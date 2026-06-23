<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0077B6,00B4D8,90E0EF&height=230&section=header&text=SehhaTech&fontSize=90&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=Smart%20Healthcare%20Management%20System&descAlignY=62&descSize=22&descColor=CAF0F8" />

<br/>

<img src="./assets/logo.png" alt="SehhaTech Logo" width="160" />

<br/>
<br/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3500&pause=1000&color=0077B6&center=true&vCenter=true&width=750&lines=%F0%9F%8F%A5+Multi-Tenant+Clinic+Management+System;%E2%9A%95%EF%B8%8F+Patient+Portal+%26+Online+Appointment+Booking;%F0%9F%94%90+JWT+%2B+OTP+Secure+Authentication;%F0%9F%9A%80+Deployed+on+Railway+%E2%80%A2+Render+%E2%80%A2+Vercel;%F0%9F%8E%93+DEPI+Full+Stack+.NET+Graduation+Project" alt="Typing SVG" />
</a>

<br/>
<br/>

<!-- ══════════ TECH BADGES ══════════ -->
<img src="https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 10"/>
<img src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white" alt="C#"/>
<img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>

<br/>

<!-- ══════════ DEPLOYMENT BADGES ══════════ -->
<img src="https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway"/>
<img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>

<br/>
<br/>

<!-- ══════════ REPO META BADGES ══════════ -->
<img src="https://img.shields.io/github/stars/abdelrahmanKhalawy/DEPI-Project?style=social" alt="Stars"/>
<img src="https://img.shields.io/github/forks/abdelrahmanKhalawy/DEPI-Project?style=social" alt="Forks"/>
&nbsp;
<img src="https://img.shields.io/badge/DEPI-Graduation%20Project%202025-orange?style=flat-square&logo=graduation-cap" alt="DEPI"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"/>
<img src="https://img.shields.io/badge/Status-Live%20%F0%9F%9F%A2-brightgreen?style=flat-square" alt="Status"/>

</div>

