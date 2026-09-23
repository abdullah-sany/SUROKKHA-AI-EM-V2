import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, Crosshair, Building2, Pill, CheckCircle2, AlertTriangle, 
  Phone, ExternalLink, RefreshCw, Radio, Compass, Navigation, 
  Maximize2, Minimize2, Footprints, Car, Layers, Info, Siren, 
  Share2, Check, Sparkles, ShieldAlert, HeartPulse, Moon, Sun, Globe
} from 'lucide-react';
import { HealthcareFacility, Ambulance } from '../types';
import { useLocation } from '../hooks/useLocation';
import { calculateDistanceKm } from '../utils/haversine';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchLiveOsmHospitals } from '../services/osmService';
import { fetchRoadRoute, OsrmRouteResult } from '../services/routingService';
import { MapContainer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import { CachedTileLayer } from '../components/CachedTileLayer';
import { getCachedTileCount, clearMapTileCache } from '../utils/mapTileCache';
import bundledHospitals from '../data/hospitals.json';
import bundledAmbulances from '../data/ambulances.json';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create Custom Map Marker Icons using Leaflet DivIcon
const userLocationIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="user-pulse-marker">
      <div class="pulse-ring"></div>
      <div class="core-dot"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const createFacilityIcon = (type: string, isSelected: boolean = false, isIcu: boolean = false) => {
  let pinClass = 'hospital';
  let symbol = '✚';

  if (type === 'Ambulance') {
    pinClass = 'ambulance';
    symbol = '🚑';
  } else if (isIcu) {
    pinClass = 'icu';
    symbol = '🫀';
  } else if (type.includes('Pharmacy')) {
    pinClass = 'pharmacy';
    symbol = '℞';
  } else if (type.includes('Clinic')) {
    pinClass = 'clinic';
    symbol = '✚';
  } else if (type.includes('Diagnostic')) {
    pinClass = 'diagnostic';
    symbol = '🔬';
  }

  const selectedBorder = isSelected ? 'border-4 !border-yellow-400 scale-125 z-[1000]' : '';

  return L.divIcon({
    className: 'custom-facility-icon',
    html: `
      <div class="facility-pin ${pinClass} ${selectedBorder}">
        <span style="font-size: 14px; line-height: 1; font-weight: bold;">${symbol}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Map center transition helper
function MapController({ 
  center, 
  zoom 
}: { 
  center: [number, number]; 
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
}

export default function NearbyFacilities() {
  const { t, language } = useLanguage();
  const { location, requestLocation } = useLocation();

  // State
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(false);
  const [osmLoading, setOsmLoading] = useState(false);
  const [error, setError] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'icu' | 'hospital' | 'ambulance' | 'pharmacy' | 'clinic'>('all');
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [liveOsmCount, setLiveOsmCount] = useState<number>(0);
  
  // Advanced features state
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [activeRoadRoute, setActiveRoadRoute] = useState<OsrmRouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [copiedSos, setCopiedSos] = useState(false);
  const [isOfflineLoaded, setIsOfflineLoaded] = useState(false);
  const [cachedTilesCount, setCachedTilesCount] = useState<number>(0);

  const mapRef = useRef<any>(null);

  // Sync IndexedDB tile count
  const refreshTileCount = async () => {
    try {
      const count = await getCachedTileCount();
      setCachedTilesCount(count);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    refreshTileCount();
  }, []);

  const handleClearTileCache = async () => {
    await clearMapTileCache();
    await refreshTileCount();
  };

  // Helper to identify ICU or 24/7 emergency capability
  const isEmergencyOrICU = (f: HealthcareFacility) => {
    const text = `${f.name} ${f.facilityType} ${f.area}`.toLowerCase();
    return (
      f.facilityType.includes('Medical College') ||
      text.includes('icu') ||
      text.includes('general hospital') ||
      text.includes('emergency') ||
      text.includes('মেডিকেল') ||
      text.includes('সদর') ||
      text.includes('সদর হাসপাতাল') ||
      !!f.emergencyPhone
    );
  };

  // Fetch verified local facilities + real-time OpenStreetMap Overpass facilities + Ambulances
  const fetchNearby = async () => {
    if (location.status !== 'granted' || !location.latitude || !location.longitude) return;

    setLoading(true);
    setError('');
    setSelectedFacility(null);
    setActiveRoadRoute(null);

    try {
      // 1. Fetch Local Facilities & Ambulances in Parallel
      const [localRes, ambRes] = await Promise.allSettled([
        fetch('/api/healthcare'),
        fetch('/api/ambulances')
      ]);

      let localData: HealthcareFacility[] = [];
      if (localRes.status === 'fulfilled' && localRes.value.ok) {
        localData = await localRes.value.json();
      } else if (bundledHospitals && (bundledHospitals as any[]).length > 0) {
        localData = bundledHospitals as HealthcareFacility[];
      }

      let ambData: Ambulance[] = [];
      if (ambRes.status === 'fulfilled' && ambRes.value.ok) {
        ambData = await ambRes.value.json();
      } else if (bundledAmbulances && (bundledAmbulances as any[]).length > 0) {
        ambData = bundledAmbulances as Ambulance[];
      }

      // Calculate distances for local facilities
      const processedLocal = localData.map(f => {
        if (f.latitude && f.longitude) {
          f.distanceKm = calculateDistanceKm(location.latitude!, location.longitude!, f.latitude, f.longitude);
        }
        return f;
      }).filter(f => f.distanceKm !== undefined && f.distanceKm <= radiusKm);

      // Process ambulances
      const processedAmbulances = ambData.map(a => {
        if (a.latitude && a.longitude) {
          a.distanceKm = calculateDistanceKm(location.latitude!, location.longitude!, a.latitude, a.longitude);
        }
        return a;
      }).filter(a => a.distanceKm !== undefined && a.distanceKm <= radiusKm);

      setAmbulances(processedAmbulances);

      // 2. Fetch Live Real-time facilities from OpenStreetMap
      setOsmLoading(true);
      let osmResults: HealthcareFacility[] = [];
      try {
        const radiusMeters = Math.max(radiusKm * 1000, 3000);
        osmResults = await fetchLiveOsmHospitals(location.latitude, location.longitude, radiusMeters);
        
        osmResults = osmResults.map(f => {
          if (f.latitude && f.longitude) {
            f.distanceKm = calculateDistanceKm(location.latitude!, location.longitude!, f.latitude, f.longitude);
          }
          return f;
        }).filter(f => f.distanceKm !== undefined && f.distanceKm <= radiusKm);
        
        setLiveOsmCount(osmResults.length);
      } catch (osmErr) {
        console.warn("OSM Overpass live query fallback:", osmErr);
      } finally {
        setOsmLoading(false);
      }

      // 3. Smart Merge
      const merged: HealthcareFacility[] = [...processedLocal];

      for (const osmF of osmResults) {
        const isDuplicate = merged.some(existing => {
          if (existing.latitude && existing.longitude && osmF.latitude && osmF.longitude) {
            const dist = calculateDistanceKm(existing.latitude, existing.longitude, osmF.latitude, osmF.longitude);
            if (dist < 0.12) return true; // within 120m
          }
          if (existing.name.toLowerCase() === osmF.name.toLowerCase()) return true;
          return false;
        });

        if (!isDuplicate) {
          merged.push(osmF);
        }
      }

      // Sort ascending by distance
      merged.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      setFacilities(merged);

      // Cache offline
      try {
        localStorage.setItem('surokkha_cached_nearby', JSON.stringify({
          facilities: merged.slice(0, 30),
          ambulances: processedAmbulances.slice(0, 15),
          timestamp: Date.now()
        }));
        setIsOfflineLoaded(true);
      } catch (storageErr) {
        console.warn("LocalStorage cache quota reached:", storageErr);
      }

    } catch (err) {
      console.error("Error fetching nearby facilities:", err);
      // Try restoring from offline cache if network fails
      const cached = localStorage.getItem('surokkha_cached_nearby');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.facilities) setFacilities(parsed.facilities);
          if (parsed.ambulances) setAmbulances(parsed.ambulances);
          setIsOfflineLoaded(true);
        } catch {
          setError(t('healthcare.error.title'));
        }
      } else {
        setError(t('healthcare.error.title'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.status === 'idle') {
      requestLocation();
    }
  }, [location.status, requestLocation]);

  useEffect(() => {
    if (location.status === 'granted' && location.latitude && location.longitude) {
      fetchNearby();
    }
  }, [location.status, location.latitude, location.longitude, radiusKm]);

  // Real Turn-by-Turn Road Route Fetching when a facility is selected
  useEffect(() => {
    if (!selectedFacility || !location.latitude || !location.longitude || !selectedFacility.latitude || !selectedFacility.longitude) {
      setActiveRoadRoute(null);
      return;
    }

    let isMounted = true;
    setRouteLoading(true);

    fetchRoadRoute(
      location.latitude,
      location.longitude,
      selectedFacility.latitude,
      selectedFacility.longitude
    ).then(route => {
      if (isMounted) {
        setActiveRoadRoute(route);
        setRouteLoading(false);
      }
    }).catch(() => {
      if (isMounted) setRouteLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedFacility, location.latitude, location.longitude]);

  // Filtered facilities based on user category filter
  const displayedFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'icu') {
        return isEmergencyOrICU(f);
      }
      if (categoryFilter === 'hospital') {
        return f.facilityType.includes('Hospital') || f.facilityType.includes('Medical College');
      }
      if (categoryFilter === 'pharmacy') {
        return f.facilityType.includes('Pharmacy');
      }
      if (categoryFilter === 'clinic') {
        return f.facilityType.includes('Clinic') || f.facilityType.includes('Diagnostic');
      }
      return true;
    });
  }, [facilities, categoryFilter]);

  // Handle facility card click -> pan map to target & select
  const handleSelectFacility = (facility: HealthcareFacility) => {
    setSelectedFacility(facility);
  };

  // Convert Ambulance item to compatible facility structure for map preview
  const handleSelectAmbulance = (amb: Ambulance) => {
    const asFacility: HealthcareFacility = {
      id: amb.id,
      name: amb.providerName,
      facilityType: 'Ambulance',
      division: amb.division,
      district: amb.district,
      area: amb.area,
      ownership: 'Private',
      phone: amb.phone,
      emergencyPhone: amb.phone,
      latitude: amb.latitude,
      longitude: amb.longitude,
      verified: amb.verified,
      source: amb.source,
      lastVerifiedAt: amb.lastVerifiedAt,
      distanceKm: amb.distanceKm
    };
    setSelectedFacility(asFacility);
  };

  // SOS Location Share to WhatsApp
  const handleShareSos = () => {
    if (!location.latitude || !location.longitude) return;
    const destName = selectedFacility ? (language === 'bn' && selectedFacility.nameBn ? selectedFacility.nameBn : selectedFacility.name) : '';
    const myLocUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const destUrl = selectedFacility ? `https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}` : '';

    const msg = language === 'bn' 
      ? `🚨 জরুরি চিকিৎসা সহায়তা প্রয়োজন!\nআমার বর্তমান অবস্থান: ${myLocUrl}\n${destName ? `গন্তব্য হাসপাতাল: ${destName}\nহাসপাতালের পথ: ${destUrl}` : ''}`
      : `🚨 Emergency Medical Assistance Needed!\nMy Live Location: ${myLocUrl}\n${destName ? `Heading to: ${destName}\nRoute: ${destUrl}` : ''}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');

    // Also copy to clipboard
    navigator.clipboard?.writeText(msg);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 3000);
  };

  const getFacilityIcon = (type: string) => {
    if (type === 'Ambulance') return <Siren className="h-4 w-4 text-orange-600" />;
    if (type.includes('Pharmacy')) return <Pill className="h-4 w-4" />;
    return <Building2 className="h-4 w-4" />;
  };

  const translateType = (type: string) => {
    if (type === 'Ambulance') return t('nearby.filter_ambulance');
    if (type === 'Private Hospital / Clinic') return t('type.private');
    if (type === 'Medical College Hospital') return t('type.medical_college');
    if (type === 'Diagnostic Center') return t('type.diagnostic');
    if (type === 'Hospital') return t('type.hospital');
    if (type === 'Clinic') return t('type.clinic');
    if (type === 'Pharmacy') return t('type.pharmacy');
    return type;
  };

  // Travel time calculations
  const getTravelTime = (distanceKm?: number) => {
    if (distanceKm === undefined) return null;
    const walkMinutes = Math.round((distanceKm / 4.5) * 60);
    const driveMinutes = Math.max(2, Math.round((distanceKm / 22) * 60));
    return { walkMinutes, driveMinutes };
  };

  // Tile layer URL selection
  const tileLayerConfig = useMemo(() => {
    if (mapStyle === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      };
    }
    if (mapStyle === 'dark') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      };
    }
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };
  }, [mapStyle]);

  return (
    <div className={`mx-auto space-y-6 transition-all duration-300 ${isFullScreen ? 'max-w-none px-2' : 'max-w-6xl'}`}>
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t('nearby.title')}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  {t('nearby.live_osm_badge')}
                </span>
                {isOfflineLoaded && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    {t('nearby.offline_notice')}
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-1 max-w-2xl text-sm md:text-base">
                {t('nearby.desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* SOS Location Share Button */}
            {location.status === 'granted' && (
              <button
                onClick={handleShareSos}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                title="Send Live GPS to Family / Rescuers"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedSos ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : t('nearby.sos_share')}</span>
              </button>
            )}

            <button
              onClick={fetchNearby}
              disabled={loading || osmLoading}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm border border-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
              title="Refresh Radar"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || osmLoading) ? 'animate-spin text-blue-600' : ''}`} />
              <span>{loading || osmLoading ? (language === 'bn' ? 'স্ক্যান হচ্ছে...' : 'Scanning...') : (language === 'bn' ? 'রিফ্রেশ' : 'Refresh')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Prompt States */}
      {location.status === 'loading' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-900">{t('nearby.loc.request')}</h3>
          <p className="text-slate-500 mt-2 max-w-md">
            {language === 'bn' 
              ? 'অনুগ্রহ করে ব্রাউজারের পপ-আপে "Allow" ক্লিক করুন যাতে আপনার নিকটবর্তী হাসপাতাল ও ফার্মেসিগুলো তাৎক্ষণিকভাবে দেখা যায়।'
              : 'Please allow location access in your browser to detect nearby emergency hospitals instantly.'}
          </p>
        </div>
      )}

      {(location.status === 'denied' || location.status === 'unsupported' || location.status === 'error' || location.status === 'unavailable') && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8 flex flex-col items-center text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <h3 className="text-xl font-bold text-red-900">{t('nearby.loc.denied')}</h3>
          <p className="text-red-700 text-sm mt-1 max-w-md">
            {language === 'bn'
              ? 'লোকেশন পারমিশন বন্ধ থাকায় দূরত্ব হিসাব করা যাচ্ছে না। পুনরায় চেষ্টা করতে নিচের বাটনে ক্লিক করুন।'
              : 'Location permission is required to calculate distances and plot real-time routes.'}
          </p>
          <button 
            onClick={requestLocation}
            className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Crosshair className="h-4 w-4" />
            {language === 'bn' ? 'পুনরায় পারমিশন দিন' : 'Grant Permission'}
          </button>
        </div>
      )}

      {/* Active Working Mode */}
      {location.status === 'granted' && location.latitude && location.longitude && (
        <div className="space-y-6">
          {/* Controls Bar: Radius Filter & Category Tabs */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[var(--color-medical-navy)] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('nearby.filter_all')} ({facilities.length})
              </button>

              {/* 24/7 ICU & Emergency Filter */}
              <button
                onClick={() => setCategoryFilter('icu')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'icu'
                    ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-300'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>{t('nearby.filter_emergency')}</span>
              </button>

              <button
                onClick={() => setCategoryFilter('hospital')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'hospital'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {t('nearby.filter_hospitals')}
              </button>

              {/* Ambulance Category Filter */}
              <button
                onClick={() => setCategoryFilter('ambulance')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'ambulance'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                <Siren className="w-3.5 h-3.5" />
                <span>{t('nearby.filter_ambulance')} ({ambulances.length})</span>
              </button>

              <button
                onClick={() => setCategoryFilter('pharmacy')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'pharmacy'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {t('nearby.filter_pharmacies')}
              </button>

              <button
                onClick={() => setCategoryFilter('clinic')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'clinic'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                {t('nearby.filter_clinics')}
              </button>
            </div>

            {/* Radius Range & Map Layer Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Map Layer Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setMapStyle('streets')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    mapStyle === 'streets' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={t('nearby.map_streets')}
                >
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('nearby.map_streets')}</span>
                </button>
                <button
                  onClick={() => setMapStyle('satellite')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    mapStyle === 'satellite' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={t('nearby.map_satellite')}
                >
                  <Layers className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('nearby.map_satellite')}</span>
                </button>
                <button
                  onClick={() => setMapStyle('dark')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    mapStyle === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={t('nearby.map_dark')}
                >
                  <Moon className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('nearby.map_dark')}</span>
                </button>
              </div>

              {/* Radius Range Selector */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  {t('nearby.radius_label')}: <strong className="text-blue-600">{radiusKm} km</strong>
                </span>
                <div className="flex items-center gap-1">
                  {[5, 10, 15, 25].map(r => (
                    <button
                      key={r}
                      onClick={() => setRadiusKm(r)}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        radiusKm === r 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}k
                    </button>
                  ))}
                </div>
              </div>

              {/* IndexedDB Map Tile Cache Status Badge */}
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-xs font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">
                  <strong>{cachedTilesCount}</strong> {t('nearby.tiles_cached')}
                </span>
                {cachedTilesCount > 0 && (
                  <button
                    onClick={handleClearTileCache}
                    className="ml-1 text-[10px] text-emerald-700 hover:text-red-600 underline font-bold cursor-pointer"
                    title={t('nearby.clear_tile_cache')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upgraded Interactive Leaflet Map Stage */}
          <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 transition-all ${
            isFullScreen ? 'h-[75vh]' : 'h-80 md:h-[420px]'
          }`}>
            <MapContainer 
              center={[location.latitude, location.longitude]} 
              zoom={13} 
              scrollWheelZoom={true} 
              className="h-full w-full z-0"
              ref={mapRef}
            >
              <CachedTileLayer
                attribution={tileLayerConfig.attribution}
                url={tileLayerConfig.url}
                mapStyleKey={mapStyle}
                onTileCached={refreshTileCount}
              />

              {/* Recenter / Focus Controller */}
              <MapController 
                center={
                  selectedFacility?.latitude && selectedFacility?.longitude
                    ? [selectedFacility.latitude, selectedFacility.longitude]
                    : [location.latitude, location.longitude]
                } 
                zoom={selectedFacility ? 15 : (radiusKm <= 5 ? 13 : radiusKm <= 15 ? 12 : 11)}
              />

              {/* Radius Circle Indicator */}
              <Circle
                center={[location.latitude, location.longitude]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: mapStyle === 'dark' ? '#60a5fa' : '#2563eb',
                  fillColor: mapStyle === 'dark' ? '#3b82f6' : '#3b82f6',
                  fillOpacity: 0.06,
                  weight: 1.5,
                  dashArray: '4, 6'
                }}
              />

              {/* User Location Pulse Marker */}
              <Marker 
                position={[location.latitude, location.longitude]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="text-center font-bold text-xs py-1">
                    📍 {language === 'bn' ? 'আপনার বর্তমান অবস্থান' : 'You are here'}
                  </div>
                </Popup>
              </Marker>

              {/* Real Road Turn-by-Turn Polyline from OSRM */}
              {activeRoadRoute && activeRoadRoute.coordinates.length > 0 ? (
                <Polyline
                  positions={activeRoadRoute.coordinates}
                  pathOptions={{
                    color: '#2563eb',
                    weight: 5,
                    opacity: 0.9,
                    lineJoin: 'round'
                  }}
                />
              ) : selectedFacility && selectedFacility.latitude && selectedFacility.longitude ? (
                // Straight Line Fallback while road route loads
                <Polyline
                  positions={[
                    [location.latitude, location.longitude],
                    [selectedFacility.latitude, selectedFacility.longitude]
                  ]}
                  pathOptions={{
                    color: '#dc2626',
                    weight: 3.5,
                    opacity: 0.85,
                    dashArray: '6, 8'
                  }}
                />
              ) : null}

              {/* Facility Markers */}
              {categoryFilter !== 'ambulance' && displayedFacilities.map((facility) => (
                facility.latitude && facility.longitude && (
                  <Marker 
                    key={facility.id} 
                    position={[facility.latitude, facility.longitude]}
                    icon={createFacilityIcon(
                      facility.facilityType, 
                      selectedFacility?.id === facility.id,
                      isEmergencyOrICU(facility)
                    )}
                    eventHandlers={{
                      click: () => handleSelectFacility(facility)
                    }}
                  >
                    <Popup>
                      <div className="text-sm p-1 min-w-[200px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            facility.facilityType.includes('Pharmacy') ? 'bg-emerald-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-[11px] font-bold uppercase text-slate-500">
                            {translateType(facility.facilityType)}
                          </span>
                          {isEmergencyOrICU(facility) && (
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 rounded">
                              ICU/24h
                            </span>
                          )}
                        </div>
                        <strong className="block text-sm font-bold text-slate-900 leading-tight">
                          {language === 'bn' && facility.nameBn ? facility.nameBn : facility.name}
                        </strong>
                        <p className="text-xs text-slate-600 mt-1">{facility.area}</p>
                        
                        {facility.distanceKm !== undefined && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600">
                              {facility.distanceKm.toFixed(2)} km
                            </span>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
                            >
                              {t('common.directions')} ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Ambulance Markers */}
              {(categoryFilter === 'all' || categoryFilter === 'ambulance') && ambulances.map((amb) => (
                amb.latitude && amb.longitude && (
                  <Marker
                    key={amb.id}
                    position={[amb.latitude, amb.longitude]}
                    icon={createFacilityIcon('Ambulance', selectedFacility?.id === amb.id)}
                    eventHandlers={{
                      click: () => handleSelectAmbulance(amb)
                    }}
                  >
                    <Popup>
                      <div className="text-sm p-1 min-w-[190px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Siren className="w-3.5 h-3.5 text-orange-600" />
                          <span className="text-[11px] font-bold uppercase text-orange-700">
                            {amb.serviceType || 'Ambulance Service'}
                          </span>
                        </div>
                        <strong className="block text-sm font-bold text-slate-900 leading-tight">
                          {amb.providerName}
                        </strong>
                        <p className="text-xs text-slate-600 mt-1">{amb.area}, {amb.district}</p>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-600">
                            {amb.distanceKm?.toFixed(1)} km
                          </span>
                          <a
                            href={`tel:${amb.phone}`}
                            className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                          >
                            📞 Call {amb.phone}
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>

            {/* Floating Map Overlays */}
            {/* 1. Recenter & Fullscreen Controls */}
            <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedFacility(null);
                  setActiveRoadRoute(null);
                  if (mapRef.current) {
                    mapRef.current.flyTo([location.latitude, location.longitude], 13);
                  }
                }}
                className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-md border border-slate-200 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title={t('nearby.recenter')}
              >
                <Crosshair className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">{t('nearby.recenter')}</span>
              </button>

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-md border border-slate-200 transition-transform active:scale-95 cursor-pointer self-end"
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Map"}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* 2. Active Road Route Navigation & ETA Overlay Banner */}
            {selectedFacility && (
              <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-[400] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-blue-200 flex items-center justify-between gap-3 animate-fade-in">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase">
                    <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span>{t('nearby.road_route')}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {language === 'bn' && selectedFacility.nameBn ? selectedFacility.nameBn : selectedFacility.name}
                  </p>
                  
                  {/* Road vs Direct Distance & ETA Info */}
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-600">
                    {activeRoadRoute ? (
                      <>
                        <span className="text-blue-700 font-bold">
                          🚗 {activeRoadRoute.distanceKm} km (রোড)
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          ~{activeRoadRoute.durationMinutes} min
                        </span>
                      </>
                    ) : routeLoading ? (
                      <span className="text-slate-400 italic text-[10px]">{t('nearby.calculating_route')}</span>
                    ) : (
                      <span>{selectedFacility.distanceKm?.toFixed(1)} km (আকাশপথ)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedFacility.emergencyPhone || selectedFacility.phone ? (
                    <a
                      href={`tel:${selectedFacility.emergencyPhone || selectedFacility.phone}`}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                      title="Call Hospital Hotline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  ) : null}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Go</span>
                  </a>

                  <button
                    onClick={() => {
                      setSelectedFacility(null);
                      setActiveRoadRoute(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                    title={t('nearby.clear_route')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                {categoryFilter === 'ambulance' ? (
                  language === 'bn' 
                    ? `${radiusKm} কি.মি. পরিধিতে ${ambulances.length}টি অ্যাম্বুলেন্স সেবা পাওয়া গেছে` 
                    : `Found ${ambulances.length} ambulances within ${radiusKm} km`
                ) : (
                  language === 'bn' 
                    ? `${radiusKm} কি.মি. পরিধিতে ${displayedFacilities.length}টি স্বাস্থ্যসেবা কেন্দ্র পাওয়া গেছে` 
                    : `Found ${displayedFacilities.length} facilities within ${radiusKm} km`
                )}
              </h2>
              {liveOsmCount > 0 && categoryFilter !== 'ambulance' && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  +{liveOsmCount} Live OSM
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' 
                ? 'কার্ডে ক্লিক করে ম্যাপে রাস্তার রুট ও গাড়িতে যাওয়ার সময় দেখুন' 
                : 'Click any card to preview real road route and driving ETA'}
            </p>
          </div>

          {/* Facilities or Ambulances Cards Grid */}
          {categoryFilter === 'ambulance' ? (
            /* Ambulance List View */
            <div className="grid gap-4 md:grid-cols-2">
              {ambulances.map((amb) => (
                <div
                  key={amb.id}
                  onClick={() => handleSelectAmbulance(amb)}
                  className={`bg-white rounded-2xl shadow-sm border p-5 transition-all cursor-pointer relative ${
                    selectedFacility?.id === amb.id
                      ? 'border-orange-500 ring-2 ring-orange-100 shadow-md bg-orange-50/20'
                      : 'border-slate-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 mb-1">
                        <Siren className="w-3.5 h-3.5" />
                        {amb.serviceType || 'Ambulance Service'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {amb.providerName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {amb.area}, {amb.district}
                      </p>
                    </div>

                    {amb.distanceKm !== undefined && (
                      <div className="flex flex-col items-end shrink-0 bg-orange-50 px-2.5 py-1.5 rounded-xl border border-orange-100">
                        <span className="text-base font-black text-orange-700 leading-none">
                          {amb.distanceKm.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-bold text-orange-600 uppercase">
                          {t('common.km_away')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                    <a
                      href={`tel:${amb.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{t('common.call_now')} ({amb.phone})</span>
                    </a>

                    <button
                      onClick={() => handleSelectAmbulance(amb)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedFacilities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {displayedFacilities.map((facility) => {
                const travel = getTravelTime(facility.distanceKm);
                const isCardSelected = selectedFacility?.id === facility.id;
                const isIcu = isEmergencyOrICU(facility);

                return (
                  <div 
                    key={facility.id} 
                    onClick={() => handleSelectFacility(facility)}
                    className={`bg-white rounded-2xl shadow-sm border p-5 md:p-6 transition-all cursor-pointer relative ${
                      isCardSelected 
                        ? 'border-blue-500 ring-2 ring-blue-100 shadow-md bg-blue-50/20' 
                        : isIcu 
                        ? 'border-red-200 hover:border-red-400 hover:shadow-md'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            facility.facilityType.includes('Pharmacy') 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : facility.facilityType.includes('Clinic')
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {getFacilityIcon(facility.facilityType)}
                            {translateType(facility.facilityType)}
                          </span>

                          {isIcu && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                              <HeartPulse className="w-3 h-3 text-rose-600" />
                              24/7 ICU & Emergency
                            </span>
                          )}

                          {facility.source?.includes('OpenStreetMap') ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              OSM Live
                            </span>
                          ) : facility.verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('common.verified')}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {language === 'bn' && facility.nameBn ? facility.nameBn : facility.name}
                        </h3>
                      </div>

                      {facility.distanceKm !== undefined && (
                        <div className="flex flex-col items-end shrink-0 bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-100">
                          <span className="text-lg font-black text-blue-700 leading-none">
                            {facility.distanceKm.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                            {t('common.km_away')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-600 line-clamp-2">
                          {facility.area}{facility.district ? `, ${facility.district}` : ''}
                        </span>
                      </div>

                      {/* Travel Estimates (Walking & Driving) */}
                      {travel && (
                        <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Footprints className="w-3.5 h-3.5 text-slate-600" />
                            {travel.walkMinutes} min {t('nearby.walking_eta')}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Car className="w-3.5 h-3.5 text-slate-600" />
                            ~{travel.driveMinutes} min {t('nearby.driving_eta')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                      {facility.emergencyPhone ? (
                        <a
                          href={`tel:${facility.emergencyPhone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{t('common.call_now')}</span>
                        </a>
                      ) : facility.phone ? (
                        <a
                          href={`tel:${facility.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs transition-colors border border-blue-200"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{t('common.call')}</span>
                        </a>
                      ) : null}

                      {facility.latitude && facility.longitude && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors border border-slate-200"
                          title="Open Google Maps Route"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>{t('common.directions')}</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleSelectFacility(facility)}
                        className={`px-3 py-2 rounded-xl font-bold text-xs transition-colors border cursor-pointer ${
                          isCardSelected 
                            ? 'bg-blue-100 text-blue-800 border-blue-300' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                        title={t('nearby.view_on_map')}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {language === 'bn' ? 'কোনো স্বাস্থ্যসেবা কেন্দ্র পাওয়া যায়নি' : 'No facilities found'}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {language === 'bn' 
                  ? 'অনুসন্ধানের পরিধি বাড়িয়ে (যেমন ১০, ১৫ বা ২৫ কি.মি.) চেষ্টা করুন।' 
                  : 'Try increasing your search radius (e.g. 15 or 25 km).'}
              </p>
              <button
                onClick={() => {
                  setRadiusKm(25);
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer transition-colors"
              >
                {language === 'bn' ? '২৫ কি.মি. পরিধিতে খুঁজুন' : 'Expand to 25 km'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
