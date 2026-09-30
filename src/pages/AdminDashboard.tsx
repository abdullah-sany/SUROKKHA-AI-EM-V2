import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Lock,
  Mail,
  LogOut,
  Building2,
  Activity,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  LifeBuoy,
  Users,
  MapPin,
  Phone,
  Check,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Ambulance, HealthcareFacility, Shelter, VolunteerSquad, ShelterType, SquadStatus } from '../types';
import {
  db,
  ambulancesCollection,
  facilitiesCollection,
  sheltersCollection,
  volunteersCollection,
  saveAmbulanceToFirestore,
  deleteAmbulanceFromFirestore,
  seedAmbulancesToFirestore,
  saveFacilityToFirestore,
  deleteFacilityFromFirestore,
  seedFacilitiesToFirestore,
  saveShelterToFirestore,
  deleteShelterFromFirestore,
  seedSheltersToFirestore,
  saveVolunteerToFirestore,
  deleteVolunteerFromFirestore,
  seedVolunteersToFirestore
} from '../lib/firebase';
import { onSnapshot } from 'firebase/firestore';

import bundledAmbulances from '../data/ambulances.json';
import bundledHospitals from '../data/hospitals.json';
import bundledShelters from '../data/shelters.json';
import bundledVolunteers from '../data/volunteers.json';
import { BANGLADESH_DISTRICTS, getDistrictsForDivision } from '../data/bangladeshDistricts';

