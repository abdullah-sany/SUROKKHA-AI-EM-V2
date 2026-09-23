/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppHeader } from './components/layout/AppHeader';
import HomePage from './pages/HomePage';
import EmergencyHub from './pages/EmergencyHub';
import HealthcareDirectory from './pages/HealthcareDirectory';
import AmbulanceDirectory from './pages/AmbulanceDirectory';
import EmergencyContacts from './pages/EmergencyContacts';
import NearbyFacilities from './pages/NearbyFacilities';
import FirstAidGuide from './pages/FirstAidGuide';
import AdminDashboard from './pages/AdminDashboard';
import MeetDeveloper from './pages/MeetDeveloper';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ShieldCheck, Code2, Heart } from 'lucide-react';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[var(--color-off-white)] font-sans">
            <AppHeader />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/emergency" element={<EmergencyHub />} />
                <Route path="/healthcare" element={<HealthcareDirectory />} />
                <Route path="/ambulance" element={<AmbulanceDirectory />} />
                <Route path="/emergency-contacts" element={<EmergencyContacts />} />
                <Route path="/nearby" element={<NearbyFacilities />} />
                <Route path="/first-aid" element={<FirstAidGuide />} />
                <Route path="/meet-developer" element={<MeetDeveloper />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-[var(--color-muted-gray)]">
              <div className="max-w-7xl mx-auto px-4">
                <p>&copy; {new Date().getFullYear()} SUROKKHA AI BD. All rights reserved.</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
                  <span>Emergency & Healthcare System Module 1</span>
                  <span className="text-gray-300">•</span>
                  <Link 
                    to="/meet-developer" 
                    className="text-[var(--color-medical-navy)] hover:text-[var(--color-medical-red)] font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Meet the Developer (MD Abdullah Sany)</span>
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link to="/admin" className="text-gray-400 hover:text-[var(--color-medical-red)] flex items-center space-x-1 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
