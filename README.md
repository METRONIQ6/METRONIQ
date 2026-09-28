# ⚖️ MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

> **SIH Problem Statement: SIH26034**  
> *"Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels."*

MetronIQ is a robust, enterprise-grade software system designed to evaluate product packaging against live **Legal Metrology (Packaged Commodities) Rules, 2011**. By integrating YOLO object detection, PaddleOCR, Generative AI declaration extraction, and a deterministic regulation rule engine, MetronIQ serves as the central operational backbone for Government Enforcement Directorates.

---

## 🚀 Key Platform Capabilities

### 1. AI Product Compliance Scanner
- Upload product imagery for automated scanning.
- **YOLO** detects labeled regions (MRP Area, Net Quantity, Manufacturer Info, Consumer Care).
- **PaddleOCR** (PP-OCRv4) extracts text from detected regions.
- **Gemini AI Declaration Extractor** normalizes raw OCR output into structured compliance declarations.
- Deterministic **Legal Metrology Rule Engine** evaluates MRP, Net Quantity, Manufacturer Address, Best Before Date, and other mandatory fields.
- Renders legally defensible **PASS / FAIL / NOT VERIFIED** evaluations.
- OCR failure returns `NOT VERIFIED / OCR SERVICE UNAVAILABLE` — never auto-fails the product.

### 2. Full-Stack Regulatory Enforcement Lifecycle
- **Improvement Notices**: Generate formal notices targeting deficient manufacturers.
- **Rectification Workflow**: Manufacturers submit corrections for government review.
- **Reinspection Queues**: Intelligent scheduling for flagged product follow-ups.
- **Enforcement & Legal Dockets**: Compounding penalties and legal interventions with audit trails.

### 3. E-Commerce Auto Monitor
- Deterministic E-Commerce URL crawler using Fast HTTP + Playwright DOM fallback.
- Cleanly separates **technical crawl states** (SSRF-blocked, timeout, unreachable) from **legal compliance failures**.
- Automatic scheduled scans (Hourly / Daily / Weekly).

### 4. MetronIQ Copilot (AI)
- Context-aware virtual assistant powered by **Google Gemini**.
- Helps officers interpret complex Legal Metrology requirements alongside the active dashboard.

### 5. Multilingual Support
- Fully localized in **English (EN)**, **Tamil (தமிழ், TA)**, and **Hindi (हिन्दी, HI)**.
- Language-aware typography with dedicated **Noto Sans Tamil** font for Tamil rendering.
- Dynamic language switching without page reload.

---

## 🔒 Security & Role-Based Access Control (RBAC)

Government-level authorization with strict data segregation:

| Role | Access |
|---|---|
| 👑 **Administrator** | Full control: user management, rule configuration, analytics, geo-dashboard, officer approval/rejection |
| 👮 **Government Officer** | Legal verification, AI scanner, inspection management, notices, enforcement, reports, e-commerce monitor, Copilot |
| 📦 **Manufacturer** | Private silo: product registry, pre-market compliance audit, government submissions, rectification center, compliance history |

Officers require Admin approval before gaining access. Manufacturers self-register and operate in isolated ownership contexts.

---

## 🏗️ Architecture & Stack

### Frontend
- **Framework**: Next.js 16 (React 19 / App Router)
- **Styling**: TailwindCSS v4 + Shadcn/UI components
- **Data Fetching**: Parallelized REST API calls via `Promise.all`
- **Visuals**: Recharts (analytics), Leaflet (geo-mapping)
- **i18n**: Custom multilingual system (EN / TA / HI)
- **Themes**: Light / Dark mode (next-themes)

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database**: PostgreSQL (mandatory — SQLite is strictly prohibited in production)
- **ORM**: SQLAlchemy + Alembic migrations
- **AI**: Google Gemini API (Copilot + declaration extraction)
- **OCR**: External PaddleOCR microservice (PP-OCRv4) — see OCR Architecture below
- **YOLO**: Ultralytics YOLO11n for label region detection
- **Crawler**: httpx Fast HTTP + Playwright fallback pipeline
- **Background Jobs**: FastAPI BackgroundTasks + APScheduler (for e-commerce scheduling)
- **PDF Reports**: FPDF2 with i18n font support

### Deployment Architecture
```
User Browser
    │
    ▼
Vercel (Frontend — Next.js)
    │  /api/* rewrites
    ▼
Railway (Backend — FastAPI Docker container)
    │                      │
    ▼                      ▼
PostgreSQL           External OCR Microservice
(Production DB)      (GitHub Codespaces — PaddleOCR PP-OCRv4)
```

### OCR Architecture
The backend contacts an external OCR microservice via `OCR_SERVICE_URL`:

```
Image Upload
    │
    ▼
YOLO Detection (label regions)
    │
    ▼
HTTP POST → OCR Microservice /ocr/extract
    │         (PaddleOCR PP-OCRv4 running in GitHub Codespaces)
    ▼
Text Tokens + Bounding Boxes
    │
    ▼
Gemini Declaration Extractor
    │
    ▼
Legal Metrology Rule Engine (deterministic)
    │
    ▼
PASS / FAIL / NOT VERIFIED
    │
    ▼
PostgreSQL (persisted inspection result)
    │
    ▼
PDF Report Generation
```

