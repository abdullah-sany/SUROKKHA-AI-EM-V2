import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Waves, Wind, ShieldAlert, Phone, Navigation, MapPin, 
  Search, Filter, CheckCircle2, AlertTriangle, Users, 
  Sun, Droplets, Accessibility, Info, Compass, 
  ChevronRight, RefreshCw, X, Eye, PhoneCall, ExternalLink,
  LifeBuoy, Sparkles, Building, Layers, Check, Share2, AlertOctagon
} from 'lucide-react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shelter, ShelterFilterOptions, ShelterType } from '../types';
import { 
  getAllShelters, 
  filterShelters, 
  sortSheltersByDistance, 
  CYCLONE_SIGNALS, 
  DISASTER_HOTLINES, 
  CycloneSignalInfo 
} from '../services/shelterService';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshDistricts';
import { useLocation } from '../hooks/useLocation';
import { useLanguage } from '../contexts/LanguageContext';
import { CachedTileLayer } from '../components/CachedTileLayer';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { DisasterChecklist } from '../components/DisasterChecklist';
import { EmergencyShelterShareModal } from '../components/EmergencyShelterShareModal';

// Custom Map Marker Icons using Leaflet DivIcon
const createShelterIcon = (type: ShelterType, isSelected: boolean = false) => {
  let bgClass = 'bg-blue-600 border-blue-800 text-white';
  let emoji = '🌀';

  if (type === 'flood') {
    bgClass = 'bg-cyan-600 border-cyan-800 text-white';
    emoji = '🌊';
  } else if (type === 'multipurpose') {
    bgClass = 'bg-emerald-600 border-emerald-800 text-white';
    emoji = '🏛️';
  } else if (type === 'school_cum_shelter') {
    bgClass = 'bg-amber-600 border-amber-800 text-white';
    emoji = '🏫';
  }

  const selectedRing = isSelected ? 'ring-4 ring-red-500 scale-125 z-50' : 'hover:scale-110';

  return L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 ${bgClass} ${selectedRing} transition-transform text-sm select-none">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-6 h-6 bg-red-500 rounded-full opacity-40 animate-ping"></div>
      <div class="w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white shadow-md"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to pan/zoom map programmatically
function MapController({ 
  center, 
  zoom 
}: { 
  center: [number, number]; 
  zoom: number; 
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function CycloneFloodShelterLocator() {
  const { language, t } = useLanguage();
  const { isOnline } = useNetworkStatus();
  const { location, requestLocation } = useLocation();

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<CycloneSignalInfo | null>(null);
  const [mobileTab, setMobileTab] = useState<'both' | 'map' | 'list'>('both');

  // Filters state
  const [filters, setFilters] = useState<ShelterFilterOptions>({
    searchQuery: '',
    division: '',
    district: '',
    upazila: '',
    type: 'all',
    hasLivestockSpace: false,
    hasSolarPower: false,
    hasCleanWater: false,
    hasRampAccess: false,
    hasWomenToilet: false
  });

  // Map viewport state: defaults to coastal Bangladesh
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.3569, 91.7832]); // Chattogram coastal default
  const [mapZoom, setMapZoom] = useState(8);

  // Load shelter data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAllShelters();
        setShelters(data);
      } catch (err) {
        console.error('Failed to load shelters:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // When GPS location is granted, recalculate distance and re-center map
  useEffect(() => {
    if (location.status === 'granted' && location.latitude && location.longitude) {
      setMapCenter([location.latitude, location.longitude]);
      setMapZoom(11);
    }
  }, [location.status, location.latitude, location.longitude]);

  // Compute processed & sorted shelters
  const processedShelters = useMemo(() => {
    let list = shelters;
    if (location.status === 'granted' && location.latitude && location.longitude) {
      list = sortSheltersByDistance(shelters, location.latitude, location.longitude);
    }
    return filterShelters(list, filters);
  }, [shelters, filters, location.status, location.latitude, location.longitude]);

  // Available districts based on division selection
  const availableDistricts = useMemo(() => {
    if (!filters.division) return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter(
      d => d.division.toLowerCase() === filters.division.toLowerCase()
    );
  }, [filters.division]);

  // Handle fly to shelter on map
  const handleSelectShelter = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    setMapCenter([shelter.latitude, shelter.longitude]);
    setMapZoom(13);
    // On small screens, switch to map view
    if (window.innerWidth < 768) {
      setMobileTab('map');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      division: '',
      district: '',
      upazila: '',
      type: 'all',
      hasLivestockSpace: false,
      hasSolarPower: false,
      hasCleanWater: false,
      hasRampAccess: false,
      hasWomenToilet: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-teal-900 via-blue-900 to-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-2">
                <Waves className="w-3.5 h-3.5 text-teal-300" />
                <span>{language === 'bn' ? 'উপকূলীয় ও বন্যা প্রস্তুতি' : 'Coastal & Flood Preparedness'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300">{language === 'bn' ? '১০০% অফলাইন প্রস্তুত' : '100% Offline Ready'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('shelter.title')}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">
                {t('shelter.subtitle')}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={requestLocation}
                disabled={location.status === 'loading'}
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
              >
                <Compass className={`w-4 h-4 ${location.status === 'loading' ? 'animate-spin' : ''}`} />
                <span>
                  {location.status === 'loading'
                    ? (language === 'bn' ? 'সনাক্ত করা হচ্ছে...' : 'Locating...')
                    : t('shelter.btn.locate')}
                </span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
                title={language === 'bn' ? 'জরুরি লোকেশন শেয়ার করুন' : 'Share SOS location'}
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>{language === 'bn' ? 'জরুরি SOS শেয়ার' : 'Emergency SOS'}</span>
              </button>

              <Link
                to="/volunteers"
                className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2.5 rounded-lg text-sm shadow transition cursor-pointer active:scale-95"
              >
                <Users className="w-4 h-4 text-yellow-300" />
                <span>{language === 'bn' ? 'উদ্ধারকারী টিম ডিরেক্টরি' : 'Rescue Squads'}</span>
              </Link>

              <button
                onClick={() => setShowSignalModal(true)}
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2.5 rounded-lg text-sm shadow transition cursor-pointer active:scale-95"
              >
                <Wind className="w-4 h-4 text-slate-900" />
                <span>{language === 'bn' ? 'ঘূর্ণিঝড় সংকেত (১-১০)' : 'Cyclone Signals (1-10)'}</span>
              </button>

              <a
                href="tel:1090"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-lg text-sm shadow transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{language === 'bn' ? '১০৯০ (টোল ফ্রি)' : '1090 IVR'}</span>
              </a>
            </div>
          </div>

          {/* Quick Disaster Helplines Ticker */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              {t('shelter.hotlines_title')}:
            </span>
            {DISASTER_HOTLINES.map((hotline) => (
              <a
                key={hotline.number}
                href={`tel:${hotline.number}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-200 transition"
              >
                <Phone className="w-3 h-3 text-teal-400" />
                <span className="font-bold text-white">{hotline.number}</span>
                <span className="text-slate-300">({language === 'bn' ? hotline.titleBn : hotline.titleEn})</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full flex-grow flex flex-col">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder={t('shelter.search_placeholder')}
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Division Dropdown */}
            <div>
              <select
                value={filters.division}
                onChange={(e) => setFilters(prev => ({ ...prev, division: e.target.value, district: '' }))}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="">{language === 'bn' ? 'সকল বিভাগ (All Divisions)' : 'All Divisions'}</option>
                <option value="Chattogram">{language === 'bn' ? 'চট্টগ্রাম (Chattogram)' : 'Chattogram'}</option>
                <option value="Barishal">{language === 'bn' ? 'বরিশাল (Barishal)' : 'Barishal'}</option>
                <option value="Khulna">{language === 'bn' ? 'খুলনা (Khulna)' : 'Khulna'}</option>
                <option value="Sylhet">{language === 'bn' ? 'সিলেট (Sylhet)' : 'Sylhet'}</option>
                <option value="Rangpur">{language === 'bn' ? 'রংপুর (Rangpur)' : 'Rangpur'}</option>
                <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী (Rajshahi)' : 'Rajshahi'}</option>
                <option value="Dhaka">{language === 'bn' ? 'ঢাকা (Dhaka)' : 'Dhaka'}</option>
                <option value="Mymensingh">{language === 'bn' ? 'ময়মনসিংহ (Mymensingh)' : 'Mymensingh'}</option>
              </select>
            </div>

            {/* District Dropdown */}
            <div>
              <select
                value={filters.district}
                onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="">{language === 'bn' ? 'সকল জেলা (All Districts)' : 'All Districts'}</option>
                {availableDistricts.map((d) => (
                  <option key={d.en} value={d.en}>
                    {language === 'bn' ? `${d.bn} (${d.en})` : d.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shelter Type Pills & Facility Checkboxes */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {/* Type selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500 mr-1">
                {language === 'bn' ? 'ধরন:' : 'Type:'}
              </span>
              {[
                { id: 'all', labelBn: 'সকল আশ্রয়', labelEn: 'All' },
                { id: 'cyclone', labelBn: '🌀 ঘূর্ণিঝড়', labelEn: '🌀 Cyclone' },
                { id: 'flood', labelBn: '🌊 বন্যা', labelEn: '🌊 Flood' },
                { id: 'multipurpose', labelBn: '🏛️ মুজিব কিল্লা', labelEn: '🏛️ Mujib Killa' },
              ].map((tOption) => (
                <button
                  key={tOption.id}
                  onClick={() => setFilters(prev => ({ ...prev, type: tOption.id }))}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition cursor-pointer ${
                    filters.type === tOption.id
                      ? 'bg-teal-700 text-white font-bold shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'bn' ? tOption.labelBn : tOption.labelEn}
                </button>
              ))}
            </div>

            {/* Key Facility Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 select-none">
                <input
                  type="checkbox"
                  checked={filters.hasLivestockSpace}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasLivestockSpace: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>🐮 {language === 'bn' ? 'গবাদিপশুর জায়গা' : 'Livestock Space'}</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 select-none">
                <input
                  type="checkbox"
                  checked={filters.hasSolarPower}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasSolarPower: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>☀️ {language === 'bn' ? 'সৌর বিদ্যুৎ' : 'Solar Power'}</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 select-none">
                <input
                  type="checkbox"
                  checked={filters.hasCleanWater}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasCleanWater: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>💧 {language === 'bn' ? 'বিশুদ্ধ পানি' : 'Drinking Water'}</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 select-none">
                <input
                  type="checkbox"
                  checked={filters.hasWomenToilet}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasWomenToilet: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>🚻 {language === 'bn' ? 'আলাদা নারী টয়লেট' : 'Women Toilet'}</span>
              </label>

              {(filters.searchQuery || filters.division || filters.district || filters.type !== 'all' || filters.hasLivestockSpace || filters.hasSolarPower || filters.hasCleanWater || filters.hasWomenToilet) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 hover:underline font-semibold ml-2 cursor-pointer"
                >
                  {language === 'bn' ? 'রিসেট' : 'Reset'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle Buttons */}
        <div className="md:hidden flex rounded-lg bg-gray-200 p-1 mb-4">
          <button
            onClick={() => setMobileTab('both')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mobileTab === 'both' ? 'bg-white shadow text-teal-800' : 'text-gray-600'
            }`}
          >
            {language === 'bn' ? 'উভয়ই' : 'Split'}
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mobileTab === 'map' ? 'bg-white shadow text-teal-800' : 'text-gray-600'
            }`}
          >
            {language === 'bn' ? 'মানচিত্র' : 'Map'}
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mobileTab === 'list' ? 'bg-white shadow text-teal-800' : 'text-gray-600'
            }`}
          >
            {language === 'bn' ? `তালিকা (${processedShelters.length})` : `List (${processedShelters.length})`}
          </button>
        </div>

        {/* Content Layout: Map + List */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow">
          {/* Map Column */}
          <div
            className={`md:col-span-7 lg:col-span-7 flex flex-col ${
              mobileTab === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px] md:h-[620px] relative">
              {/* Map header info */}
              <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-xs z-10">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold">
                    {language === 'bn'
                      ? `প্রদর্শিত হচ্ছে ${processedShelters.length} টি আশ্রয়কেন্দ্র`
                      : `Displaying ${processedShelters.length} Shelters`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">
                    {language === 'bn' ? 'টাইলস ক্যাশ মোড' : 'Tile Cache Active'}
                  </span>
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="flex-grow relative z-0">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <MapController center={mapCenter} zoom={mapZoom} />

                  {/* Offline-friendly CachedTileLayer */}
                  <CachedTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    mapStyleKey="osm_streets"
                  />

                  {/* User Location Marker */}
                  {location.status === 'granted' && location.latitude && location.longitude && (
                    <Marker
                      position={[location.latitude, location.longitude]}
                      icon={userLocationIcon}
                    >
                      <Popup>
                        <div className="p-1 text-xs">
                          <p className="font-bold text-red-600">
                            {language === 'bn' ? '📍 আপনার বর্তমান অবস্থান' : '📍 Your Current Location'}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Shelter Markers */}
                  {processedShelters.map((shelter) => {
                    const isSelected = selectedShelter?.id === shelter.id;
                    return (
                      <Marker
                        key={shelter.id}
                        position={[shelter.latitude, shelter.longitude]}
                        icon={createShelterIcon(shelter.type, isSelected)}
                        eventHandlers={{
                          click: () => {
                            setSelectedShelter(shelter);
                          }
                        }}
                      >
                        <Popup className="shelter-popup">
                          <div className="p-1 max-w-[260px] text-slate-800">
                            <div className="flex items-center space-x-1.5 mb-1">
                              <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                                {shelter.type}
                              </span>
                              {shelter.distanceKm !== undefined && (
                                <span className="text-xs text-gray-500 font-semibold ml-auto">
                                  {shelter.distanceKm.toFixed(1)} km
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 leading-snug">
                              {language === 'bn' ? shelter.nameBn : shelter.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {shelter.unionArea}, {shelter.upazila}, {shelter.district}
                            </p>

                            <div className="mt-2 text-xs space-y-1 bg-slate-50 p-2 rounded border border-gray-100">
                              <div className="flex justify-between">
                                <span className="text-gray-500">{t('shelter.capacity.people')}:</span>
                                <span className="font-bold text-teal-700">{shelter.capacityPeople}</span>
                              </div>
                              {shelter.capacityLivestock > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('shelter.capacity.livestock')}:</span>
                                  <span className="font-bold text-amber-700">{shelter.capacityLivestock}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-500">{t('shelter.contact_person')}:</span>
                                <span className="font-medium text-slate-700 truncate">{shelter.contactPerson}</span>
                              </div>
                            </div>

                            <div className="mt-2.5 flex items-center space-x-1.5">
                              <a
                                href={`tel:${shelter.contactPhone}`}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded text-xs text-center flex items-center justify-center space-x-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{t('common.call')}</span>
                              </a>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-2 rounded text-xs text-center flex items-center justify-center space-x-1"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>{t('shelter.directions')}</span>
                              </a>
                              <button
                                onClick={() => {
                                  setSelectedShelter(shelter);
                                  setShowShareModal(true);
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-2 rounded text-xs flex items-center justify-center space-x-1 cursor-pointer"
                                title={language === 'bn' ? 'জরুরি লোকেশন শেয়ার' : 'Share SOS'}
                              >
                                <Share2 className="w-3 h-3" />
                                <span>SOS</span>
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Map floating legend */}
              <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-gray-200 text-xs hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                  <span className="font-medium text-slate-700">{language === 'bn' ? 'ঘূর্ণিঝড়' : 'Cyclone'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-cyan-600 inline-block"></span>
                  <span className="font-medium text-slate-700">{language === 'bn' ? 'বন্যা' : 'Flood'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span className="font-medium text-slate-700">{language === 'bn' ? 'মুজিব কিল্লা' : 'Mujib Killa'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shelter Cards List Column */}
          <div
            className={`md:col-span-5 lg:col-span-5 flex flex-col space-y-3 ${
              mobileTab === 'map' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Quick Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn'
                  ? `খুঁজে পাওয়া আশ্রয়কেন্দ্র (${processedShelters.length})`
                  : `Available Shelters (${processedShelters.length})`}
              </span>
              {location.status === 'granted' && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'দূরত্ব অনুসারে সাজানো' : 'Sorted by distance'}
                </span>
              )}
            </div>

            {/* List scroll container */}
            <div className="overflow-y-auto max-h-[620px] pr-1 space-y-3.5">
              {processedShelters.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-base">{t('shelter.empty_title')}</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">{t('shelter.empty_desc')}</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    {language === 'bn' ? 'সকল ফিল্টার মুছুন' : 'Clear All Filters'}
                  </button>
                </div>
              ) : (
                processedShelters.map((shelter) => {
                  const isSelected = selectedShelter?.id === shelter.id;
                  return (
                    <div
                      key={shelter.id}
                      onClick={() => handleSelectShelter(shelter)}
                      className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                shelter.type === 'cyclone'
                                  ? 'bg-blue-100 text-blue-800'
                                  : shelter.type === 'flood'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {shelter.type === 'cyclone'
                                ? (language === 'bn' ? 'ঘূর্ণিঝড় আশ্রয়' : 'Cyclone Shelter')
                                : shelter.type === 'flood'
                                ? (language === 'bn' ? 'বন্যা আশ্রয়' : 'Flood Shelter')
                                : (language === 'bn' ? 'মুজিব কিল্লা ও আশ্রয়' : 'Mujib Killa')}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                              {shelter.floors} {t('shelter.floors')}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">
                            {language === 'bn' ? shelter.nameBn : shelter.name}
                          </h3>

                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>
                              {shelter.unionArea}, {shelter.upazila}, {shelter.district}
                            </span>
                          </p>
                        </div>

                        {/* Distance badge if GPS active */}
                        {shelter.distanceKm !== undefined && (
                          <div className="text-right shrink-0">
                            <span className="inline-block bg-teal-100 text-teal-900 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                              {shelter.distanceKm < 1
                                ? `${Math.round(shelter.distanceKm * 1000)} m`
                                : `${shelter.distanceKm.toFixed(1)} km`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity numbers */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-gray-500 block">{t('shelter.capacity.people')}</span>
                          <span className="font-extrabold text-teal-800 text-sm flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-teal-600" />
                            {shelter.capacityPeople.toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-gray-500 block">{t('shelter.capacity.livestock')}</span>
                          <span className="font-extrabold text-amber-800 text-sm">
                            {shelter.capacityLivestock > 0
                              ? `🐮 ${shelter.capacityLivestock.toLocaleString()}`
                              : (language === 'bn' ? 'নেই' : 'N/A')}
                          </span>
                        </div>
                      </div>

                      {/* Facilities badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {shelter.facilities.includes('drinking_water') && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                            💧 {language === 'bn' ? 'বিশুদ্ধ পানি' : 'Water'}
                          </span>
                        )}
                        {shelter.facilities.includes('solar_power') && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                            ☀️ {language === 'bn' ? 'সৌর বিদ্যুৎ' : 'Solar'}
                          </span>
                        )}
                        {shelter.facilities.includes('separate_women_toilet') && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">
                            🚻 {language === 'bn' ? 'নারী টয়লেট' : 'Women WC'}
                          </span>
                        )}
                        {shelter.facilities.includes('ramp_access') && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                            ♿ {language === 'bn' ? 'হুইলচেয়ার র‍্যাম্প' : 'Ramp'}
                          </span>
                        )}
                        {shelter.facilities.includes('livestock_shed') && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                            🐮 {language === 'bn' ? 'কিল্লা শেড' : 'Killa'}
                          </span>
                        )}
                      </div>

                      {/* In-Charge & Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-slate-800 block">{shelter.contactPerson}</span>
                          <span className="text-[11px] text-gray-400">{shelter.contactDesignation || 'Shelter Caretaker'}</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShelter(shelter);
                              setShowShareModal(true);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1 shadow-sm transition active:scale-95 cursor-pointer"
                            title={language === 'bn' ? 'জরুরি SOS শেয়ার' : 'Share SOS'}
                          >
                            <Share2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>{language === 'bn' ? 'SOS' : 'SOS'}</span>
                          </button>

                          <a
                            href={`tel:${shelter.contactPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'কল' : 'Call'}</span>
                          </a>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition active:scale-95"
                          >
                            <Navigation className="w-3.5 h-3.5 text-teal-400" />
                            <span>{language === 'bn' ? 'ম্যাপ' : 'Nav'}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Interactive Disaster Preparedness & Go-Bag Checklist */}
        <div className="mt-10">
          <DisasterChecklist />
        </div>

        {/* Disaster Preparedness & Flood Safety Info Guide */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {t('shelter.disaster_tips')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-sm block mb-1.5">
                🎒 {language === 'bn' ? '১. জরুরি ব্যাগ প্রস্তুত রাখুন' : '1. Prepare Go-Bag'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'শুকনো খাবার (চিঁড়া, গুড়, বিস্কুট), বোতলজাত পানি, ম্যাচ, মোমবাতি, টর্চলাইট, ওরস্যালাইন, প্রয়োজনীয় ওষুধ ও জাতীয় পরিচয়পত্র পলিথিনে মুড়ে নিরাপদে রাখুন।'
                  : 'Pack dry food, clean bottled water, flashlight, essential medicines, oral saline, and identification documents in a waterproof bag.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-sm block mb-1.5">
                🐮 {language === 'bn' ? '২. গবাদিপশুর নিরাপত্তা নিশ্চিত করুন' : '2. Secure Livestock'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'ঝড়ের আগমুহূর্তে গবাদিপশুকে কোনো অবস্থাতেই দড়ি দিয়ে বেঁধে রাখবেন না। নিকটস্থ মুজিব কিল্লা অথবা উঁচু মাটির ঢিবিতে আগেই সরিয়ে নিন।'
                  : 'Untie all cattle and livestock before the storm surge hits. Move them early to the nearest elevated Mujib Killa or highland.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-sm block mb-1.5">
                🏃 {language === 'bn' ? '৩. সংকেত ৫ পেলেই আশ্রয়কেন্দ্রে যান' : '3. Move on Signal 5+'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'বিপদ সংকেত ৫ ঘোষিত হলেই নারী, শিশু ও বৃদ্ধদের নিয়ে অবিলম্বে নিকটস্থ সাইক্লোন শেল্টারে চলে যান। রাত নামার অপেক্ষা করবেন না।'
                  : 'Do not wait for darkness or storm surge. Evacuate pregnant mothers, children, and the elderly immediately when Danger Signal 5 is hoisted.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cyclone Warning Signals Modal (1 to 10) */}
      {showSignalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base sm:text-lg">
                  {t('shelter.cyclone_signals')}
                </h3>
              </div>
              <button
                onClick={() => setShowSignalModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-gray-100 text-xs">
              {CYCLONE_SIGNALS.map((sig) => {
                const isGreatDanger = sig.level === 'great_danger';
                const isDanger = sig.level === 'danger';
                return (
                  <div key={sig.signal} className="pt-3 first:pt-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-xs ${
                          isGreatDanger
                            ? 'bg-red-600 text-white'
                            : isDanger
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {language === 'bn' ? `সংকেত নং ${sig.signal}` : `Signal #${sig.signal}`}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {language === 'bn' ? sig.titleBn : sig.titleEn}
                      </span>
                    </div>

                    <p className="text-gray-600 mt-1">
                      {language === 'bn' ? sig.descBn : sig.descEn}
                    </p>

                    <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                      <span className="font-bold text-teal-800 mr-1">
                        {language === 'bn' ? 'করণীয়:' : 'Action Required:'}
                      </span>
                      {language === 'bn' ? sig.actionBn : sig.actionEn}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {language === 'bn' ? 'উৎস: বাংলাদেশ আবহাওয়া অধিদপ্তর ও সিপিপি' : 'Source: BMD & CPP Bangladesh'}
              </span>
              <button
                onClick={() => setShowSignalModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Share Modal (WhatsApp / Native SMS / Copy) */}
      <EmergencyShelterShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        selectedShelter={selectedShelter}
        userCoords={{ latitude: location.latitude, longitude: location.longitude }}
      />
    </div>
  );
}
