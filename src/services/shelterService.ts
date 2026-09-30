import { Shelter, ShelterFilterOptions } from '../types';
import bundledShelters from '../data/shelters.json';
import { calculateDistanceKm } from '../utils/haversine';

const SHELTER_CACHE_KEY = 'surokkha_shelters_cache_v2';
const SHELTER_CACHE_TIMESTAMP_KEY = 'surokkha_shelters_timestamp_v2';

export interface CycloneSignalInfo {
  signal: number;
  level: 'warning' | 'danger' | 'great_danger';
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  actionEn: string;
  actionBn: string;
}

export interface DisasterHotline {
  number: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  available: string;
  tollFree: boolean;
}

export const DISASTER_HOTLINES: DisasterHotline[] = [
  {
    number: '1090',
    titleEn: 'Disaster Warning & Weather IVR',
    titleBn: 'দুর্যোগ বার্তা ও সতর্কবার্তা (IVR)',
    subtitleEn: 'Govt. Toll-Free Disaster Early Warning',
    subtitleBn: 'টোল-ফ্রি ২৪/৭ সরকারি পূর্বাভাস ও সতর্কবার্তা',
    available: '24/7 Toll Free',
    tollFree: true
  },
  {
    number: '999',
    titleEn: 'National Emergency Service',
    titleBn: 'জাতীয় জরুরি সেবা',
    subtitleEn: 'Police, Fire Service, Ambulance & Rescue',
    subtitleBn: 'পুলিশ, ফায়ার সার্ভিস ও রেসকিউ টিম',
    available: '24/7 Toll Free',
    tollFree: true
  },
  {
    number: '109',
    titleEn: 'Women & Child Emergency Help',
    titleBn: 'নারী ও শিশু জরুরি সহায়তা সেল',
    subtitleEn: 'Special rescue assistance for mothers & children',
    subtitleBn: 'দুর্যোগে মা ও শিশুদের জরুরি সুরক্ষা সহায়তা',
    available: '24/7 Toll Free',
    tollFree: true
  },
  {
    number: '16263',
    titleEn: 'Shastho Batayan',
    titleBn: 'স্বাস্থ্য বাতায়ন',
    subtitleEn: 'Emergency medical consultation during disaster',
    subtitleBn: 'জরুরি স্বাস্থ্য ও প্রাথমিক চিকিৎসা পরামর্শ',
    available: '24/7 Support',
    tollFree: false
  },
  {
    number: '02223386611',
    titleEn: 'Cyclone Preparedness Programme (CPP)',
    titleBn: 'ঘূর্ণিঝড় প্রস্তুতি কর্মসূচি (CPP) কন্ট্রোল রুম',
    subtitleEn: 'Disaster Coastal Evacuation & Rescue HQ',
    subtitleBn: 'উপকূলীয় জরুরি উদ্ধার ও আশ্রয়কেন্দ্র সমন্বয়',
    available: 'Emergency Duty',
    tollFree: false
  }
];

