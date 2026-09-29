import { VolunteerSquad, VolunteerFilterOptions } from '../types';
import bundledSquads from '../data/volunteers.json';
import { calculateDistanceKm } from '../utils/haversine';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const VOLUNTEER_STORAGE_KEY = 'surokkha_custom_volunteers_v1';
const VOLUNTEER_CACHE_KEY = 'surokkha_volunteers_cache_v1';

/**
 * Fetch all volunteer squads from bundled data, localStorage community submissions,
 * and Firestore (if online). Automatically calculates distance from user's coordinates.
 */
export async function getVolunteerSquads(userLat?: number, userLng?: number): Promise<VolunteerSquad[]> {
  let combined: VolunteerSquad[] = [...(bundledSquads as VolunteerSquad[])];

  // Load locally registered squads
  try {
    const localSaved = localStorage.getItem(VOLUNTEER_STORAGE_KEY);
    if (localSaved) {
      const parsedLocal = JSON.parse(localSaved);
      if (Array.isArray(parsedLocal)) {
        parsedLocal.forEach((squad: VolunteerSquad) => {
          if (!combined.some(item => item.id === squad.id)) {
            combined.unshift(squad);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error reading local volunteers:', err);
  }

  // Attempt to fetch fresh community squads from Firestore
  try {
    if (navigator.onLine && db) {
      const volunteersRef = collection(db, 'volunteers');
      const snapshot = await getDocs(volunteersRef);
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const remoteData = { id: docSnap.id, ...docSnap.data() } as VolunteerSquad;
          const existingIdx = combined.findIndex(item => item.id === remoteData.id);
          if (existingIdx >= 0) {
            combined[existingIdx] = remoteData;
          } else {
            combined.unshift(remoteData);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Firestore volunteers fetch skipped (using cached/bundled):', err);
  }

  // Calculate distance if GPS location is provided
  if (userLat !== undefined && userLng !== undefined) {
    combined = combined.map(squad => {
      const distance = calculateDistanceKm(userLat, userLng, squad.latitude, squad.longitude);
      return {
        ...squad,
        distanceKm: distance
      };
    });

    // Sort by distance (nearest first)
    combined.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }

  return combined;
}

/**
 * Register a new Volunteer Squad into local storage and sync to Firestore
 */
export async function registerVolunteerSquad(squadData: Omit<VolunteerSquad, 'id' | 'lastVerifiedAt'>): Promise<VolunteerSquad> {
  const newId = 'community-squad-' + Date.now();
  const newSquad: VolunteerSquad = {
    ...squadData,
    id: newId,
    verified: true,
    source: 'কমিউনিটি স্বেচ্ছাসেবক নিবন্ধন (Community Submission)',
    lastVerifiedAt: new Date().toISOString()
  };

  // 1. Save to LocalStorage immediately so user always sees their submitted squad offline
  try {
    const existingStr = localStorage.getItem(VOLUNTEER_STORAGE_KEY);
    const existingArr: VolunteerSquad[] = existingStr ? JSON.parse(existingStr) : [];
    existingArr.unshift(newSquad);
    localStorage.setItem(VOLUNTEER_STORAGE_KEY, JSON.stringify(existingArr));
  } catch (err) {
    console.warn('Failed to save squad locally:', err);
  }

  // 2. Sync to Firestore if online
  try {
    if (navigator.onLine && db) {
      const docRef = doc(db, 'volunteers', newId);
      await setDoc(docRef, newSquad);
    }
  } catch (err) {
    console.warn('Failed to push squad to Firestore:', err);
  }

  return newSquad;
}

/**
 * Filter squads based on user search and filters
 */
export function filterVolunteerSquads(squads: VolunteerSquad[], filters: VolunteerFilterOptions): VolunteerSquad[] {
  return squads.filter(squad => {
    // 1. Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = squad.teamName.toLowerCase().includes(q) || squad.teamNameBn.toLowerCase().includes(q);
      const matchOrg = squad.organization.toLowerCase().includes(q) || squad.orgNameBn.toLowerCase().includes(q);
      const matchArea = squad.coverageArea.toLowerCase().includes(q) || squad.coverageAreaBn.toLowerCase().includes(q);
      const matchDistrict = squad.district.toLowerCase().includes(q) || squad.upazila.toLowerCase().includes(q);
      const matchLeader = squad.leaderOrCoordinator.toLowerCase().includes(q);
      const matchPhone = squad.primaryPhone.includes(q) || (squad.whatsappNumber && squad.whatsappNumber.includes(q));

      if (!matchName && !matchOrg && !matchArea && !matchDistrict && !matchLeader && !matchPhone) {
        return false;
      }
    }

    // 2. Division filter
    if (filters.division && squad.division.toLowerCase() !== filters.division.toLowerCase()) {
      return false;
    }

    // 3. District filter
    if (filters.district && squad.district.toLowerCase() !== filters.district.toLowerCase()) {
      return false;
    }

    // 4. Organization filter
    if (filters.organization && filters.organization !== 'all') {
      if (squad.organization !== filters.organization) {
        return false;
      }
    }

    // 5. Capability filters
    if (filters.hasSpeedboat && !squad.capabilities.includes('speedboat')) {
      return false;
    }
    if (filters.hasDivers && !squad.capabilities.includes('divers')) {
      return false;
    }
    if (filters.hasMedical && !squad.capabilities.includes('firstaid') && !squad.capabilities.includes('ambulance')) {
      return false;
    }
    if (filters.hasRelief && !squad.capabilities.includes('food_relief')) {
      return false;
    }
    if (filters.hasDrone && !squad.capabilities.includes('drone')) {
      return false;
    }

    // 6. Status filter
    if (filters.status && filters.status !== 'all') {
      if (squad.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}
