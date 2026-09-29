import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Building2, Phone, MapPin, Activity, Waves, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkStatusIndicator } from '../components/NetworkStatusIndicator';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function EmergencyHub() {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Link 
            to="/healthcare"
            className="bg-white text-[var(--color-medical-red)] hover:bg-gray-50 px-6 py-4 rounded-xl font-extrabold tracking-wide text-base text-center transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <Building2 className="w-5 h-5" />
            <span>{t('emergency.btn.hospital')}</span>
          </Link>
          <Link 
            to="/ambulance"
            className="bg-red-900 text-white hover:bg-red-950 px-6 py-4 rounded-xl font-extrabold tracking-wide text-base text-center transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <Activity className="w-5 h-5" />
            <span>{t('emergency.btn.ambulance')}</span>
          </Link>
          <Link 
            to="/shelters"
            className="bg-teal-800 text-white hover:bg-teal-900 px-6 py-4 rounded-xl font-extrabold tracking-wide text-base text-center transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <Waves className="w-5 h-5 text-teal-300" />
            <span>{isBn ? 'আশ্রয়কেন্দ্র' : 'SHELTERS'}</span>
          </Link>
          <Link 
            to="/volunteers"
            className="bg-rose-950 text-white hover:bg-black px-6 py-4 rounded-xl font-extrabold tracking-wide text-base text-center transition-colors shadow-md flex items-center justify-center space-x-2 border border-rose-400/40"
          >
            <Users className="w-5 h-5 text-yellow-300" />
            <span>{isBn ? 'উদ্ধারকারী দল' : 'RESCUE SQUAD'}</span>
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[var(--color-medical-navy)] mb-8 tracking-tight">
        {t('emergency.quick_access')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volunteer Rescue Squad Card */}
        <Link to="/volunteers" className="flex items-start p-6 md:p-8 bg-gradient-to-r from-rose-50/80 via-red-50/60 to-amber-50/40 border border-rose-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="bg-rose-700 text-white p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform shrink-0 shadow-md">
            <Users className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-200/80 text-rose-900 text-xs font-bold mb-2">
              <span>{isBn ? 'জরুরি উদ্ধার ও লাইফগার্ড' : 'Rescue Squads'}</span>
              <span>•</span>
              <span>{isBn ? 'স্পিডবোট ও ডুবুরি' : '24/7 Hotline'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {isBn ? 'স্বেচ্ছাসেবক ও উদ্ধারকারী টিম ডিরেক্টরি' : 'Volunteer & Rescue Squad Directory'}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {isBn 
                ? 'রেড ক্রিসেন্ট, গাউসিয়া কমিটি, ফায়ার সার্ভিস ভলান্টিয়ার্স ও স্থানীয় তরুণ বোট স্কোয়াডের হটলাইন নম্বর ও সরাসরি উদ্ধার সহায়তা আবেদন।' 
                : 'BDRCS, Fire Service community squads, Gausia Committee, and youth rescue teams.'}
            </p>
          </div>
        </Link>

        {/* Shelters Card */}
        <Link to="/shelters" className="flex items-start p-6 md:p-8 bg-gradient-to-r from-teal-50/70 to-blue-50/50 border border-teal-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="bg-teal-600 text-white p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform shrink-0">
            <Waves className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-200/60 text-teal-900 text-xs font-bold mb-2">
              <span>{isBn ? 'উপকূলীয় ও বন্যা সংকট' : 'Disaster Relief'}</span>
              <span>•</span>
              <span>{isBn ? 'অফলাইন ম্যাপ প্রস্তুত' : 'Offline Ready'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{t('shelter.title')}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{t('shelter.subtitle')}</p>
          </div>
        </Link>

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