export const CYCLONE_SIGNALS: CycloneSignalInfo[] = [
  {
    signal: 1,
    level: 'warning',
    titleEn: 'Distant Cautionary Signal No. 1',
    titleBn: 'দূরবর্তী সতর্ক সংকেত ১',
    descEn: 'A depression has formed in distant deep sea.',
    descBn: 'দূরবর্তী গভীর সাগরে একটি নিম্নচাপ সৃষ্টি হয়েছে।',
    actionEn: 'Stay alert and monitor radio/TV bulletins.',
    actionBn: 'নিয়মিত রেডিও ও সংবাদের সতর্কবার্তা শুনুন।'
  },
  {
    signal: 2,
    level: 'warning',
    titleEn: 'Distant Warning Signal No. 2',
    titleBn: 'দূরবর্তী হুঁশিয়ারি সংকেত ২',
    descEn: 'A cyclonic storm has formed in distant deep sea.',
    descBn: 'সাগরে ঘূর্ণিবায়ু সহ একটি ঝড় সৃষ্টি হয়েছে।',
    actionEn: 'Vessels in sea should stay close to shore.',
    actionBn: 'সাগরে থাকা সব নৌযানকে উপকূলের কাছাকাছি থাকতে হবে।'
  },
  {
    signal: 3,
    level: 'warning',
    titleEn: 'Local Cautionary Signal No. 3',
    titleBn: 'স্থানীয় সতর্ক সংকেত ৩',
    descEn: 'Port is threatened by squally weather.',
    descBn: 'বন্দর দমকা হাওয়ার সম্মুখীন হতে পারে।',
    actionEn: 'Small crafts should take sheltered waters.',
    actionBn: 'ছোট নৌযান নিরাপদ আশ্রয়ে রাখুন।'
  },
  {
    signal: 4,
    level: 'warning',
    titleEn: 'Local Warning Signal No. 4',
    titleBn: 'স্থানীয় হুঁশিয়ারি সংকেত ৪',
    descEn: 'Port threatened by storm. Cyclone might cross near.',
    descBn: 'ঘূর্ণিঝড়ের সৃষ্টি হয়েছে, বন্দর এলাকা সরাসরি প্রভাবিত হতে পারে।',
    actionEn: 'Prepare disaster emergency kits, medicine, food.',
    actionBn: 'শুকনা খাবার, সুপেয় পানি, ওষুধ ও জরুরি কিট প্রস্তুত রাখুন।'
  },
  {
    signal: 5,
    level: 'danger',
    titleEn: 'Danger Signal No. 5',
    titleBn: 'বিপদ সংকেত ৫',
    descEn: 'Severe cyclone will cross port keeping it to south.',
    descBn: 'ঝড়টি উপকূল অতিক্রমের সময় তীব্র আঘাত হানতে পারে।',
    actionEn: 'Move children, elderly, and vulnerable to nearest shelter.',
    actionBn: 'শিশু, বৃদ্ধ ও গর্ভবতীদের আশ্রয়কেন্দ্রে সরিয়ে নেওয়ার প্রস্তুতি নিন।'
  },
  {
    signal: 6,
    level: 'danger',
    titleEn: 'Danger Signal No. 6',
    titleBn: 'বিপদ সংকেত ৬',
    descEn: 'Severe cyclone will cross keeping port to north.',
    descBn: 'বন্দর তীব্র ঝড়ের কবলে পড়ার সুনিশ্চিত আশঙ্কা।',
    actionEn: 'Evacuate immediately to cyclone shelter.',
    actionBn: 'অবিলম্বে নিকটস্থ সাইক্লোন শেল্টারে আশ্রয় গ্রহণ করুন।'
  },
  {
    signal: 7,
    level: 'danger',
    titleEn: 'Danger Signal No. 7',
    titleBn: 'বিপদ সংকেত ৭',
    descEn: 'Severe cyclone will cross over or very near the port.',
    descBn: 'ঘূর্ণিঝড়টি সরাসরি বন্দর বা উপকূল অতিক্রম করবে।',
    actionEn: 'Everyone must be inside reinforced cyclone shelter.',
    actionBn: 'সকলকে দ্রুততম সময়ে আশ্রয়কেন্দ্রে চলে যেতে হবে।'
  },
  {
    signal: 8,
    level: 'great_danger',
    titleEn: 'Great Danger Signal No. 8',
    titleBn: 'মহাবিপদ সংকেত ৮',
    descEn: 'Very severe cyclone with devastating winds and storm surge.',
    descBn: 'অতি তীব্র ভয়াবহ ঘূর্ণিঝড় প্রচণ্ড জলোচ্ছ্বাস সহ আঘাত হানবে।',
    actionEn: 'Stay strictly inside shelter. Keep livestock in Killa.',
    actionBn: 'শেল্টারের ভেতরে অবস্থান করুন। গবাদিপশু উঁচু কিল্লায় রাখুন।'
  },
  {
    signal: 9,
    level: 'great_danger',
    titleEn: 'Great Danger Signal No. 9',
    titleBn: 'মহাবিপদ সংকেত ৯',
    descEn: 'Super cyclone approaching with massive storm surge.',
    descBn: 'মহাপ্রলয়ংকারী ঘূর্ণিঝড় অত্যন্ত ধ্বংসাত্মক শক্তি নিয়ে আসছে।',
    actionEn: 'Do not go outside under any circumstances.',
    actionBn: 'কোনো অবস্থাতেই আশ্রয়কেন্দ্রের বাইরে বের হবেন না।'
  },
  {
    signal: 10,
    level: 'great_danger',
    titleEn: 'Great Danger Signal No. 10',
    titleBn: 'মহাবিপদ সংকেত ১০',
    descEn: 'Extreme devastating calamity. Maximum port destruction threat.',
    descBn: 'সর্বোচ্চ মাত্রার মহাবিপদ ও উপকূল বিধ্বংসী সংকট।',
    actionEn: 'Shelter security lock, wait for all-clear broadcast.',
    actionBn: 'শেল্টারের দরোজা বন্ধ রাখুন, সিপিপি সংকেত না দেওয়া পর্যন্ত অবস্থান করুন।'
  }
];

