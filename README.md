# 🛡️ SUROKKHA AI — Emergency Healthcare & Rescue Platform

<p align="center">
  <strong>A location-aware emergency healthcare, disaster response and rescue assistance platform for Bangladesh.</strong>
</p>

<p align="center">
  <a href="https://surokkha-ai-em-v2.onrender.com/">🌐 Live Demo</a> •
  <a href="https://github.com/abdullah-sany/SUROKKHA-AI-EM-V2">💻 GitHub</a>
</p>

---

## 🚨 About SUROKKHA AI

**SUROKKHA AI** is a Bangladesh-focused emergency healthcare and rescue assistance platform designed to help people quickly find healthcare facilities, ambulances, emergency contacts, disaster shelters, volunteers and other emergency resources.

Instead of acting as only an AI chatbot or a static hospital directory, SUROKKHA AI combines:

* 📍 Location-based services
* 🏥 Healthcare facility discovery
* 🚑 Ambulance information
* 🆘 Emergency & SOS assistance
* 🌊 Cyclone & flood shelter discovery
* 🧑‍🚒 Volunteer & rescue squad directory
* 🩹 First-aid guidance
* 🗺️ OpenStreetMap-based mapping
* 📴 Offline/PWA support
* 🔥 Firebase authentication & cloud database
* 🛣️ Route calculation
* 📱 One-touch emergency actions

The goal is to provide a single digital platform for **emergency information, healthcare discovery and disaster-response assistance**.

---

# ✨ Key Features

## 🏥 Healthcare Directory

Find healthcare facilities using location and facility information.

### Features

* Hospital search
* Diagnostic center search
* Facility filtering
* District/division information
* Distance-based discovery
* Phone/contact information
* Map-based location
* Navigation support
* Multiple data sources

---

## 🚑 Ambulance Directory

Quickly discover available ambulance services.

### Features

* Ambulance directory
* Contact information
* Location information
* Direct calling
* Search and filtering

---

## 📍 Nearby Emergency Facilities

The platform can use the user's location to discover nearby emergency resources.

The system combines different sources including:

```text
Local/Verified Data
        +
OpenStreetMap
        +
Overpass API
        +
Photon
        +
Nominatim
        ↓
Location Processing
        ↓
Nearby Emergency Facilities
```

This allows the application to provide more than a simple static list.

---

# 🆘 Emergency & SOS System

SUROKKHA AI includes an emergency assistance workflow designed for situations where the user may need immediate help.

Users can provide information such as:

* 📍 Current location
* 👥 Number of trapped people
* 👶 Vulnerable people
* 🌊 Water level
* 📞 Contact number
* 📝 Additional emergency information

The platform can provide quick actions such as:

* Emergency call
* WhatsApp SOS
* SMS
* Location sharing

---

# 🌊 Cyclone & Flood Shelter Locator

A dedicated disaster-response module helps users discover nearby shelters.

### Includes

* Shelter directory
* Location-based discovery
* Map view
* Distance information
* Shelter details
* Disaster-oriented emergency information

The system is designed around Bangladesh's common disaster scenarios such as:

* 🌊 Flood
* 🌀 Cyclone
* 🌧️ Heavy rainfall
* 🚨 Local emergencies

---

# 🧑‍🚒 Volunteer & Rescue Squad

SUROKKHA AI includes a volunteer/rescue directory designed to connect people with emergency assistance resources.

### Features

* Volunteer registration
* Rescue squad information
* Location
* Contact information
* Emergency assistance discovery
* Verification workflow

> Volunteer verification and administrative authorization are being strengthened as part of the security architecture.

---

# 🩹 First Aid Guide

The platform provides accessible first-aid information for common emergency situations.

The objective is to provide users with quick, understandable guidance while encouraging professional medical assistance when necessary.

---

# 🗺️ Mapping & Navigation

SUROKKHA AI uses open mapping technologies to provide location-aware emergency services.

### Technologies

* OpenStreetMap
* Leaflet
* React Leaflet
* Overpass API
* Photon
* Nominatim
* OSRM

