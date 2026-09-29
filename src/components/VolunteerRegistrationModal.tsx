import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, Users, Phone, MapPin, 
  Waves, AlertCircle, Heart, Anchor, Shield 
} from 'lucide-react';
import { VolunteerSquad, VolunteerOrgType, SquadStatus } from '../types';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshDistricts';
import { registerVolunteerSquad } from '../services/volunteerService';
import { useLanguage } from '../contexts/LanguageContext';

interface VolunteerRegistrationModalProps {
  userLat?: number;
  userLng?: number;
  onClose: () => void;
  onSquadRegistered: (squad: VolunteerSquad) => void;
}

export const VolunteerRegistrationModal: React.FC<VolunteerRegistrationModalProps> = ({
  userLat,
  userLng,
  onClose,
  onSquadRegistered
}) => {
  const { language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [teamNameBn, setTeamNameBn] = useState('');
  const [teamNameEn, setTeamNameEn] = useState('');
  const [organization, setOrganization] = useState<VolunteerOrgType>('LOCAL_YOUTH');
  const [division, setDivision] = useState('Chattogram');
  const [district, setDistrict] = useState('Feni');
  const [upazila, setUpazila] = useState('');
  const [coverageAreaBn, setCoverageAreaBn] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderDesignation, setLeaderDesignation] = useState('টিম লিডার / সমন্বয়ক');
  const [activeVolunteers, setActiveVolunteers] = useState('25');
  const [equipmentBn, setEquipmentBn] = useState('');
  
  // Capabilities checkboxes
  const [capabilities, setCapabilities] = useState<string[]>([
    'firstaid', 'food_relief'
  ]);

  // Filter districts by selected division
  const filteredDistricts = BANGLADESH_DISTRICTS.filter(d => d.division === division);

  const toggleCapability = (cap: string) => {
    setCapabilities(prev => 
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const getOrgBnName = (org: VolunteerOrgType): string => {
    switch (org) {
      case 'BDRCS': return 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি (BDRCS)';
      case 'FSCD_VOLUNTEER': return 'ফায়ার সার্ভিস ভলান্টিয়ার্স (FSCD)';
      case 'GAUSIA_COMMITTEE': return 'গাউসিয়া কমিটি বাংলাদেশ';
      case 'AS_SUNNAH': return 'আস-সুন্নাহ ফাউন্ডেশন';
      case 'SCOUTS': return 'বাংলাদেশ স্কাউটস ও রোভার স্কাউটস';
      case 'STUDENT_COMMUNITY': return 'ছাত্র ও যুব উদ্ধার প্ল্যাটফর্ম';
      case 'BOAT_SQUAD': return 'হাওর ও উপকূলীয় বোট উদ্ধার স্কোয়াড';
      case 'DIVER_LIFEGUARD': return 'ডাইভার্স ও লাইফগার্ড রেসকিউ টিম';
      case 'LOCAL_YOUTH': return 'স্থানীয় তরুণ উদ্ধারকারী দল';
      default: return 'স্বেচ্ছাসেবক ও রেসকিউ টিম';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamNameBn.trim()) {
      setErrorMsg('দয়া করে টিমের বাংলা নাম লিখুন।');
      return;
    }
    if (!primaryPhone.trim()) {
      setErrorMsg('জরুরি হটলাইন নম্বর দেওয়া আবশ্যক।');
      return;
    }
    if (!upazila.trim()) {
      setErrorMsg('উপজেলার নাম লিখুন।');
      return;
    }

    try {
      setSubmitting(true);
      
      // Default to user GPS or safe center coordinates of the district
      const lat = userLat || 23.0186;
      const lng = userLng || 91.3966;

      const newSquad = await registerVolunteerSquad({
        teamName: teamNameEn || teamNameBn,
        teamNameBn: teamNameBn,
        organization: organization,
        orgNameBn: getOrgBnName(organization),
        division: division,
        district: district,
        upazila: upazila.trim(),
        coverageArea: coverageAreaBn || upazila,
        coverageAreaBn: coverageAreaBn || upazila,
        primaryPhone: primaryPhone.trim(),
        secondaryPhone: primaryPhone.trim(),
        whatsappNumber: (whatsappNumber || primaryPhone).trim(),
        leaderOrCoordinator: leaderName || 'টিম ইনচার্জ',
        leaderDesignation: leaderDesignation,
        activeVolunteersCount: parseInt(activeVolunteers, 10) || 20,
        capabilities: capabilities,
        equipmentBn: equipmentBn || 'লাইফ জ্যাকেট, মেগাফোন ও ফার্স্ট এইড কিট',
        latitude: lat,
        longitude: lng,
        verified: true,
        is24Hours: true,
        status: 'active' as SquadStatus,
        source: 'কমিউনিটি স্বেচ্ছাসেবক নিবন্ধন'
      });

      setSuccess(true);
      setTimeout(() => {
        onSquadRegistered(newSquad);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg('নিবন্ধন সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-5 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <Users className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  COMMUNITY VOLUNTEER
                </span>
                <span className="text-xs text-emerald-100">উদ্ধারকারী দল তালিকাভুক্তি</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
                নতুন উদ্ধারকারী টিম তালিকাভুক্ত করুন
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                আপনার এলাকার স্বেচ্ছাসেবী বা উদ্ধার দলের তথ্য যুক্ত করে বিপদাপন্ন মানুষের পাশে দাঁড়ান
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

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">টিম সফলভাবে যুক্ত হয়েছে!</h3>
            <p className="text-sm text-gray-600">
              আপনার উদ্ধারকারী দল এখন ডিরেক্টরিতে অন্তর্ভুক্ত হয়েছে এবং কাছাকাছি মানুষ প্রয়োজনে সরাসরি যোগাযোগ করতে পারবে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Team Name Bn & En */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  টিমের নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফুলগাজী তরুণ উদ্ধার স্কোয়াড"
                  value={teamNameBn}
                  onChange={(e) => setTeamNameBn(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Team Name (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fulgazi Youth Rescue Squad"
                  value={teamNameEn}
                  onChange={(e) => setTeamNameEn(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                সংগঠন বা নেটওয়ার্কের ধরন *
              </label>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value as VolunteerOrgType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="LOCAL_YOUTH">স্থানীয় তরুণ ও যুব উদ্ধারকারী দল</option>
                <option value="STUDENT_COMMUNITY">ছাত্র ও বিশ্ববিদ্যালয় উদ্ধার প্ল্যাটফর্ম</option>
                <option value="BOAT_SQUAD">স্পিডবোট ও ট্রলার রেসকিউ টিম</option>
                <option value="BDRCS">বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি (BDRCS / CPP)</option>
                <option value="FSCD_VOLUNTEER">ফায়ার সার্ভিস ও সিভিল ডিফেন্স ভলান্টিয়ার্স</option>
                <option value="GAUSIA_COMMITTEE">গাউসিয়া কমিটি বাংলাদেশ</option>
                <option value="AS_SUNNAH">আস-সুন্নাহ ফাউন্ডেশন স্কোয়াড</option>
                <option value="SCOUTS">বাংলাদেশ স্কাউটস ও রোভার রেসকিউ</option>
                <option value="DIVER_LIFEGUARD">ডাইভার্স ও লাইফগার্ড রেসকিউ ইউনিট</option>
                <option value="OTHER">অন্যান্য সমাজকল্যাণমূলক উদ্ধার দল</option>
              </select>
            </div>

            {/* Division & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  বিভাগ *
                </label>
                <select
                  value={division}
                  onChange={(e) => {
                    const newDiv = e.target.value;
                    setDivision(newDiv);
                    const firstD = BANGLADESH_DISTRICTS.find(d => d.division === newDiv);
                    if (firstD) setDistrict(firstD.en);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Chattogram">চট্টগ্রাম (Chattogram)</option>
                  <option value="Dhaka">ঢাকা (Dhaka)</option>
                  <option value="Sylhet">সিলেট (Sylhet)</option>
                  <option value="Khulna">খুলনা (Khulna)</option>
                  <option value="Barishal">বরিশাল (Barishal)</option>
                  <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                  <option value="Rangpur">রংপুর (Rangpur)</option>
                  <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  জেলা *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {filteredDistricts.map(d => (
                    <option key={d.en} value={d.en}>
                      {d.bn} ({d.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upazila & Coverage Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  উপজেলা / থানা *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফুলগাজী"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  কভারেজ এলাকা / ইউনিয়নসমূহ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মুন্সীরহাট, আনন্দপুর, সদর"
                  value={coverageAreaBn}
                  onChange={(e) => setCoverageAreaBn(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Contact Phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  জরুরি কল নম্বর (Hotline) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="যেমন: 018XXXXXXXX"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  হোয়াটসঅ্যাপ নম্বর (SOS লোকেশনের জন্য)
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 018XXXXXXXX"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Coordinator Info & Member count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  সমন্বয়ক / দলনেতার নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মো. শামীম আহমেদ"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পদবী / ভূমিকা
                </label>
                <input
                  type="text"
                  placeholder="টিম লিডার / সমন্বয়ক"
                  value={leaderDesignation}
                  onChange={(e) => setLeaderDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  সক্রিয় ভলান্টিয়ার
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={activeVolunteers}
                  onChange={(e) => setActiveVolunteers(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Capabilities Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                টিমের বিশেষ সক্ষমতা ও উদ্ধার সরঞ্জাম (টিক দিন):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'speedboat', label: '🚤 স্পিডবোট / নৌকা' },
                  { id: 'divers', label: '🤿 ডুবুরি ও সাঁতারু' },
                  { id: 'firstaid', label: '🩹 ফার্স্ট এইড ও স্যালাইন' },
                  { id: 'food_relief', label: '🍞 শুকনা খাদ্য ও পানি' },
                  { id: 'drone', label: '🚁 ড্রোন সার্চ নজরদারি' },
                  { id: 'climbing_rope', label: '🪢 রশি ও স্ট্রেচার' },
                  { id: 'ambulance', label: '🚑 ফ্রি অ্যাম্বুলেন্স' },
                ].map((cap) => (
                  <label 
                    key={cap.id} 
                    className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      capabilities.includes(cap.id) 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={capabilities.includes(cap.id)}
                      onChange={() => toggleCapability(cap.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{cap.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment details */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                বিদ্যমান সরঞ্জামাদি (সংক্ষেপে):
              </label>
              <input
                type="text"
                placeholder="যেমন: ২টি কাঠের নৌকা, ২০টি লাইফ জ্যাকেট, মেগাফোন, সার্চলাইট"
                value={equipmentBn}
                onChange={(e) => setEquipmentBn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>সংরক্ষণ হচ্ছে...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>টিম যুক্ত করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
