import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Building2, 
  Phone, 
  MapPin, 
  Activity, 
  Waves, 
  Users, 
  PhoneCall, 
  HeartPulse, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkStatusIndicator } from '../components/NetworkStatusIndicator';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function EmergencyHub() {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';

  const nationalHelplines = [
    {
      num: '999',
      label: isBn ? 'জাতীয় জরুরি সেবা (পুলিশ, অ্যাম্বুলেন্স, ফায়ার)' : 'National Emergency (Police, Ambulance, Fire)',
      color: 'bg-red-600 hover:bg-red-700 text-white',
      badge: '24/7 SOS',
    },
    {
      num: '1090',
      label: isBn ? 'দুর্যোগ বিষয়ক তথ্য ও সাইক্লোন পূর্বাভাস' : 'Disaster Weather & Flood Alerts',
      color: 'bg-teal-700 hover:bg-teal-800 text-white',
      badge: isBn ? 'দুর্যোগ' : 'Disaster',
    },
    {
      num: '16263',
      label: isBn ? 'স্বাস্থ্য বাতায়ন (সরকারি ডাক্তার পরামর্শ)' : 'Govt Health Doctor Consultation',
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
      badge: isBn ? 'স্বাস্থ্য' : 'Health',
    },
    {
      num: '109',
      label: isBn ? 'নারী ও শিশু নির্যাতন প্রতিরোধ সেল' : 'Women & Child Helpline',
      color: 'bg-indigo-700 hover:bg-indigo-800 text-white',
      badge: isBn ? 'সহায়তা' : 'Support',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <NetworkStatusIndicator />
      
      <div className="mb-6">
        <PWAInstallButton variant="banner" />
      </div>

      {/* Main Emergency Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-rose-800 to-slate-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl border border-red-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{t('emergency.hub')}</span>
            <span className="text-white/40">/</span>
            <span>{isBn ? 'সরাসরি জীবনরক্ষাকারী সাপোর্ট' : 'Immediate Response Hub'}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight max-w-3xl">
            {t('emergency.title')}
          </h1>
          
          <p className="text-lg sm:text-xl font-medium text-rose-100 mb-4 max-w-2xl">
            {t('emergency.subtitle')}
          </p>
          
          <p className="text-rose-100/90 max-w-2xl mb-8 text-sm sm:text-base leading-relaxed">
            {t('emergency.desc')}
          </p>

          {/* Direct Emergency Access Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
            <Link 
              to="/healthcare"
              className="bg-white text-[var(--color-medical-red)] hover:bg-gray-50 px-5 py-3.5 rounded-xl font-bold tracking-wide text-sm text-center transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Building2 className="w-5 h-5 text-red-600" />
              <span>{t('emergency.btn.hospital')}</span>
            </Link>

            <Link 
              to="/ambulance"
              className="bg-red-950/80 hover:bg-red-950 text-white border border-red-400/30 px-5 py-3.5 rounded-xl font-bold tracking-wide text-sm text-center transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Activity className="w-5 h-5 text-rose-300" />
              <span>{t('emergency.btn.ambulance')}</span>
            </Link>

            <Link 
              to="/shelters"
              className="bg-teal-900/80 hover:bg-teal-900 text-white border border-teal-400/30 px-5 py-3.5 rounded-xl font-bold tracking-wide text-sm text-center transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Waves className="w-5 h-5 text-teal-300" />
              <span>{isBn ? 'আশ্রয়কেন্দ্র সন্ধান' : 'SHELTERS'}</span>
            </Link>

            <Link 
              to="/volunteers"
              className="bg-slate-900 hover:bg-black text-white border border-rose-400/40 px-5 py-3.5 rounded-xl font-bold tracking-wide text-sm text-center transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5 text-yellow-300" />
              <span>{isBn ? 'উদ্ধারকারী দল' : 'RESCUE SQUAD'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Immediate Dial Fast Row */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs mb-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">
          <PhoneCall className="w-4 h-4" />
          <span>{isBn ? 'জাতীয় ১-ক্লিক হেল্পলাইন' : 'National 1-Tap Helplines'}</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {isBn ? 'জীবন বিপন্ন হলে বা জরুরি প্রয়োজনে নিচের যেকোনো নম্বরে ট্যাপ করে সরাসরি কল করুন:' : 'Tap below to dial immediate government emergency hotlines:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nationalHelplines.map((item) => (
            <a
              key={item.num}
              href={`tel:${item.num}`}
              className={`${item.color} p-4 rounded-xl shadow-xs transition-all flex items-center justify-between group hover:scale-[1.01]`}
            >
              <div className="min-w-0 pr-2">
                <span className="text-xl font-black tracking-tight">{item.num}</span>
                <p className="text-[11px] opacity-90 truncate mt-0.5 font-medium">{item.label}</p>
              </div>
              <PhoneCall className="w-5 h-5 shrink-0 group-hover:animate-bounce" />
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Categories Section */}
      <h2 className="text-2xl font-black text-[var(--color-medical-navy)] mb-6 tracking-tight">
        {t('emergency.quick_access')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Volunteer Rescue Squad Card */}
        <Link 
          to="/volunteers" 
          className="flex items-start p-6 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 border border-rose-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group"
        >
          <div className="bg-rose-600 text-white p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0 shadow-xs">
            <Users className="w-7 h-7 text-yellow-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold mb-1">
              <span>{isBn ? 'জরুরি উদ্ধার ও লাইফগার্ড' : 'Rescue Squads'}</span>
              <span aria-hidden="true">·</span>
              <span>{isBn ? 'স্পিডবোট ও ডুবুরি' : '24/7 Hotline'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isBn ? 'স্বেচ্ছাসেবক ও উদ্ধারকারী টিম ডিরেক্টরি' : 'Volunteer & Rescue Squad Directory'}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {isBn 
                ? 'রেড ক্রিসেন্ট, গাউসিয়া কমিটি, ফায়ার সার্ভিস ভলান্টিয়ার্স ও তরুণ স্পিডবোট উদ্ধার স্কোয়াডের এরিয়া-ভিত্তিক সরাসরি হটলাইন।' 
                : 'BDRCS, Fire Service community squads, Gausia Committee, and youth rescue teams.'}
            </p>
          </div>
        </Link>

        {/* Shelters Card */}
        <Link 
          to="/shelters" 
          className="flex items-start p-6 bg-gradient-to-br from-teal-50/70 via-white to-blue-50/30 border border-teal-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group"
        >
          <div className="bg-teal-700 text-white p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0 shadow-xs">
            <Waves className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold mb-1">
              <span>{isBn ? 'উপকূলীয় ও বন্যা সংকট' : 'Disaster Relief'}</span>
              <span aria-hidden="true">·</span>
              <span>{isBn ? 'অফলাইন ম্যাপ প্রস্তুত' : 'Offline Ready'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t('shelter.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('shelter.subtitle')}
            </p>
          </div>
        </Link>

        {/* Hospital Card */}
        <Link 
          to="/healthcare" 
          className="flex items-start p-6 bg-white border border-gray-150 rounded-2xl shadow-xs hover:shadow-md transition-all group"
        >
          <div className="bg-blue-50 p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-7 h-7 text-[var(--color-medical-blue)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold mb-1">
              <span>{isBn ? 'হাসপাতাল ও আইসিইউ' : 'Hospitals & ICU'}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
              {t('home.card.hospital.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('emergency.card.hospital.desc')}
            </p>
          </div>
        </Link>
        
        {/* Ambulance Card */}
        <Link 
          to="/ambulance" 
          className="flex items-start p-6 bg-white border border-gray-150 rounded-2xl shadow-xs hover:shadow-md transition-all group"
        >
          <div className="bg-red-50 p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0">
            <Activity className="w-7 h-7 text-[var(--color-medical-red)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-red-700 font-semibold mb-1">
              <span>{isBn ? 'জরুরি রোগী পরিবহন' : 'Emergency Transport'}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
              {t('home.card.ambulance.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('emergency.card.ambulance.desc')}
            </p>
          </div>
        </Link>

        {/* Emergency Contacts Card */}
        <Link 
          to="/emergency-contacts" 
          className="flex items-start p-6 bg-white border border-gray-150 rounded-2xl shadow-xs hover:shadow-md transition-all group"
        >
          <div className="bg-amber-50 p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0">
            <Phone className="w-7 h-7 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold mb-1">
              <span>{isBn ? 'জাতীয় হটলাইন বুক' : 'National Directory'}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
              {t('home.card.contacts.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('emergency.card.contacts.desc')}
            </p>
          </div>
        </Link>

        {/* Nearby Facilities Card */}
        <Link 
          to="/nearby" 
          className="flex items-start p-6 bg-white border border-gray-150 rounded-2xl shadow-xs hover:shadow-md transition-all group"
        >
          <div className="bg-teal-50 p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0">
            <MapPin className="w-7 h-7 text-[var(--color-medical-teal)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold mb-1">
              <span>{isBn ? 'লাইভ জিপিএস রুট' : 'Live GPS Routing'}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
              {t('home.card.nearby.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('emergency.card.nearby.desc')}
            </p>
          </div>
        </Link>

        {/* First Aid Card */}
        <Link 
          to="/first-aid" 
          className="flex items-start p-6 bg-white border border-gray-150 rounded-2xl shadow-xs hover:shadow-md transition-all group md:col-span-2"
        >
          <div className="bg-rose-50 p-3.5 rounded-xl mr-5 group-hover:scale-105 transition-transform shrink-0">
            <HeartPulse className="w-7 h-7 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold mb-1">
              <span>{isBn ? 'জরুরি জীবনরক্ষা নির্দেশিকা' : 'Life Saving Procedures'}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1">
              {t('firstaid.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('firstaid.desc')}
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}