### Capabilities

```text
User Location
     ↓
Nearby Search
     ↓
Facility Discovery
     ↓
Distance Calculation
     ↓
Map Visualization
     ↓
Road Route
```

---

# 📴 Offline & PWA Support

Emergency applications may need to remain useful when internet connectivity is poor.

SUROKKHA AI therefore includes Progressive Web App capabilities and offline-oriented functionality.

### Includes

* Service Worker
* Cached resources
* Offline detection
* Local data fallback
* Installable PWA
* Cached map/data support

The objective is to maintain access to important emergency information even under unstable connectivity.

---

# 🔥 Authentication & Cloud Infrastructure

The project uses Firebase for authentication and cloud-based data management.

### Firebase Features

* Firebase Authentication
* Firestore Database
* User management
* Cloud data storage
* Role-based authorization architecture

Administrative permissions are designed to be separated from normal user authentication.

---

# 🧩 System Architecture

```text
                         ┌─────────────────────┐
                         │     SUROKKHA AI     │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          Healthcare           Disaster            Rescue
           Services            Response           Services
                 │                  │                  │
        ┌────────┼───────┐     ┌────┼────┐       ┌─────┼─────┐
        │        │       │     │         │       │           │
     Hospitals Ambulance First  Shelters  SOS  Volunteers  Rescue
                 Aid
        │
        ▼
 ┌───────────────────────┐
 │ Location Intelligence │
 └───────────┬───────────┘
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
   OSM    Overpass   Routing
     │       │        │
     └───────┼────────┘
             ▼
      Emergency Results
             │
             ▼
       User Assistance
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide Icons

## Backend

* Node.js
* Express
* TypeScript

## Database & Authentication

* Firebase Authentication
* Firebase Firestore

## Maps & Location

* Leaflet
* React Leaflet
* OpenStreetMap
* Overpass API
* Photon
* Nominatim
* OSRM

## PWA

* Service Worker
* Browser Cache
* Local Storage
* Offline Detection

---

# 📊 Current Data Coverage

The current project dataset includes approximately:

| Resource                        | Records |
| ------------------------------- | ------: |
| 🏥 Healthcare Facilities        |     319 |
| 🚑 Ambulances                   |      49 |
| 🌊 Disaster Shelters            |      66 |
| 🧑‍🚒 Volunteer / Rescue Squads |      20 |

Data sources include official/public registries and open mapping resources where applicable.

> Emergency information can change over time. Users should verify critical information with the relevant authority whenever possible.

---

# 🔐 Security

Security is an active part of the project's development.

The security architecture includes:

* Firebase Authentication
* Protected admin routes
* Role-based admin authorization
* Firestore security rules
* Server-side privileged operations
* Environment-based secrets
* Input validation
* Volunteer verification
* Administrative controls

### Security Principle

```text
Normal User
     │
     ├── Public emergency information
     ├── Personal actions
     └── Own requests
     
Admin
     │
     ├── Verified administrative role
     ├── Data management
     ├── Volunteer verification
     └── Administrative operations
```

---

# 📱 Progressive Web App

SUROKKHA AI is designed as an installable web application.

Users can access the platform through a modern browser and install it as a PWA on supported devices.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/abdullah-sany/SUROKKHA-AI-EM-V2.git
```

```bash
cd SUROKKHA-AI-EM-V2
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file based on the project's required environment variables.

Example:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> Never commit private keys, service-account credentials or other server secrets to GitHub.

## 4. Start development server

```bash
npm run dev
```

Then open the local URL shown by Vite.

---

# 📂 Project Structure

```text
SUROKKHA-AI-EM-V2/
│
├── components/
│   ├── emergency/
│   ├── healthcare/
│   ├── rescue/
│   ├── shelter/
│   └── ...
│
├── contexts/
│   └── AuthContext.tsx
│
├── data/
│   ├── hospitals/
│   ├── ambulances/
│   ├── shelters/
│   └── volunteers/
│
├── services/
│   ├── firebase/
│   ├── location/
│   ├── routing/
│   └── ...
│
├── server/
│
├── public/
│
├── App.tsx
├── main.tsx
├── firestore.rules
├── package.json
├── vite.config.ts
└── README.md
```

> The exact structure may evolve as the project is refactored and additional modules are introduced.

---

# 🔄 Emergency Data Flow

```text
User
 │
 ▼
