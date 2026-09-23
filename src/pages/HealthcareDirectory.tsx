import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, CheckCircle2, Phone, AlertTriangle, Building2, Map, Crosshair } from 'lucide-react';
import { HealthcareFacility } from '../types';
import { useLocation } from '../hooks/useLocation';
import { calculateDistanceKm } from '../utils/haversine';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getFacilitiesFromFirestore } from '../lib/firebase';
import { getDistrictsForDivision } from '../data/bangladeshDistricts';
import bundledHospitals from '../data/hospitals.json';

export default function HealthcareDirectory() {
  const { language, t } = useLanguage();
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

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

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      let data: HealthcareFacility[] = [];

      // 1. Check Cloud Firestore
      try {
        const firestoreFacilities = await getFacilitiesFromFirestore();
        if (firestoreFacilities && firestoreFacilities.length > 0) {
          data = firestoreFacilities;
        }
      } catch (fErr) {
        console.warn('Firestore fetch failed:', fErr);
      }

      // 2. Fallback to Local API
      if (data.length === 0) {
        try {
          const url = new URL('/api/healthcare', window.location.origin);
          const res = await fetch(url.toString());
          if (res.ok) {
            data = await res.json();
          }
        } catch (apiErr) {
          console.warn('Server API fetch failed:', apiErr);
        }
      }

      // 3. Guaranteed Local Offline Fallback if offline
      if (data.length === 0 && bundledHospitals && (bundledHospitals as any[]).length > 0) {
        data = bundledHospitals as HealthcareFacility[];
      }

      // Apply client-side filters
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        data = data.filter(f => f.name.toLowerCase().includes(s) || (f.nameBn && f.nameBn.includes(s)) || (f.area && f.area.toLowerCase().includes(s)));
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
    if (urlParams.get('nearby') === 'true') {
      requestLocation();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities();
    }, 400); // debounce
    return () => clearTimeout(timer);
  }, [searchQuery, division, district, facilityType, verifiedFilter, location.status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-medical-navy)] tracking-tight mb-3">
            {t('healthcare.title')}
          </h1>
          <p className="text-lg text-[var(--color-muted-gray)] max-w-2xl">
            {t('healthcare.desc')}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button 
            onClick={requestLocation}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-[var(--color-medical-blue)] px-6 py-3 rounded-lg font-bold tracking-wide transition-colors border border-blue-200"
          >
            <Crosshair className="w-5 h-5" />
            <span>{t('healthcare.btn.location')}</span>
          </button>
          
          {location.status === 'loading' && <p className="text-sm text-blue-600 mt-2 text-center md:text-right font-medium">{t('healthcare.loc.detecting')}</p>}
          {location.status === 'granted' && <p className="text-sm text-green-600 mt-2 text-center md:text-right font-medium flex items-center justify-end"><CheckCircle2 className="w-4 h-4 mr-1"/> {t('healthcare.loc.enabled')}</p>}
          {(location.status === 'denied' || location.status === 'unavailable' || location.status === 'timeout' || location.status === 'unsupported') && (
            <p className="text-sm text-amber-600 mt-2 text-center md:text-right font-medium">{t('healthcare.loc.unavailable')}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Panel */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-[var(--color-medical-navy)] mb-6 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              {t('healthcare.filters.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-medical-navy)] mb-2">{t('healthcare.filters.search')}</label>
                <input
                  type="text"
                  placeholder={t('healthcare.filters.search_placeholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:border-transparent outline-none transition-shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-medical-navy)] mb-2">{t('healthcare.filters.division')}</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)]"
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-[var(--color-medical-navy)]">
                    {t('healthcare.filters.district')}
                  </label>
                  {division && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {availableDistricts.length} {language === 'bn' ? 'টি জেলা' : 'districts'}
                    </span>
                  )}
                </div>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)]"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">{t('healthcare.filters.all_districts')}</option>
                  {availableDistricts.map((d) => (
                    <option key={d.en} value={d.en}>
                      {language === 'bn' ? d.bn : d.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-medical-navy)] mb-2">{t('healthcare.filters.type')}</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)]"
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

              <div>
                <label className="block text-sm font-semibold text-[var(--color-medical-navy)] mb-2">{t('healthcare.filters.status')}</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-medical-teal)]"
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                >
                  <option value="">{t('healthcare.filters.all_status')}</option>
                  <option value="true">{t('healthcare.filters.verified_only')}</option>
                  <option value="false">{t('healthcare.filters.needs_verification')}</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setDivision('');
                  setDistrict('');
                  setFacilityType('');
                  setVerifiedFilter('');
                }}
                className="w-full text-center text-sm font-semibold text-[var(--color-medical-red)] hover:text-red-700 py-2 transition-colors"
              >
                {t('healthcare.filters.clear')}
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1">
          {loading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-48"></div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-start space-x-4 mb-6">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg mb-1">{t('healthcare.error.title')}</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && facilities.length === 0 && (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--color-medical-navy)] mb-2">{t('healthcare.empty.title')}</h3>
              <p className="text-[var(--color-muted-gray)] text-lg">{t('healthcare.empty.desc')}</p>
            </div>
          )}

          {!loading && !error && facilities.length > 0 && (
            <div className="space-y-6">
              {facilities.map((facility) => (
                <div key={facility.id} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-50 p-3.5 rounded-xl text-[var(--color-medical-blue)] flex-shrink-0">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--color-medical-navy)] leading-tight mb-1">
                          {language === 'bn' && facility.nameBn ? facility.nameBn : facility.name}
                        </h3>
                        {((language === 'en' && facility.nameBn) || (language === 'bn' && facility.name && !facility.nameBn)) && (
                          <p className="text-[var(--color-medical-navy)] font-medium text-lg mb-2">
                            {language === 'en' ? facility.nameBn : facility.name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{t(`type.${facility.facilityType.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`) || facility.facilityType}</span>
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{facility.ownership}</span>
                        </div>
                      </div>
                    </div>
                    
                    {facility.distanceKm !== undefined && (
                      <div className="bg-blue-50 border border-blue-100 text-[var(--color-medical-blue)] px-4 py-2 rounded-lg text-center flex-shrink-0">
                        <p className="text-xl font-extrabold">{facility.distanceKm.toFixed(1)}</p>
                        <p className="text-xs font-bold uppercase tracking-wider">{t('common.km_away')}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 text-[var(--color-muted-gray)] mb-6 ml-0 sm:ml-15">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{facility.area}, {t(`div.${facility.district.toLowerCase()}`)}, {t(`div.${facility.division.toLowerCase()}`)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 mt-4 gap-4">
                    <div className="w-full sm:w-auto">
                      {facility.verified ? (
                        <div className="flex items-center space-x-1.5 text-[var(--color-verified-green)]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">{t('common.verified')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-[var(--color-warning-amber)]">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">{t('common.needs_verification')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-3 w-full sm:w-auto">
                      {facility.phone && (
                        <a 
                          href={`tel:${facility.phone}`}
                          className="flex-1 sm:flex-none inline-flex justify-center items-center space-x-2 bg-white border border-[var(--color-medical-navy)] text-[var(--color-medical-navy)] hover:bg-gray-50 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('common.call')}</span>
                        </a>
                      )}
                      
                      {facility.latitude && facility.longitude && (
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none inline-flex justify-center items-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors"
                        >
                          <Map className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('common.directions')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
