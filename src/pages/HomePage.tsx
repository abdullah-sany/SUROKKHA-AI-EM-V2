import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Building2, 
  Phone, 
  MapPin, 
  Activity, 
  ArrowRight, 
  Code2, 
  Heart, 
  Waves, 
  Users, 
  Search, 
  PhoneCall, 
  Sparkles, 
  HeartPulse, 
  CheckCircle2, 
  Wifi, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import OneTouchEmergency from '../components/OneTouchEmergency';

export default function HomePage() {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';
  const navigate = useNavigate();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/healthcare?search=${encodeURIComponent(heroSearchQuery.trim())}`);
    } else {
      navigate('/healthcare');
    }
  };

  const emergencyHotlines = [
    {
      number: '999',
      title: isBn ? 'জাতীয় জরুরি সেবা' : 'National Emergency',
      sub: isBn ? 'পুলিশ · অ্যাম্বুলেন্স · ফায়ার' : 'Police · Ambulance · Fire',
      bg: 'bg-red-600 text-white hover:bg-red-700',
      badge: '24/7 SOS',
      badgeColor: 'bg-red-800 text-white',
    },
    {
      number: '1090',
      title: isBn ? 'দুর্যোগ পূর্বাভাস ও বার্তা' : 'Disaster Weather IVR',
      sub: isBn ? 'সাইক্লোন ও বন্যা সংকেত' : 'Flood & Cyclone Alerts',
      bg: 'bg-teal-700 text-white hover:bg-teal-800',
      badge: isBn ? 'দুর্যোগ' : 'Disaster',
      badgeColor: 'bg-teal-900 text-teal-200',
    },
    {
      number: '16263',
      title: isBn ? 'স্বাস্থ্য বাতায়ন' : 'Shastho Batayon',
      sub: isBn ? 'সরকারি সার্বক্ষণিক ডাক্তার' : 'Govt Doctor Consultation',
      bg: 'bg-blue-700 text-white hover:bg-blue-800',
      badge: isBn ? 'স্বাস্থ্য' : 'Health',
      badgeColor: 'bg-blue-900 text-blue-200',
    },
    {
      number: '109',
      title: isBn ? 'নারী ও শিশু সহায়তা' : 'Women & Child Helpline',
      sub: isBn ? 'জাতীয় হেল্পলাইন সেল' : 'National Assistance Cell',
      bg: 'bg-indigo-700 text-white hover:bg-indigo-800',
      badge: isBn ? 'সহায়তা' : 'Support',
      badgeColor: 'bg-indigo-900 text-indigo-200',
    },
    {
      number: '333',
      title: isBn ? 'জাতীয় কল সেন্টার' : 'National Call Center',
      sub: isBn ? 'সরকারি তথ্য ও সেবা' : 'Govt Services & Info',
      bg: 'bg-slate-800 text-white hover:bg-slate-900',
      badge: isBn ? 'তথ্য' : 'Info',
      badgeColor: 'bg-slate-950 text-slate-300',
    },
  ];

  return (
    <div className="w-full">
      <OneTouchEmergency />

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Soft background ambient gradient accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-red-100/40 via-teal-50/20 to-transparent blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '28px 28px' }}></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Typographic Unboxed Kicker */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-medical-red)] mb-4">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>{t('home.badge')}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-semibold">{isBn ? 'সারা বাংলাদেশ সার্বক্ষণিক নিরাপত্তা' : '24/7 Nationwide Network'}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-medical-navy)] tracking-tight leading-[1.12] mb-5 text-balance">
            {isBn ? (
              <>
                জরুরি মুহূর্তের জীবনরক্ষাকারী{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                  স্বাস্থ্য ও দুর্যোগ সহায়তা
                </span>{' '}
                নেটওয়ার্ক
              </>
            ) : (
              <>
                Lifesaving Emergency{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                  Healthcare & Disaster
                </span>{' '}
                Support
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed text-balance">
            {isBn
              ? 'নিকটতম হাসপাতাল, অ্যাম্বুলেন্স, সাইক্লোন আশ্রয়কেন্দ্র ও রেসকিউ টিম খুঁজুন এক ক্লিকে — সম্পূর্ণ অফলাইন ব্যাকআপ সহ।'
              : 'Find nearest verified hospitals, ambulances, cyclone shelters, and rescue squads instantly — with full offline backup.'}
          </p>

          {/* Interactive Hero Fast Search Bar */}
          <form 
            onSubmit={handleHeroSearch}
            className="w-full max-w-xl mb-8 flex items-center bg-white border border-gray-200 shadow-md rounded-2xl p-1.5 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all"
          >
            <div className="pl-3.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={heroSearchQuery}
              onChange={(e) => setHeroSearchQuery(e.target.value)}
              placeholder={isBn ? 'হাসপাতাল, এলাকা বা জেলার নাম লিখুন...' : 'Search hospital, clinic, or district name...'}
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[var(--color-medical-navy)] hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wide transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {isBn ? 'খুঁজুন' : 'Search'}
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link 
              to="/emergency"
              className="w-full sm:w-auto px-7 py-3.5 bg-[var(--color-medical-red)] hover:bg-red-700 text-white rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{t('home.btn.emergency')}</span>
            </Link>

            <Link 
              to="/healthcare"
              className="w-full sm:w-auto px-7 py-3.5 bg-[var(--color-medical-navy)] hover:bg-slate-800 text-white rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Building2 className="w-5 h-5 text-teal-300" />
              <span>{t('home.btn.healthcare')}</span>
            </Link>

            <Link 
              to="/shelters"
              className="w-full sm:w-auto px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Waves className="w-5 h-5 text-teal-200" />
              <span>{isBn ? 'আশ্রয়কেন্দ্র সন্ধান' : 'Find Shelters'}</span>
            </Link>
          </div>

          {/* Key Reliability Metrics Strip */}
          <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 py-6 px-6 bg-white/80 backdrop-blur-xs rounded-2xl border border-gray-150 shadow-xs text-left">
            <div className="space-y-0.5 border-r border-gray-100 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-[var(--color-medical-navy)] tabular-nums">
                ৬৪ <span className="text-sm font-semibold text-gray-500">{isBn ? 'জেলা' : 'Districts'}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isBn ? 'সার্বক্ষণিক দেশব্যাপী নেটওয়ার্ক' : 'Nationwide Area Coverage'}
              </p>
            </div>

            <div className="space-y-0.5 border-r border-gray-100 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">
                ২,৫০০+
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isBn ? 'যাচাইকৃত হাসপাতাল ও ক্লিনিক' : 'Verified Health Centers'}
              </p>
            </div>

            <div className="space-y-0.5 border-r border-gray-100 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-rose-600 tabular-nums">
                ৯৯৯ / ১০৯০
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isBn ? '১-ক্লিকে জরুরি হটলাইন কল' : 'Direct Emergency Lines'}
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-teal-700 flex items-center gap-1.5">
                <span>১০০%</span>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">PWA</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isBn ? 'সম্পূর্ণ অফলাইন ক্যাশ সুবিধা' : 'Offline Ready Storage'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Instant National Emergency Hotlines Bar */}
      <section className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>{isBn ? 'জাতীয় জরুরি ডায়াল প্যাড' : 'National Emergency Speed Dial'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isBn ? 'তাৎক্ষণিক জীবনরক্ষাকারী হটলাইন' : 'Instant Lifeline Hotlines'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isBn ? 'জরুরি প্রয়োজনে সরাসরি কলের জন্য যেকোনো নম্বরে ট্যাপ করুন' : 'Tap any number to dial national helplines immediately'}
              </p>
            </div>

            {/* Hotline Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 w-full lg:w-auto">
              {emergencyHotlines.map((hotline) => (
                <a
                  key={hotline.number}
                  href={`tel:${hotline.number}`}
                  className={`${hotline.bg} p-3.5 rounded-xl shadow-xs transition-all duration-150 flex flex-col justify-between group hover:scale-[1.02] cursor-pointer`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-lg font-black tracking-tight flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 shrink-0 group-hover:animate-bounce" />
                      {hotline.number}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${hotline.badgeColor}`}>
                      {hotline.badge}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight truncate">{hotline.title}</p>
                    <p className="text-[10px] text-white/80 truncate mt-0.5">{hotline.sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Capabilities & Lifesaving Modules */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              <span>{isBn ? 'সেবাসমূহ ও মডিউল' : 'Services & Modules'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-medical-navy)] tracking-tight">
              {t('home.quick_access')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {isBn
              ? 'প্রাকৃতিক দুর্যোগের আশ্রয়কেন্দ্র থেকে শুরু করে জরুরি অ্যাম্বুলেন্স ও ব্লাড ব্যাংক—সবকিছু এক প্ল্যাটফর্মে।'
              : 'From natural disaster shelters to verified ambulances and emergency care—everything in one place.'}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1 (Span 2 on lg): Cyclone & Flood Shelter Locator */}
          <Link
            to="/shelters"
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-md hover:shadow-xl transition-all duration-200 border border-teal-500/30 flex flex-col justify-between"
          >
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 group-hover:scale-105 transition-transform">
                  <Waves className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <span className="bg-teal-400/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/30">
                      {isBn ? 'দুর্যোগ ব্যবস্থাপনা' : 'Disaster Relief'}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {isBn ? '• ১০০% অফলাইন রেডি' : '• 100% Offline Ready'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {isBn ? 'সাইক্লোন ও বন্যা আশ্রয়কেন্দ্র ফাইন্ডার' : 'Cyclone & Flood Shelter Locator'}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                    {isBn
                      ? 'ঘূর্ণিঝড় ও বন্যার সময় নিকটতম নিরাপদ উঁচু আশ্রয়কেন্দ্র, মুজিব কিল্লা, গবাদিপশু আশ্রয় ও সিপিপি (CPP) ইন-চার্জের সরাসরি যোগাযোগ নম্বর খুঁজুন।'
                      : 'Locate nearby elevated cyclone shelters, flood refuges, livestock Mujib Killas, and emergency contact details.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-300 font-medium">
                <span>✓ {isBn ? 'বিশুদ্ধ পানি সুবিধা' : 'Clean Water'}</span>
                <span>✓ {isBn ? 'সোলার পাওয়ার' : 'Solar Power'}</span>
                <span>✓ {isBn ? 'নারীদের আলাদা টয়লেট' : 'Women Toilets'}</span>
              </div>
              <div className="flex items-center space-x-1 text-teal-300 font-bold group-hover:translate-x-1 transition-transform">
                <span>{isBn ? 'আশ্রয়কেন্দ্র অনুসন্ধান করুন' : 'Explore Shelters'}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: Volunteer & Rescue Squads */}
          <Link
            to="/volunteers"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 p-6 sm:p-7 text-white shadow-md hover:shadow-xl transition-all duration-200 border border-rose-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold bg-yellow-400/20 text-yellow-300 px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                  {isBn ? 'জরুরি উদ্ধার SOS' : 'Rescue SOS'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                {isBn ? 'উদ্ধারকারী দল ও ভলান্টিয়ার' : 'Rescue Squads & Volunteers'}
              </h3>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {isBn
                  ? 'রেড ক্রিসেন্ট, গাউসিয়া কমিটি, ফায়ার সার্ভিস ভলান্টিয়ার্স ও স্থানীয় স্পিডবোট উদ্ধার স্কোয়াড।'
                  : 'Red Crescent, Fire Service community squads, Gausia Committee, and youth boat rescue teams.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-yellow-300 mt-6">
              <span>{isBn ? 'টিম ডিরেক্টরি ও হটলাইন' : 'Squads Directory'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Healthcare Directory */}
          <Link
            to="/healthcare"
            className="group bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-blue-50 text-[var(--color-medical-blue)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'যাচাইকৃত তালিকা' : 'Verified Directory'}</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">
                {t('home.card.hospital.title')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('home.card.hospital.desc')}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[var(--color-medical-blue)] mt-5">
              <span>{isBn ? 'হাসপাতাল খুঁজুন' : 'Search Hospitals'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Ambulance Directory */}
          <Link
            to="/ambulance"
            className="group bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-rose-50 text-[var(--color-medical-red)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>{isBn ? '২৪/৭ সার্ভিস' : '24/7 Service'}</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">
                {t('home.card.ambulance.title')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('home.card.ambulance.desc')}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[var(--color-medical-red)] mt-5">
              <span>{isBn ? 'অ্যাম্বুলেন্স খুঁজুন' : 'Find Ambulance'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Nearby Facilities Radar */}
          <Link
            to="/nearby"
            className="group bg-white p-6 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-teal-50 text-[var(--color-medical-teal)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 mb-1">
                <span>{isBn ? 'লাইভ জিপিএস রেডার' : 'Live GPS Radar'}</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">
                {t('home.card.nearby.title')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('home.card.nearby.desc')}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-teal-700 mt-5">
              <span>{isBn ? 'ম্যাপে দেখুন' : 'Explore Radar'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* First Aid & Preparedness Banner */}
      <section className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isBn ? 'জরুরি প্রাথমিক চিকিৎসা ও সিপিপি গাইড' : 'Emergency First Aid Protocols'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {isBn
                  ? 'সিপিআর (CPR), পোড়া, বিষক্রিয়া ও রক্তক্ষরণ বন্ধে অফলাইন প্রাথমিক চিকিৎসা নির্দেশিকা।'
                  : 'Step-by-step life saving procedures for CPR, burns, bleeding, and snakebite emergencies.'}
              </p>
            </div>
          </div>
          <Link
            to="/first-aid"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold tracking-wide transition-colors shrink-0 shadow-xs flex items-center space-x-1.5"
          >
            <span>{isBn ? 'গাইড পড়ুন' : 'Read Guide'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Meet The Developer Section */}
      <section className="px-4 pt-10 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 via-[var(--color-medical-navy)] to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
            <Code2 className="w-64 h-64 text-teal-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-teal-400/30 shadow-lg bg-slate-800 shrink-0">
                  <img 
                    src="https://raw.githubusercontent.com/abdullah-sany/Asset/main/Sany.png" 
                    alt="MD Abdullah Sany" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-2 border-slate-900 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Founder & Lead Developer</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  MD Abdullah Sany
                </h3>
                <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                  {isBn 
                    ? '“প্রযুক্তি কেবল উদ্ভাবনী হলেই চলবে না — মানুষের চরম প্রয়োজনের মুহূর্তে যেন তা বাস্তবে কার্যকর ও সহায়ক হতে পারে।”'
                    : '“Technology should not only be innovative — it should be genuinely useful when people need it most.”'}
                </p>
              </div>
            </div>

            <Link
              to="/meet-developer"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white text-[var(--color-medical-navy)] hover:bg-gray-100 rounded-xl font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>{isBn ? 'ডেভেলপার পরিচিতি ও ভিশন দেখুন' : 'Meet the Developer'}</span>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
