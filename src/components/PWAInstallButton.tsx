import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useLanguage();

  if (isInstalled) {
    return null;
  }

  const label = language === 'bn' ? 'অফলাইন অ্যাপ ইনস্টল' : 'Install App (Offline)';

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base">
                {language === 'bn' ? 'অফলাইনে ব্যবহারের জন্য অ্যাপটি ইনস্টল করুন' : 'Install App for 100% Offline Access'}
              </h4>
              <p className="text-xs text-red-100 mt-0.5">
                {language === 'bn' ? 'ইন্টারনেট ছাড়াই জরুরি ফার্স্ট-এইড গাইড ও নম্বর পান' : 'Access emergency contacts & first-aid guides even with no internet'}
              </p>
            </div>
          </div>
          <button
            onClick={install}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-[var(--color-medical-red)] hover:bg-gray-50 rounded-xl font-bold text-sm tracking-wide transition-colors shadow-sm flex items-center justify-center space-x-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{label}</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs bg-red-50 text-[var(--color-medical-red)] hover:bg-red-100 border border-red-200 transition-colors shadow-xs ${className}`}
        title={language === 'bn' ? 'অফলাইনে ব্যবহারের জন্য ইনস্টল করুন' : 'Install App for offline emergency access'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'banner' ? (
          <div className={`bg-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <Share className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-base">
                  {language === 'bn' ? 'iPhone-এ অফলাইন অ্যাপ যোগ করুন' : 'Add to iPhone Home Screen'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {language === 'bn' ? 'ইন্টারনেট ছাড়াই ইনস্ট্যান্ট ব্যবহারের জন্য হোম স্ক্রিনে রাখুন' : 'Instant offline emergency access from home screen'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs transition-colors shrink-0"
            >
              {language === 'bn' ? 'ইনস্টল নিয়মাবলী' : 'How to Install'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>{language === 'bn' ? 'iOS ইনস্টল' : 'Install on iOS'}</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-red-50 text-[var(--color-medical-red)] rounded-xl">
                  <Share className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'bn' ? 'iPhone / iPad এ ইনস্টল করুন' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-xs text-gray-500">Safari Browser</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-red-600">১.</span>
                  <p>
                    {language === 'bn'
                      ? 'সাফারি ব্রাউজারের নিচে "Share" (শেয়ার) আইকনটি চাপুন।'
                      : 'Tap the Share icon at the bottom of Safari.'}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-red-600">২.</span>
                  <p>
                    {language === 'bn'
                      ? 'মেনু থেকে "Add to Home Screen" অপশনটি সিলেক্ট করুন।'
                      : 'Scroll and tap "Add to Home Screen".'}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-red-600">৩.</span>
                  <p>
                    {language === 'bn'
                      ? 'উপরে "Add" চাপুন। এবার ইন্টারনেট ছাড়াই যেকোনো সময় অ্যাপটি খুলবে!'
                      : 'Tap "Add" in top-right. The app will work fully offline!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[var(--color-medical-navy)] text-white py-3 text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                {language === 'bn' ? 'বুঝেছি' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback if beforeinstallprompt not fired yet or desktop browser
  return null;
};
