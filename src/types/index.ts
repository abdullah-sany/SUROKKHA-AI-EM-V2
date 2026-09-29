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

export type ShelterType = 'cyclone' | 'flood' | 'multipurpose' | 'school_cum_shelter';
export type ShelterStatus = 'active' | 'open' | 'standby' | 'near_capacity' | 'maintenance';

export interface ShelterFacilityItem {
  id: string;
  name: string;
  nameBn: string;
  icon?: string;
}

export interface Shelter {
  id: string;
  name: string;
  nameBn: string;
  type: ShelterType;
  division: string;
  district: string;
  upazila: string;
  unionArea: string;
  capacityPeople: number;
  capacityLivestock: number;
  floors: number;
  elevationMeters?: number;
  facilities: string[]; // e.g. ['drinking_water', 'solar_power', 'separate_women_toilet', 'ramp_access', 'livestock_shed', 'first_aid', 'pregnant_care']
  contactPerson: string;
  contactDesignation?: string;
  contactPhone: string;
  emergencyPhone?: string;
  latitude: number;
  longitude: number;
  status: ShelterStatus;
  verified: boolean;
  source: string;
  lastVerifiedAt: string;
  distanceKm?: number;
}

export interface ShelterFilterOptions {
  searchQuery: string;
  division: string;
  district: string;
  upazila: string;
  type: string;
  hasLivestockSpace: boolean;
  hasSolarPower: boolean;
  hasCleanWater: boolean;
  hasRampAccess: boolean;
  hasWomenToilet: boolean;
}

export type VolunteerOrgType = 
  | 'BDRCS' 
  | 'FSCD_VOLUNTEER' 
  | 'GAUSIA_COMMITTEE' 
  | 'AS_SUNNAH' 
  | 'SCOUTS' 
  | 'STUDENT_COMMUNITY' 
  | 'BOAT_SQUAD' 
  | 'DIVER_LIFEGUARD' 
  | 'LOCAL_YOUTH' 
  | 'OTHER';

export type SquadStatus = 'active' | 'standby' | 'deployed';

export interface VolunteerSquad {
  id: string;
  teamName: string;
  teamNameBn: string;
  organization: VolunteerOrgType;
  orgNameBn: string;
  division: string;
  district: string;
  upazila: string;
  coverageArea: string;
  coverageAreaBn: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  leaderOrCoordinator: string;
  leaderDesignation?: string;
  activeVolunteersCount: number;
  capabilities: string[]; // e.g. ['speedboat', 'divers', 'firstaid', 'food_relief', 'drone', 'climbing_rope', 'ambulance']
  equipmentBn?: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  is24Hours: boolean;
  status: SquadStatus;
  notes?: string;
  source: string;
  lastVerifiedAt: string;
  distanceKm?: number;
}

export interface VolunteerFilterOptions {
  searchQuery: string;
  division: string;
  district: string;
  organization: string;
  hasSpeedboat: boolean;
  hasDivers: boolean;
  hasMedical: boolean;
  hasRelief: boolean;
  hasDrone: boolean;
  status: string;
}
