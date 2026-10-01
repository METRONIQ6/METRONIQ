# ⚖️ MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

> **SIH Problem Statement: SIH26034**  
> *"Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels."*

MetronIQ is a comprehensive, local-first intelligent compliance and enforcement system designed to verify packaged commodity labels against the Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011). It features a local computer vision pipeline (YOLO11n + PaddleOCR), AI-driven declaration extraction, a deterministic compliance rule engine, multi-role dashboards, multilingual support (English, Tamil, Hindi), and verifiable localized PDF audit report generation.

---

## 🏗️ Architecture

MetronIQ operates completely as a local-first system with no external cloud hosting dependency:

```text
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│                   http://localhost:3000                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Port 3000)             │
│        • React 19 / App Router / TypeScript                 │
│        • Multilingual i18n (English, Tamil, Hindi)          │
│        • Role-Based Workspaces (Admin / Officer / Mfg)      │
│        • Proxies /api requests to Backend                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)              │
│        • REST API / JWT Authentication / RBAC               │
│        • Deterministic Legal Metrology Rule Engine          │
│        • Local AI Singleton (PaddleOCR + YOLO11n)           │
│        • Gemini AI Declaration Structuring                  │
│        • FPDF2 Multilingual PDF Report Generator            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Local PostgreSQL Database                   │
│             postgresql://localhost:5432/metroniq            │
│        • Inspections, Reports, Notices, Audit Trails        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

- **AI Product Scanner**: Upload product package images for bounding-box detection and text extraction.
- **Local YOLO Detection**: Detects mandatory declaration regions (MRP area, Net Quantity, Manufacturer details, Consumer Care).
- **Local PaddleOCR**: On-device optical character recognition (`PP-OCRv4`).
- **Declaration Extraction**: Structured metadata extraction powered by Gemini AI.
- **Deterministic Rule Engine**: Direct verification against Legal Metrology Rules, 2011 (MRP format, unit sale price, date declarations, consumer care details).
- **Audit Reports & Defensible PDFs**: Instant localized PDF report generation with embedded native fonts (Noto Sans Tamil, Devanagari, English).
- **Role-Based Workspaces (RBAC)**:
  - **👑 Admin**: System management, user approvals, rule configurations, system-wide geographic analytics (`Admin → Geo Analytics`).
  - **👮 Legal Metrology Officer**: AI label scanning, inspection reviews, role-scoped geographic analytics (`Officer → Geo Analytics`), issuing improvement notices, penalty compounding, e-commerce catalog monitoring.
  - **📦 Manufacturer**: Pre-market compliance validation, notice response submissions, rectification management.
- **Geospatial Compliance Intelligence (Geo Analytics)**:
  - **Admin View (`Admin → Geo Analytics`)**: System-wide spatial heatmap, jurisdiction-level compliance density, high-risk enforcement hotspots, and inspection tracking across national territories.
  - **Officer View (`Officer → Geo Analytics`)**: Role-scoped geospatial enforcement visualization displaying assigned jurisdiction records and regional risk profiles.
  - **Database-Backed Aggregation**: Derives coordinates, compliance rates, and risk density directly from PostgreSQL inspection records and manufacturer jurisdiction registries.
- **Multilingual Support (i18n)**: Seamless live switching across English (`EN`), Tamil (`TA`), and Hindi (`HI`).
- **Light & Dark Mode**: Professional, government-grade visual presentation.

---

## 📋 Prerequisites

Ensure the following tools are installed on your local system:

1. **Node.js**: `v18.x` or `v20.x` (with `npm`)
2. **Python**: `3.10+` / `3.11+` / `3.12+`
3. **PostgreSQL**: `15+` or `16+` running locally on port `5432`
4. **Git**

---

## 📥 Clone the Repository

```powershell
git clone https://github.com/METRONIQ6/METRONIQ.git
cd METRONIQ
```

---

## ⚙️ Environment Configuration

### 1. Backend Configuration (`backend/.env`)

Create `backend/.env` (or copy from `backend/.env.example`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/metroniq
SECRET_KEY=your_secure_random_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 2. Frontend Configuration (`frontend/.env.local`)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 📦 Installation & Database Setup

### Step 1: Backend Setup

Open a **PowerShell** window:

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial system users and rules (if setting up fresh DB)
python seed_users.py
python seed_rules.py
```

### Step 2: Frontend Setup

