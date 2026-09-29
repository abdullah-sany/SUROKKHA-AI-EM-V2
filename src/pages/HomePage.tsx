import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Building2, Phone, MapPin, Activity, Sparkles, ArrowRight, Code2, Heart, Waves, Wind, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import OneTouchEmergency from '../components/OneTouchEmergency';

export default function HomePage() {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <div className="w-full">
      <OneTouchEmergency />
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-24 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle background dotted texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-medical-red)]"></span>
            <span className="text-xs md:text-sm font-semibold tracking-wide text-[var(--color-medical-navy)] uppercase">{t('home.badge')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-medical-navy)] tracking-tight leading-tight mb-4 animate-fade-in-up">
            {t('home.title1')}<br className="hidden md:block"/> {t('home.title2')}
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-[var(--color-medical-navy)] mb-6">
            {t('home.subtitle')}
          </p>
          
          <p className="text-base md:text-lg text-[var(--color-muted-gray)] mb-10 max-w-2xl leading-relaxed">
            {t('home.desc')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Link 
              to="/healthcare"
              className="w-full sm:w-auto px-7 py-3.5 bg-[var(--color-medical-navy)] hover:bg-gray-800 text-white rounded-lg font-bold tracking-wide transition-colors shadow-md text-center"
            >
              {t('home.btn.healthcare')}
            </Link>
            <Link 
              to="/emergency"
              className="w-full sm:w-auto px-7 py-3.5 bg-[var(--color-medical-red)] hover:bg-red-700 text-white rounded-lg font-bold tracking-wide transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{t('home.btn.emergency')}</span>
            </Link>
            <Link 
              to="/shelters"
              className="w-full sm:w-auto px-7 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold tracking-wide transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <Waves className="w-5 h-5 text-teal-200" />
              <span>{isBn ? 'আশ্রয়কেন্দ্র খুঁজুন' : 'FIND SHELTERS'}</span>
            </Link>
          </div>

          {/* Disaster Emergency Modules Banners Grid */}
          <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Cyclone & Flood Shelter Feature Banner Card */}
            <Link
              to="/shelters"
              className="group relative block overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl hover:shadow-2xl transition-all border border-teal-500/30"
            >
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 group-hover:scale-110 transition-transform">
                    <Waves className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                        {isBn ? 'আশ্রয়কেন্দ্র' : 'Shelters'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        {isBn ? '• ১০০% অফলাইন' : '• Offline'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {isBn ? '🌊 সাইক্লোন ও বন্যা আশ্রয়কেন্দ্র ফাইন্ডার' : '🌊 Cyclone & Flood Shelter Locator'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {isBn
                        ? 'উপকূলীয় ও বন্যাপ্রবণ এলাকার নিরাপদ উঁচু আশ্রয়কেন্দ্র, ধারণক্ষমতা ও মুজিব কিল্লা।'
                        : 'Locate nearby elevated cyclone shelters, flood refuges and livestock Mujib Killas.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-teal-300 font-bold text-xs shrink-0 sm:self-center">
                  <span>{isBn ? 'ম্যাপ দেখুন' : 'Explore'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Volunteer & Rescue Squad Banner Card */}
            <Link
              to="/volunteers"
              className="group relative block overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 p-6 text-white shadow-xl hover:shadow-2xl transition-all border border-red-500/30"
            >
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-rose-300 shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-400/20 text-yellow-300 px-2 py-0.5 rounded-full border border-rose-400/30">
                        {isBn ? 'উদ্ধারকারী দল' : 'Rescue Squad'}
                      </span>
                      <span className="text-[10px] text-yellow-300 font-semibold">
                        {isBn ? '• ২৪/৭ হটলাইন' : '• 24/7 Hotline'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {isBn ? '🧑‍🤝‍🧑 স্বেচ্ছাসেবক ও উদ্ধারকারী টিম ডিরেক্টরি' : '🧑‍🤝‍🧑 Volunteer & Rescue Squad Directory'}
                    </h3>
                    <p className="text-xs text-rose-200 mt-1 line-clamp-2">
                      {isBn
                        ? 'রেড ক্রিসেন্ট, গাউসিয়া কমিটি, ফায়ার সার্ভিস ভলান্টিয়ার ও স্পিডবোট উদ্ধার স্কোয়াড।'
                        : 'BDRCS, Gausia Committee, Fire Service community squads, and boat teams.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-yellow-300 font-bold text-xs shrink-0 sm:self-center">
                  <span>{isBn ? 'টিম দেখুন' : 'Explore'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100">
        <h2 className="text-2xl font-bold text-[var(--color-medical-navy)] mb-8 text-center">{t('home.quick_access')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          <Link to="/volunteers" className="group bg-gradient-to-b from-rose-50/50 to-white p-5 rounded-2xl border border-rose-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-rose-100 text-rose-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-medical-navy)] mb-1">
              {isBn ? 'উদ্ধারকারী দল' : 'Rescue Squads'}
            </h3>
            <p className="text-[var(--color-muted-gray)] text-xs leading-relaxed">
              {isBn ? 'রেড ক্রিসেন্ট ও স্পিডবোট টিম।' : 'Volunteer rescue squads & boats.'}
            </p>
          </Link>

          <Link to="/shelters" className="group bg-gradient-to-b from-teal-50/50 to-white p-5 rounded-2xl border border-teal-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-medical-navy)] mb-1">
              {isBn ? 'আশ্রয়কেন্দ্র ফাইন্ডার' : 'Shelter Locator'}
            </h3>
            <p className="text-[var(--color-muted-gray)] text-xs leading-relaxed">
              {isBn ? 'ঘূর্ণিঝড় ও বন্যার আশ্রয়কেন্দ্র।' : 'Find cyclone & flood shelters.'}
            </p>
          </Link>

          <Link to="/healthcare" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 text-[var(--color-medical-blue)] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">{t('home.card.hospital.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-xs leading-relaxed">{t('home.card.hospital.desc')}</p>
          </Link>
          
          <Link to="/ambulance" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-50 text-[var(--color-medical-red)] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">{t('home.card.ambulance.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-xs leading-relaxed">{t('home.card.ambulance.desc')}</p>
          </Link>

          <Link to="/emergency-contacts" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-50 text-[var(--color-warning-amber)] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">{t('home.card.contacts.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-xs leading-relaxed">{t('home.card.contacts.desc')}</p>
          </Link>

          <Link to="/nearby" className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-teal-50 text-[var(--color-medical-teal)] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-medical-navy)] mb-1.5">{t('home.card.nearby.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-xs leading-relaxed">{t('home.card.nearby.desc')}</p>
          </Link>
        </div>
      </section>

      {/* Meet The Developer Teaser Card on Home Page */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 via-[var(--color-medical-navy)] to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
            <Code2 className="w-64 h-64 text-teal-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-teal-400/30 shadow-lg bg-slate-800 flex-shrink-0">
                  <img 
                    src="https://raw.githubusercontent.com/abdullah-sany/Asset/main/Sany.png" 
                    alt="MD Abdullah Sany" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-2 border-slate-900">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <span>Founder & Lead Developer</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  MD Abdullah Sany
                </h3>
                <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                  {isBn 
                    ? '“প্রযুক্তি কেবল উদ্ভাবনী হলেই চলবে না — মানুষের চরম প্রয়োজনের মুহূর্তে যেন তা বাস্তবে কার্যকর ও সহায়ক হতে পারে।”'
                    : '“Technology should not only be innovative — it should be useful when people need it most.”'}
                </p>
              </div>
            </div>

            <Link
              to="/meet-developer"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white text-[var(--color-medical-navy)] hover:bg-gray-100 rounded-xl font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md flex-shrink-0 cursor-pointer"
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
