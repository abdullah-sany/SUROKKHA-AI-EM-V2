import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Square, RotateCcw, Check, Sparkles, 
  ShieldAlert, Utensils, Pill, FileText, Flashlight, 
  Home, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CHECKLIST_STORAGE_KEY = 'surokkha_disaster_checklist_v1';

interface ChecklistItem {
  id: string;
  category: 'food_water' | 'medicine' | 'documents' | 'tools' | 'home_cattle';
  titleBn: string;
  titleEn: string;
  urgent?: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Food & Water
  {
    id: 'item_dry_food',
    category: 'food_water',
    titleBn: '৩-৫ দিনের শুকনো খাবার (চিঁড়া, মুড়ি, গুড়, বিস্কুট, খেজুর)',
    titleEn: '3-5 days of dry food (flattened rice, puffed rice, biscuits, dates)',
    urgent: true
  },
  {
    id: 'item_clean_water',
    category: 'food_water',
    titleBn: 'সিল করা প্লাস্টিক বোতলে সুপেয় খাবার পানি (জনপ্রতি প্রতিদিন ৩ লিটার)',
    titleEn: 'Bottled drinking water in sealed plastic (3L/person/day)',
    urgent: true
  },
  {
    id: 'item_water_purify',
    category: 'food_water',
    titleBn: 'পানি বিশুদ্ধকরণ ট্যাবলেট (হ্যালট্যাব / ক্লোরিন) বা ফিটকিরি',
    titleEn: 'Water purification tablets (Halotab/Chlorine) or alum',
    urgent: false
  },
  {
    id: 'item_baby_food',
    category: 'food_water',
    titleBn: 'শিশু ও বয়স্কদের বাড়তি খাবার / গুঁড়োদুধ (প্রয়োজনে)',
    titleEn: 'Baby food, formula milk or elderly nutrition (if needed)',
    urgent: false
  },

  // Medicine & First Aid
  {
    id: 'item_ors',
    category: 'medicine',
    titleBn: 'পর্যাপ্ত খাবার স্যালাইন (ORS) ও ডায়রিয়ার ওষুধ',
    titleEn: 'Adequate Oral Rehydration Solution (ORS) & anti-diarrheal meds',
    urgent: true
  },
  {
    id: 'item_prescription_meds',
    category: 'medicine',
    titleBn: 'পরিবারের নিয়মিত জরুরি ওষুধ (প্রেসার, ডায়াবেটিস, ইনসুলিন, হাঁপানি)',
    titleEn: 'Prescription medicines for chronic patients (BP, diabetes, asthma)',
    urgent: true
  },
  {
    id: 'item_first_aid_kit',
    category: 'medicine',
    titleBn: 'ব্যান্ডেজ, স্যাভলন/অ্যান্টিসেপটিক লোশন, তুলা, প্যারাসিটামল',
    titleEn: 'First aid kit: Bandages, antiseptic, cotton, paracetamol',
    urgent: false
  },
  {
    id: 'item_hygiene_sanitary',
    category: 'medicine',
    titleBn: 'নারীদের স্যানিটারি ন্যাপকিন, সাবান ও জীবানুনাশক সামগ্রী',
    titleEn: 'Sanitary napkins, soap and personal hygiene essentials',
    urgent: false
  },

  // Documents & Cash
  {
    id: 'item_nid_papers',
    category: 'documents',
    titleBn: 'জাতীয় পরিচয়পত্র (NID), জন্মসনদ ও জমির কাগজপত্র পলিথিনে মোড়ানো',
    titleEn: 'National ID cards, birth certificates & property deeds in waterproof pouch',
    urgent: true
  },
  {
    id: 'item_cash',
    category: 'documents',
    titleBn: 'জরুরি নগদ টাকা ও কিছু খুচরা কয়েন (ঝড়ে এটিএম ও অনলাইন বন্ধ হতে পারে)',
    titleEn: 'Emergency physical cash & coins (mobile banks & ATMs may fail)',
    urgent: true
  },
  {
    id: 'item_contact_list',
    category: 'documents',
    titleBn: 'জরুরি ফোন নম্বর ও নিকটাত্মীয়দের নম্বর কাগজে লেখা তালিকা',
    titleEn: 'Physical paper list of emergency contacts and family phone numbers',
    urgent: false
  },

  // Tools & Survival Gear
  {
    id: 'item_torch',
    category: 'tools',
    titleBn: 'ওয়াটারপ্রুফ টর্চলাইট ও অতিরিক্ত ব্যাটারি',
    titleEn: 'Waterproof flashlight & spare batteries',
    urgent: true
  },
  {
    id: 'item_matches_candles',
    category: 'tools',
    titleBn: 'ম্যাচ/লাইটার ও মোমবাতি (পলিথিনে শক্তভাবে মোড়ানো)',
    titleEn: 'Matches/lighter and candles tightly sealed in plastic',
    urgent: true
  },
  {
    id: 'item_powerbank',
    category: 'tools',
    titleBn: 'ফুল চার্জড মোবাইল ফোন ও পাওয়ার ব্যাংক',
    titleEn: 'Fully charged mobile phone and power bank',
    urgent: true
  },
  {
    id: 'item_radio',
    category: 'tools',
    titleBn: 'ব্যাটারি চালিত রেডিও (আবহাওয়ার খবর ও সংকেত শোনার জন্য)',
    titleEn: 'Battery-operated radio for weather & warning announcements',
    urgent: false
  },
  {
    id: 'item_whistle',
    category: 'tools',
    titleBn: 'হুইসেল বা বাঁশি (উদ্ধারকারী দল বা সিপিপির দৃষ্টি আকর্ষণ করতে)',
    titleEn: 'Whistle to signal rescue teams & volunteers',
    urgent: false
  },