<br/>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🏗️ System Architecture](#-system-architecture)
- [✨ Features](#-features)
  - [🏥 Clinic Management System](#-system-1--multi-tenant-clinic-management)
  - [🧑‍⚕️ Patient Portal](#%EF%B8%8F-system-2--patient-portal)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🌐 Live Demo](#-live-demo)
- [👥 Team](#-team-sehhatech)
- [📄 License](#-license)

---

## 🌟 Overview

<img align="right" src="./assets/logo.png" width="130" alt="SehhaTech"/>

**SehhaTech** is a production-ready, enterprise-grade **Healthcare Management Platform** built as a graduation project for the **Digital Egypt Pioneers Initiative (DEPI) — Full Stack .NET Track**.

The system bridges the gap between clinics and their patients by offering a powerful multi-tenant **Clinic Management System** alongside a patient-facing **Online Appointment Booking Portal** — all powered by a modern **.NET 10 backend** and deployed fully to the cloud.

<br/>

> 💬 *"Bringing Egyptian clinics and patients closer through smart, scalable technology."*

<br/>

### 🎯 Why SehhaTech?

| | Traditional Clinics | 🏥 With SehhaTech |
|:--|:--:|:--:|
| Patient Appointment Booking | 📞 Phone Call Only | 🌐 Online 24/7 |
| Clinic Data Management | 📄 Paper-based | ☁️ Cloud-based |
| Staff Access Control | 🔓 None | 🔐 Role-Based |
| Multi-Clinic Support | ❌ One System All | ✅ Fully Isolated |
| Subscription Model | ❌ | ✅ Annual Plans |

---

## 🏗️ System Architecture

SehhaTech is composed of **two independent systems** sharing a single PostgreSQL database, built on a clean **3-layer architecture**:

<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        🏥  SehhaTech Platform                          ║
╠══════════════════════════════╦═══════════════════════════════════════════╣
║   System 1: Clinic Mgmt     ║      System 2: Patient Portal            ║
║   (Multi-Tenant SaaS)       ║      (Public Self-Service)               ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║  📡 SehhaTech.API            ║  📡 SehhaTech.PatientPortal.API         ║
║  🖥️  sehhatech-frontend       ║  📱 patient-portal-frontend             ║
╠══════════════════════════════╩═══════════════════════════════════════════╣
║               🧠 SehhaTech.Core  (Domain Layer)                        ║
║            🏗️ SehhaTech.Infrastructure  (Data Layer)                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                      🐘  PostgreSQL Database                            ║
╚══════════════════════════════════════════════════════════════════════════╝

          ☁️ Railway          ☁️ Render           🌐 Vercel
       (Clinic API)      (Portal API)       (Both Frontends)
```

</div>

---

## ✨ Features

### 🏥 System 1 — Multi-Tenant Clinic Management

A complete digital operations hub for clinics, with **full data isolation** between tenants.

#### 👤 Role-Based Access Control — 4 Roles

<div align="center">

|  | 🟣 Super Admin | 🔵 Clinic Admin | 🟢 Doctor | 🟡 Receptionist |
|:---|:---:|:---:|:---:|:---:|
| **Who** | Dev Team | Clinic Owner | Medical Staff | Front Desk |
| 🏢 Manage Platform & Subscriptions | ✅ | ❌ | ❌ | ❌ |
| 🏥 Manage Clinic Settings | ✅ | ✅ | ❌ | ❌ |
| 👨‍⚕️ Manage Doctors & Staff | ✅ | ✅ | ❌ | ❌ |
| 📅 Manage Appointments | ✅ | ✅ | ❌ | ✅ |
| 🩺 View Patients & Medical Records | ✅ | ✅ | ✅ | ✅ |
| 💊 Write Prescriptions | ❌ | ❌ | ✅ | ❌ |
| 📊 View Dashboard & Reports | ✅ | ✅ | ✅ | ✅ |

</div>

<br/>

#### 🔑 Key Capabilities

<table>
<tr>
<td width="50%">

**🏢 Clinic Onboarding**
> Register, subscribe annually, and go live in minutes

**📅 Doctor Scheduling**
> Doctors define their own availability & working hours

**💊 Patient Medical Records**
> Full history of visits, diagnoses & prescriptions

</td>
<td width="50%">

**📊 Real-time Dashboard**
> Live statistics for clinic performance

**🔒 Complete Tenant Isolation**
> Zero data leakage between clinics, guaranteed

**💳 Subscription Management**
> Annual billing with Super Admin oversight

</td>
</tr>
</table>

---

### 🧑‍⚕️ System 2 — Patient Portal

Empowering patients to book appointments **online, anytime** — no phone calls needed.

<table>
<tr>
<td width="50%">

- 📝 **Quick Registration** — Simple sign-up flow
- 🔐 **OTP-Based Auth** — Secure, passwordless login
- 📅 **Online Booking** — Choose clinic, doctor & slot
- 📋 **Medical History** — View past visits & prescriptions

</td>
<td width="50%">

- 🔔 **Appointment Reminders** — Never miss a visit
- ↩️ **JWT Token Rotation** — Enhanced session security
- 🏥 **Multi-Clinic Support** — Book across any clinic
- 📱 **Mobile-Responsive** — Works on all devices

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### 🔵 Backend
<img src="https://skillicons.dev/icons?i=dotnet,cs,postgres,git&theme=dark" height="55"/>

### ⚛️ Frontend
<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,html,css&theme=dark" height="55"/>

### ☁️ DevOps & Tools
<img src="https://skillicons.dev/icons?i=github,git,vercel,postman&theme=dark" height="55"/>

</div>

<br/>

<div align="center">

| Layer | Technology | Details |
|:-----:|:----------:|:--------|
| 🔵 API Framework | ASP.NET Core (.NET 10) | Controller-based REST APIs |
| 🗄️ ORM | Entity Framework Core | Code-First with Migrations |
| 🐘 Database | PostgreSQL 16 | Primary data store (shared) |
| 🔐 Authentication | JWT Bearer + OTP | Role-based & Tenant-isolated |
| ⚛️ UI Framework | React 18 + Vite | Fast builds, hot reload |
| 🎨 Styling | Tailwind CSS | Utility-first responsive design |
| ☁️ API Hosting | Railway & Render | Cloud-managed backend |
| 🌐 Frontend Hosting | Vercel | CDN-optimized frontends |

</div>

---

## 📁 Project Structure

```
📦 DEPI-Project/
│
├── 📁 src/
│   │
│   ├── 🔵 SehhaTech.API/                    # Clinic Management REST API
│   │   ├── 📁 Controllers/                   # Endpoint Controllers
│   │   │   ├── SuperAdminController.cs
│   │   │   ├── DoctorController.cs
│   │   │   └── ReceptionController.cs
│   │   └── Program.cs                        # App config & middleware
│   │
│   ├── 🧠 SehhaTech.Core/                   # Domain Layer (Business Logic)
│   │   ├── 📁 Entities/                      # Database Models
│   │   ├── 📁 Interfaces/                    # Repository Contracts
│   │   └── 📁 DTOs/                          # Data Transfer Objects
│   │
│   ├── 🏗️ SehhaTech.Infrastructure/         # Infrastructure Layer
│   │   ├── 📁 Repositories/                  # EF Core Implementations
│   │   ├── 📁 Migrations/                    # DB Migrations
│   │   └── 📁 Services/                      # External Services
│   │
│   ├── 🏥 SehhaTech.PatientPortal.API/       # Patient Portal REST API
│   │   ├── 📁 Controllers/                   # Portal Endpoints
│   │   └── Program.cs                        # App config
│   │
│   ├── ⚛️  sehhatech-frontend/               # Clinic Management UI
│   │   └── 📁 src/
│   │       ├── 📁 components/                # Reusable Components
│   │       └── 📁 pages/                     # Page Views
│   │
│   └── 📱 patient-portal-frontend/           # Patient Booking UI
│       └── 📁 src/
│           ├── 📁 components/                # Reusable Components
│           └── 📁 pages/                     # Page Views
│
├── 📁 assets/                                # Logos & Media
├── 📁 database/                              # DB Scripts & Seeds
├── 📁 docs/                                  # API Documentation
├── 📁 presentation/                          # Slides & Demo Materials
├── 📄 .gitignore
├── 📄 LICENSE
└── 📄 README.md
```

---

## 🚀 Getting Started

### 📋 Prerequisites

| Tool | Version | Download |
|:----:|:-------:|:--------:|
| .NET SDK | 10.0+ | [↗ dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| Node.js | 18.0+ | [↗ nodejs.org](https://nodejs.org/) |
| PostgreSQL | 16+ | [↗ postgresql.org](https://www.postgresql.org/download/) |
| Git | Latest | [↗ git-scm.com](https://git-scm.com/) |

---

### ⚙️ Backend Setup

**1️⃣ Clone the repository**

```bash
git clone https://github.com/abdelrahmanKhalawy/DEPI-Project.git
cd DEPI-Project
```

**2️⃣ Configure Clinic Management API**

```bash
cd src/SehhaTech.API

# Restore NuGet packages
dotnet restore

# Update appsettings.json with your DB connection string:
# "ConnectionStrings": {
#   "DefaultConnection": "Host=localhost;Database=SehhaTech;Username=postgres;Password=yourpassword"
# }

# Apply database migrations
dotnet ef database update

# Run the API → https://localhost:5001
dotnet run
```

**3️⃣ Configure Patient Portal API**

```bash
cd ../SehhaTech.PatientPortal.API

dotnet restore
dotnet ef database update
dotnet run
```

---

### 🎨 Frontend Setup

**4️⃣ Clinic Management Frontend**

```bash
cd ../../src/sehhatech-frontend

npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5001" > .env

npm run dev   # → http://localhost:5173
```

**5️⃣ Patient Portal Frontend**

```bash
cd ../patient-portal-frontend

npm install

echo "VITE_API_URL=http://localhost:5002" > .env

npm run dev   # → http://localhost:5174
```

---

### 🔧 Environment Variables Reference

| Variable | Description | Example |
|:---------|:-----------|:--------|
| `VITE_API_URL` | Clinic Management API base URL | `https://your-api.railway.app` |
| `VITE_PORTAL_API_URL` | Patient Portal API base URL | `https://your-portal.render.com` |
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | `Host=...;Database=SehhaTech;...` |
| `JWT__SecretKey` | JWT signing key | `your-super-secret-key` |

---

## 🌐 Live Demo

<div align="center">

| Service | Platform | Link | Status |
|:-------:|:--------:|:----:|:------:|
| 🔵 Clinic Management API | Railway | [View API →](#) | 🟢 Live |
| 🏥 Patient Portal API | Render | [View API →](#) | 🟢 Live |
| 🖥️ Clinic Frontend | Vercel | [Open App →](#) | 🟢 Live |
| 📱 Patient Portal | Vercel | [Open App →](#) | 🟢 Live |

> 💡 Replace `#` links above with your actual deployment URLs

</div>

---

## 👥 Team SehhaTech

<div align="center">

> 🎓 Built with passion, countless ☕ coffees, and a lot of `git push --force` by the **SehhaTech Team**
> as a graduation project for the **Digital Egypt Pioneers Initiative (DEPI) — Full Stack .NET Track, 2024–2025**

<br/>

<table>
<tr>
<td align="center" width="200">
<b>🏆 Abdelrahman</b><br/>
<sub>Team Lead · Full Stack Dev</sub>
</td>
<td align="center" width="200">
<b>⭐ Maryam</b><br/>
<sub>Backend Developer</sub>
</td>
<td align="center" width="200">
<b>⭐ Shahd</b><br/>
<sub>Backend Developer</sub>
</td>
<td align="center" width="200">
<b>⭐ Baher</b><br/>
<sub>Backend Developer</sub>
</td>
<td align="center" width="200">
<b>⭐ Naglaa</b><br/>
<sub>Backend Developer</sub>
</td>
</tr>
</table>

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<br/>

### 🌟 If SehhaTech impressed you, drop a ⭐ — it means the world to us! 🌟

<br/>

**Made with ❤️ in Egypt 🇪🇬 by Team SehhaTech**

*Digital Egypt Pioneers Initiative (DEPI) · Full Stack .NET Track · 2025–2026*

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0077B6,00B4D8,90E0EF&height=130&section=footer" />

</div>