Open a **second PowerShell** window:

```powershell
cd frontend

# Install Node dependencies
npm install
```

---

## 🚀 Starting MetronIQ Locally

### ✅ Easiest Method — Double-Click Startup (Recommended)

Once the one-time setup is complete, the simplest way to start MetronIQ is using the included startup script:

> **Just double-click `start_metroniq.bat`** in the repository root directory (or run it from any terminal).

What it does automatically:
- 🔓 Frees ports `3000` and `8000` if they are in use
- 🗄️ Starts PostgreSQL service
- ⚙️ Activates the Python virtual environment and starts the FastAPI backend (`uvicorn`)
- 🌐 Installs any missing Node dependencies and starts the Next.js frontend (`npm run dev`)

After a few seconds:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 🔧 Alternative — Manual PowerShell Startup

If you prefer to start services manually (e.g., for debugging), use two PowerShell windows:

#### Window 1 — Backend (FastAPI)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Window 2 — Frontend (Next.js)

```powershell
cd frontend
npm run dev
```

> **Frontend:** [http://localhost:3000](http://localhost:3000)  
> **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)  
> **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)  
> **Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## 🔑 Default Seeded Accounts

The database comes pre-configured with role-segregated test accounts:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **ADMIN** | `admin@metroniq.local` | `password` | User approvals, audit logs, rule configuration, system-wide geo analytics |
| **OFFICER** | `officer@metroniq.local` | `password` | AI product scanner, inspections, role-scoped geo analytics, notices, reinspections, e-commerce monitor |
| **MANUFACTURER** | `manufacturer@metroniq.local` | `password` | Pre-market compliance auditor, notice responses, rectification queue |

---

## 🔍 Verification & Demo Flow

To verify the complete end-to-end pipeline on your local machine:

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. Click **Sign In** and log in with `officer@metroniq.local` / `password`.
3. Navigate to **Scanner** (`/officer/scanner`).
4. Upload a packaged product image or label (JPEG/PNG).
5. The system performs:
   - **Local YOLO Object Detection** for declaration zones.
   - **Local PaddleOCR** for text reading.
   - **Gemini AI** for declaration structuring.
   - **Rule Engine Validation** against Legal Metrology Rules, 2011.
6. Review the resulting **Compliance Report** with detailed checks (MRP, Net Quantity, Dates, Manufacturer).
7. Click **View Full Details** and click **Download PDF Report** to verify multi-page localized PDF generation.

---

## 🛠️ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **Backend fails with DB Connection Error** | PostgreSQL service is stopped or port 5432 is blocked. | Verify PostgreSQL is running (`net start postgresql` or via Services app). Ensure database `metroniq` exists. |
| **Port 8000 or 3000 already in use** | An existing process is listening on the port. | In PowerShell: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process` (repeat for 3000). |
| **`Activate.ps1 cannot be loaded because running scripts is disabled`** | PowerShell Execution Policy restriction. | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell. |
| **`ModuleNotFoundError` on Backend Startup** | Dependencies not installed in active virtual environment. | Ensure venv is active (`.\venv\Scripts\Activate.ps1`) and run `pip install -r requirements.txt`. |
| **PaddleOCR / YOLO Model Initialization Delay** | First-run model initialization loads weights into memory. | The backend AI singleton caches models on startup; subsequent scans execute rapidly. |

---

## 📂 Repository Structure

```text
MetronIQ/
├── frontend/                     # Next.js 16 (React 19, TypeScript, TailwindCSS)
│   ├── src/app/                  # App Router pages (admin, officer, manufacturer, login)
│   ├── src/components/           # Reusable UI components & layouts
│   ├── src/i18n/                 # Multilingual translation dictionaries (EN, TA, HI)
│   ├── src/lib/                  # Auth, utilities, and API client helpers
│   └── package.json
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── ai/                   # Local YOLO & PaddleOCR pipeline
│   │   ├── api/routes/           # API endpoints (scanner, reports, auth, notices, admin)
│   │   ├── core/                 # Database configuration, security, JWT
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic data validation schemas
│   │   └── services/             # Rule engine, PDF generation, enforcement logic
│   ├── alembic/                  # Database migration scripts
│   ├── requirements.txt
│   └── seed_users.py             # User seeding script
├── start_metroniq.bat            # Local startup script
└── README.md                     # Documentation
```
