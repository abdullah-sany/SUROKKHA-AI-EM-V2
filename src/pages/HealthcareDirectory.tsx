import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  AlertTriangle, 
  Building2, 
  Crosshair, 
  X, 
  Filter, 
  SlidersHorizontal, 
  Navigation2, 
  Copy, 
  Check, 
  Stethoscope 
} from 'lucide-react';
import { HealthcareFacility } from '../types';
import { useLocation } from '../hooks/useLocation';
import { calculateDistanceKm } from '../utils/haversine';
import { useLanguage } from '../contexts/LanguageContext';
import { getFacilitiesFromFirestore } from '../lib/firebase';
import { getDistrictsForDivision } from '../data/bangladeshDistricts';
import bundledHospitals from '../data/hospitals.json';

export default function HealthcareDirectory() {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';

  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { location, requestLocation } = useLocation();

  // Get available districts based on selected division
  const availableDistricts = useMemo(() => {
    return getDistrictsForDivision(division);
  }, [division]);

  // When division changes, check if current district belongs to it; if not, reset district
  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    if (newDivision && district) {
      const match = getDistrictsForDivision(newDivision).some(
        d => d.en.toLowerCase() === district.toLowerCase()
      );
      if (!match) {
        setDistrict('');
      }
    }
  };

  const copyPhoneNumber = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const facilityMap = new Map<string, HealthcareFacility>();

      // 1. Load base comprehensive bundled database (319+ facilities across Bangladesh)
      if (bundledHospitals && Array.isArray(bundledHospitals)) {
        (bundledHospitals as HealthcareFacility[]).forEach((f) => {
          const key = f.id || `${f.name}_${f.district}`;
          facilityMap.set(key, f);
        });
      }

      // 2. Overlay / Merge with Local Server API (328 facilities)
      try {
        const url = new URL('/api/healthcare', window.location.origin);
        const res = await fetch(url.toString());
        if (res.ok) {
          const apiData: HealthcareFacility[] = await res.json();
          if (Array.isArray(apiData)) {
            apiData.forEach((f) => {
              const key = f.id || `${f.name}_${f.district}`;
              facilityMap.set(key, { ...facilityMap.get(key), ...f });
            });
          }
        }
      } catch (apiErr) {
        console.warn('Server API fetch failed, relying on offline bundled dataset:', apiErr);
      }

      // 3. Overlay Firestore documents (any user/admin edits, new facilities, verified flags)
      try {
        const firestoreFacilities = await getFacilitiesFromFirestore();
        if (firestoreFacilities && firestoreFacilities.length > 0) {
          firestoreFacilities.forEach((f) => {
            const key = f.id || `${f.name}_${f.district}`;
            facilityMap.set(key, { ...(facilityMap.get(key) || {}), ...f } as HealthcareFacility);
          });
        }
      } catch (fErr) {
        console.warn('Firestore fetch failed:', fErr);
      }

      let data: HealthcareFacility[] = Array.from(facilityMap.values());

      // Apply client-side filters
      if (searchQuery) {
        const s = searchQuery.toLowerCase().trim();
        data = data.filter(f => 
          f.name.toLowerCase().includes(s) || 
          (f.nameBn && f.nameBn.includes(s)) || 
          (f.area && f.area.toLowerCase().includes(s)) ||
          (f.district && f.district.toLowerCase().includes(s))
        );
      }
      if (division) data = data.filter(f => f.division?.toLowerCase() === division.toLowerCase());
      if (district) {
        const dSearch = district.toLowerCase();
        data = data.filter(f => {
          const facilityDistrict = f.district?.toLowerCase() || '';
          return facilityDistrict === dSearch || facilityDistrict.replace(/'/g, '') === dSearch.replace(/'/g, '');
        });
      }
      if (facilityType) data = data.filter(f => f.facilityType === facilityType);
      if (verifiedFilter !== '') {
        const isV = verifiedFilter === 'true';
        data = data.filter(f => f.verified === isV);
      }

      // If location is granted, calculate distance and sort
      if (location.status === 'granted' && location.latitude && location.longitude) {
        data = data.map(f => {
          if (f.latitude && f.longitude) {
            f.distanceKm = calculateDistanceKm(location.latitude!, location.longitude!, f.latitude, f.longitude);
          }
          return f;
        });
        
        // Sort by distance if available
        data.sort((a, b) => {
          if (a.distanceKm !== undefined && b.distanceKm !== undefined) return a.distanceKm - b.distanceKm;
          if (a.distanceKm !== undefined) return -1;
          if (b.distanceKm !== undefined) return 1;
          return 0;
        });
      }

      setFacilities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (urlParams.get('nearby') === 'true') {
      requestLocation();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities();
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [searchQuery, division, district, facilityType, verifiedFilter, location.status]);

  const activeFilterCount = (division ? 1 : 0) + (district ? 1 : 0) + (facilityType ? 1 : 0) + (verifiedFilter !== '' ? 1 : 0) + (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setDivision('');
    setDistrict('');
    setFacilityType('');
    setVerifiedFilter('');
  };

  const quickTypes = [
    { label: isBn ? 'সবগুলো' : 'All Facilities', value: '' },
    { label: isBn ? 'হাসপাতাল' : 'Hospitals', value: 'Hospital' },
    { label: isBn ? 'মেডিকেল কলেজ' : 'Medical College', value: 'Medical College Hospital' },
    { label: isBn ? 'ক্লিনিক' : 'Clinics', value: 'Clinic' },
    { label: isBn ? 'ডায়াগনস্টিক' : 'Diagnostic', value: 'Diagnostic Center' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Top Header & Location Finder */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-150">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
            <Building2 className="w-4 h-4" />
            <span>{isBn ? 'স্বাস্থ্যসেবা কেন্দ্র ও হাসপাতাল নেটওয়ার্ক' : 'Healthcare & Hospital Directory'}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 font-semibold">{isBn ? 'সারা বাংলাদেশ' : 'Nationwide Database'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-medical-navy)] tracking-tight mb-2">
            {t('healthcare.title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            {isBn
              ? 'বাংলাদেশের ৬৪ জেলার যাচাইকৃত সরকারি ও বেসরকারি হাসপাতাল, ক্লিনিক এবং মেডিকেল কলেজ ডিরেক্টরি।'
              : 'Search verified government and private hospitals, specialized clinics, and medical colleges across all 64 districts.'}
          </p>
        </div>
        
        {/* GPS Location Finder Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <button 
            onClick={requestLocation}
            className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-[var(--color-medical-navy)] px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all border border-gray-200 shadow-2xs cursor-pointer group"
          >
            <Crosshair className={`w-4 h-4 text-blue-600 group-hover:rotate-45 transition-transform ${location.status === 'loading' ? 'animate-spin' : ''}`} />
            <span>{t('healthcare.btn.location')}</span>
          </button>

          {location.status === 'granted' && (
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('healthcare.loc.enabled')}</span>
            </div>
          )}

          {location.status === 'loading' && (
            <span className="text-xs font-semibold text-blue-600 animate-pulse">
              {t('healthcare.loc.detecting')}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden w-full flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 text-xs font-bold text-[var(--color-medical-navy)]"
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span>{isBn ? 'ফিল্টার ও সার্চ অপশন' : 'Filters & Search'}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 font-semibold hover:underline"
            >
              {isBn ? 'রিসেট' : 'Reset'}
            </button>
          )}
        </div>

        {/* Filters Sidebar */}
        <aside className={`w-full lg:w-76 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs sticky top-24 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-[var(--color-medical-navy)] font-bold text-sm">
                <Filter className="w-4 h-4 text-teal-600" />
                <span>{t('healthcare.filters.title')}</span>
              </div>
              {activeFilterCount > 0 && (
                <button 
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  {isBn ? 'সব মুছুন' : 'Clear All'}
                </button>
              )}
            </div>
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('healthcare.filters.search')}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('healthcare.filters.search_placeholder')}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Division Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('healthcare.filters.division')}
              </label>
              <select 
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value)}
              >
                <option value="">{t('healthcare.filters.all_divisions')}</option>
                <option value="Dhaka">{t('div.dhaka')}</option>
                <option value="Chattogram">{t('div.chattogram')}</option>
                <option value="Sylhet">{t('div.sylhet')}</option>
                <option value="Rajshahi">{t('div.rajshahi')}</option>
                <option value="Khulna">{t('div.khulna')}</option>
                <option value="Barishal">{t('div.barishal')}</option>
                <option value="Rangpur">{t('div.rangpur')}</option>
                <option value="Mymensingh">{t('div.mymensingh')}</option>
              </select>
            </div>

            {/* District Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('healthcare.filters.district')}
                </label>
                {division && (
                  <span className="text-[10px] font-semibold text-teal-700">
                    {availableDistricts.length} {isBn ? 'টি জেলা' : 'districts'}
                  </span>
                )}
              </div>
              <select 
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!division}
              >
                <option value="">{t('healthcare.filters.all_districts')}</option>
                {availableDistricts.map((d) => (
                  <option key={d.en} value={d.en}>
                    {isBn ? d.bn : d.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Facility Type Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('healthcare.filters.type')}
              </label>
              <select 
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
              >
                <option value="">{t('healthcare.filters.all_types')}</option>
                <option value="Hospital">{t('type.hospital')}</option>
                <option value="Medical College Hospital">{t('type.medical_college')}</option>
                <option value="Private Hospital / Clinic">{t('type.private')}</option>
                <option value="Clinic">{t('type.clinic')}</option>
                <option value="Diagnostic Center">{t('type.diagnostic')}</option>
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('healthcare.filters.status')}
              </label>
              <select 
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
              >
                <option value="">{t('healthcare.filters.all_status')}</option>
                <option value="true">{t('healthcare.filters.verified_only')}</option>
                <option value="false">{t('healthcare.filters.needs_verification')}</option>
              </select>
            </div>

            {/* Quick Helper Hotline */}
            <div className="pt-4 border-t border-gray-100 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">{isBn ? 'জরুরি প্রয়োজনে:' : 'Emergency Hotlines:'}</p>
              <p>৯৯৯ (জাতীয় জরুরি সেবা)</p>
              <p>১৬২৬৩ (স্বাস্থ্য বাতায়ন ডাক্তার)</p>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Quick Category Segmented Tabs */}
          <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {quickTypes.map((q) => (
              <button
                key={q.value}
                onClick={() => setFacilityType(q.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                  facilityType === q.value
                    ? 'bg-[var(--color-medical-navy)] text-white border-[var(--color-medical-navy)] shadow-2xs'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Results Summary Bar */}
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <div>
              {!loading && (
                <span>
                  {isBn ? (
                    <>মোট <strong className="text-slate-900 tabular-nums">{facilities.length}</strong> টি স্বাস্থ্যকেন্দ্র পাওয়া গেছে</>
                  ) : (
                    <>Found <strong className="text-slate-900 tabular-nums">{facilities.length}</strong> healthcare facilities</>
                  )}
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <span className="text-teal-700 font-medium">
                {isBn ? `ফিল্টার সক্রিয় (${activeFilterCount})` : `Active Filters (${activeFilterCount})`}
              </span>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs animate-pulse space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-12 bg-slate-50 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-start space-x-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm mb-0.5">{t('healthcare.error.title')}</h3>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && facilities.length === 0 && (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-150 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
                {t('healthcare.empty.title')}
              </h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-5">
                {t('healthcare.empty.desc')}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer"
              >
                {isBn ? 'সব ফিল্টার মুছুন' : 'Reset All Filters'}
              </button>
            </div>
          )}

          {/* Facility Cards List */}
          {!loading && !error && facilities.length > 0 && (
            <div className="space-y-4">
              {facilities.map((facility) => {
                const isCopied = copiedId === facility.id;
                const isMedCollege = facility.facilityType === 'Medical College Hospital';
                
                return (
                  <div 
                    key={facility.id} 
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-2xs hover:border-gray-250 hover:shadow-xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Left: Icon & Details */}
                      <div className="flex items-start space-x-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isMedCollege 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'bg-blue-50 text-[var(--color-medical-blue)]'
                        }`}>
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div>
                          {/* Facility Names */}
                          <h3 className="text-base sm:text-lg font-bold text-[var(--color-medical-navy)] leading-snug">
                            {isBn && facility.nameBn ? facility.nameBn : facility.name}
                          </h3>

                          {/* Secondary language name if available */}
                          {isBn && facility.name && facility.name !== facility.nameBn && (
                            <p className="text-xs text-slate-500 font-medium">
                              {facility.name}
                            </p>
                          )}
                          {!isBn && facility.nameBn && (
                            <p className="text-xs text-slate-500 font-medium font-bangla">
                              {facility.nameBn}
                            </p>
                          )}

                          {/* Unboxed Metadata Line (No generic pill capsules) */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2 font-medium">
                            <span className="font-semibold text-slate-800">
                              {t(`type.${facility.facilityType.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`) || facility.facilityType}
                            </span>
                            <span className="text-gray-300" aria-hidden="true">·</span>
                            <span>{facility.ownership}</span>
                            {facility.division && (
                              <>
                                <span className="text-gray-300" aria-hidden="true">·</span>
                                <span>{t(`div.${facility.division.toLowerCase()}`)}</span>
                              </>
                            )}
                          </div>

                          {/* Area & Location */}
                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>
                              {facility.area ? `${facility.area}, ` : ''}
                              {t(`div.${facility.district?.toLowerCase()}`) || facility.district}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Distance & Status */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                        {facility.distanceKm !== undefined && (
                          <div className="text-right bg-blue-50/70 border border-blue-100/80 px-3 py-1.5 rounded-lg">
                            <div className="text-sm font-black text-blue-700 tabular-nums leading-tight">
                              {facility.distanceKm.toFixed(1)} <span className="text-[11px] font-semibold">{isBn ? 'কিমি দূরে' : 'km'}</span>
                            </div>
                            <span className="text-[10px] text-blue-600/80 uppercase tracking-wider font-semibold">
                              {t('common.km_away')}
                            </span>
                          </div>
                        )}

                        <div>
                          {facility.verified ? (
                            <div className="flex items-center space-x-1 text-emerald-700 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('common.verified')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-amber-700 text-xs font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span>{t('common.needs_verification')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action Strip */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      
                      {/* Phone Info */}
                      <div className="flex items-center space-x-2">
                        {facility.phone ? (
                          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <a 
                              href={`tel:${facility.phone}`}
                              className="hover:underline hover:text-emerald-700 tabular-nums"
                            >
                              {facility.phone}
                            </a>
                            <button
                              onClick={() => copyPhoneNumber(facility.id, facility.phone)}
                              className="text-gray-400 hover:text-slate-600 p-1 rounded transition-colors"
                              title={isBn ? 'নম্বর কপি করুন' : 'Copy Phone'}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            {isBn ? 'ফোন নম্বর যোগ করা হয়নি' : 'No direct phone listed'}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {facility.phone && (
                          <a 
                            href={`tel:${facility.phone}`}
                            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{t('common.call_now')}</span>
                          </a>
                        )}

                        {facility.latitude && facility.longitude && (
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors"
                          >
                            <Navigation2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{t('common.directions')}</span>
                          </a>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
