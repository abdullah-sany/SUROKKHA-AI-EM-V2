import React from 'react';
import { Wifi, WifiOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useLanguage } from '../contexts/LanguageContext';

export function NetworkStatusIndicator() {
  const { isOnline, quality, effectiveType } = useNetworkStatus();
  const { language } = useLanguage();

  if (!isOnline) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
            <WifiOff className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="font-bold text-sm">
              {language === 'bn' 
                ? 'আপনি অফলাইনে আছেন — জরুরি ডেটা প্রস্তুত' 
                : 'You are currently offline — Emergency cache active'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {language === 'bn'
                ? 'ফার্স্ট-এইড গাইড ও জরুরি ফোন নম্বরগুলো আপনার ডিভাইসে সংরক্ষিত রয়েছে এবং শতভাগ কাজ করবে।'
                : 'First-aid guides and emergency contact numbers remain 100% accessible from local storage.'}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-xs font-bold text-emerald-700 shrink-0 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{language === 'bn' ? 'অফলাইন নিরাপদ' : 'Offline Safe'}</span>
        </div>
      </div>
    );
  }

  let bgColor = 'bg-emerald-50';
  let borderColor = 'border-emerald-200';
  let textColor = 'text-emerald-700';
  let iconColor = 'text-emerald-600';
  let message = language === 'bn' 
    ? 'ইন্টারনেট সংযোগ স্থিতিশীল। জরুরি ডেটা লাইভ সিঙ্ক হচ্ছে।' 
    : 'Connection is stable. Emergency data is live and synchronized.';

  if (quality === 'poor') {
    bgColor = 'bg-rose-50';
    borderColor = 'border-rose-200';
    textColor = 'text-rose-700';
    iconColor = 'text-rose-600';
    message = language === 'bn'
      ? 'দুর্বল ইন্টারনেট সংযোগ সনাক্ত হয়েছে। অফলাইন ক্যাশ ব্যাকআপ সক্রিয় রয়েছে।'
      : 'Weak connection detected. Offline local storage backup is active.';
  } else if (quality === 'medium') {
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-200';
    textColor = 'text-amber-700';
    iconColor = 'text-amber-600';
    message = language === 'bn'
      ? 'মাঝারি গতির নেটওয়ার্ক। ডেটা স্বাভাবিকভাবে লোড হচ্ছে।'
      : 'Medium connection strength. Data is loading normally.';
  }

  return (
    <div className={`${bgColor} ${borderColor} border ${textColor} px-4 py-3 rounded-2xl flex items-center justify-between mb-6 shadow-xs`}>
      <div className="flex items-center space-x-3">
        {quality === 'poor' ? <AlertTriangle className={`w-5 h-5 ${iconColor}`} /> : <Wifi className={`w-5 h-5 ${iconColor}`} />}
        <span className="font-semibold text-sm">{message}</span>
      </div>
      {effectiveType && (
        <div className="text-xs font-bold uppercase tracking-wider bg-white/70 px-2.5 py-1 rounded-md border border-black/5">
          {effectiveType}
        </div>
      )}
    </div>
  );
}