export async function getAllShelters(): Promise<Shelter[]> {
  const shelterMap = new Map<string, Shelter>();
  
  // 1. Bundled dataset
  if (bundledShelters && Array.isArray(bundledShelters)) {
    (bundledShelters as Shelter[]).forEach((s) => {
      shelterMap.set(s.id, s);
    });
  }

  // 2. Local cache
  try {
    const cachedData = localStorage.getItem(SHELTER_CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed)) {
        parsed.forEach((s: Shelter) => {
          shelterMap.set(s.id, { ...(shelterMap.get(s.id) || {}), ...s } as Shelter);
        });
      }
    }
  } catch (e) {
    console.warn('Could not read cached shelters from localStorage:', e);
  }

  // 3. Firestore live sync (if online)
  try {
    if (navigator.onLine) {
      const { getSheltersFromFirestore } = await import('../lib/firebase');
      const remote = await getSheltersFromFirestore();
      if (remote && remote.length > 0) {
        remote.forEach((s) => {
          shelterMap.set(s.id, { ...(shelterMap.get(s.id) || {}), ...s } as Shelter);
        });
      }
    }
  } catch (fErr) {
    console.warn('Firestore shelters fetch skipped:', fErr);
  }

  const result = Array.from(shelterMap.values());
  try {
    localStorage.setItem(SHELTER_CACHE_KEY, JSON.stringify(result));
    localStorage.setItem(SHELTER_CACHE_TIMESTAMP_KEY, new Date().toISOString());
  } catch (e) {
    // quota exceeded fallback
  }

  return result;
}

export function filterShelters(shelters: Shelter[], filters: ShelterFilterOptions): Shelter[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return shelters.filter((shelter) => {
    // Text search (matches English or Bengali name, union, upazila, district)
    if (query) {
      const matchName = shelter.name.toLowerCase().includes(query);
      const matchNameBn = shelter.nameBn.toLowerCase().includes(query);
      const matchDistrict = shelter.district.toLowerCase().includes(query);
      const matchUpazila = shelter.upazila.toLowerCase().includes(query);
      const matchUnion = shelter.unionArea.toLowerCase().includes(query);
      if (!matchName && !matchNameBn && !matchDistrict && !matchUpazila && !matchUnion) {
        return false;
      }
    }

    // Division filter
    if (filters.division && shelter.division.toLowerCase() !== filters.division.toLowerCase()) {
      return false;
    }

    // District filter
    if (filters.district && shelter.district.toLowerCase() !== filters.district.toLowerCase()) {
      return false;
    }

    // Upazila filter
    if (filters.upazila && shelter.upazila.toLowerCase() !== filters.upazila.toLowerCase()) {
      return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      if (shelter.type !== filters.type) {
        return false;
      }
    }

    // Facility filters
    if (filters.hasLivestockSpace && (!shelter.capacityLivestock || shelter.capacityLivestock <= 0)) {
      return false;
    }

    if (filters.hasSolarPower && !shelter.facilities.includes('solar_power')) {
      return false;
    }

    if (filters.hasCleanWater && !shelter.facilities.includes('drinking_water')) {
      return false;
    }

    if (filters.hasRampAccess && !shelter.facilities.includes('ramp_access')) {
      return false;
    }

    if (filters.hasWomenToilet && !shelter.facilities.includes('separate_women_toilet')) {
      return false;
    }

    return true;
  });
}

export function sortSheltersByDistance(shelters: Shelter[], userLat: number, userLon: number): Shelter[] {
  return shelters
    .map((s) => ({
      ...s,
      distanceKm: calculateDistanceKm(userLat, userLon, s.latitude, s.longitude)
    }))
    .sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
}
