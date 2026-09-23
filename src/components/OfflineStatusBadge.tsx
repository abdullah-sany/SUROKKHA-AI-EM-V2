import React, { useState } from 'react';
import { WifiOff, Database, Info, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useLanguage } from '../contexts/LanguageContext';

interface OfflineStatusBadgeProps {
  /**
   * Optional compact mode for mobile viewports
   */
  compact?: boolean;
}

export function OfflineStatusBadge({ compact = false }: OfflineStatusBadgeProps) {
  const { isOnline } = useNetworkStatus();
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  // If online, do not render the offline badge
  if (isOnline) {
    return null;
  }

  const handleManualCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);

    try {
      // Ping favicon or lightweight endpoint with cache-busting
      const response = await fetch(`/favicon.ico?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store'
      });
      if (response.ok) {
        setCheckResult(
          language === 'bn' 
            ? 'ইন্টারনেট পুনঃসংযোগ পাওয়া গেছে!' 
            : 'Connection restored!'
        );
        setTimeout(() => window.location.reload(), 800);
      } else {
        setCheckResult(
          language === 'bn' 
            ? 'এখনও ইন্টারনেট সংযোগ নেই' 
            : 'Still offline'
        );
      }
    } catch {
      setCheckResult(
        language === 'bn' 
          ? 'এখনও অফলাইনে আছেন' 
          : 'Still offline'
      );
    } finally {
      setIsChecking(false);
    }
  };

  const badgeText = language === 'bn' 
    ? 'অফলাইন • ক্যাশ ডেটা সক্রিয়' 
    : 'Offline • Using Cached Data';

  const compactText = language === 'bn'
    ? 'ক্যাশ ডেটা'
    : 'Cached Data';

  return (
    <div className="relative inline-block">
      <motion.button
        id="offline-status-header-badge"
        type="button"
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -4 }}
        transition={{ duration: 0.2 }}
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shadow-xs cursor-pointer select-none
          bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
        title={
          language === 'bn'
            ? 'ডিভাইস অফলাইনে আছে। স্থানীয় ক্যাশ ডেটা ব্যবহার হচ্ছে। বিস্তারিত জানতে ক্লিক করুন।'
            : 'Device is offline. Using cached data. Click for details.'
        }
        aria-label="Offline status: currently using cached data"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>

        <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />

        <span className={compact ? 'hidden sm:inline font-medium' : 'font-medium'}>
          {compact ? compactText : badgeText}
        </span>

        <Database className="w-3 h-3 text-amber-600 hidden sm:inline shrink-0 ml-0.5" />
      </motion.button>

      {/* Popover Details / Modal Tooltip */}
      <AnimatePresence>
        {showDetails && (
          <>
            {/* Backdrop for easy dismiss on mobile */}
            <div 
              className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent"
              onClick={() => setShowDetails(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 sm:left-auto mt-2 w-80 max-w-[90vw] p-4 bg-white border border-amber-200 rounded-xl shadow-lg z-50 text-left text-gray-800"
            >
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      {language === 'bn' ? 'অফলাইন মোড' : 'Offline Mode Active'}
                    </h4>
                    <p className="text-xs font-medium text-gray-700">
                      {language === 'bn' ? 'ক্যাশ থেকে ডেটা পরিবেশন হচ্ছে' : 'Serving from local cache'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2.5 space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100">
                  <Database className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <p>
                    {language === 'bn'
                      ? 'আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে। অ্যাপের সংরক্ষিত ক্যাশ (হাসপাতাল ডিরেক্টরি, ফার্স্ট এইড ও জরুরি হটলাইন) সম্পূর্ণ সচল রয়েছে।'
                      : 'No internet connection detected. The app is serving cached medical directories, hospital contacts, and offline first-aid guides safely.'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 font-medium px-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {language === 'bn' 
                      ? 'জরুরি ফোন কল ও নেভিগেশন সচল রয়েছে' 
                      : 'Emergency direct calling & navigation ready'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>
                    {isChecking
                      ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Checking...')
                      : (language === 'bn' ? 'সংযোগ পুনরায় চেক করুন' : 'Check connection')}
                  </span>
                </button>

                {checkResult && (
                  <span className="text-xs font-semibold text-amber-800">
                    {checkResult}
                  </span>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
