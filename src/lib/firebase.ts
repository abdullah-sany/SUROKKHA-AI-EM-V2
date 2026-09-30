import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Ambulance, HealthcareFacility, Shelter, VolunteerSquad } from '../types';

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to the specific database instance
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper auth functions
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
export type { User };

// Firestore collection references
export const ambulancesCollection = collection(db, 'ambulances');
export const facilitiesCollection = collection(db, 'facilities');
export const sheltersCollection = collection(db, 'shelters');
export const volunteersCollection = collection(db, 'volunteers');

/**
 * Fetch all ambulances from Firestore.
 * If Firestore is empty, returns null so the caller can fall back to local/static API.
 */
export async function getAmbulancesFromFirestore(): Promise<Ambulance[] | null> {
  try {
    const q = query(ambulancesCollection);
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: Ambulance[] = [];
    querySnapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Ambulance);
    });
    return list;
  } catch (error) {
    console.warn('Firestore fetch failed, falling back to local API:', error);
    return null;
  }
}

/**
 * Fetch facilities from Firestore.
 * Returns null on empty or error so caller can fall back.
 */
export async function getFacilitiesFromFirestore(): Promise<HealthcareFacility[] | null> {
  try {
    const q = query(facilitiesCollection, limit(200));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: HealthcareFacility[] = [];
    querySnapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as HealthcareFacility);
    });
    return list;
  } catch (error) {
    console.warn('Firestore facilities fetch failed, falling back to local API:', error);
    return null;
  }
}

/**
 * Admin operations: Add or update ambulance
 */
export async function saveAmbulanceToFirestore(ambulance: Partial<Ambulance> & { id?: string }) {
  if (ambulance.id) {
    const docRef = doc(db, 'ambulances', ambulance.id);
    await setDoc(docRef, ambulance, { merge: true });
    return ambulance.id;
  } else {
    const docRef = await addDoc(ambulancesCollection, {
      ...ambulance,
      lastVerifiedAt: new Date().toISOString()
    });
    return docRef.id;
  }
}

/**
 * Admin operations: Delete ambulance
 */
export async function deleteAmbulanceFromFirestore(id: string) {
  const docRef = doc(db, 'ambulances', id);
  await deleteDoc(docRef);
}

/**
 * Admin operations: Add or update facility
 */
export async function saveFacilityToFirestore(facility: Partial<HealthcareFacility> & { id?: string }) {
  if (facility.id) {
    const docRef = doc(db, 'facilities', facility.id);
    await setDoc(docRef, facility, { merge: true });
    return facility.id;
  } else {
    const docRef = await addDoc(facilitiesCollection, {
      ...facility,
      lastVerifiedAt: new Date().toISOString()
    });
    return docRef.id;
  }
}

/**
 * Admin operations: Delete facility
 */
export async function deleteFacilityFromFirestore(id: string) {
  const docRef = doc(db, 'facilities', id);
  await deleteDoc(docRef);
}

/**
 * One-click Batch Seed function for Admin:
 * Copies current local JSON ambulances into Firestore so they can be modified live
 */
export async function seedAmbulancesToFirestore(ambulances: Ambulance[]): Promise<number> {
  let count = 0;
  for (const amb of ambulances) {
    const docRef = doc(db, 'ambulances', amb.id);
    await setDoc(docRef, amb, { merge: true });
    count++;
  }
  return count;
}

/**
 * Batch Seed facilities into Firestore
 */
export async function seedFacilitiesToFirestore(facilities: HealthcareFacility[], onProgress?: (current: number, total: number) => void): Promise<number> {
  let count = 0;
  for (const fac of facilities) {
    const docId = fac.id || `hf-${Date.now()}-${count}`;
    const docRef = doc(db, 'facilities', docId);
    await setDoc(docRef, { ...fac, id: docId }, { merge: true });
    count++;
    if (onProgress && count % 25 === 0) {
      onProgress(count, facilities.length);
    }
  }
  return count;
}

/**
 * Fetch all shelters from Firestore.
 */
export async function getSheltersFromFirestore(): Promise<Shelter[] | null> {
  try {
    const q = query(sheltersCollection);
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: Shelter[] = [];
    querySnapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Shelter);
    });
    return list;
  } catch (error) {
    console.warn('Firestore shelters fetch failed:', error);
    return null;
  }
}

/**
 * Admin operations: Add or update Shelter
 */
export async function saveShelterToFirestore(shelter: Partial<Shelter> & { id?: string }) {
  if (shelter.id) {
    const docRef = doc(db, 'shelters', shelter.id);
    await setDoc(docRef, shelter, { merge: true });
    return shelter.id;
  } else {
    const docRef = await addDoc(sheltersCollection, {
      ...shelter,
      lastVerifiedAt: new Date().toISOString()
    });
    return docRef.id;
  }
}

/**
 * Admin operations: Delete Shelter
 */
export async function deleteShelterFromFirestore(id: string) {
  const docRef = doc(db, 'shelters', id);
  await deleteDoc(docRef);
}

/**
 * Batch Seed shelters into Firestore
 */
export async function seedSheltersToFirestore(shelters: Shelter[], onProgress?: (current: number, total: number) => void): Promise<number> {
  let count = 0;
  for (const s of shelters) {
    const docId = s.id || `sh-${Date.now()}-${count}`;
    const docRef = doc(db, 'shelters', docId);
    await setDoc(docRef, { ...s, id: docId }, { merge: true });
    count++;
    if (onProgress && count % 10 === 0) {
      onProgress(count, shelters.length);
    }
  }
  return count;
}

/**
 * Admin operations: Add or update Volunteer Squad
 */
export async function saveVolunteerToFirestore(volunteer: Partial<VolunteerSquad> & { id?: string }) {
  if (volunteer.id) {
    const docRef = doc(db, 'volunteers', volunteer.id);
    await setDoc(docRef, volunteer, { merge: true });
    return volunteer.id;
  } else {
    const docRef = await addDoc(volunteersCollection, {
      ...volunteer,
      lastVerifiedAt: new Date().toISOString()
    });
    return docRef.id;
  }
}

/**
 * Admin operations: Delete Volunteer Squad
 */
export async function deleteVolunteerFromFirestore(id: string) {
  const docRef = doc(db, 'volunteers', id);
  await deleteDoc(docRef);
}

/**
 * Batch Seed volunteers into Firestore
 */
export async function seedVolunteersToFirestore(volunteers: VolunteerSquad[], onProgress?: (current: number, total: number) => void): Promise<number> {
  let count = 0;
  for (const v of volunteers) {
    const docId = v.id || `vol-${Date.now()}-${count}`;
    const docRef = doc(db, 'volunteers', docId);
    await setDoc(docRef, { ...v, id: docId }, { merge: true });
    count++;
    if (onProgress && count % 5 === 0) {
      onProgress(count, volunteers.length);
    }
  }
  return count;
}
