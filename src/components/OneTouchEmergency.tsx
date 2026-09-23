import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function OneTouchEmergency() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="tel:999"
        className="group relative flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 hover:scale-105 transition-all duration-300"
        aria-label="Call National Emergency 999"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
        <PhoneCall className="w-7 h-7 relative z-10 group-hover:animate-bounce" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none flex flex-col items-end">
          <span>{t('emergency.call_999')}</span>
          <span className="text-red-400 text-xs">National Emergency</span>
        </div>
      </a>
    </div>
  );
}
