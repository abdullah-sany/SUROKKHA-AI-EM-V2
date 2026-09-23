import React, { useState, useEffect } from 'react';
import { Activity, Flame, Droplet, Wind, AlertTriangle, ShieldAlert, Phone, CheckCircle2, Bookmark, BookmarkCheck, Play, Pause, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getFirstAidOfflineData, saveLastFirstAidCategory, toggleFirstAidBookmark, saveFirstAidNote } from '../utils/offlineStorage';
import { PWAInstallButton } from '../components/PWAInstallButton';

type CategoryId = 'cpr' | 'burns' | 'cuts' | 'choking';

interface Step {
  titleKey: string;
  descKey: string;
}

interface Category {
  id: CategoryId;
  icon: React.ElementType;
  titleKey: string;
  steps: Step[];
  colorClass: string;
  bgColorClass: string;
}

const categories: Category[] = [
  {
    id: 'cpr',
    icon: Activity,
    titleKey: 'firstaid.cat.cpr',
    colorClass: 'text-red-600',
    bgColorClass: 'bg-red-50',
    steps: [
      { titleKey: 'cpr.s1.t', descKey: 'cpr.s1.d' },
      { titleKey: 'cpr.s2.t', descKey: 'cpr.s2.d' },
      { titleKey: 'cpr.s3.t', descKey: 'cpr.s3.d' },
      { titleKey: 'cpr.s4.t', descKey: 'cpr.s4.d' },
    ]
  },
  {
    id: 'cuts',
    icon: Droplet,
    titleKey: 'firstaid.cat.cuts',
    colorClass: 'text-rose-600',
    bgColorClass: 'bg-rose-50',
    steps: [
      { titleKey: 'cuts.s1.t', descKey: 'cuts.s1.d' },
      { titleKey: 'cuts.s2.t', descKey: 'cuts.s2.d' },
      { titleKey: 'cuts.s3.t', descKey: 'cuts.s3.d' },
      { titleKey: 'cuts.s4.t', descKey: 'cuts.s4.d' },
    ]
  },
  {
    id: 'burns',
    icon: Flame,
    titleKey: 'firstaid.cat.burns',
    colorClass: 'text-orange-600',
    bgColorClass: 'bg-orange-50',
    steps: [
      { titleKey: 'burns.s1.t', descKey: 'burns.s1.d' },
      { titleKey: 'burns.s2.t', descKey: 'burns.s2.d' },
      { titleKey: 'burns.s3.t', descKey: 'burns.s3.d' },
      { titleKey: 'burns.s4.t', descKey: 'burns.s4.d' },
    ]
  },
  {
    id: 'choking',
    icon: Wind,
    titleKey: 'firstaid.cat.choking',
    colorClass: 'text-blue-600',
    bgColorClass: 'bg-blue-50',
    steps: [
      { titleKey: 'choking.s1.t', descKey: 'choking.s1.d' },
      { titleKey: 'choking.s2.t', descKey: 'choking.s2.d' },
      { titleKey: 'choking.s3.t', descKey: 'choking.s3.d' },
      { titleKey: 'choking.s4.t', descKey: 'choking.s4.d' },
    ]
  }
];

