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
import { Ambulance, HealthcareFacility } from '../types';

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
export async function seedFacilitiesToFirestore(facilities: HealthcareFacility[]): Promise<number> {
  let count = 0;
  // Seed first 50 or full list
  const subset = facilities.slice(0, 100);
  for (const fac of subset) {
    const docRef = doc(db, 'facilities', fac.id);
    await setDoc(docRef, fac, { merge: true });
    count++;
  }
  return count;
}
