export interface HealthcareFacility {
  id: string;
  name: string;
  nameBn?: string;
  facilityType: string;
  division: string;
  district: string;
  area: string;
  ownership: string;
  phone?: string;
  emergencyPhone?: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  source: string;
  lastVerifiedAt: string;
  distanceKm?: number; // Optional, added on client side
}

export interface Ambulance {
  id: string;
  providerName: string;
  division: string;
  district: string;
  area: string;
  phone: string;
  serviceType: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  source: string;
  lastVerifiedAt: string;
  distanceKm?: number; // Optional, added on client side
}

export interface EmergencyContact {
  id: string;
  name: string;
  category: string;
  phone: string;
  verified: boolean;
  source: string;
  lastVerifiedAt: string;
}

export interface LocationState {
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';
  latitude?: number;
  longitude?: number;
  error?: string;
}
