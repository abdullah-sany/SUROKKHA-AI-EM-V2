import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Globe, 
  WifiOff, 
  ChevronDown, 
  Building2, 
  Ambulance, 
  MapPin, 
  HeartPulse, 
  LifeBuoy, 
  Users, 
  Code2, 
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { PWAInstallButton } from '../PWAInstallButton';
import { OfflineStatusBadge } from '../OfflineStatusBadge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'healthcare' | 'disaster' | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { isOnline } = useNetworkStatus();

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleDropdownEnter = (type: 'healthcare' | 'disaster') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(type);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const isHealthcareActive = ['/healthcare', '/ambulance', '/nearby', '/first-aid'].includes(location.pathname);
  const isDisasterActive = ['/shelters', '/volunteers', '/rescue-squads'].includes(location.pathname);

  const healthcareItems = [
    {
      title: language === 'bn' ? 'স্বাস্থ্যসেবা ডিরেক্টরি' : 'Healthcare Directory',
      desc: language === 'bn' ? 'যাচাইকৃত হাসপাতাল, ক্লিনিক ও স্বাস্থ্যকেন্দ্র' : 'Hospitals, clinics & diagnostic centers',
      path: '/healthcare',
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: language === 'bn' ? 'অ্যাম্বুলেন্স ডিরেক্টরি' : 'Ambulance Services',
      desc: language === 'bn' ? '২৪/৭ জরুরি রোগী পরিবহন ও অক্সিজেন সুবিধা' : '24/7 verified patient transport',
      path: '/ambulance',
      icon: Ambulance,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: language === 'bn' ? 'নিকটবর্তী ম্যাপ ও রেডার' : 'Nearby Radar & Maps',
      desc: language === 'bn' ? 'লাইভ জিপিএস রুট ও তাৎক্ষণিক দূরত্ব নির্ণয়' : 'Live GPS routing & local distance',
      path: '/nearby',
      icon: MapPin,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: language === 'bn' ? 'প্রাথমিক চিকিৎসা গাইড' : 'First Aid Protocols',
      desc: language === 'bn' ? 'সিপিআর, পোড়া ও রক্তক্ষরণ জীবন রক্ষাকারী নির্দেশিকা' : 'Step-by-step life saving procedures',
      path: '/first-aid',
      icon: HeartPulse,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const disasterItems = [
    {
      title: language === 'bn' ? 'সাইক্লোন ও বন্যা আশ্রয়কেন্দ্র' : 'Cyclone & Flood Shelters',
      desc: language === 'bn' ? 'উপকূলীয় ও বন্যা কবলিত আশ্রয়কেন্দ্র সন্ধান' : 'Find nearest cyclone & flood shelters',
      path: '/shelters',
      icon: LifeBuoy,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: language === 'bn' ? 'উদ্ধারকারী দল ও ভলান্টিয়ার' : 'Rescue Squads & Volunteers',
      desc: language === 'bn' ? 'রেড ক্রিসেন্ট, গাউসিয়া ও জরুরি রেসকিউ টিম' : 'Community volunteers, Red Crescent & SOS',
      path: '/volunteers',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo & Offline Status Badge */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-medical-navy)] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black tracking-tight text-[var(--color-medical-navy)] leading-tight">
                  SUROKKHA AI <span className="text-[var(--color-medical-red)]">BD</span>
                </span>
                <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase -mt-0.5">
                  Emergency & Health Net
                </span>
              </div>
            </Link>
            <div className="hidden xl:block pl-2 border-l border-gray-200">
              <OfflineStatusBadge />
            </div>
          </div>

          {/* Desktop Nav - Clean, grouped, uncluttered */}
          <nav 
            ref={navContainerRef}
            className="hidden lg:flex items-center space-x-1 xl:space-x-2"
            aria-label="Main Navigation"
          >
            {/* 1. Home Link */}
            <Link
              to="/"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors duration-150",
                location.pathname === '/'
                  ? "text-[var(--color-medical-red)] bg-red-50/60 font-bold"
                  : "text-[var(--color-medical-navy)] hover:text-[var(--color-medical-teal)] hover:bg-gray-50"
              )}
            >
              {t('nav.home')}
            </Link>

            {/* 2. Emergency Hub Link - Featured */}
            <Link
              to="/emergency"
              className={cn(
                "inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-150 border shadow-2xs",
                location.pathname === '/emergency'
                  ? "bg-red-600 text-white border-red-600 shadow-red-200"
                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300"
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span>{t('nav.emergency')}</span>
            </Link>

            {/* 3. Healthcare Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('healthcare')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'healthcare' ? null : 'healthcare')}
                className={cn(
                  "inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors cursor-pointer select-none",
                  isHealthcareActive
                    ? "text-[var(--color-medical-red)] bg-red-50/60 font-bold"
                    : "text-[var(--color-medical-navy)] hover:text-[var(--color-medical-teal)] hover:bg-gray-50"
                )}
                aria-expanded={activeDropdown === 'healthcare'}
                aria-haspopup="true"
              >
                <span>{t('nav.healthcare')}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 opacity-75", activeDropdown === 'healthcare' ? "rotate-180" : "")} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'healthcare' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1.5 w-84 bg-white rounded-xl shadow-xl border border-gray-150 p-2 z-50 ring-1 ring-black/5"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                      {language === 'bn' ? 'চিকিৎসা ও স্বাস্থ্যসেবা' : 'Medical & Healthcare Services'}
                    </div>
                    <div className="space-y-1">
                      {healthcareItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "flex items-start space-x-3 p-2.5 rounded-lg transition-colors group",
                              isCurrent
                                ? "bg-red-50/80 text-[var(--color-medical-red)]"
                                : "hover:bg-slate-50 text-[var(--color-medical-navy)]"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", item.bg)}>
                              <Icon className={cn("w-4 h-4", item.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-bold leading-tight", isCurrent ? "text-red-700" : "group-hover:text-teal-700")}>
                                {item.title}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Disaster & Relief Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('disaster')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'disaster' ? null : 'disaster')}
                className={cn(
                  "inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors cursor-pointer select-none",
                  isDisasterActive
                    ? "text-[var(--color-medical-red)] bg-red-50/60 font-bold"
                    : "text-[var(--color-medical-navy)] hover:text-[var(--color-medical-teal)] hover:bg-gray-50"
                )}
                aria-expanded={activeDropdown === 'disaster'}
                aria-haspopup="true"
              >
                <span>{t('nav.disaster')}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 opacity-75", activeDropdown === 'disaster' ? "rotate-180" : "")} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'disaster' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-gray-150 p-2 z-50 ring-1 ring-black/5"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                      {language === 'bn' ? 'দুর্যোগ ব্যবস্থাপনা ও উদ্ধার' : 'Disaster Relief & Rescue'}
                    </div>
                    <div className="space-y-1">
                      {disasterItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "flex items-start space-x-3 p-2.5 rounded-lg transition-colors group",
                              isCurrent
                                ? "bg-red-50/80 text-[var(--color-medical-red)]"
                                : "hover:bg-slate-50 text-[var(--color-medical-navy)]"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", item.bg)}>
                              <Icon className={cn("w-4 h-4", item.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-bold leading-tight", isCurrent ? "text-red-700" : "group-hover:text-teal-700")}>
                                {item.title}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. Emergency Contacts / Hotlines */}
            <Link
              to="/emergency-contacts"
              className={cn(
                "inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors",
                location.pathname === '/emergency-contacts'
                  ? "text-[var(--color-medical-red)] bg-red-50/60 font-bold"
                  : "text-[var(--color-medical-navy)] hover:text-[var(--color-medical-teal)] hover:bg-gray-50"
              )}
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('nav.contacts')}</span>
            </Link>

            {/* 6. Meet Developer */}
            <Link
              to="/meet-developer"
              className={cn(
                "inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors",
                location.pathname === '/meet-developer'
                  ? "text-[var(--color-medical-red)] bg-red-50/60 font-bold"
                  : "text-gray-600 hover:text-[var(--color-medical-navy)] hover:bg-gray-50"
              )}
              title={language === 'bn' ? 'ডেভেলপার পরিচিতি' : 'Meet Developer'}
            >
              <Code2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('nav.developer')}</span>
            </Link>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <div className="xl:hidden">
              <OfflineStatusBadge compact />
            </div>

            <PWAInstallButton variant="header" />

            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1.5 text-[var(--color-medical-navy)] hover:bg-gray-50 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors border border-gray-200 cursor-pointer shadow-2xs"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>
          </div>

          {/* Mobile Menu Button & Mobile Offline Badge */}
          <div className="lg:hidden flex items-center space-x-1.5">
            <OfflineStatusBadge compact />

            <PWAInstallButton variant="header" />

            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center justify-center text-[var(--color-medical-navy)] bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold w-11 shadow-2xs cursor-pointer"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[var(--color-medical-navy)] hover:text-[var(--color-medical-red)] focus:outline-none p-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slim Offline Bar Below Header when device is offline */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 border-t border-amber-200 text-amber-900 px-4 py-1.5 text-xs flex items-center justify-center gap-2 overflow-hidden select-none"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              {language === 'bn'
                ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন — আপনি বর্তমানে সংরক্ষিত ক্যাশ ডেটা ব্যবহার করছেন।'
                : 'No internet connection — You are currently using offline cached data.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer - Organized by categories */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-150 shadow-lg overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="px-4 pt-3 pb-6 space-y-4">
              
              {/* Emergency Fast Banner */}
              <Link
                to="/emergency"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-red-600 text-white shadow-sm"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t('nav.emergency')}</p>
                    <p className="text-[11px] text-red-100">{language === 'bn' ? 'জরুরি সাহায্য ও ৯৯৯ কল' : 'Immediate assistance & 999 hotline'}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-red-700/60 px-2.5 py-1 rounded-md">SOS</span>
              </Link>

              {/* Main Quick Links */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 text-sm font-bold rounded-lg transition-colors",
                    location.pathname === '/'
                      ? "bg-red-50 text-[var(--color-medical-red)]"
                      : "text-[var(--color-medical-navy)] hover:bg-gray-50"
                  )}
                >
                  {t('nav.home')}
                </Link>

                <Link
                  to="/emergency-contacts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors",
                    location.pathname === '/emergency-contacts'
                      ? "bg-red-50 text-[var(--color-medical-red)]"
                      : "text-[var(--color-medical-navy)] hover:bg-gray-50"
                  )}
                >
                  <PhoneCall className="w-4 h-4 text-rose-500" />
                  <span>{t('nav.contacts')}</span>
                </Link>
              </div>

              {/* Category: Medical & Healthcare */}
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {t('nav.healthcare')}
                </p>
                <div className="space-y-1">
                  {healthcareItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                          location.pathname === item.path
                            ? "bg-red-50 text-[var(--color-medical-red)] font-bold"
                            : "text-[var(--color-medical-navy)] hover:bg-gray-50"
                        )}
                      >
                        <Icon className={cn("w-4 h-4 shrink-0", item.color)} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Category: Disaster Relief */}
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {t('nav.disaster')}
                </p>
                <div className="space-y-1">
                  {disasterItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                          location.pathname === item.path
                            ? "bg-red-50 text-[var(--color-medical-red)] font-bold"
                            : "text-[var(--color-medical-navy)] hover:bg-gray-50"
                        )}
                      >
                        <Icon className={cn("w-4 h-4 shrink-0", item.color)} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Developer & PWA in mobile */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <Link
                  to="/meet-developer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[var(--color-medical-navy)]"
                >
                  <Code2 className="w-4 h-4 text-teal-600" />
                  <span>{language === 'bn' ? 'ডেভেলপার পরিচিতি (MD Abdullah Sany)' : 'Meet the Developer (MD Abdullah Sany)'}</span>
                </Link>
                <PWAInstallButton variant="banner" />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
