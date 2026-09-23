import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Building2, Phone, MapPin, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkStatusIndicator } from '../components/NetworkStatusIndicator';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function EmergencyHub() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <NetworkStatusIndicator />
      <div className="mb-6">
        <PWAInstallButton variant="banner" />
      </div>
      <div className="bg-[var(--color-medical-red)] text-white rounded-3xl p-8 md:p-12 mb-12 shadow-lg">
        <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-1.5 rounded-full mb-6 text-sm font-bold tracking-wide uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>{t('emergency.hub')}</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          {t('emergency.title')}
        </h1>
        <p className="text-xl md:text-2xl font-medium text-red-50 mb-4">
          {t('emergency.subtitle')}
        </p>
        <p className="text-red-100 max-w-2xl mb-10 text-lg leading-relaxed">
          {t('emergency.desc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            to="/healthcare"
            className="flex-1 bg-white text-[var(--color-medical-red)] hover:bg-gray-50 px-8 py-5 rounded-xl font-extrabold tracking-wide text-lg text-center transition-colors shadow-md flex items-center justify-center space-x-3"
          >
            <Building2 className="w-6 h-6" />
            <span>{t('emergency.btn.hospital')}</span>
          </Link>
          <Link 
            to="/ambulance"
            className="flex-1 bg-red-900 text-white hover:bg-red-950 px-8 py-5 rounded-xl font-extrabold tracking-wide text-lg text-center transition-colors shadow-md flex items-center justify-center space-x-3"
          >
            <Activity className="w-6 h-6" />
            <span>{t('emergency.btn.ambulance')}</span>
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[var(--color-medical-navy)] mb-8 tracking-tight">
        {t('emergency.quick_access')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/healthcare" className="flex items-start p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="bg-blue-50 p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform">
            <Building2 className="w-8 h-8 text-[var(--color-medical-blue)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.hospital.title')}</h3>
            <p className="text-[var(--color-muted-gray)] leading-relaxed">{t('emergency.card.hospital.desc')}</p>
          </div>
        </Link>
        
        <Link to="/ambulance" className="flex items-start p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="bg-red-50 p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform">
            <Activity className="w-8 h-8 text-[var(--color-medical-red)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.ambulance.title')}</h3>
            <p className="text-[var(--color-muted-gray)] leading-relaxed">{t('emergency.card.ambulance.desc')}</p>
          </div>
        </Link>

        <Link to="/emergency-contacts" className="flex items-start p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="bg-amber-50 p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform">
            <Phone className="w-8 h-8 text-[var(--color-warning-amber)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.contacts.title')}</h3>
            <p className="text-[var(--color-muted-gray)] leading-relaxed">{t('emergency.card.contacts.desc')}</p>
          </div>
        </Link>

        <Link to="/nearby" className="flex items-start p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="bg-teal-50 p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform">
            <MapPin className="w-8 h-8 text-[var(--color-medical-teal)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.nearby.title')}</h3>
            <p className="text-[var(--color-muted-gray)] leading-relaxed">{t('emergency.card.nearby.desc')}</p>
          </div>
        </Link>

        <Link to="/first-aid" className="flex items-start p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group md:col-span-2">
          <div className="bg-rose-50 p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('firstaid.title')}</h3>
            <p className="text-[var(--color-muted-gray)] leading-relaxed">{t('firstaid.desc')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
