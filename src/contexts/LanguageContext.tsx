import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // AppHeader
    'nav.home': 'HOME',
    'nav.emergency': 'EMERGENCY',
    'nav.healthcare': 'HEALTHCARE',
    'nav.ambulance': 'AMBULANCE',
    'nav.contacts': 'CONTACTS',
    'nav.need_blood': 'NEED BLOOD ↗',
    'nav.nearby': 'NEARBY',
    'nav.developer': 'DEVELOPER',

    // HomePage
    'home.badge': 'Emergency & Healthcare Support',
    'home.title1': 'Emergency & Healthcare',
    'home.title2': 'Support for Bangladesh',
    'home.subtitle': 'Right support at critical moments',
    'home.desc': 'Find hospitals, ambulance services and important emergency resources quickly.',
    'home.btn.healthcare': 'FIND HEALTHCARE',
    'home.btn.emergency': 'GET EMERGENCY HELP',
    'home.quick_access': 'Quick Access',
    'home.card.hospital.title': 'Find Hospital',
    'home.card.hospital.desc': 'Search for verified healthcare facilities and clinics.',
    'home.card.ambulance.title': 'Find Ambulance',
    'home.card.ambulance.desc': 'Search verified ambulance services in your area.',
    'home.card.contacts.title': 'Emergency Contacts',
    'home.card.contacts.desc': 'Access important national and local emergency numbers.',
    'home.card.nearby.title': 'Nearby Help',
    'home.card.nearby.desc': 'Use your location to discover nearby support.',

    // Emergency Hub
    'emergency.call_999': 'Call 999',
    'emergency.hub': 'Emergency Hub',
    'emergency.title': 'Emergency Assistance',
    'emergency.subtitle': 'Assistance in urgent moments',
    'emergency.desc': 'Select an option below to find immediate help. Do not hesitate to call national emergency services if lives are in danger.',
    'emergency.btn.hospital': 'FIND HOSPITAL',
    'emergency.btn.ambulance': 'FIND AMBULANCE',
    'emergency.quick_access': 'QUICK EMERGENCY ACCESS',
    'emergency.card.hospital.desc': 'Search healthcare facilities quickly. View emergency contact numbers and directions.',
    'emergency.card.ambulance.desc': 'Find verified ambulance service information in your district or area.',
    'emergency.card.contacts.desc': 'Access important national emergency contact information (999, Fire, Medical).',
    'emergency.card.nearby.desc': 'Use your location to discover nearby support and healthcare facilities.',

    // Common
    'common.verified': 'Verified',
    'common.needs_verification': 'Needs Verification',
    'common.call': 'CALL',
    'common.call_now': 'CALL NOW',
    'common.directions': 'DIRECTIONS',
    'common.km_away': 'KM AWAY',
    'common.source': 'Source:',

    // Healthcare Directory
    'healthcare.title': 'Healthcare Directory',
    'healthcare.desc': 'Find healthcare facilities across Bangladesh.',
    'healthcare.btn.location': 'USE MY LOCATION',
    'healthcare.loc.detecting': 'Detecting location...',
    'healthcare.loc.enabled': 'Location Enabled',
    'healthcare.loc.unavailable': 'Location access unavailable. Select manually.',
    'healthcare.filters.title': 'Smart Filters',
    'healthcare.filters.search': 'Search Name or Area',
    'healthcare.filters.search_placeholder': 'e.g. Dhaka Medical',
    'healthcare.filters.division': 'Division',
    'healthcare.filters.all_divisions': 'All Divisions',
    'healthcare.filters.district': 'District',
    'healthcare.filters.all_districts': 'All Districts',
    'healthcare.filters.type': 'Facility Type',
    'healthcare.filters.all_types': 'All Types',
    'healthcare.filters.status': 'Verification Status',
    'healthcare.filters.all_status': 'All Status',
    'healthcare.filters.verified_only': 'Verified Only',
    'healthcare.filters.needs_verification': 'Needs Verification',
    'healthcare.filters.clear': 'Clear Filters',
    'healthcare.empty.title': 'No healthcare facilities found.',
    'healthcare.empty.desc': 'Try changing your search or filters.',
    'healthcare.error.title': 'Unable to load directory',

    // Ambulance Directory
    'ambulance.title': 'Ambulance Directory',
    'ambulance.desc': 'Find verified ambulance service information. Contact the provider to confirm availability.',
    'ambulance.search_placeholder': 'Search by provider name or area...',
    'ambulance.empty.title': 'No ambulance services found.',
    'ambulance.empty.desc': 'Try changing your search terms.',
    'ambulance.error.title': 'Unable to load ambulances',
    'ambulance.btn.contact': 'CONTACT SERVICE',
    'ambulance.type.ambulance': 'Ambulance',

    // Emergency Contacts
    'contacts.title': 'Emergency Contacts',
    'contacts.desc': 'Important verified emergency contact information for national and local services.',
    'contacts.error.title': 'Unable to load contacts',

    // Nearby Facilities
    'nearby.title': 'Nearby Facilities',
    'nearby.desc': 'Real-time hospitals, emergency clinics, and pharmacies around your location powered by OpenStreetMap.',
    'nearby.loc.request': 'Requesting Location...',
    'nearby.loc.denied': 'Location access denied. Please enable location to use this feature.',
    'nearby.live_osm_badge': 'Live OSM Radar',
    'nearby.radius_label': 'Search Radius',
    'nearby.filter_all': 'All Types',
    'nearby.filter_hospitals': 'Hospitals',
    'nearby.filter_pharmacies': 'Pharmacies',
    'nearby.filter_clinics': 'Clinics',
    'nearby.walking_eta': 'Walk',
    'nearby.driving_eta': 'Drive',
    'nearby.recenter': 'Recenter',
    'nearby.route_to': 'Navigation route active',
    'nearby.clear_route': 'Clear Route',
    'nearby.view_on_map': 'View on Map',
    'nearby.filter_emergency': '24/7 ICU & Emergency',
    'nearby.filter_ambulance': 'Ambulance',
    'nearby.map_style': 'Map Style',
    'nearby.map_streets': 'Streets',
    'nearby.map_satellite': 'Satellite',
    'nearby.map_dark': 'Night Mode',
    'nearby.road_route': 'Road Route Navigation',
    'nearby.calculating_route': 'Calculating road route...',
    'nearby.sos_share': 'Share Location (WhatsApp)',
    'nearby.sos_copied': 'Location & destination copied to clipboard!',
    'nearby.offline_notice': 'Offline Cache Active',
    'nearby.tile_cache_active': 'Offline Map Cache Active',
    'nearby.tiles_cached': 'Tiles Cached in IndexedDB',
    'nearby.clear_tile_cache': 'Clear Cached Tiles',
    'nearby.cache_cleared': 'Tile cache cleared',

    // First Aid Guide
    'nav.first_aid': 'FIRST AID',
    'firstaid.title': 'First Aid Guide',
    'firstaid.desc': 'Step-by-step instructions for common emergencies. Note: This is not a substitute for professional medical advice.',
    'firstaid.warning': 'Disclaimer: This guide is for educational purposes only. Always seek professional medical help in an emergency.',
    
    'firstaid.cat.cpr': 'CPR',
    'firstaid.cat.burns': 'Burns',
    'firstaid.cat.cuts': 'Cuts & Bleeding',
    'firstaid.cat.choking': 'Choking',

    'cpr.s1.t': 'Check for Response',
    'cpr.s1.d': 'Shake gently and shout. If no response, call for help immediately.',
    'cpr.s2.t': 'Call Emergency',
    'cpr.s2.d': 'Call 999 or ask a specific person to do it.',
    'cpr.s3.t': 'Chest Compressions',
    'cpr.s3.d': 'Push hard and fast in the center of the chest (100-120 beats per minute).',
    'cpr.s4.t': 'Rescue Breaths',
    'cpr.s4.d': 'Give 2 rescue breaths after every 30 compressions if trained.',

    'burns.s1.t': 'Cool the Burn',
    'burns.s1.d': 'Hold the burned area under cool running water for at least 10 minutes.',
    'burns.s2.t': 'Remove Restrictive Items',
    'burns.s2.d': 'Remove rings or tight items from the burned area before it swells.',
    'burns.s3.t': 'Cover the Burn',
    'burns.s3.d': 'Apply a sterile gauze bandage loosely. Do not pop blisters.',
    'burns.s4.t': 'Seek Medical Help',
    'burns.s4.d': 'If it is a major burn, call emergency services immediately.',

    'cuts.s1.t': 'Stop the Bleeding',
    'cuts.s1.d': 'Apply firm pressure to the wound with a clean cloth or sterile bandage.',
    'cuts.s2.t': 'Clean the Wound',
    'cuts.s2.d': 'Once bleeding stops, rinse the wound with clear water. Clean the area around it with soap.',
    'cuts.s3.t': 'Apply an Antibiotic',
    'cuts.s3.d': 'Apply a thin layer of antibiotic ointment to keep the surface moist.',
    'cuts.s4.t': 'Cover the Wound',
    'cuts.s4.d': 'Apply a bandage, rolled gauze, or dressing to protect it from infection.',

    'choking.s1.t': 'Encourage Coughing',
    'choking.s1.d': 'If the person can cough forcefully, encourage them to keep coughing.',
    'choking.s2.t': 'Give 5 Back Blows',
    'choking.s2.d': 'Stand behind them. Give 5 sharp blows between their shoulder blades with the heel of your hand.',
    'choking.s3.t': 'Give 5 Abdominal Thrusts',
    'choking.s3.d': 'Perform the Heimlich maneuver: 5 upward thrusts just above the navel.',
    'choking.s4.t': 'Call for Help',
    'choking.s4.d': 'If the blockage does not clear, call emergency services.',

    // Dropdowns
    'div.dhaka': 'Dhaka',
    'div.chattogram': 'Chattogram',
    'div.sylhet': 'Sylhet',
    'div.rajshahi': 'Rajshahi',
    'div.khulna': 'Khulna',
    'div.barishal': 'Barishal',
    'div.rangpur': 'Rangpur',
    'div.mymensingh': 'Mymensingh',
    'type.hospital': 'Hospital',
    'type.medical_college': 'Medical College Hospital',
    'type.private': 'Private Hospital / Clinic',
    'type.clinic': 'Clinic',
    'type.diagnostic': 'Diagnostic Center',
    'type.pharmacy': 'Pharmacy',
  },
  bn: {
    // AppHeader
    'nav.home': 'হোম',
    'nav.emergency': 'জরুরি',
    'nav.healthcare': 'স্বাস্থ্যসেবা',
    'nav.ambulance': 'অ্যাম্বুলেন্স',
    'nav.contacts': 'যোগাযোগ',
    'nav.need_blood': 'রক্ত প্রয়োজন ↗',
    'nav.nearby': 'আশেপাশে',
    'nav.developer': 'ডেভেলপার',

    // HomePage
    'home.badge': 'জরুরি ও স্বাস্থ্যসেবা সহায়তা',
    'home.title1': 'বাংলাদেশের জন্য',
    'home.title2': 'জরুরি ও স্বাস্থ্যসেবা সহায়তা',
    'home.subtitle': 'জরুরি মুহূর্তে, সঠিক সহায়তা',
    'home.desc': 'দ্রুত হাসপাতাল, অ্যাম্বুলেন্স পরিষেবা এবং গুরুত্বপূর্ণ জরুরি সম্পদ খুঁজুন।',
    'home.btn.healthcare': 'স্বাস্থ্যসেবা খুঁজুন',
    'home.btn.emergency': 'জরুরি সহায়তা নিন',
    'home.quick_access': 'দ্রুত অ্যাক্সেস',
    'home.card.hospital.title': 'হাসপাতাল খুঁজুন',
    'home.card.hospital.desc': 'যাচাইকৃত স্বাস্থ্যসেবা কেন্দ্র এবং ক্লিনিক খুঁজুন।',
    'home.card.ambulance.title': 'অ্যাম্বুলেন্স খুঁজুন',
    'home.card.ambulance.desc': 'আপনার এলাকায় যাচাইকৃত অ্যাম্বুলেন্স পরিষেবা খুঁজুন।',
    'home.card.contacts.title': 'জরুরি যোগাযোগ',
    'home.card.contacts.desc': 'গুরুত্বপূর্ণ জাতীয় এবং স্থানীয় জরুরি নম্বরগুলি অ্যাক্সেস করুন।',
    'home.card.nearby.title': 'আশেপাশের সহায়তা',
    'home.card.nearby.desc': 'আশেপাশের সহায়তা পেতে আপনার অবস্থান ব্যবহার করুন।',

    // Emergency Hub
    'emergency.call_999': '৯৯৯ এ কল করুন',
    'emergency.hub': 'ইমার্জেন্সি হাব',
    'emergency.title': 'জরুরি সহায়তা',
    'emergency.subtitle': 'জরুরি মুহূর্তে সহায়তা',
    'emergency.desc': 'অবিলম্বে সহায়তা পেতে নীচের একটি বিকল্প নির্বাচন করুন। জীবন বিপন্ন হলে জাতীয় জরুরি পরিষেবাগুলিতে কল করতে দ্বিধা করবেন না।',
    'emergency.btn.hospital': 'হাসপাতাল খুঁজুন',
    'emergency.btn.ambulance': 'অ্যাম্বুলেন্স খুঁজুন',
    'emergency.quick_access': 'দ্রুত জরুরি অ্যাক্সেস',
    'emergency.card.hospital.desc': 'দ্রুত স্বাস্থ্যসেবা কেন্দ্র খুঁজুন। জরুরি যোগাযোগ নম্বর এবং দিকনির্দেশনা দেখুন।',
    'emergency.card.ambulance.desc': 'আপনার জেলা বা এলাকায় যাচাইকৃত অ্যাম্বুলেন্স পরিষেবার তথ্য খুঁজুন।',
    'emergency.card.contacts.desc': 'গুরুত্বপূর্ণ জাতীয় জরুরি যোগাযোগের তথ্য অ্যাক্সেস করুন (৯৯৯, ফায়ার, মেডিকেল)।',
    'emergency.card.nearby.desc': 'আশেপাশের সহায়তা এবং স্বাস্থ্যসেবা সুবিধাগুলি আবিষ্কার করতে আপনার অবস্থান ব্যবহার করুন।',

    // Common
    'common.verified': 'যাচাইকৃত',
    'common.needs_verification': 'যাচাইকরণ প্রয়োজন',
    'common.call': 'কল করুন',
    'common.call_now': 'এখনি কল করুন',
    'common.directions': 'দিকনির্দেশনা',
    'common.km_away': 'কিমি দূরে',
    'common.source': 'সূত্র:',

    // Healthcare Directory
    'healthcare.title': 'স্বাস্থ্যসেবা ডিরেক্টরি',
    'healthcare.desc': 'সারা বাংলাদেশে স্বাস্থ্যসেবা কেন্দ্র খুঁজুন।',
    'healthcare.btn.location': 'আমার অবস্থান ব্যবহার করুন',
    'healthcare.loc.detecting': 'অবস্থান শনাক্ত করা হচ্ছে...',
    'healthcare.loc.enabled': 'অবস্থান সক্রিয়',
    'healthcare.loc.unavailable': 'অবস্থান অ্যাক্সেস অনুপলব্ধ। ম্যানুয়ালি নির্বাচন করুন।',
    'healthcare.filters.title': 'স্মার্ট ফিল্টার',
    'healthcare.filters.search': 'নাম বা এলাকা খুঁজুন',
    'healthcare.filters.search_placeholder': 'যেমন ঢাকা মেডিকেল',
    'healthcare.filters.division': 'বিভাগ',
    'healthcare.filters.all_divisions': 'সকল বিভাগ',
    'healthcare.filters.district': 'জেলা',
    'healthcare.filters.all_districts': 'সকল জেলা',
    'healthcare.filters.type': 'কেন্দ্রের ধরন',
    'healthcare.filters.all_types': 'সকল ধরন',
    'healthcare.filters.status': 'যাচাইকরণ স্থিতি',
    'healthcare.filters.all_status': 'সকল স্থিতি',
    'healthcare.filters.verified_only': 'শুধুমাত্র যাচাইকৃত',
    'healthcare.filters.needs_verification': 'যাচাইকরণ প্রয়োজন',
    'healthcare.filters.clear': 'ফিল্টার মুছুন',
    'healthcare.empty.title': 'কোন স্বাস্থ্যসেবা কেন্দ্র পাওয়া যায়নি।',
    'healthcare.empty.desc': 'আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করার চেষ্টা করুন।',
    'healthcare.error.title': 'ডিরেক্টরি লোড করতে অক্ষম',

    // Ambulance Directory
    'ambulance.title': 'অ্যাম্বুলেন্স ডিরেক্টরি',
    'ambulance.desc': 'যাচাইকৃত অ্যাম্বুলেন্স পরিষেবার তথ্য খুঁজুন। উপলব্ধতা নিশ্চিত করতে প্রদানকারীর সাথে যোগাযোগ করুন।',
    'ambulance.search_placeholder': 'প্রদানকারীর নাম বা এলাকা দ্বারা অনুসন্ধান করুন...',
    'ambulance.empty.title': 'কোন অ্যাম্বুলেন্স পরিষেবা পাওয়া যায়নি।',
    'ambulance.empty.desc': 'আপনার অনুসন্ধানের শর্তাবলী পরিবর্তন করার চেষ্টা করুন।',
    'ambulance.error.title': 'অ্যাম্বুলেন্স লোড করতে অক্ষম',
    'ambulance.btn.contact': 'পরিষেবা যোগাযোগ',
    'ambulance.type.ambulance': 'অ্যাম্বুলেন্স',

    // Emergency Contacts
    'contacts.title': 'জরুরি যোগাযোগ',
    'contacts.desc': 'জাতীয় এবং স্থানীয় পরিষেবাগুলির জন্য গুরুত্বপূর্ণ যাচাইকৃত জরুরি যোগাযোগের তথ্য।',
    'contacts.error.title': 'পরিচিতি লোড করতে অক্ষম',

    // Nearby Facilities
    'nearby.title': 'নিকটবর্তী সেবাসমূহ',
    'nearby.desc': 'ওপেনস্ট্রিটম্যাপ লাইভ রেডার ও ভেরিফায়েড ডেটাবেস থেকে আপনার অবস্থানের নিকটবর্তী সকল হাসপাতাল, ক্লিনিক এবং ফার্মেসি।',
    'nearby.loc.request': 'অবস্থান অনুরোধ করা হচ্ছে...',
    'nearby.loc.denied': 'অবস্থান অ্যাক্সেস অস্বীকার করা হয়েছে। এই বৈশিষ্ট্যটি ব্যবহার করতে অনুগ্রহ করে অবস্থান সক্ষম করুন৷',
    'nearby.live_osm_badge': 'লাইভ ওপেনস্ট্রিটম্যাপ রাডার',
    'nearby.radius_label': 'সন্ধানের পরিধি',
    'nearby.filter_all': 'সকল ধরন',
    'nearby.filter_hospitals': 'হাসপাতাল',
    'nearby.filter_pharmacies': 'ফার্মেসি',
    'nearby.filter_clinics': 'ক্লিনিক',
    'nearby.walking_eta': 'হেঁটে',
    'nearby.driving_eta': 'গাড়িতে',
    'nearby.recenter': 'আমার অবস্থানে যাও',
    'nearby.route_to': 'নেভিগেশন রুট সক্রিয়',
    'nearby.clear_route': 'রুট মুছুন',
    'nearby.view_on_map': 'ম্যাপে দেখুন',
    'nearby.filter_emergency': '২৪/৭ ইমার্জেন্সি ও ICU',
    'nearby.filter_ambulance': 'অ্যাম্বুলেন্স',
    'nearby.map_style': 'ম্যাপ স্টাইল',
    'nearby.map_streets': 'স্ট্রিট ম্যাপ',
    'nearby.map_satellite': 'স্যাটেলাইট ভিউ',
    'nearby.map_dark': 'নাইট মোড',
    'nearby.road_route': 'রাস্তার রুট নেভিগেশন',
    'nearby.calculating_route': 'রাস্তার পথ হিসাব করা হচ্ছে...',
    'nearby.sos_share': 'জরুরি লোকেশন পাঠান (WhatsApp)',
    'nearby.sos_copied': 'লোকেশন ও হাসপাতালের লিঙ্ক কপি করা হয়েছে!',
    'nearby.offline_notice': 'অফলাইন ক্যাশ সংরক্ষিত',
    'nearby.tile_cache_active': 'অফলাইন ম্যাপ ক্যাশ সক্রিয়',
    'nearby.tiles_cached': 'টাইল IndexedDB-তে সংরক্ষিত',
    'nearby.clear_tile_cache': 'ম্যাপ ক্যাশ মুছুন',
    'nearby.cache_cleared': 'ম্যাপ টাইল ক্যাশ খালি করা হয়েছে',

    // First Aid Guide
    'nav.first_aid': 'ফার্স্ট এইড',
    'firstaid.title': 'ফার্স্ট এইড গাইড',
    'firstaid.desc': 'সাধারণ জরুরি অবস্থার জন্য ধাপে ধাপে নির্দেশাবলী। দ্রষ্টব্য: এটি পেশাদার চিকিৎসকের পরামর্শের বিকল্প নয়।',
    'firstaid.warning': 'সতর্কতা: এই নির্দেশিকা শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে। জরুরি অবস্থায় সর্বদা পেশাদার চিকিৎসকের সাহায্য নিন।',
    
    'firstaid.cat.cpr': 'সিপিআর',
    'firstaid.cat.burns': 'পোড়া',
    'firstaid.cat.cuts': 'কাটা ও রক্তপাত',
    'firstaid.cat.choking': 'শ্বাসরোধ',

    'cpr.s1.t': 'প্রতিক্রিয়া পরীক্ষা করুন',
    'cpr.s1.d': 'আলতো করে ঝাঁকান এবং জোরে ডাকুন। কোনো সাড়া না পেলে অবিলম্বে সাহায্য চান।',
    'cpr.s2.t': 'জরুরি নম্বরে কল করুন',
    'cpr.s2.d': '৯৯৯ এ কল করুন অথবা কাউকে কল করতে বলুন।',
    'cpr.s3.t': 'বুকে চাপ দিন',
    'cpr.s3.d': 'বুকের মাঝখানে জোরে এবং দ্রুত চাপ দিন (মিনিটে ১০০-১২০ বার)।',
    'cpr.s4.t': 'কৃত্রিম শ্বাস-প্রশ্বাস',
    'cpr.s4.d': 'প্রশিক্ষণ থাকলে প্রতি ৩০ বার বুকে চাপ দেওয়ার পর ২ বার মুখে মুখ রেখে শ্বাস দিন।',

    'burns.s1.t': 'পোড়া জায়গা ঠান্ডা করুন',
    'burns.s1.d': 'পোড়া জায়গাটি অন্তত ১০ মিনিট ঠান্ডা চলমান জলের নিচে রাখুন।',
    'burns.s2.t': 'আঁটসাঁট জিনিস সরিয়ে ফেলুন',
    'burns.s2.d': 'ফুলে যাওয়ার আগেই পোড়া জায়গা থেকে আংটি বা আঁটসাঁট জিনিস সরিয়ে ফেলুন।',
    'burns.s3.t': 'পোড়া স্থানটি ঢেকে দিন',
    'burns.s3.d': 'আলগাভাবে জীবাণুমুক্ত গজ ব্যান্ডেজ লাগান। ফোস্কা গলাবেন না।',
    'burns.s4.t': 'চিকিৎসকের সাহায্য নিন',
    'burns.s4.d': 'মারাত্মকভাবে পুড়ে গেলে অবিলম্বে জরুরি নম্বরে কল করুন।',

    'cuts.s1.t': 'রক্তপাত বন্ধ করুন',
    'cuts.s1.d': 'পরিষ্কার কাপড় বা জীবাণুমুক্ত ব্যান্ডেজ দিয়ে ক্ষতের ওপর শক্তভাবে চাপ দিন।',
    'cuts.s2.t': 'ক্ষত পরিষ্কার করুন',
    'cuts.s2.d': 'রক্ত পড়া বন্ধ হলে পরিষ্কার পানি দিয়ে ক্ষতস্থান ধুয়ে ফেলুন। চারপাশে সাবান দিয়ে পরিষ্কার করুন।',
    'cuts.s3.t': 'অ্যান্টিবায়োটিক লাগান',
    'cuts.s3.d': 'ক্ষতস্থান আর্দ্র রাখতে অ্যান্টিবায়োটিক মলমের একটি পাতলা প্রলেপ দিন।',
    'cuts.s4.t': 'ক্ষতস্থান ঢেকে দিন',
    'cuts.s4.d': 'সংক্রমণ থেকে রক্ষা করতে ব্যান্ডেজ বা গজ দিয়ে ঢেকে দিন।',

    'choking.s1.t': 'কাশতে উৎসাহিত করুন',
    'choking.s1.d': 'ব্যক্তি যদি জোরে কাশতে পারে, তবে তাকে কাশতে বলুন।',
    'choking.s2.t': 'পিঠে ৫ বার আঘাত করুন',
    'choking.s2.d': 'তার পিছনে দাঁড়ান। হাতের তালুর নিচের অংশ দিয়ে কাঁধের ব্লেডের মাঝখানে ৫ বার জোরালো আঘাত করুন।',
    'choking.s3.t': 'পেটে ৫ বার চাপ দিন',
    'choking.s3.d': 'হেইমলিচ ম্যানুভার প্রয়োগ করুন: নাভির ঠিক উপরে ৫ বার ওপরের দিকে চাপ দিন।',
    'choking.s4.t': 'সাহায্যের জন্য কল করুন',
    'choking.s4.d': 'শ্বাসরোধী বস্তু বের না হলে জরুরি নম্বরে কল করুন।',

    // Dropdowns
    'div.dhaka': 'ঢাকা',
    'div.chattogram': 'চট্টগ্রাম',
    'div.sylhet': 'সিলেট',
    'div.rajshahi': 'রাজশাহী',
    'div.khulna': 'খুলনা',
    'div.barishal': 'বরিশাল',
    'div.rangpur': 'রংপুর',
    'div.mymensingh': 'ময়মনসিংহ',
    'type.hospital': 'হাসপাতাল',
    'type.medical_college': 'মেডিকেল কলেজ হাসপাতাল',
    'type.private': 'বেসরকারি হাসপাতাল / ক্লিনিক',
    'type.clinic': 'ক্লিনিক',
    'type.diagnostic': 'ডায়াগনস্টিক সেন্টার',
    'type.pharmacy': 'ফার্মেসি',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Sync with localStorage and document element
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
