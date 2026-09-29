import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, ShieldAlert, Phone, Navigation, MapPin, 
  Search, Filter, CheckCircle2, AlertTriangle, 
  Waves, MessageSquare, Plus, RefreshCw, X, Eye, 
  PhoneCall, ExternalLink, LifeBuoy, Sparkles, 
  Anchor, Layers, Send, HelpCircle, HeartHandshake, Compass
} from 'lucide-react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VolunteerSquad, VolunteerFilterOptions, VolunteerOrgType } from '../types';
import { 
  getVolunteerSquads, 
  filterVolunteerSquads 
} from '../services/volunteerService';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshDistricts';
import { useLocation } from '../hooks/useLocation';
import { useLanguage } from '../contexts/LanguageContext';
import { CachedTileLayer } from '../components/CachedTileLayer';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { RescueRequestModal } from '../components/RescueRequestModal';
import { VolunteerRegistrationModal } from '../components/VolunteerRegistrationModal';

// Custom Map Marker Icons using Leaflet DivIcon
const createVolunteerIcon = (org: VolunteerOrgType, isSelected: boolean = false) => {
  let bgClass = 'bg-red-600 border-red-800 text-white';
  let emoji = '🚨';

  switch (org) {
    case 'BDRCS':
      bgClass = 'bg-rose-600 border-rose-900 text-white';
      emoji = '➕';
      break;
    case 'FSCD_VOLUNTEER':
      bgClass = 'bg-amber-600 border-amber-900 text-white';
      emoji = '🚒';
      break;
    case 'GAUSIA_COMMITTEE':
      bgClass = 'bg-emerald-600 border-emerald-900 text-white';
      emoji = '🤝';
      break;
    case 'AS_SUNNAH':
      bgClass = 'bg-teal-600 border-teal-900 text-white';
      emoji = '📦';
      break;
    case 'SCOUTS':
      bgClass = 'bg-indigo-600 border-indigo-900 text-white';
      emoji = '⚜️';
      break;
    case 'BOAT_SQUAD':
      bgClass = 'bg-cyan-600 border-cyan-900 text-white';
      emoji = '🚤';
      break;
    case 'DIVER_LIFEGUARD':
      bgClass = 'bg-blue-600 border-blue-900 text-white';
      emoji = '🤿';
      break;
    case 'STUDENT_COMMUNITY':
    case 'LOCAL_YOUTH':
      bgClass = 'bg-purple-600 border-purple-900 text-white';
      emoji = '🧑‍🤝‍🧑';
      break;
    default:
      bgClass = 'bg-emerald-600 border-emerald-900 text-white';
      emoji = '🛡️';
  }

  const selectedRing = isSelected ? 'ring-4 ring-yellow-400 scale-125 z-50' : 'hover:scale-110';

  return L.divIcon({
    className: 'custom-volunteer-marker',
    html: `
      <div class="relative flex items-center justify-center transition-all duration-200 ${selectedRing}">
        <div class="w-10 h-10 rounded-full ${bgClass} border-2 shadow-lg flex items-center justify-center text-base cursor-pointer">
          <span>${emoji}</span>
        </div>
        <div class="absolute -bottom-1 w-2 h-2 bg-gray-800 rotate-45"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -36]
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-blue-500/40 rounded-full animate-ping"></div>
        <div class="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map Recenter Helper Component
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
}

export default function VolunteerDirectory() {
  const { t, language } = useLanguage();
  const { location, requestLocation } = useLocation();
  const { isOnline } = useNetworkStatus();

  // State
  const [squads, setSquads] = useState<VolunteerSquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSquad, setSelectedSquad] = useState<VolunteerSquad | null>(null);
  const [requestRescueSquad, setRequestRescueSquad] = useState<VolunteerSquad | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.6850, 90.3563]); // Center of Bangladesh
  const [mapZoom, setMapZoom] = useState<number>(7);

  // Filters State
  const [filters, setFilters] = useState<VolunteerFilterOptions>({
    searchQuery: '',
    division: '',
    district: '',
    organization: 'all',
    hasSpeedboat: false,
    hasDivers: false,
    hasMedical: false,
    hasRelief: false,
    hasDrone: false,
    status: 'all'
  });

  // Load Volunteer Squads with GPS coordinates
  const loadSquads = async () => {
    setLoading(true);
    try {
      const lat = location.status === 'granted' ? location.latitude : undefined;
      const lng = location.status === 'granted' ? location.longitude : undefined;
      const data = await getVolunteerSquads(lat, lng);
      setSquads(data);

      if (lat && lng) {
        setMapCenter([lat, lng]);
        setMapZoom(10);
      }
    } catch (err) {
      console.error('Failed to load volunteer squads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSquads();
  }, [location.status, location.latitude, location.longitude]);

  // Request user location on page load
  useEffect(() => {
    if (location.status === 'idle') {
      requestLocation();
    }
  }, [location.status, requestLocation]);

  // Filtered squads
  const filteredSquads = useMemo(() => {
    return filterVolunteerSquads(squads, filters);
  }, [squads, filters]);

  // Statistics
  const stats = useMemo(() => {
    const totalSquads = squads.length;
    const totalVolunteers = squads.reduce((acc, s) => acc + (s.activeVolunteersCount || 0), 0);
    const speedboatsCount = squads.filter(s => s.capabilities.includes('speedboat')).length;
    const diversCount = squads.filter(s => s.capabilities.includes('divers')).length;
    return { totalSquads, totalVolunteers, speedboatsCount, diversCount };
  }, [squads]);

  // Available districts for current division
  const availableDistricts = useMemo(() => {
    if (!filters.division) return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter(d => d.division.toLowerCase() === filters.division.toLowerCase());
  }, [filters.division]);

  // Handler for selecting squad and zooming map
  const handleSelectSquad = (squad: VolunteerSquad) => {
    setSelectedSquad(squad);
    setMapCenter([squad.latitude, squad.longitude]);
    setMapZoom(13);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      division: '',
      district: '',
      organization: 'all',
      hasSpeedboat: false,
      hasDivers: false,
      hasMedical: false,
      hasRelief: false,
      hasDrone: false,
      status: 'all'
    });
  };

  const getOrgBadgeColor = (org: VolunteerOrgType) => {
    switch (org) {
      case 'BDRCS': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'FSCD_VOLUNTEER': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'GAUSIA_COMMITTEE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'AS_SUNNAH': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SCOUTS': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'BOAT_SQUAD': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'DIVER_LIFEGUARD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT_COMMUNITY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LOCAL_YOUTH': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-800 to-emerald-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-yellow-300 border border-white/20">
                <Users className="w-3.5 h-3.5" />
                <span>কমিউনিটি উদ্ধার ও লাইফগার্ড নেটওয়ার্ক</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                স্বেচ্ছাসেবক ও উদ্ধারকারী টিম ডিরেক্টরি
              </h1>
              <p className="text-sm sm:text-base text-red-100 leading-relaxed">
                বন্যা, সাইক্লোন ও জলাবদ্ধতায় আটকে পড়া মানুষের জীবন বাঁচাতে রেড ক্রিসেন্ট, ফায়ার সার্ভিস ভলান্টিয়ার, গাউসিয়া কমিটি, ছাত্র উদ্ধার দল ও স্থানীয় বোট স্কোয়াডের এলাকা-ভিত্তিক ২৪/৭ জরুরি হটলাইন।
              </p>
            </div>

            {/* Action Buttons in Hero */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>টিম তালিকাভুক্ত করুন</span>
              </button>

              <button
                onClick={() => {
                  requestLocation();
                  loadSquads();
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm backdrop-blur-md border border-white/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>নিকটবর্তী টিম খুঁজুন</span>
              </button>
            </div>
          </div>

          {/* Emergency Hotlines Ribbon */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a 
              href="tel:999" 
              className="flex items-center justify-between p-3 bg-red-950/60 hover:bg-red-900/80 rounded-xl border border-red-500/30 backdrop-blur-sm transition-all text-white group"
            >
              <div>
                <div className="text-[11px] text-red-200">জাতীয় জরুরি সেবা</div>
                <div className="text-lg font-black text-yellow-300">৯৯৯ (999)</div>
              </div>
              <PhoneCall className="w-5 h-5 text-red-300 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:16163" 
              className="flex items-center justify-between p-3 bg-red-950/60 hover:bg-red-900/80 rounded-xl border border-red-500/30 backdrop-blur-sm transition-all text-white group"
            >
              <div>
                <div className="text-[11px] text-red-200">ফায়ার সার্ভিস উদ্ধার</div>
                <div className="text-lg font-black text-white">১৬১৬৩ (FSCD)</div>
              </div>
              <PhoneCall className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:1090" 
              className="flex items-center justify-between p-3 bg-red-950/60 hover:bg-red-900/80 rounded-xl border border-red-500/30 backdrop-blur-sm transition-all text-white group"
            >
              <div>
                <div className="text-[11px] text-red-200">দুর্যোগ সতর্কবার্তা IVR</div>
                <div className="text-lg font-black text-white">১০৯০ (Toll-Free)</div>
              </div>
              <PhoneCall className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:+8801819654321" 
              className="flex items-center justify-between p-3 bg-red-950/60 hover:bg-red-900/80 rounded-xl border border-red-500/30 backdrop-blur-sm transition-all text-white group"
            >
              <div>
                <div className="text-[11px] text-red-200">রেড ক্রিসেন্ট রেসকিউ</div>
                <div className="text-sm font-bold text-white leading-tight">BDRCS কন্ট্রোল</div>
              </div>
              <PhoneCall className="w-5 h-5 text-rose-300 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          {/* Quick Stats Cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-red-200 block">মোট উদ্ধারকারী দল</span>
              <span className="text-xl font-extrabold text-white">{stats.totalSquads}+</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-red-200 block">সক্রিয় ভলান্টিয়ার</span>
              <span className="text-xl font-extrabold text-yellow-300">{stats.totalVolunteers}+</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-red-200 block">বোট ও স্পিডবোট ইউনিট</span>
              <span className="text-xl font-extrabold text-cyan-300">{stats.speedboatsCount} দল</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-red-200 block">ডুবুরি ও সাঁতারু দল</span>
              <span className="text-xl font-extrabold text-emerald-300">{stats.diversCount} দল</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* GPS Location Status Ribbon */}
        {location.status === 'granted' && location.latitude && location.longitude && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>আপনার লাইভ জিপিএস সক্রিয়:</strong> সবচেয়ে কাছের উদ্ধারকারী দলগুলো দূরত্বের (কিলোমিটার) ভিত্তিতে ক্রমানুসারে সাজানো হয়েছে।
              </span>
            </div>
            <button
              onClick={() => {
                requestLocation();
                loadSquads();
              }}
              className="text-emerald-700 hover:text-emerald-900 underline font-semibold flex-shrink-0 ml-2"
            >
              আপডেট করুন
            </button>
          </div>
        )}

        {/* Filter and Search Box */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8">
          
          {/* Search Row */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="উদ্ধার দলের নাম, সংগঠন, উপজেলা, জেলা বা ফোন নম্বর লিখে খুঁজুন..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-11 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-inner"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {/* Division Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">বিভাগ নির্বাচন করুন:</label>
              <select
                value={filters.division}
                onChange={(e) => setFilters(prev => ({ ...prev, division: e.target.value, district: '' }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="">সব বিভাগ (All Divisions)</option>
                <option value="Chattogram">চট্টগ্রাম (Chattogram)</option>
                <option value="Dhaka">ঢাকা (Dhaka)</option>
                <option value="Sylhet">সিলেট (Sylhet)</option>
                <option value="Khulna">খুলনা (Khulna)</option>
                <option value="Barishal">বরিশাল (Barishal)</option>
                <option value="Rangpur">রংপুর (Rangpur)</option>
                <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">জেলা নির্বাচন করুন:</label>
              <select
                value={filters.district}
                onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="">সব জেলা (All Districts)</option>
                {availableDistricts.map(d => (
                  <option key={d.en} value={d.en}>
                    {d.bn} ({d.en})
                  </option>
                ))}
              </select>
            </div>

            {/* Organization Type Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">সংগঠনের ধরন:</label>
              <select
                value={filters.organization}
                onChange={(e) => setFilters(prev => ({ ...prev, organization: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="all">সব সংগঠন (All Teams)</option>
                <option value="BDRCS">রেড ক্রিসেন্ট (BDRCS / CPP)</option>
                <option value="FSCD_VOLUNTEER">ফায়ার সার্ভিস ভলান্টিয়ার্স</option>
                <option value="GAUSIA_COMMITTEE">গাউসিয়া কমিটি বাংলাদেশ</option>
                <option value="AS_SUNNAH">আস-সুন্নাহ ফাউন্ডেশন</option>
                <option value="SCOUTS">বাংলাদেশ স্কাউটস ও রোভার</option>
                <option value="BOAT_SQUAD">স্পিডবোট ও ট্রলার রেসকিউ</option>
                <option value="DIVER_LIFEGUARD">ডাইভার্স ও লাইফগার্ড</option>
                <option value="STUDENT_COMMUNITY">ছাত্র ও যুব উদ্ধার প্ল্যাটফর্ম</option>
                <option value="LOCAL_YOUTH">স্থানীয় তরুণ উদ্ধারকারী দল</option>
              </select>
            </div>
          </div>

          {/* Quick Capability Filter Chips */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-600 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>সক্ষমতা:</span>
              </span>

              <button
                onClick={() => setFilters(prev => ({ ...prev, hasSpeedboat: !prev.hasSpeedboat }))}
                className={`px-3 py-1 rounded-full border transition-all ${
                  filters.hasSpeedboat 
                    ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🚤 স্পিডবোট / নৌকা
              </button>

              <button
                onClick={() => setFilters(prev => ({ ...prev, hasDivers: !prev.hasDivers }))}
                className={`px-3 py-1 rounded-full border transition-all ${
                  filters.hasDivers 
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🤿 ডুবুরি ও সাঁতারু
              </button>

              <button
                onClick={() => setFilters(prev => ({ ...prev, hasMedical: !prev.hasMedical }))}
                className={`px-3 py-1 rounded-full border transition-all ${
                  filters.hasMedical 
                    ? 'bg-red-600 text-white border-red-600 font-bold shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🩹 প্রাথমিক চিকিৎসা ও অ্যাম্বুলেন্স
              </button>

              <button
                onClick={() => setFilters(prev => ({ ...prev, hasRelief: !prev.hasRelief }))}
                className={`px-3 py-1 rounded-full border transition-all ${
                  filters.hasRelief 
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🍞 শুকনো খাদ্য ও পানি
              </button>

              <button
                onClick={() => setFilters(prev => ({ ...prev, hasDrone: !prev.hasDrone }))}
                className={`px-3 py-1 rounded-full border transition-all ${
                  filters.hasDrone 
                    ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🚁 ড্রোন নজরদারি
              </button>

              {(filters.searchQuery || filters.division || filters.district || filters.organization !== 'all' || filters.hasSpeedboat || filters.hasDivers || filters.hasMedical || filters.hasRelief || filters.hasDrone) && (
                <button
                  onClick={resetFilters}
                  className="px-2.5 py-1 text-red-600 hover:text-red-800 font-bold text-xs underline ml-2"
                >
                  ফিল্টার রিসেট
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                তালিকা ভিউ ({filteredSquads.length})
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'map' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ম্যাপ ভিউ 🗺️
              </button>
            </div>
          </div>
        </div>

        {/* Map View Mode */}
        {activeTab === 'map' && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-red-600" />
                <span>ম্যাপে যেকোনো টিমের মার্কারে ক্লিক করে সরাসরি হটলাইনে কল অথবা SOS মেসেজ পাঠাতে পারবেন।</span>
              </div>
              <span className="font-bold text-gray-800">{filteredSquads.length} টিম ম্যাপে প্রদর্শিত</span>
            </div>

            <div className="h-[520px] w-full relative z-0">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <MapViewController center={mapCenter} zoom={mapZoom} />
                <CachedTileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User GPS location marker */}
                {location.status === 'granted' && location.latitude && location.longitude && (
                  <Marker
                    position={[location.latitude, location.longitude]}
                    icon={createUserLocationIcon()}
                  >
                    <Popup>
                      <div className="p-1 text-center">
                        <div className="font-bold text-blue-700 text-xs">আপনার বর্তমান অবস্থান</div>
                        <div className="text-[10px] text-gray-500">জিপিএস কোঅর্ডিনেট সক্রিয়</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Volunteer Squads Markers */}
                {filteredSquads.map((squad) => (
                  <Marker
                    key={squad.id}
                    position={[squad.latitude, squad.longitude]}
                    icon={createVolunteerIcon(squad.organization, selectedSquad?.id === squad.id)}
                    eventHandlers={{
                      click: () => setSelectedSquad(squad)
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-[220px]">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 border ${getOrgBadgeColor(squad.organization)}`}>
                          {squad.orgNameBn}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 leading-snug">
                          {squad.teamNameBn || squad.teamName}
                        </h4>
                        <div className="text-xs text-gray-600 mt-1 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span>{squad.upazila}, {squad.district}</span>
                        </div>
                        {squad.distanceKm !== undefined && (
                          <div className="text-xs font-semibold text-emerald-700 mt-1">
                            📍 {squad.distanceKm.toFixed(1)} কিমি দূরে
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-700">
                          <strong>সমন্বয়ক:</strong> {squad.leaderOrCoordinator}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <a
                            href={`tel:${squad.primaryPhone}`}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center space-x-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>কল দিন</span>
                          </a>
                          <button
                            onClick={() => setRequestRescueSquad(squad)}
                            className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center space-x-1"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>SOS পাঠান</span>
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Squad Cards Grid */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <RefreshCw className="w-10 h-10 text-red-600 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">উদ্ধারকারী দলসমূহের তালিকা লোড হচ্ছে...</h3>
            <p className="text-xs text-gray-500 mt-1">নিকটবর্তী রেসকিউ টিম ও লাইভ হটলাইন প্রস্তুত করা হচ্ছে</p>
          </div>
        ) : filteredSquads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <HelpCircle className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">কোনো উদ্ধারকারী দল পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
              আপনার নির্বাচিত ফিল্টারে কোনো টিম খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন অথবা আপনার এলাকার টিম তালিকাভুক্ত করুন।
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition-colors"
              >
                ফিল্টার রিসেট করুন
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                + নতুন টিম যোগ করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSquads.map((squad) => (
              <div 
                key={squad.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  
                  {/* Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getOrgBadgeColor(squad.organization)}`}>
                      {squad.orgNameBn}
                    </span>

                    {squad.distanceKm !== undefined ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{squad.distanceKm.toFixed(1)} কিমি</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        ২৪/৭ সক্রিয়
                      </span>
                    )}
                  </div>

                  {/* Team Title */}
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-red-700 transition-colors leading-snug">
                      {squad.teamNameBn || squad.teamName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{squad.upazila}, {squad.district} ({squad.division})</span>
                    </p>
                  </div>

                  {/* Coverage Area */}
                  <div className="text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
                    <div className="text-gray-500 text-[11px] font-semibold">কভারেজ এলাকা:</div>
                    <div className="text-gray-800 font-medium">
                      {squad.coverageAreaBn || squad.coverageArea}
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 mb-1.5">বিশেষ উদ্ধার সক্ষমতা:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {squad.capabilities.map((cap) => (
                        <span 
                          key={cap}
                          className="text-[11px] bg-red-50 text-red-800 border border-red-100 px-2 py-0.5 rounded-lg font-medium"
                        >
                          {cap === 'speedboat' && '🚤 স্পিডবোট/নৌকা'}
                          {cap === 'divers' && '🤿 ডুবুরি ও সাঁতারু'}
                          {cap === 'firstaid' && '🩹 প্রাথমিক চিকিৎসা'}
                          {cap === 'food_relief' && '🍞 খাদ্য ও পানি'}
                          {cap === 'drone' && '🚁 ড্রোন নজরদারি'}
                          {cap === 'climbing_rope' && '🪢 রশি ও স্ট্রেচার'}
                          {cap === 'ambulance' && '🚑 নিজস্ব ফ্রি অ্যাম্বুলেন্স'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Coordinator & Gear */}
                  <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-700">সমন্বয়ক: </span>
                      <span>{squad.leaderOrCoordinator}</span>
                      {squad.leaderDesignation && (
                        <span className="text-[10px] text-gray-500 block">{squad.leaderDesignation}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">সক্রিয় ভলান্টিয়ার: </span>
                      <span className="font-bold text-gray-900">{squad.activeVolunteersCount} জন</span>
                    </div>
                    {squad.equipmentBn && (
                      <div className="text-[11px] text-gray-500 leading-tight pt-1">
                        <strong>সরঞ্জাম:</strong> {squad.equipmentBn}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${squad.primaryPhone}`}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>কল দিন ({squad.primaryPhone.slice(-6)})</span>
                    </a>

                    <button
                      onClick={() => {
                        const targetPhone = squad.whatsappNumber || squad.primaryPhone;
                        const clean = targetPhone.replace(/[^0-9]/g, '');
                        const msg = encodeURIComponent(`জরুরি বার্তা: আসসালামু আলাইকুম। আমি ${squad.upazila} এলাকা থেকে যোগাযোগ করছি। উদ্ধার সহায়তার জন্য বিস্তারিত তথ্য পাঠাতে চাই।`);
                        window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
                      }}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-green-50 hover:bg-green-100 text-emerald-800 border border-green-300 rounded-xl text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp চ্যাট</span>
                    </button>
                  </div>

                  {/* 1-Click SOS Rescue Request Button */}
                  <button
                    onClick={() => setRequestRescueSquad(squad)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-md"
                  >
                    <ShieldAlert className="w-4 h-4 text-yellow-300" />
                    <span>জরুরি উদ্ধার সহায়তা চান (SOS Request)</span>
                  </button>

                  {/* Map view locator */}
                  <button
                    onClick={() => {
                      setActiveTab('map');
                      handleSelectSquad(squad);
                    }}
                    className="w-full text-center text-[11px] text-gray-500 hover:text-gray-800 font-semibold pt-1 transition-colors"
                  >
                    🗺️ ম্যাপে অবস্থান ও রুট দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community Volunteer Callout Footer */}
        <div className="mt-12 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-yellow-200">
              <HeartHandshake className="w-4 h-4" />
              <span>মানবতার সেবায় এগিয়ে আসুন</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              আপনি কি কোনো উদ্ধারকারী দল বা বোটের সাথে যুক্ত?
            </h3>
            <p className="text-sm text-emerald-100 max-w-xl">
              আপনার এলাকার ক্লাব, তরুণ দল, স্পিডবোট বা রিলিফ টিমকে সুরক্ষা এআই বিডি ডিরেক্টরিতে বিনামূল্যে অন্তর্ভুক্ত করুন।
            </p>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex-shrink-0 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold rounded-2xl shadow-lg transition-transform active:scale-95 text-sm"
          >
            + নতুন টিম তালিকাভুক্ত করুন
          </button>
        </div>
      </div>

      {/* Modals */}
      {requestRescueSquad && (
        <RescueRequestModal
          squad={requestRescueSquad}
          userLat={location.status === 'granted' ? location.latitude : undefined}
          userLng={location.status === 'granted' ? location.longitude : undefined}
          onClose={() => setRequestRescueSquad(null)}
        />
      )}

      {showRegisterModal && (
        <VolunteerRegistrationModal
          userLat={location.status === 'granted' ? location.latitude : undefined}
          userLng={location.status === 'granted' ? location.longitude : undefined}
          onClose={() => setShowRegisterModal(false)}
          onSquadRegistered={(newSquad) => {
            setSquads(prev => [newSquad, ...prev]);
          }}
        />
      )}
    </div>
  );
}
