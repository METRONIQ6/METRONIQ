# ΓÜû∩╕Å MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

MetronIQ is a robust, enterprise-grade software system designed to autonomously evaluate product packaging artworks and real-world commodity captures against live, version-controlled **Legal Metrology (Packaged Commodities) Rules, 2011**.

By integrating state-of-the-art Optical Character Recognition (OCR), Headless E-Commerce Crawling, and Generative AI directly into deterministic regulation evaluators, MetronIQ serves as the central operational backbone for Government Enforcement Directorates.

---

## ≡ƒÜÇ Key Platform Capabilities

1. **AI Product Compliance Scanner**
   - Upload or natively capture product imagery.
   - Extracts localized entity declarations (MRP, Best Before, Manufacturer Address) instantly using an optimized singleton OCR pass and GenAI extraction pipelines.
   - Cross-checks all tokens against strict, dynamic Meta-Rules engineered by Administrators, rendering deterministic **PASS / FAIL / NOT VERIFIED** evaluations.
   - Legally separates visual MRP from Offer Prices ΓÇö in strict compliance with Legal Metrology Rules.

2. **Full-Stack Regulatory Enforcement Lifecycle**
   - **Improvement Notices**: Automatically generate formal improvement notices targeting deficient Manufacturers.
   - **Rectification Workflow**: Allows assigned manufacturers to submit corrections for direct government review.
   - **Reinspection Queues**: Intelligent scheduling ensures flagged products receive localized follow-ups.
   - **Enforcement & Legal Dockets**: Issues trackable compounding penalties & legal interventions for repeat offenders.

3. **E-Commerce Auto Monitor**
   - High-performance deterministic E-Commerce URL crawler utilizing Fast HTTP.
   - Cascades from JSON-LD / `@graph` extraction ΓåÆ Playwright DOM rendering as fallback.
   - Cleanly separates **technical crawl states** (SSRF blocked, timeout) from **legal compliance failures**.

4. **MetronIQ Copilot (AI)**
   - Context-aware virtual assistant powered by Google Gemini.
   - Helps investigating officers interpret complex Legal Metrology requirements alongside the active dashboard.

5. **Vernacular / Multilingual Support**
   - Fully localized in **English, Tamil (α«ñα««α«┐α«┤α»ì), and Hindi (αñ╣αñ┐αñ¿αÑìαñªαÑÇ)**.
   - Language-aware typography with dedicated **Noto Sans Tamil** font rendering.

---

## ≡ƒöÆ Security & Role-Based Access Control (RBAC)

The system enforces Government-level authorization with strict data segregation:

| Role | Access |
|---|---|
| ≡ƒææ **Administrator** | Full control: user management, rule management, analytics, geo dashboard, approval/rejection of officers |
| ≡ƒæ« **Government Officer** | Legal verification, AI scanner, inspection management, notices, enforcement, reports, E-Commerce monitor |
| ≡ƒôª **Manufacturer** | Private silo: product registry, pre-market compliance audit, submission management, rectification center |

---

## ≡ƒÅù∩╕Å Architecture & Stack

**Frontend**
- **Framework**: Next.js (React)
- **Styling**: TailwindCSS + Shadcn/UI
- **Data Fetching**: Parallelized REST API calls via `Promise.all`
- **Visuals**: Recharts (Analytics), Leaflet (Geo)
- **i18n**: Custom multilingual system (EN / TA / HI)

**Backend**
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL *(mandatory ΓÇö SQLite strictly prohibited)*
- **AI**: Google Gemini API (Copilot + extraction)
- **OCR**: Singleton-based OCR pipeline with MD5 caching
- **Crawler**: Fast HTTP + Playwright fallback pipeline
- **Background Jobs**: FastAPI BackgroundTasks

**Deployment**
- **Frontend**: Vercel (Next.js service)
- **Backend**: Vercel Python service (Fluid Compute)
- **Config**: `vercel.json` with Vercel Services architecture

---

## ≡ƒÆ╗ Local Development Setup

### Prerequisites
- Node.js `v18+`
- Python `v3.10+`
- PostgreSQL (running locally or via managed service)
- A valid `GEMINI_API_KEY`

### 1. Database Setup
Ensure PostgreSQL is running with:
```
Database: metroniq
Port:     5432
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

# Configure secrets
# Copy .env.example ΓåÆ .env and fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET_KEY
```

Start the backend:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend
```bash
cd frontend

npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ≡ƒîÉ Vercel Deployment

This repository is configured for Vercel Services deployment via `vercel.json`.

**Services:**
- `frontend/` ΓåÆ Next.js service
- `backend/` ΓåÆ FastAPI Python service (`app.main:app`)

**API Routing:**
- `/api/(.*)` ΓåÆ backend service
- `/(.*)` ΓåÆ frontend service

**Required Environment Variables in Vercel Dashboard:**

| Variable | Scope |
|---|---|
| `DATABASE_URL` | Backend only |
| `GEMINI_API_KEY` | Backend only |
| `JWT_SECRET_KEY` | Backend only |
| `ENVIRONMENT` | Backend only |
| `CORS_ORIGINS` | Backend only |

> ΓÜá∩╕Å Never prefix backend secrets with `NEXT_PUBLIC_`.

---

## ≡ƒôü Project Structure

```
MetronIQ/
Γö£ΓöÇΓöÇ frontend/              # Next.js application
Γöé   Γö£ΓöÇΓöÇ src/app/
Γöé   Γöé   Γö£ΓöÇΓöÇ admin/         # Administrator portal
Γöé   Γöé   Γö£ΓöÇΓöÇ officer/       # Government Officer portal
Γöé   Γöé   Γö£ΓöÇΓöÇ manufacturer/  # Manufacturer portal
Γöé   Γöé   ΓööΓöÇΓöÇ login/         # Authentication
Γöé   ΓööΓöÇΓöÇ src/i18n/          # EN / TA / HI translations
Γö£ΓöÇΓöÇ backend/               # FastAPI application
Γöé   Γö£ΓöÇΓöÇ app/
Γöé   Γöé   Γö£ΓöÇΓöÇ api/routes/    # All API endpoints
Γöé   Γöé   Γö£ΓöÇΓöÇ ai/            # OCR, extraction, scanner pipeline
Γöé   Γöé   Γö£ΓöÇΓöÇ services/      # Crawler, PDF, rules validation
Γöé   Γöé   Γö£ΓöÇΓöÇ models/        # SQLAlchemy ORM models
Γöé   Γöé   ΓööΓöÇΓöÇ core/          # Config, DB, auth
Γöé   ΓööΓöÇΓöÇ requirements.txt
Γö£ΓöÇΓöÇ vercel.json            # Vercel Services deployment config
ΓööΓöÇΓöÇ README.md
```

---

*Developed for the **Smart India Hackathon (SIH) 2026** ΓÇö Digital Market Surveillance & Enforcement Track.*
