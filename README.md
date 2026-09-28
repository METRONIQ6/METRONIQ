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

## ⚙️ Architecture & Scanner Workflow

### Deployment / Demo Architecture

- **Frontend Hosting**: Vercel (Publicly accessible)
- **Backend Hosting**: Self-hosted Fast API via Cloudflare Tunnel. (Running securely from a local designated demo machine).
- **Database Hosting**: Local PostgreSQL mapped to backend.
- **AI Infrastructure**: Local YOLO11n & PaddleOCR natively processed by the backend.

```text
User Browser / Admin
    │
    ▼
Vercel Frontend (Next.js)
    │
    ▼
Cloudflare Public Tunnel (https://*.trycloudflare.com)
    │
    ▼
Self-Hosted FastAPI Backend (Running Locally on Demo Machine)
    │                           │                      │
    ▼                           ▼                      ▼
PostgreSQL (Local DB)     Local PaddleOCR       YOLO11n Predictor
```

> ⚠️ **Demo Limitation**: Because backend APIs and local AI models run on a self-hosted computer via Cloudflare Tunnel, the designated host laptop **must remain powered on and connected to the internet** during the demo. This is a local demo infrastructure and not permanent 24/7 cloud hosting.

### Scanner Workflow

When an image is submitted:

1. **Product Image** → uploaded to backend
2. **YOLO** → determines precise label coordinates
3. **PaddleOCR** → runs over coordinates to extract raw strings
4. **Declaration Extraction** (Gemini) → translates raw tokens into structured fields
5. **Deterministic Legal Metrology Rule Engine** → runs rigid validation rules against values
6. **Risk/Compliance Result** → categorizes result as PASS, FAIL, or NOT VERIFIED
7. **Evidence & Logs** → snapshots saved
8. **PostgreSQL** → final records persisted
9. **Reports** → available via frontend tables or PDF export

> ⚠️ **Safe Failure Behavior**: If PaddleOCR or Gemini is unavailable or errors out during a scan, the execution seamlessly degrades to a **NOT VERIFIED / Technical Review** status. OCR failure does **NOT** result in an automatic compliance FAIL against the manufacturer. A human officer is alerted to inspect the image manually.

---

## 💻 Setup Instructions (Windows)

The current self-hosted architecture is automated via the repository batch script.

### 1. Clone repository
```bash
git clone https://github.com/TeamMetronIQ/MetronIQ.git
cd MetronIQ
```

### 2. Configure environment variables
Create a `.env` file in the `backend` folder based on `.env.example`. 
```env
DATABASE_URL=postgresql://user:password@localhost:5432/metroniq
GEMINI_API_KEY=AIzaSy...
SECRET_KEY=a_strong_random_secret_string
```
*(Never include real secrets, tokens, or API keys in source control.)*

### 3. Install dependencies
*(Assuming Python and Node.js are available)*
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
cd ..

cd frontend
npm install
cd ..
```

### 4. Start PostgreSQL
Ensure the PostgreSQL service is active locally (default port 5432) and the `metroniq` database is created.

### 5. Run Demo Setup
Use the root batch file, which will automatically bind your backend to an active Cloudflare Tunnel and orchestrate Vercel to reflect the new API tunnel endpoint.
```cmd
start_metroniq.bat
```

### 6. Open MetronIQ
Wait for the terminal script to complete deployment synchronization, then visit your configured Vercel frontend URL.

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
