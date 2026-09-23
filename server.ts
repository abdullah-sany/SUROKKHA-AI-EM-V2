import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const rootDir = process.cwd();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Mock Database (In-Memory) ---
let healthcareFacilities = [
  { id: 'hf-1', name: 'Dhaka Medical College Hospital', nameBn: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', facilityType: 'Medical College Hospital', division: 'Dhaka', district: 'Dhaka', area: 'Bakshibazar', ownership: 'Public', phone: '+880255165088', emergencyPhone: '+880255165088', latitude: 23.7257, longitude: 90.3978, verified: true, source: 'MOHFW', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-2', name: 'Kurmitola General Hospital', nameBn: 'কুর্মিটোলা জেনারেল হাসপাতাল', facilityType: 'Hospital', division: 'Dhaka', district: 'Dhaka', area: 'Kurmitola', ownership: 'Public', phone: '+880255062201', emergencyPhone: '+8801769010200', latitude: 23.8152, longitude: 90.4004, verified: true, source: 'MOHFW', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-3', name: 'Square Hospitals Ltd.', nameBn: 'স্কয়ার হাসপাতাল', facilityType: 'Private Hospital / Clinic', division: 'Dhaka', district: 'Dhaka', area: 'Panthapath', ownership: 'Private', phone: '+88028144400', emergencyPhone: '+8801713377775', latitude: 23.7533, longitude: 90.3814, verified: true, source: 'DGHS', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-4', name: 'Evercare Hospital Dhaka', nameBn: 'এভারকেয়ার হাসপাতাল', facilityType: 'Private Hospital / Clinic', division: 'Dhaka', district: 'Dhaka', area: 'Bashundhara', ownership: 'Private', phone: '+8809666710678', emergencyPhone: '+8801714090000', latitude: 23.8105, longitude: 90.4312, verified: true, source: 'DGHS', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-5', name: 'Chittagong Medical College Hospital', nameBn: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', facilityType: 'Medical College Hospital', division: 'Chattogram', district: 'Chattogram', area: 'Panchlaish', ownership: 'Public', phone: '+88031619597', emergencyPhone: '+88031619597', latitude: 22.3569, longitude: 91.8268, verified: true, source: 'MOHFW', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-demo-1', name: '[DEMO DATA] Central Care Clinic', nameBn: '', facilityType: 'Clinic', division: 'Dhaka', district: 'Dhaka', area: 'Gulshan', ownership: 'Private', phone: '+8801XXXXXXXXX', emergencyPhone: '', latitude: 23.7925, longitude: 90.4078, verified: false, source: 'User Submission', lastVerifiedAt: '2023-01-01T00:00:00Z' },
  { id: 'hf-6', name: 'Lazz Pharma', nameBn: 'লাজ ফার্মা', facilityType: 'Pharmacy', division: 'Dhaka', district: 'Dhaka', area: 'Dhanmondi', ownership: 'Private', phone: '+88029615286', emergencyPhone: '', latitude: 23.7461, longitude: 90.3742, verified: true, source: 'DGHS', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-7', name: 'Tamanna Pharmacy', nameBn: 'তামান্না ফার্মেসি', facilityType: 'Pharmacy', division: 'Dhaka', district: 'Dhaka', area: 'Mirpur', ownership: 'Private', phone: '+88029000000', emergencyPhone: '', latitude: 23.8052, longitude: 90.3696, verified: true, source: 'DGHS', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'hf-8', name: 'Al-Madina Pharmacy', nameBn: 'আল-মদিনা ফার্মেসি', facilityType: 'Pharmacy', division: 'Chattogram', district: 'Chattogram', area: 'Agrabad', ownership: 'Private', phone: '+880312500000', emergencyPhone: '', latitude: 22.3214, longitude: 91.8087, verified: true, source: 'User Submission', lastVerifiedAt: '2023-10-01T10:00:00Z' }
];

// --- Load Imported Hospitals ---
try {
  const importedHospitalsPath = path.join(rootDir, 'src', 'data', 'hospitals.json');
  if (fs.existsSync(importedHospitalsPath)) {
    const importedData = JSON.parse(fs.readFileSync(importedHospitalsPath, 'utf8'));
    healthcareFacilities = [...healthcareFacilities, ...importedData];
  }
} catch (error) {
  console.error("Error loading imported hospitals:", error);
}

let ambulances = [
  { id: 'amb-1', providerName: 'Al Markazul Islami Ambulance', division: 'Dhaka', district: 'Dhaka', area: 'Mohammadpur', phone: '+88029127867', serviceType: 'ICU & Basic', latitude: 23.7658, longitude: 90.3584, verified: true, source: 'Provider Direct', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'amb-2', providerName: 'Anjuman Mufidul Islam Ambulance', division: 'Dhaka', district: 'Dhaka', area: 'Kakrail', phone: '+88029336611', serviceType: 'Basic', latitude: 23.7381, longitude: 90.4074, verified: true, source: 'Provider Direct', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'amb-3', providerName: 'Red Crescent Ambulance Service', division: 'Chattogram', district: 'Chattogram', area: 'Andarkilla', phone: '+88031616781', serviceType: 'Basic', latitude: 22.3364, longitude: 91.8361, verified: true, source: 'Provider Direct', lastVerifiedAt: '2023-10-01T10:00:00Z' }
];

// --- Load Imported Ambulances ---
try {
  const importedAmbulancesPath = path.join(rootDir, 'src', 'data', 'ambulances.json');
  if (fs.existsSync(importedAmbulancesPath)) {
    const importedData = JSON.parse(fs.readFileSync(importedAmbulancesPath, 'utf8'));
    ambulances = importedData;
  }
} catch (error) {
  console.error("Error loading imported ambulances:", error);
}

let emergencyContacts = [
  { id: 'ec-1', name: 'National Emergency Service', category: 'National Emergency', phone: '999', verified: true, source: 'Government of Bangladesh', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'ec-2', name: 'Health Call Center', category: 'Medical Emergency', phone: '16263', verified: true, source: 'MOHFW', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'ec-3', name: 'Fire Service & Civil Defense', category: 'Fire Service', phone: '16163', verified: true, source: 'FSCD', lastVerifiedAt: '2023-10-01T10:00:00Z' },
  { id: 'ec-4', name: 'National Help Desk (Info)', category: 'National Emergency', phone: '333', verified: true, source: 'Government of Bangladesh', lastVerifiedAt: '2023-10-01T10:00:00Z' }
];

// --- API Routes ---

app.get("/api/healthcare", (req, res) => {
  const { search, division, district, facilityType, ownership, verified } = req.query;
  
  let results = [...healthcareFacilities];
  
  if (search) {
    const s = (search as string).toLowerCase();
    results = results.filter(f => f.name.toLowerCase().includes(s) || (f.nameBn && f.nameBn.includes(s)) || f.area.toLowerCase().includes(s));
  }
  
  if (division) results = results.filter(f => f.division === division);
  if (district) results = results.filter(f => f.district === district);
  if (facilityType) results = results.filter(f => f.facilityType === facilityType);
  if (ownership) results = results.filter(f => f.ownership === ownership);
  
  if (verified !== undefined) {
    if (verified === 'true') results = results.filter(f => f.verified === true);
    else if (verified === 'false') results = results.filter(f => f.verified === false);
  }
  
  res.json(results);
});

app.get("/api/healthcare/:id", (req, res) => {
  const result = healthcareFacilities.find(f => f.id === req.params.id);
  if (!result) return res.status(404).json({ error: "Facility not found" });
  res.json(result);
});

app.get("/api/ambulances", (req, res) => {
  const { search, division, district, area } = req.query;
  
  let results = [...ambulances];
  
  if (search) {
    const s = (search as string).toLowerCase();
    results = results.filter(a => a.providerName.toLowerCase().includes(s) || a.area.toLowerCase().includes(s));
  }
  
  if (division) results = results.filter(a => a.division === division);
  if (district) results = results.filter(a => a.district === district);
  if (area) {
    const aSearch = (area as string).toLowerCase();
    results = results.filter(a => a.area.toLowerCase().includes(aSearch));
  }
  
  res.json(results);
});

app.get("/api/emergency-contacts", (req, res) => {
  res.json(emergencyContacts);
});



// --- Vite Middleware & Fallback ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
