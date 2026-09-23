import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, WifiOff } from 'lucide-react';
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
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { isOnline } = useNetworkStatus();

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.emergency'), path: '/emergency' },
    { name: t('nav.healthcare'), path: '/healthcare' },
    { name: t('nav.nearby'), path: '/nearby' },
    { name: t('nav.ambulance'), path: '/ambulance' },
    { name: t('nav.contacts'), path: '/emergency-contacts' },
    { name: t('nav.first_aid'), path: '/first-aid' },
    { name: t('nav.developer'), path: '/meet-developer' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo & Offline Status Badge */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-[var(--color-medical-navy)]">
                SUROKKHA AI <span className="text-[var(--color-medical-red)]">BD</span>
              </span>
            </Link>
            <div className="hidden lg:block">
              <OfflineStatusBadge />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-semibold tracking-wide transition-colors duration-200",
                  location.pathname === link.path 
                    ? "text-[var(--color-medical-red)]" 
                    : "text-[var(--color-medical-navy)] hover:text-[var(--color-medical-teal)]"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="lg:hidden">
              <OfflineStatusBadge compact />
            </div>

            <PWAInstallButton variant="header" />

            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1.5 text-[var(--color-medical-navy)] hover:bg-gray-50 px-3 py-1.5 rounded-md font-semibold text-sm transition-colors border border-gray-200 cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>
          </div>

          {/* Mobile Menu Button & Mobile Offline Badge */}
          <div className="md:hidden flex items-center space-x-1.5">
            <OfflineStatusBadge compact />

            <PWAInstallButton variant="header" />

            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center justify-center text-[var(--color-medical-navy)] bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold w-12"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[var(--color-medical-navy)] hover:text-[var(--color-medical-red)] focus:outline-none p-2"
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

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-4 text-base font-bold tracking-wide rounded-md",
                    location.pathname === link.path
                      ? "bg-red-50 text-[var(--color-medical-red)]"
                      : "text-[var(--color-medical-navy)] hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2">
                <PWAInstallButton variant="banner" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
