import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Building2, Phone, MapPin, Activity, Sparkles, ArrowRight, Code2, Heart } from 'lucide-react';
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
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <Link 
              to="/healthcare"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--color-medical-navy)] hover:bg-gray-800 text-white rounded-lg font-bold tracking-wide transition-colors shadow-md text-center"
            >
              {t('home.btn.healthcare')}
            </Link>
            <Link 
              to="/emergency"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--color-medical-red)] hover:bg-red-700 text-white rounded-lg font-bold tracking-wide transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{t('home.btn.emergency')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100">
        <h2 className="text-2xl font-bold text-[var(--color-medical-navy)] mb-8 text-center">{t('home.quick_access')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/healthcare" className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 text-[var(--color-medical-blue)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.hospital.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-sm leading-relaxed">{t('home.card.hospital.desc')}</p>
          </Link>
          
          <Link to="/ambulance" className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-50 text-[var(--color-medical-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.ambulance.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-sm leading-relaxed">{t('home.card.ambulance.desc')}</p>
          </Link>

          <Link to="/emergency-contacts" className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-50 text-[var(--color-warning-amber)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.contacts.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-sm leading-relaxed">{t('home.card.contacts.desc')}</p>
          </Link>

          <Link to="/nearby" className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-teal-50 text-[var(--color-medical-teal)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-2">{t('home.card.nearby.title')}</h3>
            <p className="text-[var(--color-muted-gray)] text-sm leading-relaxed">{t('home.card.nearby.desc')}</p>
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
