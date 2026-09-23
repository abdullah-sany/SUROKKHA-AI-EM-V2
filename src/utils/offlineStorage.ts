import { EmergencyContact } from '../types';

export const FALLBACK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'National Emergency Service (জাতীয় জরুরি সেবা)',
    category: 'National Emergency',
    phone: '999',
    verified: true,
    source: 'Government of Bangladesh',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ec-2',
    name: 'Health Call Center / Shastho Batayon (স্বাস্থ্য বাতায়ন)',
    category: 'Medical Emergency',
    phone: '16263',
    verified: true,
    source: 'MOHFW Bangladesh',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ec-3',
    name: 'Fire Service & Civil Defense (ফায়ার সার্ভিস)',
    category: 'Fire Service',
    phone: '16163',
    verified: true,
    source: 'FSCD',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ec-4',
    name: 'National Help Desk (সরকারি তথ্য ও সেবা)',
    category: 'National Emergency',
    phone: '333',
    verified: true,
    source: 'Government of Bangladesh',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ec-5',
    name: 'Child Helpline (শিশু হেল্পলাইন)',
    category: 'National Emergency',
    phone: '1098',
    verified: true,
    source: 'Ministry of Women and Children Affairs',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ec-6',
    name: 'Women & Child Abuse Helpline (নারী ও শিশু নির্যাতন প্রতিরোধ)',
    category: 'National Emergency',
    phone: '109',
    verified: true,
    source: 'Government of Bangladesh',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ec-7',
    name: 'Bangladesh Red Crescent Blood & Ambulance (রেড ক্রিসেন্ট)',
    category: 'Medical Emergency',
    phone: '02-48310188',
    verified: true,
    source: 'BDRCS',
    lastVerifiedAt: '2025-01-01T00:00:00Z',
  }
];

const STORAGE_KEYS = {
  EMERGENCY_CONTACTS: 'surokkha_offline_contacts_v1',
  CONTACTS_TIMESTAMP: 'surokkha_contacts_cached_at',
  FIRST_AID_FAVORITES: 'surokkha_first_aid_favorites_v1',
  FIRST_AID_LAST_READ: 'surokkha_first_aid_last_read_v1',
  FIRST_AID_CUSTOM_NOTES: 'surokkha_first_aid_notes_v1'
};

/**
 * Retrieve cached emergency contacts from localStorage, or return bundled offline fallback
 */
export function getCachedEmergencyContacts(): { contacts: EmergencyContact[]; isFromCache: boolean; cachedAt: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    const cachedAt = localStorage.getItem(STORAGE_KEYS.CONTACTS_TIMESTAMP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { contacts: parsed, isFromCache: true, cachedAt };
      }
    }
  } catch (err) {
    console.warn('Failed to read emergency contacts from localStorage:', err);
  }

  // Pre-bundled static fallback (guaranteed offline access even on first launch)
  return { contacts: FALLBACK_EMERGENCY_CONTACTS, isFromCache: false, cachedAt: null };
}

/**
 * Persist emergency contacts to localStorage for offline access
 */
export function cacheEmergencyContacts(contacts: EmergencyContact[]): void {
  try {
    if (Array.isArray(contacts) && contacts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
      localStorage.setItem(STORAGE_KEYS.CONTACTS_TIMESTAMP, new Date().toISOString());
    }
  } catch (err) {
    console.warn('Failed to cache emergency contacts:', err);
  }
}

/**
 * Cache first-aid progress, last-viewed category, and offline emergency notes
 */
export function getFirstAidOfflineData(): {
  lastCategory: string | null;
  bookmarkedSteps: string[];
  notes: Record<string, string>;
} {
  try {
    const lastCategory = localStorage.getItem(STORAGE_KEYS.FIRST_AID_LAST_READ);
    const rawFavs = localStorage.getItem(STORAGE_KEYS.FIRST_AID_FAVORITES);
    const rawNotes = localStorage.getItem(STORAGE_KEYS.FIRST_AID_CUSTOM_NOTES);

    return {
      lastCategory,
      bookmarkedSteps: rawFavs ? JSON.parse(rawFavs) : [],
      notes: rawNotes ? JSON.parse(rawNotes) : {}
    };
  } catch (err) {
    return { lastCategory: null, bookmarkedSteps: [], notes: {} };
  }
}

export function saveLastFirstAidCategory(catId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FIRST_AID_LAST_READ, catId);
  } catch (err) {
    // Ignore storage quota or disabled localStorage
  }
}

export function toggleFirstAidBookmark(stepKey: string): string[] {
  try {
    const rawFavs = localStorage.getItem(STORAGE_KEYS.FIRST_AID_FAVORITES);
    const current: string[] = rawFavs ? JSON.parse(rawFavs) : [];
    const index = current.indexOf(stepKey);
    let updated: string[];
    if (index > -1) {
      updated = current.filter(k => k !== stepKey);
    } else {
      updated = [...current, stepKey];
    }
    localStorage.setItem(STORAGE_KEYS.FIRST_AID_FAVORITES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}

export function saveFirstAidNote(catId: string, note: string): void {
  try {
    const rawNotes = localStorage.getItem(STORAGE_KEYS.FIRST_AID_CUSTOM_NOTES);
    const current: Record<string, string> = rawNotes ? JSON.parse(rawNotes) : {};
    current[catId] = note;
    localStorage.setItem(STORAGE_KEYS.FIRST_AID_CUSTOM_NOTES, JSON.stringify(current));
  } catch (err) {
    // Ignore
  }
}
