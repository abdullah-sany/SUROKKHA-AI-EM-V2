import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  PhoneCall, 
  AlertTriangle, 
  Activity, 
  Filter, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Navigation, 
  Crosshair, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { Ambulance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../hooks/useLocation';
import { calculateDistanceKm } from '../utils/haversine';
import { getAmbulancesFromFirestore } from '../lib/firebase';
import { BANGLADESH_DISTRICTS, getDistrictsForDivision } from '../data/bangladeshDistricts';
import bundledAmbulances from '../data/ambulances.json';

type SortOption = 'distance' | 'verified' | 'name';

export default function AmbulanceDirectory() {
  const { language, t } = useLanguage();
  const { location, requestLocation } = useLocation();

  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  
  // Copy to clipboard notification feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    setVerifiedOnly(false);
  };

  const hasActiveFilters = Boolean(searchQuery || division || district || serviceType || verifiedOnly);

  // Fetch and merge ambulances from bundled JSON, Server API, and Firestore
  const fetchAmbulances = useCallback(async () => {
    setLoading(true);
    try {
      const ambulanceMap = new Map<string, Ambulance>();

      // 1. Load base bundled ambulances (49 verified records)
      if (bundledAmbulances && Array.isArray(bundledAmbulances)) {
        (bundledAmbulances as Ambulance[]).forEach((a) => {
          const key = a.id || `${a.providerName}_${a.phone}`;
          ambulanceMap.set(key, a);
        });
      }

      // 2. Overlay Server API if available
      try {
        const url = new URL('/api/ambulances', window.location.origin);
        const res = await fetch(url.toString());
        if (res.ok) {
          const apiData: Ambulance[] = await res.json();
          if (Array.isArray(apiData)) {
            apiData.forEach((a) => {
              const key = a.id || `${a.providerName}_${a.phone}`;
              ambulanceMap.set(key, { ...ambulanceMap.get(key), ...a });
            });
          }
        }
      } catch (apiErr) {
        console.warn('Server API ambulance fetch failed:', apiErr);
      }

      // 3. Overlay Firestore live documents
      try {
        const firestoreData = await getAmbulancesFromFirestore();
        if (firestoreData && firestoreData.length > 0) {
          firestoreData.forEach((a) => {
            const key = a.id || `${a.providerName}_${a.phone}`;
            ambulanceMap.set(key, { ...(ambulanceMap.get(key) || {}), ...a } as Ambulance);
          });
        }
      } catch (fErr) {
        console.warn('Firestore ambulance fetch failed:', fErr);
      }

      setAmbulances(Array.from(ambulanceMap.values()));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load ambulance directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

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

  // Process filtering and distance calculation
  const processedAmbulances = useMemo(() => {
    let result = [...ambulances];

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.providerName?.toLowerCase().includes(q) ||
          a.area?.toLowerCase().includes(q) ||
          a.district?.toLowerCase().includes(q) ||
          a.division?.toLowerCase().includes(q) ||
          a.phone?.includes(q)
      );
    }

    // Filter by division
    if (division) {
      result = result.filter(
        (a) => a.division?.toLowerCase() === division.toLowerCase()
      );
    }

    // Filter by district
    if (district) {
      const dSearch = district.toLowerCase();
      result = result.filter((a) => {
        const ambDistrict = a.district?.toLowerCase() || '';
        return (
          ambDistrict === dSearch ||
          ambDistrict.replace(/'/g, '') === dSearch.replace(/'/g, '')
        );
      });
    }

    // Filter by service type
    if (serviceType) {
      const sType = serviceType.toLowerCase();
      result = result.filter((a) =>
        a.serviceType?.toLowerCase().includes(sType)
      );
    }

    // Filter by verified only
    if (verifiedOnly) {
      result = result.filter((a) => a.verified === true);
    }

    // Calculate distance if GPS location is granted
    if (location.status === 'granted' && location.latitude && location.longitude) {
      result = result.map((a) => {
        if (a.latitude && a.longitude) {
          const dist = calculateDistanceKm(
            location.latitude!,
            location.longitude!,
            a.latitude,
            a.longitude
          );
          return { ...a, distanceKm: dist };
        }
        return a;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'distance' && location.status === 'granted') {
        const distA = a.distanceKm ?? 999999;
        const distB = b.distanceKm ?? 999999;
        if (distA !== distB) return distA - distB;
      }

      if (sortBy === 'verified') {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
      }

      // Default alphabetical by name
      return a.providerName.localeCompare(b.providerName);
    });

    return result;
  }, [ambulances, searchQuery, division, district, serviceType, verifiedOnly, sortBy, location]);

  // Copy phone number to clipboard
  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Share ambulance hotline
  const handleShareAmbulance = (amb: Ambulance, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareText = `জরুরি অ্যাম্বুলেন্স সার্ভিস: ${amb.providerName}\nফোন: ${amb.phone}\nএলাকা: ${amb.area}, ${amb.district}\nটাইপ: ${amb.serviceType}\nতথ্যসূত্র: SUROKKHA AI BD`;
    if (navigator.share) {
      navigator.share({
        title: amb.providerName,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert(language === 'bn' ? 'অ্যাম্বুলেন্সের বিস্তারিত কপি করা হয়েছে!' : 'Ambulance details copied to clipboard!');
    }
  };

  // Quick statistics counts
  const stats = useMemo(() => {
    const total = ambulances.length;
    const icu = ambulances.filter(a => a.serviceType?.toLowerCase().includes('icu')).length;
    const ac = ambulances.filter(a => a.serviceType?.toLowerCase().includes('ac')).length;
    const verified = ambulances.filter(a => a.verified).length;
    return { total, icu, ac, verified };
  }, [ambulances]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      
      {/* 🚨 Emergency Rapid Dispatch Banner (1-Tap Dial 999 & 16263) */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 md:p-6 shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold text-white tracking-wide">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>{language === 'bn' ? 'জরুরি জীবন রক্ষা হটলাইন' : 'CRITICAL EMERGENCY HOTLINE'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'bn' ? 'তাৎক্ষণিক অ্যাম্বুলেন্স প্রয়োজন?' : 'Need an Immediate Emergency Ambulance?'}
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl">
              {language === 'bn'
                ? 'জাতীয় জরুরি সেবা ৯৯৯ এবং স্বাস্থ্য বাতায়ন ১৬২৬৩ সরাসরি সরকারি ও বেসরকারি অ্যাম্বুলেন্সের সাথে সংযুক্ত করে দেয়।'
                : 'National Emergency 999 & Shastho Batayan 16263 immediately route to nearest emergency transport.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="tel:999"
              className="inline-flex items-center justify-center space-x-2 bg-white text-red-700 hover:bg-red-50 font-black px-5 py-3 rounded-2xl text-sm shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>{language === 'bn' ? '৯৯৯ এ কল করুন' : 'Call 999 (National)'}</span>
            </a>

            <a
              href="tel:16263"
              className="inline-flex items-center justify-center space-x-2 bg-red-800/80 hover:bg-red-800 text-white font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm border border-red-400/30 transition-all cursor-pointer min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্বাস্থ্য বাতায়ন (১৬২৬৩)' : 'Health Helpline (16263)'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4" />
            <span>{language === 'bn' ? 'সারাদেশের ভেরিফাইড অ্যাম্বুলেন্স তালিকা' : 'Verified Nationwide Fleet'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-medical-navy)] tracking-tight">
            {t('ambulance.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {language === 'bn'
              ? '৬৪ জেলার নির্ভরযোগ্য আইসিইউ, এসি ও সাধারণ অ্যাম্বুলেন্স হটলাইন। জিপিএস দিয়ে নিকটবর্তী সেবা শনাক্ত করুন।'
              : 'Reliable ICU, AC, and Basic patient transport services across 64 districts with live GPS nearest locator.'}
          </p>
        </div>

        {/* GPS Locate Button */}
        <button
          onClick={requestLocation}
          disabled={location.status === 'loading'}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer border ${
            location.status === 'granted'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-gray-200'
          }`}
        >
          {location.status === 'loading' ? (
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
          ) : (
            <Crosshair className={`w-4 h-4 ${location.status === 'granted' ? 'text-emerald-600' : 'text-slate-500'}`} />
          )}
          <span>
            {location.status === 'granted'
              ? language === 'bn' ? 'জিপিএস সক্রিয় (দূরত্ব অনুযায়ী)' : 'GPS Active (Sorted by Distance)'
              : language === 'bn' ? 'আমার নিকটবর্তী অ্যাম্বুলেন্স' : 'Find Nearest to Me'}
          </span>
        </button>
      </div>

      {/* Network Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">মোট অ্যাম্বুলেন্স</span>
          <div className="text-2xl font-black text-[var(--color-medical-navy)] mt-0.5 tabular-nums">
            {stats.total}+
          </div>
          <span className="text-[11px] text-slate-400">সারাদেশের নেটওয়ার্ক</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">আইসিইউ ও লাইফ সাপোর্ট</span>
          <div className="text-2xl font-black text-red-600 mt-0.5 tabular-nums">
            {stats.icu}+
          </div>
          <span className="text-[11px] text-slate-400">ভেন্টিলেটর ও অক্সিজেন যুক্ত</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">এসি অ্যাম্বুলেন্স</span>
          <div className="text-2xl font-black text-teal-700 mt-0.5 tabular-nums">
            {stats.ac}+
          </div>
          <span className="text-[11px] text-slate-400">তাপমাত্রা নিয়ন্ত্রিত কেবিন</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">যাচাইকৃত প্রভাইডার</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5 tabular-nums">
            {stats.verified}+
          </div>
          <span className="text-[11px] text-slate-400">প্রশাসন ও টিম কর্তৃক ভেরিফাইড</span>
        </div>
      </div>

      {/* Search & Smart Multi-Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs mb-8">
        
        {/* Main Search Input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-12 lg:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
              placeholder={
                language === 'bn'
                  ? 'প্রোভাইডারের নাম, হাসপাতাল বা এলাকা লিখে খুঁজুন...'
                  : 'Search ambulance name, hospital, area or phone...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Division Selector */}
          <div className="md:col-span-4 lg:col-span-2">
            <select
              value={division}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="">{language === 'bn' ? 'সকল বিভাগ' : 'All Divisions'}</option>
              <option value="Dhaka">ঢাকা (Dhaka)</option>
              <option value="Chattogram">চট্টগ্রাম (Chattogram)</option>
              <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
              <option value="Khulna">খুলনা (Khulna)</option>
              <option value="Barishal">বরিশাল (Barishal)</option>
              <option value="Sylhet">সিলেট (Sylhet)</option>
              <option value="Rangpur">রংপুর (Rangpur)</option>
              <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
            </select>
          </div>

          {/* Dynamic District Selector */}
          <div className="md:col-span-4 lg:col-span-3">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="">
                {division
                  ? language === 'bn'
                    ? `সকল জেলা (${formatDistrictName(division)})`
                    : `All Districts (${division})`
                  : language === 'bn'
                  ? 'সকল জেলা (৬৪টি জেলা)'
                  : 'All 64 Districts'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d.en} value={d.en}>
                  {language === 'bn' ? `${d.bn} (${d.en})` : d.en}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-4 lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="distance">{language === 'bn' ? '📍 নিকটবর্তী ক্রমানুসারে' : '📍 Nearest First'}</option>
              <option value="verified">{language === 'bn' ? '✓ যাচাইকৃত প্রথমে' : '✓ Verified First'}</option>
              <option value="name">{language === 'bn' ? 'নাম অনুযায়ী (A to Z)' : 'Name (A-Z)'}</option>
            </select>
          </div>
        </div>

        {/* Interactive Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>টাইপ:</span>
            </span>

            {/* Quick Button: All */}
            <button
              onClick={() => setServiceType('')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                serviceType === ''
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সকল সার্ভিস
            </button>

            {/* Quick Button: ICU */}
            <button
              onClick={() => setServiceType(serviceType === 'ICU' ? '' : 'ICU')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                serviceType === 'ICU'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              🚑 আইসিইউ (ICU)
            </button>

            {/* Quick Button: AC */}
            <button
              onClick={() => setServiceType(serviceType === 'AC' ? '' : 'AC')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                serviceType === 'AC'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              ❄️ এসি সার্ভিস
            </button>

            {/* Quick Button: Basic */}
            <button
              onClick={() => setServiceType(serviceType === 'Basic' ? '' : 'Basic')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                serviceType === 'Basic'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              🚐 সাধারণ (Basic)
            </button>

            {/* Toggle: Verified Only */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                verifiedOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              ✓ {language === 'bn' ? 'যাচাইকৃত মাত্র' : 'Verified Only'}
            </button>
          </div>

          {/* Results Summary & Reset */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-slate-500">
              {language === 'bn'
                ? `উপলব্ধ: ${processedAmbulances.length}টি গাড়ি`
                : `Available: ${processedAmbulances.length} Ambulances`}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs h-56"></div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-start space-x-3 mb-8">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-bold text-sm mb-0.5">{t('ambulance.error.title')}</h3>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && processedAmbulances.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-2xs">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-medical-navy)] mb-1">
            {language === 'bn' ? 'কোনো অ্যাম্বুলেন্স পাওয়া যায়নি' : t('ambulance.empty.title')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {language === 'bn'
              ? 'আপনার নির্বাচিত জেলা বা ফিল্টারে কোনো তথ্য মেলেনি। অন্য জেলা বেছে নিন অথবা ফিল্টার রিসেট করুন।'
              : 'No ambulance services matched your search filter. Please try a different district or reset filters.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>
      )}

      {/* Ambulance Cards Grid - High Legibility, Anti-Slop, Fast Mobile Tap */}
      {!loading && !error && processedAmbulances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {processedAmbulances.map((ambulance) => {
            const isICU = ambulance.serviceType?.toLowerCase().includes('icu');
            const isAC = ambulance.serviceType?.toLowerCase().includes('ac');
            const isFreezer = ambulance.serviceType?.toLowerCase().includes('freezer');

            return (
              <div
                key={ambulance.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Type Badge & Verified Seal */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isICU
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : isAC
                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-[var(--color-medical-navy)] leading-snug line-clamp-1 group-hover:text-teal-700 transition-colors">
                          {ambulance.providerName}
                        </h3>
                        {/* Zero-Pill Typography Metadata */}
                        <div className="text-[11px] text-slate-500 font-medium">
                          <span className={isICU ? 'text-red-600 font-bold' : 'text-slate-700 font-semibold'}>
                            {ambulance.serviceType}
                          </span>
                          <span className="mx-1 text-slate-300">·</span>
                          <span>{ambulance.division}</span>
                        </div>
                      </div>
                    </div>

                    {ambulance.verified && (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ভেরিফাইড</span>
                      </span>
                    )}
                  </div>

                  {/* Location Area & GPS Distance */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-3 space-y-1">
                    <div className="flex items-start space-x-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        <strong className="text-slate-800">{ambulance.area}</strong>,{' '}
                        <span>{formatDistrictName(ambulance.district || 'Dhaka')}</span>
                      </span>
                    </div>

                    {ambulance.distanceKm !== undefined && (
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-teal-700 pt-0.5">
                        <Navigation className="w-3 h-3 text-teal-600 flex-shrink-0" />
                        <span>আপনার অবস্থান থেকে প্রায় {ambulance.distanceKm.toFixed(1)} কিমি দূরে</span>
                      </div>
                    )}
                  </div>

                  {/* Highlighted Hotline Number Display */}
                  <div className="mb-4 flex items-center justify-between bg-slate-100/70 px-3.5 py-2 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">জরুরি হটলাইন</span>
                      <span className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-wide">
                        {ambulance.phone}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => handleCopyPhone(ambulance.id, ambulance.phone, e)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                      title="নম্বর কপি করুন"
                    >
                      {copiedId === ambulance.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Action Buttons (Call Now + Share + Map Link) */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <a
                    href={`tel:${ambulance.phone}`}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 rounded-xl font-black text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer min-h-[42px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>কল করুন</span>
                  </a>

                  <button
                    onClick={(e) => handleShareAmbulance(ambulance, e)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {ambulance.latitude && ambulance.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${ambulance.latitude},${ambulance.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="গুগল ম্যাপে লোকেশন ও রুট দেখুন"
                    >
                      <Navigation className="w-4 h-4 text-teal-700" />
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Emergency First-Aid Guidelines Callout */}
      <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>অ্যাম্বুলেন্স পৌঁছানোর পূর্ববর্তী প্রস্তুতি</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[var(--color-medical-navy)]">
            রোগীর সাথে থাকার সময় প্রয়োজনীয় জরুরি নির্দেশিকা
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            অ্যাম্বুলেন্স আসার আগে রোগীকে শান্ত রাখুন, খোলামেলা বাতাস চলাচল নিশ্চিত করুন এবং প্রয়োজনীয় প্রেসক্রিপশন ও পরিচয়পত্র প্রস্তুত রাখুন।
          </p>
        </div>

        <a
          href="/first-aid"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-2xs"
        >
          <span>প্রাথমিক চিকিৎসা প্রোটোকল</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