> ⚠️ **OCR Service Limitation**: The external PaddleOCR microservice runs on GitHub Codespaces, which has usage limits, hibernation, and lifecycle restrictions. If the OCR service is unavailable, scans return `NOT VERIFIED / OCR SERVICE UNAVAILABLE`. This is never automatically converted to FAIL or PENALTY.

---

## 📁 Project Structure

```
MetronIQ/
├── frontend/                    # Next.js 16 application
│   ├── src/app/
│   │   ├── admin/               # Administrator portal
│   │   ├── officer/             # Government Officer portal
│   │   ├── manufacturer/        # Manufacturer portal
│   │   └── login/               # Authentication pages
│   ├── src/i18n/                # EN / TA / HI translation files
│   └── src/lib/                 # API client, auth utilities
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/routes/          # All API endpoints
│   │   ├── ai/                  # OCR, YOLO, extraction, scanner pipeline
│   │   ├── services/            # Crawler, PDF, rules validation, analytics
│   │   ├── models/              # SQLAlchemy ORM models
│   │   └── core/                # Config, database, security
│   ├── alembic/                 # Database migrations
│   └── requirements.txt
├── ocr_service/                 # Standalone PaddleOCR microservice
│   ├── main.py                  # FastAPI OCR microservice entry point
│   ├── requirements.txt
│   └── Dockerfile
├── .devcontainer/               # GitHub Codespaces configuration for OCR microservice
│   └── devcontainer.json
├── Dockerfile                   # Railway backend Docker build
├── railway.toml                 # Railway deployment configuration
├── vercel.json                  # Vercel deployment configuration (root)
└── README.md
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `v18+`
- Python `v3.10+`
- PostgreSQL (running locally or via managed service like Neon/Railway)
- A valid `GEMINI_API_KEY` from Google AI Studio

### 1. Database Setup

Ensure PostgreSQL is running. Create a database:
```sql
CREATE DATABASE metroniq;
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in:
#   DATABASE_URL=postgresql://user:pass@localhost:5432/metroniq
#   GEMINI_API_KEY=your_key_here
#   JWT_SECRET_KEY=your_random_secret

# Run database migrations
alembic upgrade head

# Start the backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. OCR Microservice (Optional for Local)

If you do not have `OCR_SERVICE_URL` set, the backend will attempt to use a local PaddleOCR installation (requires paddleocr and paddlepaddle packages). For the external microservice:

```bash
cd ocr_service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7860
```

Then set in backend `.env`:
```
OCR_SERVICE_URL=http://localhost:7860
```

---

## 🌐 Production Deployment

### Frontend → Vercel

The root `vercel.json` configures Vercel to build the `frontend/` Next.js app and proxy all `/api/*` requests to the Railway backend.

**Required Vercel environment variables:**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Railway backend URL (if not using the default rewrite) |

### Backend → Railway

Railway builds the backend using the root `Dockerfile` and runs the FastAPI container.

**Required Railway environment variables:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (postgresql://...) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JWT_SECRET_KEY` | Randomly generated JWT signing secret |
| `CORS_ORIGINS` | Comma-separated allowed origins (e.g., `https://metroniq.vercel.app`) |
| `OCR_SERVICE_URL` | URL of the external PaddleOCR microservice |
| `ENVIRONMENT` | Set to `production` |

> ⚠️ Never prefix backend secrets with `NEXT_PUBLIC_` — that exposes them to the browser.

### OCR → GitHub Codespaces

The `ocr_service/` directory and `.devcontainer/devcontainer.json` configure a reproducible GitHub Codespaces environment running the PaddleOCR microservice on port 7860 (public visibility).

**Limitations:**
- GitHub Codespaces has monthly usage limits (free tier: 120 core-hours/month)
- Codespaces hibernate after inactivity — the backend retries up to 3 times with delays to handle wake-up
- The forwarded URL changes when a Codespace is rebuilt
- This is **not** a permanent 24/7 hosting solution

When the OCR service is unavailable, scans gracefully return `NOT VERIFIED` — no automatic compliance failures are generated.

---

## 🧪 Testing

```bash
cd backend

# Run integration tests (requires test database)
python -m pytest tests/ -v

# Manual API health check
curl http://localhost:8000/health
```

---

## 🔐 Environment Variable Reference (No Secrets)

### Backend `.env` (copy from `backend/.env.example`)

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/metroniq
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_secure_random_string

# Optional
OCR_SERVICE_URL=https://your-codespace-url.github.dev
CORS_ORIGINS=https://metroniq.vercel.app,http://localhost:3000
ENVIRONMENT=production
```

---

## 📜 Legal Metrology Compliance Rules

The system validates the following mandatory declarations under **Legal Metrology (Packaged Commodities) Rules, 2011**:

| Requirement | Rule Reference |
|---|---|
| Maximum Retail Price (MRP) | Rule 6(1) |
| Net Quantity / Net Weight | Rule 6(2) |
| Manufacturer Name & Address | Rule 6(3) |
| Country of Origin | Rule 6(4) |
| Best Before / Expiry Date | Rule 6(5) |
| Month/Year of Manufacture | Rule 6(6) |
| Customer Care Contact | Rule 6(7) |
| FSSAI License (Food Products) | FSSAI Act 2006 |

---

## 🏆 Project Context

Developed for the **Smart India Hackathon (SIH) 2026** — Digital Market Surveillance & Enforcement Track.

- **Problem Statement**: SIH26034
- **Domain**: Legal Metrology / Consumer Affairs / Digital Governance
- **Submitted By**: Team MetronIQ