export default function AdminDashboard() {
  const { user, loginWithEmail, registerWithEmail, loginWithGoogle, logout, error: authError, setError: setAuthError } = useAuth();
  
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Management Tab: 4 Directories + Cloud DB Sync
  const [activeTab, setActiveTab] = useState<'ambulances' | 'facilities' | 'shelters' | 'volunteers' | 'database'>('ambulances');

  // Live Firestore Data Lists
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerSquad[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Modals state
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Partial<Ambulance> | null>(null);

  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Partial<HealthcareFacility> | null>(null);

  const [showShelterModal, setShowShelterModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Partial<Shelter> | null>(null);

  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Partial<VolunteerSquad> | null>(null);

  // In-app Delete Confirmation State (Avoids browser iframe window.confirm blocking)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'ambulance' | 'facility' | 'shelter' | 'volunteer';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user) return;

    setLoadingData(true);

    // 1. Ambulances listener
    const unsubAmbulances = onSnapshot(ambulancesCollection, (snapshot) => {
      const list: Ambulance[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Ambulance);
      });
      setAmbulances(list);
      setLoadingData(false);
    }, (err) => {
      console.warn("Ambulance Firestore listener:", err);
      setLoadingData(false);
    });

    // 2. Facilities listener
    const unsubFacilities = onSnapshot(facilitiesCollection, (snapshot) => {
      const list: HealthcareFacility[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as HealthcareFacility);
      });
      setFacilities(list);
    }, (err) => {
      console.warn("Facilities Firestore listener:", err);
    });

    // 3. Shelters listener
    const unsubShelters = onSnapshot(sheltersCollection, (snapshot) => {
      const list: Shelter[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Shelter);
      });
      setShelters(list);
    }, (err) => {
      console.warn("Shelters Firestore listener:", err);
    });

    // 4. Volunteers listener
    const unsubVolunteers = onSnapshot(volunteersCollection, (snapshot) => {
      const list: VolunteerSquad[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as VolunteerSquad);
      });
      setVolunteers(list);
    }, (err) => {
      console.warn("Volunteers Firestore listener:", err);
    });

    return () => {
      unsubAmbulances();
      unsubFacilities();
      unsubShelters();
      unsubVolunteers();
    };
  }, [user]);

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setAuthLoading(false);
    }
  };

  // Sync individual or all datasets to Firestore
  const handleSyncAllData = async () => {
    setSyncing(true);
    setSyncStatus('ক্লাউড ফায়ারস্টোরে পূর্ণাঙ্গ ব্যাকআপ ও সিঙ্ক শুরু হচ্ছে...');
    try {
      // 1. Ambulances (49)
      setSyncStatus(`১/৪: ${bundledAmbulances.length}টি অ্যাম্বুলেন্স সিঙ্ক হচ্ছে...`);
      const ambCount = await seedAmbulancesToFirestore(bundledAmbulances as Ambulance[]);

      // 2. Facilities (319+)
      setSyncStatus(`২/৪: ${bundledHospitals.length}টি হাসপাতাল ও ক্লিনিক সিঙ্ক হচ্ছে...`);
      const facCount = await seedFacilitiesToFirestore(bundledHospitals as HealthcareFacility[]);

      // 3. Shelters (66)
      setSyncStatus(`৩/৪: ${bundledShelters.length}টি সাইক্লোন ও বন্যা আশ্রয়কেন্দ্র সিঙ্ক হচ্ছে...`);
      const shelterCount = await seedSheltersToFirestore(bundledShelters as Shelter[]);

      // 4. Volunteers (20)
      setSyncStatus(`৪/৪: ${bundledVolunteers.length}টি উদ্ধারকারী ও স্বেচ্ছাসেবী দল সিঙ্ক হচ্ছে...`);
      const volCount = await seedVolunteersToFirestore(bundledVolunteers as VolunteerSquad[]);

      setSyncStatus(`✅ সফলভাবে সিঙ্ক সম্পন্ন হয়েছে: ${ambCount}টি অ্যাম্বুলেন্স, ${facCount}টি হাসপাতাল, ${shelterCount}টি আশ্রয়কেন্দ্র, এবং ${volCount}টি উদ্ধারকারী টিম!`);
      setTimeout(() => setSyncStatus(null), 6000);
    } catch (err: any) {
      console.error('Full Sync error:', err);
      setSyncStatus(`❌ সিঙ্ক ব্যর্থ হয়েছে: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Save Ambulance (Add or Edit)
  const handleSaveAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmbulance || !editingAmbulance.providerName || !editingAmbulance.phone) {
      alert('প্রোভাইডার নাম ও ফোন নম্বর প্রদান আবশ্যক');
      return;
    }

    try {
      await saveAmbulanceToFirestore({
        ...editingAmbulance,
        id: editingAmbulance.id || `amb-${Date.now()}`,
        verified: editingAmbulance.verified ?? true,
        division: editingAmbulance.division || 'Dhaka',
        district: editingAmbulance.district || 'Dhaka',
        area: editingAmbulance.area || 'City Area',
        serviceType: editingAmbulance.serviceType || 'Basic',
        source: editingAmbulance.source || 'Admin Panel'
      });
      setShowAmbulanceModal(false);
      setEditingAmbulance(null);
    } catch (err: any) {
      alert(`অ্যাম্বুলেন্স সংরক্ষণে ত্রুটি: ${err.message}`);
    }
  };

  // Save Facility (Add or Edit)
  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility || !editingFacility.name) {
      alert('হাসপাতালের নাম প্রদান আবশ্যক');
      return;
    }

    try {
      await saveFacilityToFirestore({
        ...editingFacility,
        id: editingFacility.id || `hf-${Date.now()}`,
        verified: editingFacility.verified ?? true,
        division: editingFacility.division || 'Dhaka',
        district: editingFacility.district || 'Dhaka',
        area: editingFacility.area || 'City',
        facilityType: editingFacility.facilityType || 'Hospital',
        source: editingFacility.source || 'Admin Panel'
      });
      setShowFacilityModal(false);
      setEditingFacility(null);
    } catch (err: any) {
      alert(`হাসপাতাল সংরক্ষণে ত্রুটি: ${err.message}`);
    }
  };

  // Save Shelter (Add or Edit)
  const handleSaveShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShelter || !editingShelter.name || !editingShelter.district) {
      alert('আশ্রয়কেন্দ্রের নাম ও জেলা আবশ্যক');
      return;
    }

    try {
      await saveShelterToFirestore({
        ...editingShelter,
        id: editingShelter.id || `sh-${Date.now()}`,
        nameBn: editingShelter.nameBn || editingShelter.name,
        type: editingShelter.type || 'cyclone',
        division: editingShelter.division || 'Chattogram',
        district: editingShelter.district || 'Cox\'s Bazar',
        upazila: editingShelter.upazila || 'Sadar',
        unionArea: editingShelter.unionArea || 'Local Union',
        capacityPeople: Number(editingShelter.capacityPeople) || 500,
        capacityLivestock: Number(editingShelter.capacityLivestock) || 100,
        floors: Number(editingShelter.floors) || 2,
        facilities: editingShelter.facilities || ['drinking_water', 'solar_power'],
        contactPerson: editingShelter.contactPerson || 'CPP Officer',
        contactPhone: editingShelter.contactPhone || '1090',
        latitude: Number(editingShelter.latitude) || 21.4272,
        longitude: Number(editingShelter.longitude) || 92.0058,
        status: editingShelter.status || 'operational',
        verified: editingShelter.verified ?? true,
        source: editingShelter.source || 'Disaster Management Admin'
      });
      setShowShelterModal(false);
      setEditingShelter(null);
    } catch (err: any) {
      alert(`আশ্রয়কেন্দ্র সংরক্ষণে ত্রুটি: ${err.message}`);
    }
  };

  // Save Volunteer Squad (Add or Edit)
  const handleSaveVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer || !editingVolunteer.teamName || !editingVolunteer.primaryPhone) {
      alert('দলের নাম ও হটলাইন নম্বর আবশ্যক');
      return;
    }

    try {
      await saveVolunteerToFirestore({
        ...editingVolunteer,
        id: editingVolunteer.id || `vol-${Date.now()}`,
        teamNameBn: editingVolunteer.teamNameBn || editingVolunteer.teamName,
        organization: editingVolunteer.organization || 'BDRCS',
        orgNameBn: editingVolunteer.orgNameBn || 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি',
        division: editingVolunteer.division || 'Dhaka',
        district: editingVolunteer.district || 'Dhaka',
        upazila: editingVolunteer.upazila || 'Sadar',
        coverageArea: editingVolunteer.coverageArea || 'District-wide',
        coverageAreaBn: editingVolunteer.coverageAreaBn || 'সমগ্র জেলা',
        primaryPhone: editingVolunteer.primaryPhone,
        secondaryPhone: editingVolunteer.secondaryPhone || '',
        whatsappNumber: editingVolunteer.whatsappNumber || '',
        leaderOrCoordinator: editingVolunteer.leaderOrCoordinator || 'টিম কো-অর্ডিনেটর',
        activeVolunteersCount: Number(editingVolunteer.activeVolunteersCount) || 15,
        capabilities: editingVolunteer.capabilities || ['firstaid', 'food_relief'],
        latitude: Number(editingVolunteer.latitude) || 23.8103,
        longitude: Number(editingVolunteer.longitude) || 90.4125,
        verified: editingVolunteer.verified ?? true,
        is24Hours: editingVolunteer.is24Hours ?? true,
        status: editingVolunteer.status || 'active'
      });
      setShowVolunteerModal(false);
      setEditingVolunteer(null);
    } catch (err: any) {
      alert(`স্বেচ্ছাসেবক দল সংরক্ষণে ত্রুটি: ${err.message}`);
    }
  };

  // Quick Verification Toggles
  const handleToggleAmbulanceVerified = async (item: Ambulance) => {
    try {
      await saveAmbulanceToFirestore({ ...item, verified: !item.verified });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleFacilityVerified = async (item: HealthcareFacility) => {
    try {
      await saveFacilityToFirestore({ ...item, verified: !item.verified });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleShelterVerified = async (item: Shelter) => {
    try {
      await saveShelterToFirestore({ ...item, verified: !item.verified });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleVolunteerVerified = async (item: VolunteerSquad) => {
    try {
      await saveVolunteerToFirestore({ ...item, verified: !item.verified });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Perform Delete Action
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.type === 'ambulance') {
        setAmbulances((prev) => prev.filter((a) => a.id !== itemToDelete.id));
        await deleteAmbulanceFromFirestore(itemToDelete.id);
      } else if (itemToDelete.type === 'facility') {
        setFacilities((prev) => prev.filter((f) => f.id !== itemToDelete.id));
        await deleteFacilityFromFirestore(itemToDelete.id);
      } else if (itemToDelete.type === 'shelter') {
        setShelters((prev) => prev.filter((s) => s.id !== itemToDelete.id));
        await deleteShelterFromFirestore(itemToDelete.id);
      } else if (itemToDelete.type === 'volunteer') {
        setVolunteers((prev) => prev.filter((v) => v.id !== itemToDelete.id));
        await deleteVolunteerFromFirestore(itemToDelete.id);
      }
      setItemToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter calculations
  const availableDistricts = useMemo(() => {
    return getDistrictsForDivision(selectedDivision);
  }, [selectedDivision]);

  const filteredAmbulances = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ambulances.filter(a => {
      const matchSearch = !q || a.providerName.toLowerCase().includes(q) || a.district.toLowerCase().includes(q) || a.phone.includes(q);
      const matchDiv = !selectedDivision || a.division.toLowerCase() === selectedDivision.toLowerCase();
      const matchDist = !selectedDistrict || a.district.toLowerCase() === selectedDistrict.toLowerCase();
      return matchSearch && matchDiv && matchDist;
    });
  }, [ambulances, searchQuery, selectedDivision, selectedDistrict]);

  const filteredFacilities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return facilities.filter(f => {
      const matchSearch = !q || f.name.toLowerCase().includes(q) || (f.nameBn && f.nameBn.includes(q)) || f.district.toLowerCase().includes(q) || (f.phone && f.phone.includes(q));
      const matchDiv = !selectedDivision || f.division?.toLowerCase() === selectedDivision.toLowerCase();
      const matchDist = !selectedDistrict || f.district?.toLowerCase() === selectedDistrict.toLowerCase();
      return matchSearch && matchDiv && matchDist;
    });
  }, [facilities, searchQuery, selectedDivision, selectedDistrict]);

  const filteredShelters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return shelters.filter(s => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || (s.nameBn && s.nameBn.includes(q)) || s.district.toLowerCase().includes(q) || s.upazila.toLowerCase().includes(q);
      const matchDiv = !selectedDivision || s.division.toLowerCase() === selectedDivision.toLowerCase();
      const matchDist = !selectedDistrict || s.district.toLowerCase() === selectedDistrict.toLowerCase();
      return matchSearch && matchDiv && matchDist;
    });
  }, [shelters, searchQuery, selectedDivision, selectedDistrict]);

  const filteredVolunteers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return volunteers.filter(v => {
      const matchSearch = !q || v.teamName.toLowerCase().includes(q) || (v.teamNameBn && v.teamNameBn.includes(q)) || v.district.toLowerCase().includes(q) || v.primaryPhone.includes(q);
      const matchDiv = !selectedDivision || v.division.toLowerCase() === selectedDivision.toLowerCase();
      const matchDist = !selectedDistrict || v.district.toLowerCase() === selectedDistrict.toLowerCase();
      return matchSearch && matchDiv && matchDist;
    });
  }, [volunteers, searchQuery, selectedDivision, selectedDistrict]);

  // If Not Logged In -> Render Clean Admin Sign-In Screen
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-50 text-[var(--color-medical-red)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-[var(--color-medical-navy)] tracking-tight">
              অ্যাডমিন কন্ট্রোল পোর্টাল
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              SUROKKHA AI BD — সেন্ট্রাল ইমার্জেন্সি ডাটাবেস ও সার্ভিস নিয়ন্ত্রণ
            </p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2.5 font-bold text-xs tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                authMode === 'login'
                  ? 'border-[var(--color-medical-red)] text-[var(--color-medical-red)]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              লগইন (Sign In)
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2.5 font-bold text-xs tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                authMode === 'register'
                  ? 'border-[var(--color-medical-red)] text-[var(--color-medical-red)]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              নতুন অ্যাকাউন্ট (Register)
            </button>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-medical-navy)] uppercase tracking-wider mb-1">
                ইমেইল (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@surokkha.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-medical-navy)] uppercase tracking-wider mb-1">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[var(--color-medical-red)] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'অ্যাডমিন লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.41 7.36 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.13z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.28 2.59 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>Google অ্যাকাউন্ট দিয়ে প্রবেশ করুন</span>
            </button>
          </div>

          <div className="mt-6 text-center text-[11px] text-gray-400">
            🔒 সুরক্ষিত ক্লাউড ফায়ারস্টোর এনক্রিপ্টেড ডাটাবেজ
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user.email === 'mdabdulllahsany@gmail.com';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      
      {/* Top Header & Admin Profile */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore Connected</span>
            </span>
            {isOwner && (
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                Super Admin (Owner)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-medical-navy)] tracking-tight">
            সেন্ট্রাল অ্যাডমিন কন্ট্রোল প্যানেল
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            লগইন আছেন: <strong className="text-slate-800">{user.email || 'Admin User'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncAllData}
            disabled={syncing}
            className="inline-flex items-center space-x-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Sync all hospitals, ambulances, shelters and volunteers to Cloud Firestore"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>সব ডাটা ক্লাউডে সিঙ্ক করুন</span>
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
          <span className="font-semibold">{syncStatus}</span>
          <button onClick={() => setSyncStatus(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* 4 Metric Cards for all Services */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Metric 1: Ambulances */}
        <div 
          onClick={() => setActiveTab('ambulances')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'ambulances' ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400' : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">অ্যাম্বুলেন্স</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-medical-navy)] tabular-nums">
            {ambulances.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ফায়ারস্টোর লাইভ ডাটাবেজ</p>
        </div>

        {/* Metric 2: Hospitals */}
        <div 
          onClick={() => setActiveTab('facilities')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'facilities' ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">হাসপাতাল ও ক্লিনিক</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-medical-navy)] tabular-nums">
            {facilities.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">সারাদেশের ভেরিফায়েড হাসপাতাল</p>
        </div>

        {/* Metric 3: Cyclone & Flood Shelters */}
        <div 
          onClick={() => setActiveTab('shelters')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'shelters' ? 'bg-cyan-50/50 border-cyan-300 ring-2 ring-cyan-400' : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ঘূর্ণিঝড় ও বন্যা আশ্রয়কেন্দ্র</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-medical-navy)] tabular-nums">
            {shelters.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">উপকূলীয় ও বন্যা শেল্টার নেটওয়ার্ক</p>
        </div>

        {/* Metric 4: Volunteers & Rescue Squads */}
        <div 
          onClick={() => setActiveTab('volunteers')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'volunteers' ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">উদ্ধারকারী ও স্বেচ্ছাসেবী দল</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-medical-navy)] tabular-nums">
            {volunteers.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">রেড ক্রিসেন্ট, ফায়ার সার্ভিস ও যুব স্কোয়াড</p>
        </div>

      </div>

      {/* Main Tab Controls & Quick Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs mb-8 overflow-hidden">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 border-b border-gray-100 gap-3">
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('ambulances')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'ambulances'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>অ্যাম্বুলেন্স ({ambulances.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'facilities'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>হাসপাতাল ({facilities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'shelters'
                  ? 'bg-cyan-700 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>আশ্রয়কেন্দ্র ({shelters.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteers')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'volunteers'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>উদ্ধারকারী দল ({volunteers.length})</span>
            </button>
          </div>

          {/* Quick Add Button based on active tab */}
          <div>
            {activeTab === 'ambulances' && (
              <button
                onClick={() => {
                  setEditingAmbulance({ verified: true, serviceType: 'Basic', division: 'Dhaka', district: 'Dhaka' });
                  setShowAmbulanceModal(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন অ্যাম্বুলেন্স</span>
              </button>
            )}

            {activeTab === 'facilities' && (
              <button
                onClick={() => {
                  setEditingFacility({ verified: true, facilityType: 'Hospital', division: 'Dhaka', district: 'Dhaka' });
                  setShowFacilityModal(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন হাসপাতাল</span>
              </button>
            )}

            {activeTab === 'shelters' && (
              <button
                onClick={() => {
                  setEditingShelter({ verified: true, type: 'cyclone', division: 'Chattogram', district: 'Cox\'s Bazar', capacityPeople: 600, status: 'operational' });
                  setShowShelterModal(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন আশ্রয়কেন্দ্র</span>
              </button>
            )}

            {activeTab === 'volunteers' && (
              <button
                onClick={() => {
                  setEditingVolunteer({ verified: true, organization: 'BDRCS', division: 'Dhaka', district: 'Dhaka', activeVolunteersCount: 20, status: 'active', is24Hours: true });
                  setShowVolunteerModal(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন উদ্ধারকারী টিম</span>
              </button>
            )}
          </div>

        </div>

        {/* Filter Toolbar (Search + Division + District) */}
        <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-gray-100 flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম, ফোন বা এলাকা লিখে খুঁজুন (Search by name, phone, area)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('');
              }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="">সব বিভাগ (All Divisions)</option>
              <option value="Dhaka">ঢাকা (Dhaka)</option>
              <option value="Chattogram">চট্টগ্রাম (Chattogram)</option>
              <option value="Sylhet">সিলেট (Sylhet)</option>
              <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
              <option value="Khulna">খুলনা (Khulna)</option>
              <option value="Barishal">বরিশাল (Barishal)</option>
              <option value="Rangpur">রংপুর (Rangpur)</option>
              <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedDivision}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer disabled:opacity-50"
            >
              <option value="">সব জেলা (All Districts)</option>
              {availableDistricts.map(d => (
                <option key={d.en} value={d.en}>{d.bn} ({d.en})</option>
              ))}
            </select>

            {(selectedDivision || selectedDistrict || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDivision('');
                  setSelectedDistrict('');
                  setSearchQuery('');
                }}
                className="text-xs text-red-600 font-bold hover:underline px-2 whitespace-nowrap"
              >
                রিসেট
              </button>
            )}
          </div>

        </div>

        {/* ================= TAB 1: AMBULANCES TABLE ================= */}
        {activeTab === 'ambulances' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4">সার্ভিস নাম</th>
                  <th className="py-3 px-4">জেলা ও এলাকা</th>
                  <th className="py-3 px-4">ফোন নম্বর</th>
                  <th className="py-3 px-4">টাইপ</th>
                  <th className="py-3 px-4">ভেরিফিকেশন</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAmbulances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {loadingData ? 'লোড হচ্ছে...' : 'কোনো রেকর্ড পাওয়া যায়নি। উপরের "সব ডাটা ক্লাউডে সিঙ্ক করুন" বাটনে ক্লিক করে প্রাথমিক ডাটা সিঙ্ক করতে পারেন।'}
                    </td>
                  </tr>
                ) : (
                  filteredAmbulances.map((amb) => (
                    <tr key={amb.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--color-medical-navy)]">
                        {amb.providerName}
                        <div className="text-[10px] text-slate-400 font-normal">ID: {amb.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {amb.district}, {amb.area}
                        <div className="text-[10px] text-slate-400">{amb.division}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <a href={`tel:${amb.phone}`} className="text-teal-700 hover:underline">
                          {amb.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {amb.serviceType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAmbulanceVerified(amb)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            amb.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {amb.verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{amb.verified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingAmbulance(amb);
                            setShowAmbulanceModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: 'ambulance', id: amb.id, name: amb.providerName })}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 2: FACILITIES TABLE ================= */}
        {activeTab === 'facilities' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4">হাসপাতালের নাম</th>
                  <th className="py-3 px-4">টাইপ ও বিভাগ</th>
                  <th className="py-3 px-4">জেলা ও এলাকা</th>
                  <th className="py-3 px-4">ফোন</th>
                  <th className="py-3 px-4">ভেরিফিকেশন</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {loadingData ? 'লোড হচ্ছে...' : 'কোনো হাসপাতাল রেকর্ড পাওয়া যায়নি। উপরের "সব ডাটা ক্লাউডে সিঙ্ক করুন" বাটনে ক্লিক করে ৩২৮+ হাসপাতাল সিঙ্ক করুন।'}
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((fac) => (
                    <tr key={fac.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--color-medical-navy)]">
                        {fac.name}
                        {fac.nameBn && <div className="text-xs text-slate-500 font-normal">{fac.nameBn}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{fac.facilityType}</span>
                        <div className="text-[10px] text-slate-400">{fac.division}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {fac.district}{fac.area ? `, ${fac.area}` : ''}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {fac.phone || fac.emergencyPhone || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFacilityVerified(fac)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            fac.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {fac.verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{fac.verified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingFacility(fac);
                            setShowFacilityModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: 'facility', id: fac.id, name: fac.name })}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: CYCLONE & FLOOD SHELTERS TABLE ================= */}
        {activeTab === 'shelters' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4">আশ্রয়কেন্দ্রের নাম</th>
                  <th className="py-3 px-4">ধরণ ও ধারণক্ষমতা</th>
                  <th className="py-3 px-4">জেলা ও উপজেলা</th>
                  <th className="py-3 px-4">যোগাযোগ ও হটলাইন</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShelters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {loadingData ? 'লোড হচ্ছে...' : 'কোনো আশ্রয়কেন্দ্র পাওয়া যায়নি। "সব ডাটা ক্লাউডে সিঙ্ক করুন" বাটনে ক্লিক করে ৬৬টি শেল্টার সিঙ্ক করুন।'}
                    </td>
                  </tr>
                ) : (
                  filteredShelters.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--color-medical-navy)]">
                        {sh.nameBn || sh.name}
                        {sh.name && sh.name !== sh.nameBn && (
                          <div className="text-[10px] text-slate-400 font-normal">{sh.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800 capitalize">{sh.type} Shelter</span>
                        <div className="text-[10px] text-slate-500">
                          ধারণক্ষমতা: {sh.capacityPeople} জন {sh.capacityLivestock ? `· গবাদিপশু: ${sh.capacityLivestock}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sh.district}, {sh.upazila}
                        <div className="text-[10px] text-slate-400">{sh.unionArea}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <a href={`tel:${sh.contactPhone}`} className="text-teal-700 hover:underline">
                          {sh.contactPhone}
                        </a>
                        <div className="text-[10px] text-slate-500 font-normal">{sh.contactPerson}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleShelterVerified(sh)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            sh.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {sh.verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{sh.verified ? 'Verified' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingShelter(sh);
                            setShowShelterModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: 'shelter', id: sh.id, name: sh.nameBn || sh.name })}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 4: VOLUNTEERS & RESCUE SQUADS TABLE ================= */}
        {activeTab === 'volunteers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4">টিমের নাম ও সংস্থা</th>
                  <th className="py-3 px-4">জেলা ও কভারেজ এলাকা</th>
                  <th className="py-3 px-4">জরুরি হটলাইন</th>
                  <th className="py-3 px-4">টিম সদস্য</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {loadingData ? 'লোড হচ্ছে...' : 'কোনো উদ্ধারকারী দল পাওয়া যায়নি। "সব ডাটা ক্লাউডে সিঙ্ক করুন" বাটনে ক্লিক করে টিমগুলো সিঙ্ক করুন।'}
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--color-medical-navy)]">
                        {vol.teamNameBn || vol.teamName}
                        <div className="text-[10px] text-teal-700 font-semibold">{vol.orgNameBn || vol.organization}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {vol.district}, {vol.upazila}
                        <div className="text-[10px] text-slate-500">{vol.coverageAreaBn || vol.coverageArea}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <a href={`tel:${vol.primaryPhone}`} className="text-teal-700 hover:underline">
                          {vol.primaryPhone}
                        </a>
                        {vol.whatsappNumber && (
                          <div className="text-[10px] text-emerald-600 font-semibold">WA: {vol.whatsappNumber}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {vol.activeVolunteersCount} জন
                        <div className="text-[10px] text-slate-400 font-normal">{vol.leaderOrCoordinator}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVolunteerVerified(vol)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            vol.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {vol.verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{vol.verified ? 'Verified' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingVolunteer(vol);
                            setShowVolunteerModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: 'volunteer', id: vol.id, name: vol.teamNameBn || vol.teamName })}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ================= MODAL: ADD/EDIT AMBULANCE ================= */}
      {showAmbulanceModal && editingAmbulance && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-medical-navy)] mb-4">
              {editingAmbulance.id ? 'অ্যাম্বুলেন্স তথ্য সম্পাদনা (Edit)' : 'নতুন অ্যাম্বুলেন্স যোগ করুন'}
            </h2>

            <form onSubmit={handleSaveAmbulance} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">প্রোভাইডার নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Sandhani Ambulance Service"
                  value={editingAmbulance.providerName || ''}
                  onChange={(e) => setEditingAmbulance({ ...editingAmbulance, providerName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিভাগ (Division)</label>
                  <input
                    type="text"
                    value={editingAmbulance.division || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, division: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা (District)</label>
                  <input
                    type="text"
                    value={editingAmbulance.district || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">এলাকা (Area)</label>
                  <input
                    type="text"
                    value={editingAmbulance.area || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, area: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সার্ভিস টাইপ</label>
                  <input
                    type="text"
                    placeholder="Basic / AC / ICU"
                    value={editingAmbulance.serviceType || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, serviceType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ফোন নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={editingAmbulance.phone || ''}
                  onChange={(e) => setEditingAmbulance({ ...editingAmbulance, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="ambVerified"
                  checked={editingAmbulance.verified ?? true}
                  onChange={(e) => setEditingAmbulance({ ...editingAmbulance, verified: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="ambVerified" className="font-bold text-gray-700">
                  যাচাইকৃত (Verified Status)
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAmbulanceModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD/EDIT FACILITY ================= */}
      {showFacilityModal && editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-medical-navy)] mb-4">
              {editingFacility.id ? 'হাসপাতাল তথ্য সম্পাদনা (Edit)' : 'নতুন হাসপাতাল যোগ করুন'}
            </h2>

            <form onSubmit={handleSaveFacility} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">হাসপাতালের নাম (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Medical College Hospital"
                  value={editingFacility.name || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">হাসপাতালের নাম (বাংলা)</label>
                <input
                  type="text"
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                  value={editingFacility.nameBn || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, nameBn: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">টাইপ</label>
                  <select
                    value={editingFacility.facilityType || 'Hospital'}
                    onChange={(e) => setEditingFacility({ ...editingFacility, facilityType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Medical College Hospital">Medical College Hospital</option>
                    <option value="Private Hospital / Clinic">Private Hospital / Clinic</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Diagnostic Center">Diagnostic Center</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">মালিকানা</label>
                  <select
                    value={editingFacility.ownership || 'Public'}
                    onChange={(e) => setEditingFacility({ ...editingFacility, ownership: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="Public">Public (সরকারি)</option>
                    <option value="Private">Private (বেসরকারি)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিভাগ</label>
                  <input
                    type="text"
                    value={editingFacility.division || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, division: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={editingFacility.district || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ফোন নম্বর / জরুরি হটলাইন</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={editingFacility.phone || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="facVerified"
                  checked={editingFacility.verified ?? true}
                  onChange={(e) => setEditingFacility({ ...editingFacility, verified: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="facVerified" className="font-bold text-gray-700">
                  যাচাইকৃত (Verified Status)
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFacilityModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD/EDIT SHELTER ================= */}
      {showShelterModal && editingShelter && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-medical-navy)] mb-4">
              {editingShelter.id ? 'আশ্রয়কেন্দ্র সম্পাদনা (Edit)' : 'নতুন ঘূর্ণিঝড়/বন্যা আশ্রয়কেন্দ্র যোগ'}
            </h2>

            <form onSubmit={handleSaveShelter} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">আশ্রয়কেন্দ্রের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: কুতুবদিয়া সাইক্লোন শেল্টার"
                  value={editingShelter.nameBn || ''}
                  onChange={(e) => setEditingShelter({ ...editingShelter, nameBn: e.target.value, name: editingShelter.name || e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">আশ্রয়কেন্দ্রের নাম (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Kutubdia Cyclone Shelter"
                  value={editingShelter.name || ''}
                  onChange={(e) => setEditingShelter({ ...editingShelter, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">শেল্টারের ধরণ</label>
                  <select
                    value={editingShelter.type || 'cyclone'}
                    onChange={(e) => setEditingShelter({ ...editingShelter, type: e.target.value as ShelterType })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="cyclone">সাইক্লোন শেল্টার (Cyclone)</option>
                    <option value="flood">বন্যা আশ্রয়কেন্দ্র (Flood)</option>
                    <option value="multipurpose">মাল্টিপারপাস শেল্টার</option>
                    <option value="school_cum_shelter">স্কুল কাম শেল্টার</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">মানুষের ধারণক্ষমতা</label>
                  <input
                    type="number"
                    placeholder="600"
                    value={editingShelter.capacityPeople || ''}
                    onChange={(e) => setEditingShelter({ ...editingShelter, capacityPeople: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={editingShelter.district || ''}
                    onChange={(e) => setEditingShelter({ ...editingShelter, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">উপজেলা</label>
                  <input
                    type="text"
                    value={editingShelter.upazila || ''}
                    onChange={(e) => setEditingShelter({ ...editingShelter, upazila: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">দায়িত্বপ্রাপ্ত ব্যক্তি (Focal Point)</label>
                  <input
                    type="text"
                    placeholder="সিপিপি সমন্বয়ক"
                    value={editingShelter.contactPerson || ''}
                    onChange={(e) => setEditingShelter({ ...editingShelter, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জরুরি ফোন নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={editingShelter.contactPhone || ''}
                    onChange={(e) => setEditingShelter({ ...editingShelter, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="shVerified"
                  checked={editingShelter.verified ?? true}
                  onChange={(e) => setEditingShelter({ ...editingShelter, verified: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="shVerified" className="font-bold text-gray-700">
                  যাচাইকৃত (Verified Status)
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowShelterModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD/EDIT VOLUNTEER SQUAD ================= */}
      {showVolunteerModal && editingVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-medical-navy)] mb-4">
              {editingVolunteer.id ? 'উদ্ধারকারী টিম সম্পাদনা (Edit)' : 'নতুন উদ্ধারকারী ও স্বেচ্ছাসেবী দল যোগ'}
            </h2>

            <form onSubmit={handleSaveVolunteer} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">দলের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: কক্সবাজার উদ্ধারকারী দল"
                  value={editingVolunteer.teamNameBn || ''}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, teamNameBn: e.target.value, teamName: editingVolunteer.teamName || e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সংস্থা / অর্গানাইজেশন</label>
                  <select
                    value={editingVolunteer.organization || 'BDRCS'}
                    onChange={(e) => setEditingVolunteer({ ...editingVolunteer, organization: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="BDRCS">রেড ক্রিসেন্ট (BDRCS)</option>
                    <option value="FSCD_VOLUNTEER">ফায়ার সার্ভিস ভলান্টিয়ার</option>
                    <option value="GAUSIA_COMMITTEE">গাউসিয়া কমিটি বাংলাদেশ</option>
                    <option value="AS_SUNNAH">আস-সুন্নাহ ফাউন্ডেশন</option>
                    <option value="SCOUTS">বাংলাদেশ স্কাউটস</option>
                    <option value="BOAT_SQUAD">বোট ও লাইফগার্ড রেসকিউ</option>
                    <option value="LOCAL_YOUTH">স্থানীয় তরুণ স্বেচ্ছাসেবক</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">টিমের সদস্য সংখ্যা</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={editingVolunteer.activeVolunteersCount || ''}
                    onChange={(e) => setEditingVolunteer({ ...editingVolunteer, activeVolunteersCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={editingVolunteer.district || ''}
                    onChange={(e) => setEditingVolunteer({ ...editingVolunteer, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">উপজেলা</label>
                  <input
                    type="text"
                    value={editingVolunteer.upazila || ''}
                    onChange={(e) => setEditingVolunteer({ ...editingVolunteer, upazila: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জরুরি কল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={editingVolunteer.primaryPhone || ''}
                    onChange={(e) => setEditingVolunteer({ ...editingVolunteer, primaryPhone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={editingVolunteer.whatsappNumber || ''}
                    onChange={(e) => setEditingVolunteer({ ...editingVolunteer, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">টিম লিডার / কো-অর্ডিনেটর নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: মুহাম্মদ রফিক"
                  value={editingVolunteer.leaderOrCoordinator || ''}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, leaderOrCoordinator: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="volVerified"
                  checked={editingVolunteer.verified ?? true}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, verified: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="volVerified" className="font-bold text-gray-700">
                  যাচাইকৃত (Verified Status)
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVolunteerModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: IN-APP DELETE CONFIRMATION ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-base text-[var(--color-medical-navy)] mb-2">
              আপনি কি নিশ্চিতভাবে এই রেকর্ডটি মুছে ফেলতে চান?
            </h3>
            <p className="text-center text-xs text-slate-500 mb-6">
              <strong className="text-slate-800">{itemToDelete.name}</strong> রেকর্ডটি ক্লাউড ডাটাবেজ থেকে স্থায়ীভাবে মুছে যাবে।
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>মুছে ফেলুন</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
