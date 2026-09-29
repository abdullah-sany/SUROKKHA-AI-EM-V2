import React, { useState } from 'react';
import { 
  X, MessageSquare, Share2, Copy, Check, 
  MapPin, ShieldAlert, PhoneCall, ExternalLink, AlertTriangle 
} from 'lucide-react';
import { Shelter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EmergencyShelterShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShelter: Shelter | null;
  userCoords: { latitude?: number; longitude?: number } | null;
}

export function EmergencyShelterShareModal({
  isOpen,
  onClose,
  selectedShelter,
  userCoords
}: EmergencyShelterShareModalProps) {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build maps link
  const userMapsUrl = userCoords?.latitude && userCoords?.longitude
    ? `https://maps.google.com/?q=${userCoords.latitude},${userCoords.longitude}`
    : '';

  // Generate distress text
  let messageText = '';
  if (isBn) {
    messageText = `🚨 জরুরি দুর্যোগ সতর্কতা (SUROKKHA AI BD) 🚨\nআমি সাইক্লোন/বন্যা ঝুঁকিতে আছি। অবিলম্বে উদ্ধার সহায়তা প্রয়োজন!\n\n`;
    if (userMapsUrl) {
      messageText += `📍 আমার বর্তমান অবস্থান:\n${userMapsUrl}\n(জিপিএস: ${userCoords?.latitude?.toFixed(4)}, ${userCoords?.longitude?.toFixed(4)})\n\n`;
    }
    if (selectedShelter) {
      messageText += `🏛️ লক্ষ্য আশ্রয়কেন্দ্র: ${selectedShelter.nameBn || selectedShelter.name}\nএলাকা: ${selectedShelter.unionArea}, ${selectedShelter.upazila}, ${selectedShelter.district}\nশেল্টার দায়িত্বপ্রাপ্ত: ${selectedShelter.contactPerson} (${selectedShelter.contactPhone})\n\n`;
    }
    messageText += `দয়া করে আমাকে সাহায্য করুন অথবা জাতীয় দুর্যোগ হেল্পলাইন ১০৯০ / ৯৯৯ এ যোগাযোগ করুন!`;
  } else {
    messageText = `🚨 EMERGENCY DISASTER SOS (SUROKKHA AI BD) 🚨\nI am in urgent cyclone/flood danger and require assistance!\n\n`;
    if (userMapsUrl) {
      messageText += `📍 My Current Location:\n${userMapsUrl}\n(GPS: ${userCoords?.latitude?.toFixed(4)}, ${userCoords?.longitude?.toFixed(4)})\n\n`;
    }
    if (selectedShelter) {
      messageText += `🏛️ Destination Shelter: ${selectedShelter.name}\nArea: ${selectedShelter.unionArea}, ${selectedShelter.upazila}, ${selectedShelter.district}\nShelter In-Charge: ${selectedShelter.contactPerson} (${selectedShelter.contactPhone})\n\n`;
    }
    messageText += `Please dispatch help or notify National Disaster Helpline 1090 / 999!`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-rose-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {isBn ? 'জরুরি SOS লোকেশন শেয়ার' : 'Emergency SOS Location Share'}
              </h3>
              <p className="text-[11px] text-red-100">
                {isBn ? '১-ক্লিকে উদ্ধারকারী বা পরিবারকে বার্তা পাঠান' : 'Send 1-click rescue alert to family or volunteers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status info bar */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">
                {isBn ? 'দুর্যোগে দ্রুত যোগাযোগের পরামর্শ:' : 'Disaster Rescue Tip:'}
              </span>
              <span className="text-[11px] text-amber-800">
                {isBn 
                  ? 'মোবাইল নেটওয়ার্ক দুর্বল থাকলে এসএমএস (SMS) বাটনটি ব্যবহার করুন, এটি ইন্টারনেটের চেয়ে দ্রুত কাজ করে।' 
                  : 'If internet is unstable, use Native SMS button as text messages transmit on low cellular network.'}
              </span>
            </div>
          </div>

          {/* Location & Shelter Context */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold">{isBn ? 'বর্তমান অবস্থান:' : 'GPS Position:'}</span>
              <span className="font-bold text-slate-800">
                {userCoords?.latitude && userCoords?.longitude
                  ? `${userCoords.latitude.toFixed(4)}, ${userCoords.longitude.toFixed(4)}`
                  : (isBn ? 'জিপিএস সক্রিয় নয়' : 'GPS Not Detected')}
              </span>
            </div>

            {selectedShelter && (
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/80">
                <span className="text-gray-500 font-semibold">{isBn ? 'আশ্রয়কেন্দ্র:' : 'Target Shelter:'}</span>
                <span className="font-bold text-teal-800 truncate max-w-[200px]">
                  {isBn ? selectedShelter.nameBn : selectedShelter.name}
                </span>
              </div>
            )}
          </div>

          {/* Message Preview */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              {isBn ? 'প্রস্তুতকৃত জরুরি বার্তা প্রিভিউ:' : 'Generated SOS Message Preview:'}
            </label>
            <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto border border-slate-700">
              {messageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-white text-white" />
              <span>{isBn ? 'হোয়াটসঅ্যাপে (WhatsApp) পাঠান' : 'Share via WhatsApp'}</span>
            </a>

            {/* Native SMS */}
            <a
              href={smsUrl}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{isBn ? 'মোবাইল এসএমএস (SMS) পাঠান' : 'Send Native SMS Alert'}</span>
            </a>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopy}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 border border-gray-300 transition active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4 text-gray-600" />}
              <span>
                {copied 
                  ? (isBn ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to Clipboard!')
                  : (isBn ? 'সম্পূর্ণ মেসেজ কপি করুন' : 'Copy SOS Message')}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