export default function FirstAidGuide() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryId>('cpr');
  const [bookmarkedSteps, setBookmarkedSteps] = useState<string[]>([]);
  const [isCPRBeatActive, setIsCPRBeatActive] = useState(false);
  const [cprBeatCount, setCPRBeatCount] = useState(0);

  // Initialize from local storage cache
  useEffect(() => {
    const offlineData = getFirstAidOfflineData();
    if (offlineData.lastCategory && categories.some(c => c.id === offlineData.lastCategory)) {
      setActiveTab(offlineData.lastCategory as CategoryId);
    }
    setBookmarkedSteps(offlineData.bookmarkedSteps);
  }, []);

  const handleTabChange = (catId: CategoryId) => {
    setActiveTab(catId);
    saveLastFirstAidCategory(catId);
    if (catId !== 'cpr') {
      setIsCPRBeatActive(false);
    }
  };

  const handleToggleBookmark = (stepKey: string) => {
    const updated = toggleFirstAidBookmark(stepKey);
    setBookmarkedSteps(updated);
  };

  // CPR 100-110 BPM visual metronome for emergency chest compressions
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCPRBeatActive) {
      // 105 beats per minute = 571 ms per beat
      interval = setInterval(() => {
        setCPRBeatCount(prev => (prev + 1) % 30); // 30 compressions cycle
      }, 571);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCPRBeatActive]);

  const activeCategory = categories.find(c => c.id === activeTab)!;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      {/* 100% Offline Status Badge */}
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>
            {language === 'bn' 
              ? '১০০% অফলাইন প্রস্তুত — কোনো ইন্টারনেট বা ডাটা সংযোগ ছাড়াই এই গাইডগুলো সবসময় পড়া যাবে' 
              : '100% Offline Ready — All first-aid guides & illustrations work completely without internet'}
          </span>
        </div>
        <span className="hidden sm:inline-block bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-bold">
          {language === 'bn' ? 'ডিভাইসে সংরক্ষিত' : 'Stored On-Device'}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('firstaid.title')}
              </h1>
              <p className="text-slate-500 mt-1 leading-relaxed text-sm md:text-base">
                {t('firstaid.desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:999"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wide shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কল ৯৯৯' : 'Call 999'}</span>
            </a>
            <a
              href="tel:16263"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs tracking-wide shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্বাস্থ্য ১৬২৬৩' : 'Health 16263'}</span>
            </a>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="leading-relaxed">{t('firstaid.warning')}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  isActive 
                    ? `${cat.bgColorClass} ${cat.colorClass} border-transparent shadow-xs ring-1 ring-black/5` 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{t(cat.titleKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className={`${activeCategory.bgColorClass} px-6 py-4 border-b border-slate-100 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <activeCategory.icon className={`w-6 h-6 ${activeCategory.colorClass}`} />
              <h2 className={`text-lg font-extrabold ${activeCategory.colorClass}`}>
                {t(activeCategory.titleKey)}
              </h2>
            </div>

            {/* Offline indicator on card */}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200">
              {language === 'bn' ? 'অফলাইন গাইড' : 'Offline Guide'}
            </span>
          </div>

          {/* Interactive CPR Metronome Tool (If CPR tab is active) */}
          {activeTab === 'cpr' && (
            <div className="mx-6 mt-6 p-4 rounded-2xl bg-red-950 text-white border border-red-800 shadow-inner">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-center sm:text-left">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg transition-transform ${
                    isCPRBeatActive 
                      ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50 animate-pulse' 
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {isCPRBeatActive ? `${cprBeatCount + 1}` : 'CPR'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {language === 'bn' ? 'বুক সংকোচন রিদম গাইড (১০০-১১০ bpm)' : 'Chest Compression Rhythm Trainer (100–110 bpm)'}
                    </h4>
                    <p className="text-xs text-red-200">
                      {language === 'bn' ? 'প্রতি সেকেন্ডে প্রায় ২ বার চাপ দিন (৩০ চাপ : ২ শ্বাস)' : 'Push hard & fast at center of chest (30 compressions : 2 breaths)'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCPRBeatActive(!isCPRBeatActive)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
                    isCPRBeatActive 
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' 
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isCPRBeatActive ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>{language === 'bn' ? 'বন্ধ করুন' : 'Stop Rhythm'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{language === 'bn' ? 'রিদম চালু করুন' : 'Start Beat'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {activeCategory.steps.map((step, idx) => {
                const stepKey = `${activeCategory.id}_s${idx + 1}`;
                const isChecked = bookmarkedSteps.includes(stepKey);

                return (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Step Number Circle */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-4 border-slate-200 text-slate-700 text-xs font-extrabold shadow-xs shrink-0 md:order-1 md:group-odd:-ml-4 md:group-even:-mr-4 z-10 transition-colors group-hover:border-red-500 group-hover:text-red-600">
                      {idx + 1}
                    </div>
                    
                    {/* Step Card */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-5 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-xs transition-all hover:shadow-md hover:bg-white hover:border-red-200">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {t(step.titleKey)}
                        </h3>
                        <button
                          onClick={() => handleToggleBookmark(stepKey)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            isChecked 
                              ? 'text-emerald-600 bg-emerald-50' 
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={language === 'bn' ? 'ধাপ সম্পন্ন হিসেবে চিহ্নিত করুন' : 'Mark step completed'}
                        >
                          {isChecked ? (
                            <BookmarkCheck className="w-4 h-4 fill-emerald-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