Location / Emergency Request
 │
 ▼
Surokkha AI
 │
 ├──────────────► Local/Verified Data
 │
 ├──────────────► Firebase
 │
 ├──────────────► OpenStreetMap
 │
 ├──────────────► Overpass
 │
 └──────────────► Routing Services
 │
 ▼
Emergency Information
 │
 ├── Hospital
 ├── Ambulance
 ├── Shelter
 ├── Volunteer
 ├── First Aid
 └── Emergency Contact
 │
 ▼
User Action
 │
 ├── Call
 ├── SMS
 ├── WhatsApp
 ├── Navigation
 └── SOS
```

---

# 🎯 Project Objectives

SUROKKHA AI was developed with several goals:

### 1. Faster Emergency Discovery

Help users find relevant emergency resources without searching across multiple platforms.

### 2. Location-Aware Assistance

Use the user's location to provide geographically relevant emergency information.

### 3. Disaster Response

Support people during floods, cyclones and other emergency situations.

### 4. Accessibility

Provide simple interfaces and Bengali/English support for a wider range of users.

### 5. Offline Resilience

Maintain access to important information when network connectivity is limited.

### 6. Connected Emergency Ecosystem

Bring healthcare facilities, ambulances, shelters, volunteers and emergency actions into one platform.

---

# 🏆 Innovation Focus

The project focuses on combining several technologies into one emergency-response ecosystem rather than building another standalone chatbot.

### Core Innovation Areas

* 📍 Location intelligence
* 🗺️ Open mapping
* 📴 Offline-first capabilities
* 🆘 Emergency workflow
* 🌊 Disaster response
* 🧑‍🚒 Community rescue network
* 🔥 Cloud infrastructure
* 📱 Progressive Web App
* 🔄 Multiple data-source integration

---

# 🔮 Future Roadmap

Planned improvements include:

* [ ] AI-powered health guidance
* [ ] Prescription analysis
* [ ] Medicine information integration
* [ ] Improved emergency triage
* [ ] Advanced hospital service availability
* [ ] Real-time ambulance tracking
* [ ] Stronger volunteer verification
* [ ] Advanced admin analytics
* [ ] Emergency notification system
* [ ] Improved offline synchronization
* [ ] More Bangladesh-specific datasets
* [ ] Advanced disaster-response coordination

---

# ⚠️ Medical & Emergency Disclaimer

SUROKKHA AI is an emergency information and assistance platform.

It does **not** replace:

* Doctors
* Hospitals
* Emergency responders
* Ambulance services
* Government authorities
* Professional medical diagnosis

Information displayed by the platform may become outdated or inaccurate. For serious or life-threatening situations, users should contact the appropriate emergency service or seek professional medical assistance immediately.

---

# 👨‍💻 Developer

## MD Abdullah Sany

**Developer & Creator of SUROKKHA AI**

I built SUROKKHA AI with the goal of exploring how modern web technologies, location intelligence, cloud services and emergency-response workflows can be combined to create something practically useful for people in Bangladesh.

The project is continuously evolving through new modules, security improvements, data verification and real-world testing.

---

# 📬 Connect

* 🌐 Portfolio: https://abdullah-sany.netlify.app/
* 💻 GitHub: https://github.com/abdullah-sany
* 📸 Instagram: https://instagram.com/abdullah_sany_07
* 📘 Facebook: https://facebook.com/md.abdullah.sany.07

---

# 📄 License

This project is developed as an independent software project.

Please check the repository license and individual data-source terms before redistributing or commercially using project data.

---

<p align="center">

### 🛡️ SUROKKHA AI

**Technology for faster emergency assistance.**

Made with ❤️ for Bangladesh 🇧🇩

</p>
