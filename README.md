# ⚖️ MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

> **SIH Problem Statement: SIH26034**  
> *"Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels."*

MetronIQ is a smart system for checking compliance of packaged commodities under the Legal Metrology (Packaged Commodities) Rules, 2011 by scanning product images and labels. It integrates YOLO object detection, local PaddleOCR text extraction, Generative AI for declaration parsing, and a deterministic regulation rule engine.

---

## 🚀 Key Features

- **AI product scanner**: Upload images/labels for automated bounding box detection and OCR.
- **YOLO11n**: Detects labeled item regions precisely (MRP Area, Net Quantity, Manufacturer Info, Consumer Care).
- **PaddleOCR**: Local extraction of printed text from the bounding box regions.
- **Declaration Extraction**: Structured metadata generation powered by Gemini AI.
- **Deterministic Compliance Validation**: Evaluates MRP, quantity, manufacturer address, and best before dates directly against the rules.
- **Admin Dashboard**: Approvals, system administration, and analytics.
- **Officer Dashboard**: Compliance verification, notice drafts, e-commerce monitoring, and reporting.
- **Manufacturer Workspace**: Pre-market application and secure rectification workflow.
- **Role-Based Access Control (RBAC)**: Segregated government access and manufacturer self-registration.
- **Inspection Workflow**: Traceable review processes.
- **Notices / Rectification**: Structured compliance improvement queue for both sides.
- **Reinspection & Enforcement**: Follow-up verifications and penalty compounding steps.
- **Reports / PDF Generation**: Defensible, comprehensive, localized inspection PDFs.
- **E-Commerce Monitoring**: Crawler tools to flag online listings for review.
- **MetronIQ Copilot**: Context-aware AI assistant helping officers interpret rule requirements on the dashboard.
- **Multilingual (i18n)**: English (EN), Tamil (TA), and Hindi (HI). Uses native typography (e.g. Noto Sans Tamil).
- **Light / Dark Mode & Responsive UI**.
- **Audit Trail & PostgreSQL persistence**.

---

## 🔒 Role-Based Access Control (RBAC)

MetronIQ employs strict data segregation verified by backend JWT authorization protecting restricted APIs:

| Role | Access Permissions |
|---|---|
| 👑 **ADMIN** | Full control over user management, admin analytics, officer approvals, and system configuration. |
| 👮 **OFFICER** | Government execution of product verifications, automated AI scanner, inspection review, issuing legal notices, verifying rectifications, reporting, e-commerce evaluations, and interacting with MetronIQ Copilot. |
| 📦 **MANUFACTURER** | Isolated workspace. Self-registration, product self-audits before market deployment, communication on government notices, resolving rectification queues, and viewing their own compliance history. Cannot view competitor data. |

> Backend logic rigorously enforces ownership — authenticated users can only interact with entities explicitly permitted by their assigned role.

---

## 🏗️ Technology Stack

**Frontend:**
- Next.js 16 (React 19, App Router)
- TypeScript
- TailwindCSS v4
- Shadcn/UI
- Recharts (analytics)
- Leaflet (maps)
- next-themes
- Custom i18n implementation (EN, TA, HI)

**Backend:**
- FastAPI (Python 3.12, Uvicorn)
- PostgreSQL
- SQLAlchemy
- Alembic migrations
- JSON Web Tokens (JWT) + bcrypt (authentication)
- REST API architecture
- Playwright & httpx (crawler operations)
- APScheduler (background scheduling)
- FPDF2 (PDF logic with embedded i18n fonts)

**AI / ML:**
- PaddleOCR
- Ultralytics YOLO11n
- OpenCV
- Google Gemini API

---

## ⚙️ Architecture & Local Execution

MetronIQ can run either as a fully local environment or in a hybrid cloud configuration.

### Local Host Architecture

```text
Officer / Manufacturer Browser (http://localhost:3000)
    │
    ▼
Next.js Frontend (Port 3000, App Router, React 19, TailwindCSS)
    │
    ▼
FastAPI Backend (http://127.0.0.1:8000)
    ├── Local In-Memory AI Singleton (Ultralytics YOLO11n + PaddleOCR PP-OCRv4)
    ├── Google Gemini API (Structured Legal Metrology Declaration Extraction)
    ├── Deterministic Rule Engine (PCR 2011 Compliance Verification)
    ├── Playwright Web Scraper (E-Commerce Catalog & Snapshot Crawler)
    └── PostgreSQL Database (Port 5432, metroniq)
```

---

## 🔑 Login Credentials

The local database is seeded with role-segregated test accounts:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **ADMIN** | `admin@metroniq.local` | `password` | User approvals, global audit logs, rule configuration, geo analytics |
| **OFFICER** | `officer@metroniq.local` | `password` | AI product scanner, inspections, legal notices, reinspections, e-commerce crawler |
| **MANUFACTURER** | `manufacturer@metroniq.local` | `password` | Pre-market compliance auditor, notice responses, rectification submission queue |

---

## 💻 Setup & Run Instructions (Windows / Local Host)

### 1. Clone repository
```bash
git clone https://github.com/METRONIQ6/METRONIQ.git
cd METRONIQ
```

### 2. Configure environment variables
Backend (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/metroniq
SECRET_KEY=your_secure_randomly_generated_string_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Install dependencies
Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
alembic upgrade head
cd ..
```

Frontend:
```bash
cd frontend
npm install
cd ..
```

### 4. Start Local Host Services
Simply double-click or run the repository batch script:
```cmd
start_metroniq.bat
```

This starts:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🌐 Internationalization (i18n)

The platform features seamless switching without page-reloads across:
- **English** (EN)
- **Tamil** (TA) — Rendered elegantly using native typography (Noto Sans Tamil)
- **Hindi** (HI)

---

## 🛡️ Security Best Practices

- **Authentication**: JWT access tokens manage session securely.
- **Password Strength**: Hashed strictly using bcrypt.
- **Authorization**: Backend RBAC middleware limits data ownership strictly per user.
- **Cross-Origin**: CORS handles authorized Vercel/localhost domains explicitly.
- **Exclusion**: All secrets are strictly ignored in source control and remain in `.env`.
- **SSRF Protections**: Strict URL validations where utilized in the platform crawler functions.

---

## 🧪 Testing / Verification

MetronIQ implements tests with temporary test databases, enforcing strict process workflows properly decoupled from the primary PostgreSQL storage. Testing systematically guards the product pipeline so that technical issues are intercepted and gracefully isolated without causing false legal penalties against citizens or manufacturers.

---

## 📂 Project Structure

```text
MetronIQ/
├── frontend/                # Next.js 16 application
│   ├── src/app/             # Pages (Admin, Officer, Manufacturer, Login)
│   ├── src/i18n/            # Dynamic Translation files
│   └── src/components/      # UI logic and layouts
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/routes/      # Endpoint Logic
│   │   ├── ai/              # Scanner pipeline (YOLO array, PaddleOCR, Evidence)
│   │   ├── services/        # Enforcements, Notices, Compliance
│   │   ├── models/          # SQLAlchemy PostgreSQL models
│   │   └── core/            # Database hooks and Config
│   ├── alembic/             # Version-controlled migrations
│   └── requirements.txt
├── start_metroniq.bat       # Demo Bootstrapper (Vercel + Tunnel + FastAPI)
└── README.md
```
