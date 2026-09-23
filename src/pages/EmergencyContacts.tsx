import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Flame, WifiOff, Copy, Check, RefreshCw } from 'lucide-react';
import { EmergencyContact } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getCachedEmergencyContacts, cacheEmergencyContacts } from '../utils/offlineStorage';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function EmergencyContacts() {
  const { t, language } = useLanguage();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);
  const [cachedTime, setCachedTime] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    // 1. Immediately hydrate from LocalStorage cache or bundled fallback
    const { contacts: cachedList, isFromCache, cachedAt } = getCachedEmergencyContacts();
    setContacts(cachedList);
    setCachedTime(cachedAt);
    setLoading(false);

    // 2. Fetch fresh data if online
    if (navigator.onLine) {
      try {
        setIsRefreshing(true);
        const res = await fetch('/api/emergency-contacts');
        if (res.ok) {
          const freshData = await res.json();
          if (Array.isArray(freshData) && freshData.length > 0) {
            setContacts(freshData);
            cacheEmergencyContacts(freshData);
            setCachedTime(new Date().toISOString());
            setIsOfflineMode(false);
          }
        }
      } catch (err) {
        console.warn('Network fetch failed, retained cached emergency contacts:', err);
        setIsOfflineMode(true);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setIsOfflineMode(true);
    }
  };

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOfflineMode(false);
      loadData();
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIconForCategory = (category: string) => {
    if (category.toLowerCase().includes('fire')) return <Flame className="w-8 h-8" />;
    if (category.toLowerCase().includes('medical')) return <Activity className="w-8 h-8" />;
    return <ShieldAlert className="w-8 h-8" />;
  };

  const categories = ['all', ...Array.from(new Set(contacts.map(c => c.category)))];

  const filteredContacts = selectedCategory === 'all' 
    ? contacts 
    : contacts.filter(c => c.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Offline Status & Storage Indicator */}
      {isOfflineMode ? (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {language === 'bn' 
                  ? 'অফলাইন মোড সক্রিয় — ক্যাশড জরুরি নম্বরগুলো প্রস্তুত' 
                  : 'Offline Mode Active — Cached Emergency Contacts Ready'}
              </p>
              <p className="text-xs text-amber-700">
                {language === 'bn' 
                  ? 'ইন্টারনেট সংযোগ না থাকলেও এই নম্বরগুলো সবসময় আপনার ডিভাইসে সংরক্ষিত থাকবে।' 
                  : 'These numbers remain securely saved in local storage on your device without internet.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-md border border-amber-200 text-amber-800 shrink-0">
            {language === 'bn' ? 'অফলাইন ক্যাশ' : 'Local Storage Cache'}
          </span>
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 bg-white border border-gray-100 p-3 rounded-xl shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-gray-700">
              {language === 'bn' ? 'অফলাইন ক্যাশ সক্রিয় (১০০% সুরক্ষিত)' : 'Offline Local Storage Cache Active (Always Ready)'}
            </span>
            {cachedTime && (
              <span className="text-gray-400">
                • {language === 'bn' ? 'সর্বশেষ সংরক্ষিত:' : 'Last Synced:'} {new Date(cachedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button 
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center space-x-1 text-gray-600 hover:text-[var(--color-medical-red)] transition-colors font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'bn' ? 'ক্যাশ রিফ্রেশ' : 'Sync Cache'}</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-medical-navy)] tracking-tight mb-3">
            {t('contacts.title')}
          </h1>
          <p className="text-lg text-[var(--color-muted-gray)] max-w-2xl">
            {t('contacts.desc')}
          </p>
        </div>
        <PWAInstallButton variant="header" />
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--color-medical-navy)] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? (language === 'bn' ? 'সকল নম্বর (All)' : 'All Contacts') : cat}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-48"></div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gray-50 p-4 rounded-xl text-[var(--color-medical-navy)]">
                  {getIconForCategory(contact.category)}
                </div>
                {contact.verified && (
                  <div className="flex items-center space-x-1.5 text-[var(--color-verified-green)] bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('common.verified')}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-[var(--color-medical-navy)] mb-1">{contact.name}</h3>
              <p className="text-sm font-medium text-[var(--color-muted-gray)] uppercase tracking-wide mb-6">{contact.category}</p>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-2xl md:text-3xl font-extrabold text-[var(--color-medical-navy)] tracking-tight">
                    {contact.phone}
                  </span>
                  <button
                    onClick={() => handleCopy(contact.id, contact.phone)}
                    className="p-2 text-gray-500 hover:text-[var(--color-medical-navy)] hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title={language === 'bn' ? 'নম্বর কপি করুন' : 'Copy number'}
                    aria-label="Copy phone number"
                  >
                    {copiedId === contact.id ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <a 
                  href={`tel:${contact.phone}`}
                  className="w-full flex items-center justify-center space-x-2 bg-[var(--color-medical-red)] hover:bg-red-700 text-white py-3.5 rounded-lg font-bold tracking-wide transition-colors shadow-xs"
                >
                  <Phone className="w-5 h-5" />
                  <span>{t('common.call_now')}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