  // Home & Cattle Security
  {
    id: 'item_untie_cattle',
    category: 'home_cattle',
    titleBn: 'বিপদ সংকেত ৫-এর আগেই গবাদিপশুর বাঁধন খুলে উঁচু কিল্লা বা মাটির ঢিবিতে নেওয়া',
    titleEn: 'Untie cattle before Signal 5 and move them to elevated Mujib Killa',
    urgent: true
  },
  {
    id: 'item_power_switch',
    category: 'home_cattle',
    titleBn: 'ঘর ছাড়ার আগে মেইন পাওয়ার সুইচ ও গ্যাস লাইন পুরোপুরি বন্ধ করা',
    titleEn: 'Shut off main electrical breaker and gas line before leaving',
    urgent: true
  }
];

export function DisasterChecklist() {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';

  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Load saved checklist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read checklist from localStorage', e);
    }
  }, []);

  // Save to localStorage when changed
  const toggleItem = (id: string) => {
    setCheckedIds(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // storage quota fallback
      }
      return next;
    });
  };

  const handleCheckAll = () => {
    const allChecked: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach(item => {
      allChecked[item.id] = true;
    });
    setCheckedIds(allChecked);
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(allChecked));
    } catch (e) {}
  };

  const handleReset = () => {
    setCheckedIds({});
    try {
      localStorage.removeItem(CHECKLIST_STORAGE_KEY);
    } catch (e) {}
  };

  const totalItems = CHECKLIST_ITEMS.length;
  const completedCount = CHECKLIST_ITEMS.filter(item => checkedIds[item.id]).length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  const categories = [
    { id: 'all', labelBn: 'সবগুলো', labelEn: 'All', icon: Sparkles },
    { id: 'food_water', labelBn: 'খাদ্য ও পানি', labelEn: 'Food & Water', icon: Utensils },
    { id: 'medicine', labelBn: 'ওষুধ ও চিকিৎসা', labelEn: 'Medicine', icon: Pill },
    { id: 'documents', labelBn: 'কাগজপত্র ও টাকা', labelEn: 'Documents', icon: FileText },
    { id: 'tools', labelBn: 'টর্চ ও সরঞ্জাম', labelEn: 'Tools & Light', icon: Flashlight },
    { id: 'home_cattle', labelBn: 'গবাদিপশু ও বাড়ি', labelEn: 'Livestock & Home', icon: Home },
  ];

  const filteredItems = activeCategory === 'all' 
    ? CHECKLIST_ITEMS 
    : CHECKLIST_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden transition-all">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                {isBn ? 'ইন্টারেক্টিভ গাইড' : 'Interactive Guide'}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {isBn ? 'স্বয়ংক্রিয়ভাবে সংরক্ষিত' : 'Auto Saved'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {t('shelter.checklist_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {t('shelter.checklist_subtitle')}
            </p>
          </div>
        </div>

        {/* Progress summary & collapse arrow */}
        <div className="flex items-center space-x-4 shrink-0 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xs text-slate-300 block font-medium">
              {t('shelter.checklist_progress')}
            </span>
            <span className="text-base font-extrabold text-emerald-400">
              {completedCount} / {totalItems} ({progressPercent}%)
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Category filter tabs & Reset buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive 
                        ? 'bg-teal-700 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCheckAll}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-md transition cursor-pointer"
              >
                {t('shelter.checklist_check_all')}
              </button>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-md transition cursor-pointer inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('shelter.checklist_reset')}</span>
              </button>
            </div>
          </div>

          {/* Checklist items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredItems.map(item => {
              const isChecked = !!checkedIds[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3 rounded-xl border flex items-start space-x-3 transition cursor-pointer select-none ${
                    isChecked 
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' 
                      : 'bg-white border-gray-200 hover:border-teal-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white" />
                    )}
                  </div>

                  <div className="flex-1 text-xs">
                    <p className={`font-semibold leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {isBn ? item.titleBn : item.titleEn}
                    </p>
                    {item.urgent && !isChecked && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        {isBn ? '⚠️ অতি জরুরি' : '⚠️ Critical'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Motivation completion banner if all done */}
          {progressPercent === 100 && (
            <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-sm block">
                  {isBn ? 'মাশাল্লাহ! আপনার দুর্যোগ গো-ব্যাগ সম্পূর্ণ প্রস্তুত।' : 'Great Job! Your emergency disaster go-bag is 100% ready.'}
                </span>
                <span className="text-emerald-800">
                  {isBn ? 'জরুরি সংকেত পেলে কালবিলম্ব না করে নিকটস্থ আশ্রয়কেন্দ্রে চলে যান।' : 'Evacuate promptly to the nearest designated shelter when warned.'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
