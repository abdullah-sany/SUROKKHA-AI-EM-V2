import React, { useState } from 'react';
import { 
  X, AlertTriangle, Phone, MessageSquare, MapPin, 
  Users, Waves, Send, Copy, Check, ShieldAlert, Sparkles 
} from 'lucide-react';
import { VolunteerSquad } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface RescueRequestModalProps {
  squad: VolunteerSquad;
  userLat?: number;
  userLng?: number;
  onClose: () => void;
}

export const RescueRequestModal: React.FC<RescueRequestModalProps> = ({
  squad,
  userLat,
  userLng,
  onClose
}) => {
  const { t, language } = useLanguage();
  const [address, setAddress] = useState('');
  const [peopleCount, setPeopleCount] = useState('1');
  const [vulnerablePeople, setVulnerablePeople] = useState('শিশু / বৃদ্ধ / প্রসূতি আছেন');
  const [waterLevel, setWaterLevel] = useState('কোমর সমান পানি / দ্রুত বাড়ছে');
  const [userPhone, setUserPhone] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // Formulate the GPS map link
  const mapsLink = userLat && userLng ? `https://maps.google.com/?q=${userLat},${userLng}` : '';

  // Generate standardized, disaster-actionable SOS message
  const generateSosMessage = () => {
    const isBn = language === 'bn';
    const lines = [
      isBn ? '🚨 *জরুরি উদ্ধার সহায়তা চাই (SOS RESCUE REQUEST)* 🚨' : '🚨 *EMERGENCY SOS RESCUE REQUEST* 🚨',
      `${isBn ? 'টিম' : 'Team'}: ${squad.teamNameBn || squad.teamName}`,
      `${isBn ? 'এলাকা' : 'Area'}: ${squad.coverageAreaBn || squad.coverageArea} (${squad.district})`,
      '--------------------------------',
      `${isBn ? '📍 আটকে পড়ার স্থান / ঠিকানা' : '📍 Stranded Location/Address'}: ${address || (isBn ? 'ঠিকানা উল্লেখ নেই' : 'Not specified')}`,
      mapsLink ? `${isBn ? '🗺️ লাইভ জিপিএস লোকেশন' : '🗺️ Live GPS Location'}: ${mapsLink}` : '',
      `${isBn ? '👥 আটকে পড়া মানুষের সংখ্যা' : '👥 Stranded Count'}: ${peopleCount} জন/people`,
      vulnerablePeople ? `${isBn ? '⚠️ সংবেদনশীল অবস্থা' : '⚠️ Vulnerable Status'}: ${vulnerablePeople}` : '',
      `${isBn ? '🌊 বর্তমান পানির অবস্থা' : '🌊 Flood/Danger Level'}: ${waterLevel}`,
      userPhone ? `${isBn ? '📞 যোগাযোগের ফোন' : '📞 Contact Phone'}: ${userPhone}` : '',
      additionalNotes ? `${isBn ? '📝 বিশেষ তথ্য' : '📝 Notes'}: ${additionalNotes}` : '',
      '--------------------------------',
      isBn 
        ? 'দয়া করে দ্রুত উদ্ধার নৌকা / স্পিডবোট বা রেসকিউ টিম পাঠান! আমরা বিপদে আছি।' 
        : 'Please send rescue boats or rescue squad immediately! We are in grave danger.'
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopy = () => {
    const msg = generateSosMessage();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const targetPhone = squad.whatsappNumber || squad.primaryPhone;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(generateSosMessage());
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleSms = () => {
    const targetPhone = squad.primaryPhone;
    const msg = encodeURIComponent(generateSosMessage());
    window.location.href = `sms:${targetPhone}?body=${msg}`;
  };

  const handleDirectCall = () => {
    window.location.href = `tel:${squad.primaryPhone}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-200 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 sm:p-5 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldAlert className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-yellow-200 px-2 py-0.5 rounded-full">
                  SOS RESCUE
                </span>
                <span className="text-xs text-white/90">24/7 লাইভ সাপোর্ট</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
                জরুরি উদ্ধার সহায়তা আবেদন
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                {squad.teamNameBn || squad.teamName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Notice */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">জরুরি নির্দেশনা:</span> তথ্যগুলো পূরণ করে সরাসরি হোয়াটসঅ্যাপ অথবা এসএমএস বাটনে চাপ দিন। উদ্ধারকারী দল আপনার লোকেশন ও পানির উচ্চতা দেখে দ্রুত নৌকা পাঠাতে পারবে।
            </div>
          </div>

          {/* Stranded Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              📍 আপনার সঠিক অবস্থান বা পরিচিত ল্যান্ডমার্ক (বাধ্যতামূলক):
            </label>
            <input
              type="text"
              placeholder="যেমন: ফুলগাজী মুন্সীরহাট, বারেক মিয়ার বাড়ির দোতলা বা ছাদ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {/* GPS Coordinates detected */}
          {userLat && userLng ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-800">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>জিপিএস পাওয়া গেছে: <strong>{userLat.toFixed(4)}, {userLng.toFixed(4)}</strong></span>
              </div>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                ম্যাপ লিংক যুক্ত হবে
              </span>
            </div>
          ) : (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>জিপিএস বন্ধ রয়েছে। উপরের ঘরে বিস্তারিত ঠিকানা লিখুন।</span>
            </div>
          )}

          {/* Trapped People & Danger status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                👥 মোট আটকে পড়া মানুষ:
              </label>
              <select
                value={peopleCount}
                onChange={(e) => setPeopleCount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="1">১ জন (নিজে)</option>
                <option value="2-3">২ - ৩ জন</option>
                <option value="4-6">৪ - ৬ জন (একটি পরিবার)</option>
                <option value="7-10">৭ - ১০ জন</option>
                <option value="10+">১০ জনের বেশি (একাধিক পরিবার)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                🌊 পানির উচ্চতা / বিপদের মাত্রা:
              </label>
              <select
                value={waterLevel}
                onChange={(e) => setWaterLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="কোমর সমান পানি / দ্রুত বাড়ছে">কোমর সমান পানি / দ্রুত বাড়ছে</option>
                <option value="ঘরের ভেতর বুক সমান পানি">ঘরের ভেতর বুক সমান পানি</option>
                <option value="চালে বা ছাদে আশ্রয় নিয়েছি">চালে বা ছাদে আশ্রয় নিয়েছি</option>
                <option value="তীব্র স্রোত / ভেসে যাওয়ার ঝুঁকি">তীব্র স্রোত / ভেসে যাওয়ার ঝুঁকি</option>
                <option value="সাইক্লোনে গাছ বা ঘর ভেঙে পড়েছে">সাইক্লোনে গাছ বা ঘর ভেঙে পড়েছে</option>
              </select>
            </div>
          </div>

          {/* Vulnerable Status & User Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ⚠️ পরিবারে কারা আছেন:
              </label>
              <input
                type="text"
                placeholder="যেমন: বৃদ্ধ মা, নবজাতক শিশু বা গর্ভবতী"
                value={vulnerablePeople}
                onChange={(e) => setVulnerablePeople(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                📞 আপনার যোগাযোগের মোবাইল নম্বর:
              </label>
              <input
                type="tel"
                placeholder="যেমন: 017XXXXXXXX"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              📝 অতিরিক্ত দরকারি তথ্য (যদি থাকে):
            </label>
            <input
              type="text"
              placeholder="যেমন: খাবার ও খাওয়ার পানি শেষ, একজনের স্যালাইন লাগবে"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Generated Message Preview */}
          <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-mono relative">
            <div className="flex justify-between items-center mb-1 text-[11px] font-sans font-bold text-gray-500">
              <span>তৈরিকৃত উদ্ধার বার্তা (মেসেজ প্রিভিউ)</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-800 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200">
              {generateSosMessage()}
            </pre>
          </div>

          {/* 3 Urgent Dispatch Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <span>হোয়াটসঅ্যাপে এই রেসকিউ টিমকে পাঠান (WhatsApp SOS)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDirectCall}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>সরাসরি কল দিন ({squad.primaryPhone})</span>
              </button>

              <button
                onClick={handleSms}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-gray-800 hover:bg-black text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                <span>এসএমএস (SMS) পাঠান</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <p className="text-[11px] text-gray-500">
              অত্যন্ত জরুরি বিপদে জাতীয় জরুরি সেবা <strong className="text-red-600">৯৯৯</strong> অথবা ফায়ার সার্ভিস <strong className="text-red-600">১৬১৬৩</strong> নম্বরেও যোগাযোগ করতে পারেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
