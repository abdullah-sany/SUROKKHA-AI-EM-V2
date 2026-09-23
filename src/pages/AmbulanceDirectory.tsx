import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, CheckCircle2, Phone, AlertTriangle, Activity, Filter, RefreshCw, X, Shield, Sparkles } from 'lucide-react';
import { Ambulance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getAmbulancesFromFirestore } from '../lib/firebase';
import { BANGLADESH_DISTRICTS, getDistrictsForDivision } from '../data/bangladeshDistricts';

export default function AmbulanceDirectory() {
  const { language, t } = useLanguage();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  // Dynamic district options based on selected division
  const availableDistricts = useMemo(() => {
    return getDistrictsForDivision(division);
  }, [division]);

  // Handle Division change: Reset district if it no longer matches the new division
  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    if (newDiv && district) {
      const match = getDistrictsForDivision(newDiv).some(
        (d) => d.en.toLowerCase() === district.toLowerCase()
      );
      if (!match) {
        setDistrict('');
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDivision('');
    setDistrict('');
    setServiceType('');
    setVerifiedFilter('');
  };

  const hasActiveFilters = Boolean(searchQuery || division || district || serviceType || verifiedFilter);

  const fetchAmbulances = async () => {
    setLoading(true);
    try {
      let results: Ambulance[] = [];

      // 1. Attempt reading from Cloud Firestore first
      const firestoreData = await getAmbulancesFromFirestore();
      if (firestoreData && firestoreData.length > 0) {
        results = firestoreData;
      } else {
        // 2. Fallback to Server API
        const url = new URL('/api/ambulances', window.location.origin);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch ambulance data');
        results = await res.json();
      }

      // Apply Client-Side Filter for precision & instant responsiveness
      let filtered = results;

      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (a) =>
            a.providerName?.toLowerCase().includes(s) ||
            a.area?.toLowerCase().includes(s) ||
            a.district?.toLowerCase().includes(s) ||
            a.division?.toLowerCase().includes(s) ||
            a.phone?.includes(s)
        );
      }

      if (division) {
        filtered = filtered.filter(
          (a) => a.division?.toLowerCase() === division.toLowerCase()
        );
      }

      if (district) {
        const dSearch = district.toLowerCase();
        filtered = filtered.filter((a) => {
          const ambDistrict = a.district?.toLowerCase() || '';
          return (
            ambDistrict === dSearch ||
            ambDistrict.replace(/'/g, '') === dSearch.replace(/'/g, '')
          );
        });
      }

      if (serviceType) {
        const sType = serviceType.toLowerCase();
        filtered = filtered.filter((a) =>
          a.serviceType?.toLowerCase().includes(sType)
        );
      }

      if (verifiedFilter !== '') {
        const isV = verifiedFilter === 'true';
        filtered = filtered.filter((a) => a.verified === isV);
      }

      setAmbulances(filtered);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAmbulances();
    }, 250); // Fast debounce

    return () => clearTimeout(timer);
  }, [searchQuery, division, district, serviceType, verifiedFilter]);

  // Translate District helper
  const formatDistrictName = (dEn: string) => {
    const found = BANGLADESH_DISTRICTS.find(
      (d) => d.en.toLowerCase() === dEn.toLowerCase()
    );
    if (found) {
      return language === 'bn' ? found.bn : found.en;
    }
    return dEn;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '২৪/৭ অ্যাম্বুলেন্স নেটওয়ার্ক' : '24/7 Ambulance Network'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[var(--color-medical-navy)] tracking-tight mb-2">
          {t('ambulance.title')}
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-muted-gray)] max-w-3xl">
          {language === 'bn'
            ? 'বিভাগ ও জেলা অনুযায়ী ভেরিফাইড সরকারি-বেসরকারি এসি, নন-এসি ও আইসিইউ অ্যাম্বুলেন্সের জরুরি নম্বর।'
            : 'Find verified Government & Private AC, Non-AC, and ICU Ambulance hotlines across all districts of Bangladesh.'}
        </p>
      </div>

      {/* Search & District Filter Card */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Main Search Bar */}
          <div className="md:col-span-12 lg:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[var(--color-medical-navy)] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:bg-white transition-all text-sm"
              placeholder={
                language === 'bn'
                  ? 'অ্যাম্বুলেন্সের নাম, হাসপাতাল, এলাকা বা ফোন নম্বর লিখুন...'
                  : 'Search by provider, area, or phone number...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Division Filter */}
          <div className="md:col-span-4 lg:col-span-2">
            <select
              value={division}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[var(--color-medical-navy)] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">{language === 'bn' ? 'সকল বিভাগ (All Divisions)' : 'All Divisions'}</option>
              <option value="Dhaka">{language === 'bn' ? 'ঢাকা (Dhaka)' : 'Dhaka'}</option>
              <option value="Chattogram">{language === 'bn' ? 'চট্টগ্রাম (Chattogram)' : 'Chattogram'}</option>
              <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী (Rajshahi)' : 'Rajshahi'}</option>
              <option value="Khulna">{language === 'bn' ? 'খুলনা (Khulna)' : 'Khulna'}</option>
              <option value="Barishal">{language === 'bn' ? 'বরিশাল (Barishal)' : 'Barishal'}</option>
              <option value="Sylhet">{language === 'bn' ? 'সিলেট (Sylhet)' : 'Sylhet'}</option>
              <option value="Rangpur">{language === 'bn' ? 'রংপুর (Rangpur)' : 'Rangpur'}</option>
              <option value="Mymensingh">{language === 'bn' ? 'ময়মনসিংহ (Mymensingh)' : 'Mymensingh'}</option>
            </select>
          </div>

          {/* District Filter (Dynamic 64 Districts) */}
          <div className="md:col-span-4 lg:col-span-3">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[var(--color-medical-navy)] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">
                {division
                  ? language === 'bn'
                    ? `সকল জেলা (${formatDistrictName(division)} বিভাগ)`
                    : `All Districts (${division})`
                  : language === 'bn'
                  ? 'সকল জেলা (৬৪টি জেলা)'
                  : 'All Districts (64 Districts)'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d.en} value={d.en}>
                  {language === 'bn' ? `${d.bn} (${d.en})` : d.en}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type Filter */}
          <div className="md:col-span-4 lg:col-span-2">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[var(--color-medical-navy)] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">{language === 'bn' ? 'সব ধরণের গাড়ি' : 'All Types'}</option>
              <option value="ICU">{language === 'bn' ? '🚑 আইসিইউ (ICU)' : '🚑 ICU Support'}</option>
              <option value="AC">{language === 'bn' ? '❄️ এসি (AC)' : '❄️ AC Ambulance'}</option>
              <option value="Basic">{language === 'bn' ? '🚐 সাধারণ / বেসিক' : '🚐 Basic / Non-AC'}</option>
              <option value="Freezer">{language === 'bn' ? '🧊 ফ্রিজার ভ্যান' : '🧊 Freezer Van'}</option>
            </select>
          </div>
        </div>

        {/* Filter Quick Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 flex items-center space-x-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কুইক ফিল্টার:' : 'Quick Filters:'}</span>
            </span>

            {/* Quick Pill: ICU */}
            <button
              onClick={() => setServiceType(serviceType === 'ICU' ? '' : 'ICU')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                serviceType === 'ICU'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              🚑 ICU Ambulance
            </button>

            {/* Quick Pill: AC */}
            <button
              onClick={() => setServiceType(serviceType === 'AC' ? '' : 'AC')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                serviceType === 'AC'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              ❄️ AC Service
            </button>

            {/* Quick Pill: Verified Only */}
            <button
              onClick={() => setVerifiedFilter(verifiedFilter === 'true' ? '' : 'true')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                verifiedFilter === 'true'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ✓ {language === 'bn' ? 'যাচাইকৃত মাত্র' : 'Verified Only'}
            </button>
          </div>

          {/* Results Count & Reset Button */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-gray-500">
              {language === 'bn'
                ? `পাওয়া গেছে: ${ambulances.length}টি সার্ভিস`
                : `Found: ${ambulances.length} Services`}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-48"></div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex items-start space-x-4 mb-8">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-bold text-base mb-1">{t('ambulance.error.title')}</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && ambulances.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
            {language === 'bn' ? 'কোনো অ্যাম্বুলেন্স পাওয়া যায়নি' : t('ambulance.empty.title')}
          </h3>
          <p className="text-sm text-[var(--color-muted-gray)] max-w-md mx-auto mb-4">
            {language === 'bn'
              ? 'আপনার নির্বাচিত জেলা বা ফিল্টারে কোনো রেকর্ড মেলেনি। অন্য জেলা নির্বাচন করুন অথবা রিসেট বাটন চাপুন।'
              : t('ambulance.empty.desc')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[var(--color-medical-navy)] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব ফিল্টার মুছুন' : 'Clear All Filters'}</span>
            </button>
          )}
        </div>
      )}

      {/* Ambulance Cards Grid */}
      {!loading && !error && ambulances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ambulances.map((ambulance) => {
            const isICU = ambulance.serviceType?.toLowerCase().includes('icu');
            return (
              <div
                key={ambulance.id}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          isICU
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-teal-50 text-[var(--color-medical-teal)] border border-teal-100'
                        }`}
                      >
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[var(--color-medical-navy)] leading-snug">
                          {ambulance.providerName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                              isICU
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ambulance.serviceType} {language === 'bn' ? 'অ্যাম্বুলেন্স' : 'Ambulance'}
                          </span>
                          {ambulance.verified && (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location info */}
                  <div className="flex items-start space-x-2 text-gray-500 mb-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <span className="font-semibold text-gray-800">{ambulance.area}</span>,{' '}
                      <span className="font-bold text-[var(--color-medical-navy)]">
                        {formatDistrictName(ambulance.district || 'Dhaka')}
                      </span>
                      {ambulance.division && (
                        <span className="text-gray-500"> ({formatDistrictName(ambulance.division)} বিভাগ)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Source & Direct Call Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <div className="text-[11px] text-gray-400">
                    <span className="block font-medium">
                      {language === 'bn' ? 'উৎস: ' : 'Source: '}
                      <span className="text-gray-600">{ambulance.source || 'Verified Directory'}</span>
                    </span>
                  </div>

                  <a
                    href={`tel:${ambulance.phone}`}
                    className="inline-flex items-center space-x-2 bg-[var(--color-medical-navy)] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wide shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'bn' ? `কল (${ambulance.phone})` : `Call: ${ambulance.phone}`}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
