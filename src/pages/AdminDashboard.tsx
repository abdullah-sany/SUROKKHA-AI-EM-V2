import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Ambulance, HealthcareFacility } from '../types';
import {
  db,
  ambulancesCollection,
  facilitiesCollection,
  saveAmbulanceToFirestore,
  deleteAmbulanceFromFirestore,
  saveFacilityToFirestore,
  deleteFacilityFromFirestore,
  seedAmbulancesToFirestore,
  seedFacilitiesToFirestore
} from '../lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, loginWithEmail, registerWithEmail, loginWithGoogle, logout, error: authError, setError: setAuthError } = useAuth();
  
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<'ambulances' | 'facilities' | 'database'>('ambulances');

  // Live Data Lists
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Modal / Form state for Ambulance
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Partial<Ambulance> | null>(null);

  // Modal / Form state for Facility
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Partial<HealthcareFacility> | null>(null);

  // In-app Delete Confirmation State (Avoids browser iframe window.confirm blocking)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'ambulance' | 'facility';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user) return;

    setLoadingData(true);

    // Listen to Ambulances
    const unsubscribeAmbulances = onSnapshot(ambulancesCollection, (snapshot) => {
      const list: Ambulance[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Ambulance);
      });
      setAmbulances(list);
      setLoadingData(false);
    }, (err) => {
      console.error("Ambulance Firestore listener error:", err);
      setLoadingData(false);
    });

    // Listen to Facilities
    const unsubscribeFacilities = onSnapshot(facilitiesCollection, (snapshot) => {
      const list: HealthcareFacility[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as HealthcareFacility);
      });
      setFacilities(list);
    }, (err) => {
      console.error("Facilities Firestore listener error:", err);
    });

    return () => {
      unsubscribeAmbulances();
      unsubscribeFacilities();
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
      // Error handled in AuthContext
    } finally {
      setAuthLoading(false);
    }
  };

  // Seed Data into Firestore from local API
  const handleSeedData = async () => {
    setSyncStatus('Fetching local records to upload...');
    try {
      // 1. Fetch current local ambulances
      const ambRes = await fetch('/api/ambulances');
      const localAmbulances: Ambulance[] = await ambRes.json();

      // 2. Fetch current local hospitals
      const facRes = await fetch('/api/healthcare');
      const localFacilities: HealthcareFacility[] = await facRes.json();

      setSyncStatus(`Syncing ${localAmbulances.length} ambulances to Cloud Firestore...`);
      const ambCount = await seedAmbulancesToFirestore(localAmbulances);

      setSyncStatus(`Syncing ${Math.min(localFacilities.length, 100)} hospitals to Cloud Firestore...`);
      const facCount = await seedFacilitiesToFirestore(localFacilities);

      setSyncStatus(`✅ Successfully synced ${ambCount} ambulances & ${facCount} healthcare facilities to Firebase!`);
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      console.error('Seed error:', err);
      setSyncStatus(`❌ Sync failed: ${err.message}`);
    }
  };

  // Save Ambulance (Add or Edit)
  const handleSaveAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmbulance || !editingAmbulance.providerName || !editingAmbulance.phone) {
      alert('Please fill in required fields: Provider Name and Phone');
      return;
    }

    try {
      await saveAmbulanceToFirestore({
        ...editingAmbulance,
        id: editingAmbulance.id || `amb-${Date.now()}`,
        verified: editingAmbulance.verified ?? true,
        division: editingAmbulance.division || 'Dhaka',
        district: editingAmbulance.district || 'Dhaka',
        area: editingAmbulance.area || 'City',
        serviceType: editingAmbulance.serviceType || 'Basic',
        source: editingAmbulance.source || 'Admin Direct Entry'
      });
      setShowAmbulanceModal(false);
      setEditingAmbulance(null);
    } catch (err: any) {
      alert(`Error saving ambulance: ${err.message}`);
    }
  };

  // Save Facility (Add or Edit)
  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility || !editingFacility.name) {
      alert('Please fill in required field: Facility Name');
      return;
    }

    try {
      await saveFacilityToFirestore({
        ...editingFacility,
        id: editingFacility.id || `hf-${Date.now()}`,
        verified: editingFacility.verified ?? true,
        division: editingFacility.division || 'Dhaka',
        district: editingFacility.district || 'Dhaka',
        area: editingFacility.area || 'Center',
        facilityType: editingFacility.facilityType || 'Hospital',
        source: editingFacility.source || 'Admin Direct Entry'
      });
      setShowFacilityModal(false);
      setEditingFacility(null);
    } catch (err: any) {
      alert(`Error saving facility: ${err.message}`);
    }
  };

  // Quick Toggle Ambulance Verified
  const handleToggleAmbulanceVerified = async (amb: Ambulance) => {
    try {
      await saveAmbulanceToFirestore({
        ...amb,
        verified: !amb.verified
      });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Trigger Delete Confirmation Modal
  const requestDeleteAmbulance = (id: string, name: string) => {
    setItemToDelete({ type: 'ambulance', id, name });
  };

  const requestDeleteFacility = (id: string, name: string) => {
    setItemToDelete({ type: 'facility', id, name });
  };

  // Perform Delete Action
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.type === 'ambulance') {
        // Optimistic UI update
        setAmbulances((prev) => prev.filter((a) => a.id !== itemToDelete.id));
        await deleteAmbulanceFromFirestore(itemToDelete.id);
      } else {
        // Optimistic UI update
        setFacilities((prev) => prev.filter((f) => f.id !== itemToDelete.id));
        await deleteFacilityFromFirestore(itemToDelete.id);
      }
      setItemToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

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
              অ্যাডমিন পোর্টাল (Admin Portal)
            </h1>
            <p className="text-sm text-[var(--color-muted-gray)] mt-1">
              SUROKKHA AI BD — ক্লাউড ডাটাবেস ও সার্ভিস নিয়ন্ত্রণ
            </p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2.5 font-bold text-sm border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-[var(--color-medical-red)] text-[var(--color-medical-red)]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              লগইন (Sign In)
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2.5 font-bold text-sm border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-[var(--color-medical-red)] text-[var(--color-medical-red)]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              নতুন অ্যাকাউন্ট (Register)
            </button>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-medical-navy)] uppercase tracking-wider mb-1">
                ইমেইল (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@surokkha.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[var(--color-medical-red)] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
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
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.41 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.28 2.59 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Google দিয়ে সাইন ইন</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            🔒 সুরক্ষিত ক্লাউড ফায়ারস্টোর এনক্রিপ্টেড ডাটাবেজ
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists for active tab
  const filteredAmbulances = ambulances.filter(a =>
    a.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery)
  );

  const filteredFacilities = facilities.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.phone && f.phone.includes(searchQuery))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Firebase Cloud Firestore Live</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-medical-navy)] tracking-tight">
            অ্যাডমিন ড্যাশবোর্ড (Admin Control Center)
          </h1>
          <p className="text-sm text-[var(--color-muted-gray)] mt-1">
            লগইন আছেন: <strong className="text-gray-800">{user.email || 'Admin User'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeedData}
            className="inline-flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            title="Upload local 49 ambulances to Firestore"
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Sync Initial Data</span>
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between animate-fadeIn">
          <span>{syncStatus}</span>
          <button onClick={() => setSyncStatus(null)} className="text-blue-500 hover:text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ক্লাউড অ্যাম্বুলেন্স</p>
              <h3 className="text-3xl font-black text-[var(--color-medical-navy)] mt-1">
                {ambulances.length}
              </h3>
            </div>
            <div className="p-3.5 bg-red-50 rounded-xl text-[var(--color-medical-red)]">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>রিয়েল-টাইম ডাটাবেস সক্রিয়</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ক্লাউড হাসপাতাল</p>
              <h3 className="text-3xl font-black text-[var(--color-medical-navy)] mt-1">
                {facilities.length}
              </h3>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl text-[var(--color-medical-blue)]">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>সরাসরি আপডেটযোগ্য</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ডাটাবেজ স্ট্যাটাস</p>
              <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
                Firestore Connected
              </h3>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Cloud className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Google Firebase Cloud Run
          </p>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-100 gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('ambulances')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center space-x-2 ${
                activeTab === 'ambulances'
                  ? 'bg-[var(--color-medical-red)] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>অ্যাম্বুলেন্স ({ambulances.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center space-x-2 ${
                activeTab === 'facilities'
                  ? 'bg-[var(--color-medical-blue)] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>হাসপাতাল ({facilities.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="খুঁজুন (Search by name/district)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs w-64 focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
              />
            </div>

            {activeTab === 'ambulances' ? (
              <button
                onClick={() => {
                  setEditingAmbulance({ verified: true, serviceType: 'Basic', division: 'Dhaka', district: 'Dhaka' });
                  setShowAmbulanceModal(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন অ্যাম্বুলেন্স যোগ</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingFacility({ verified: true, facilityType: 'Hospital', division: 'Dhaka', district: 'Dhaka' });
                  setShowFacilityModal(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন হাসপাতাল যোগ</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Ambulances Table */}
        {activeTab === 'ambulances' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs tracking-wider">
                  <th className="py-3.5 px-6">সার্ভিস নাম</th>
                  <th className="py-3.5 px-6">জেলা ও এলাকা</th>
                  <th className="py-3.5 px-6">ফোন নম্বর</th>
                  <th className="py-3.5 px-6">টাইপ</th>
                  <th className="py-3.5 px-6">ভেরিফাইড</th>
                  <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAmbulances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      {loadingData ? 'লোড হচ্ছে...' : 'কোনো অ্যাম্বুলেন্স পাওয়া যায়নি। "Sync Initial Data" বাটনে ক্লিক করে বর্তমান ৪৯টি রেকর্ড ডাটাবেজে নিয়ে আসতে পারেন।'}
                    </td>
                  </tr>
                ) : (
                  filteredAmbulances.map((amb) => (
                    <tr key={amb.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-[var(--color-medical-navy)]">
                        {amb.providerName}
                        <div className="text-xs text-gray-400 font-normal">ID: {amb.id}</div>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">
                        {amb.district}, {amb.area}
                        <div className="text-xs text-gray-400">{amb.division}</div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-gray-800">
                        <a href={`tel:${amb.phone}`} className="text-blue-600 hover:underline">
                          {amb.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700">
                          {amb.serviceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => handleToggleAmbulanceVerified(amb)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            amb.verified
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {amb.verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{amb.verified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
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
                          onClick={() => requestDeleteAmbulance(amb.id, amb.providerName)}
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

        {/* Tab 2: Facilities Table */}
        {activeTab === 'facilities' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs tracking-wider">
                  <th className="py-3.5 px-6">হাসপাতালের নাম</th>
                  <th className="py-3.5 px-6">টাইপ ও বিভাগ</th>
                  <th className="py-3.5 px-6">জেলা</th>
                  <th className="py-3.5 px-6">ফোন</th>
                  <th className="py-3.5 px-6">ভেরিফাইড</th>
                  <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      {loadingData ? 'লোড হচ্ছে...' : 'কোনো হাসপাতাল রেকর্ড পাওয়া যায়নি। "Sync Initial Data" বাটনে ক্লিক করে ডাটাবেজে ডেটা যুক্ত করতে পারেন।'}
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((fac) => (
                    <tr key={fac.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-[var(--color-medical-navy)]">
                        {fac.name}
                        {fac.nameBn && <div className="text-xs text-gray-400">{fac.nameBn}</div>}
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                          {fac.facilityType}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">{fac.division}</div>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">
                        {fac.district}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-gray-800">
                        {fac.phone || fac.emergencyPhone || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          fac.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {fac.verified ? 'Verified' : 'Standard'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
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
                          onClick={() => requestDeleteFacility(fac.id, fac.name)}
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

      {/* Modal: Add/Edit Ambulance */}
      {showAmbulanceModal && editingAmbulance && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-bold text-[var(--color-medical-navy)] mb-4">
              {editingAmbulance.id ? 'অ্যাম্বুলেন্স তথ্য সম্পাদনা (Edit)' : 'নতুন অ্যাম্বুলেন্স যোগ করুন'}
            </h2>

            <form onSubmit={handleSaveAmbulance} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">প্রোভাইডার নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Sandhani Ambulance Service"
                  value={editingAmbulance.providerName || ''}
                  onChange={(e) => setEditingAmbulance({ ...editingAmbulance, providerName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিভাগ (Division)</label>
                  <input
                    type="text"
                    value={editingAmbulance.division || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, division: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা (District)</label>
                  <input
                    type="text"
                    value={editingAmbulance.district || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
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
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সার্ভিস টাইপ</label>
                  <input
                    type="text"
                    placeholder="Basic / AC / ICU"
                    value={editingAmbulance.serviceType || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, serviceType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
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
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={editingAmbulance.latitude || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, latitude: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={editingAmbulance.longitude || ''}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, longitude: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-[var(--color-medical-red)] hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Facility */}
      {showFacilityModal && editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-bold text-[var(--color-medical-navy)] mb-4">
              {editingFacility.id ? 'হাসপাতাল তথ্য সম্পাদনা (Edit)' : 'নতুন হাসপাতাল যোগ করুন'}
            </h2>

            <form onSubmit={handleSaveFacility} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">হাসপাতালের নাম (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dhaka Medical College Hospital"
                  value={editingFacility.name || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বাংলা নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                  value={editingFacility.nameBn || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, nameBn: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিভাগ (Division)</label>
                  <input
                    type="text"
                    value={editingFacility.division || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, division: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা (District)</label>
                  <input
                    type="text"
                    value={editingFacility.district || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">টাইপ</label>
                  <input
                    type="text"
                    placeholder="Medical College / General / Clinic"
                    value={editingFacility.facilityType || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, facilityType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ফোন</label>
                  <input
                    type="text"
                    value={editingFacility.phone || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-medical-teal)] focus:outline-none"
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-[var(--color-medical-blue)] hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Delete Confirmation (In-App) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-[var(--color-medical-navy)] mb-1">
              রেকর্ড মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              আপনি কি নিশ্চিত যে আপনি <span className="font-bold text-gray-800">"{itemToDelete.name}"</span> ডাটাবেজ থেকে মুছে ফেলতে চান?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                না, বাতিল
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-1"
              >
                {isDeleting ? (
                  <span>মুছে ফেলা হচ্ছে...</span>
                ) : (
                  <span>হ্যাঁ, মুছুন</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
