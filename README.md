# ⚖️ MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

MetronIQ is a robust, enterprise-grade software system designed to autonomously evaluate product packaging artworks and real-world commodity captures against live, version-controlled **Legal Metrology (Packaged Commodities) Rules, 2011**.

By integrating state-of-the-art Optical Character Recognition (OCR), Headless E-Commerce Crawling, and Generative AI directly into deterministic regulation evaluators, MetronIQ serves as the central operational backbone for Government Enforcement Directorates.

---

## 🚀 Key Platform Capabilities

1. **AI Product Compliance Scanner**
   - Upload or natively capture product imagery.
   - Extracts localized entity declarations (MRP, Best Before, Manufacturer Address) instantly using an optimized singleton OCR pass and GenAI extraction pipelines.
   - Cross-checks all tokens against strict, dynamic Meta-Rules engineered by Administrators, rendering deterministic **PASS / FAIL / NOT VERIFIED** evaluations.
   - Legally separates visual MRP from Offer Prices — in strict compliance with Legal Metrology Rules.

2. **Full-Stack Regulatory Enforcement Lifecycle**
   - **Improvement Notices**: Automatically generate formal improvement notices targeting deficient Manufacturers.
   - **Rectification Workflow**: Allows assigned manufacturers to submit corrections for direct government review.
   - **Reinspection Queues**: Intelligent scheduling ensures flagged products receive localized follow-ups.
   - **Enforcement & Legal Dockets**: Issues trackable compounding penalties & legal interventions for repeat offenders.

3. **E-Commerce Auto Monitor**
   - High-performance deterministic E-Commerce URL crawler utilizing Fast HTTP.
   - Cascades from JSON-LD / `@graph` extraction → Playwright DOM rendering as fallback.
   - Cleanly separates **technical crawl states** (SSRF blocked, timeout) from **legal compliance failures**.

4. **MetronIQ Copilot (AI)**
   - Context-aware virtual assistant powered by Google Gemini.
   - Helps investigating officers interpret complex Legal Metrology requirements alongside the active dashboard.

5. **Vernacular / Multilingual Support**
   - Fully localized in **English, Tamil (தமிழ்), and Hindi (हिन्दी)**.
   - Language-aware typography with dedicated **Noto Sans Tamil** font rendering.

---

## 🔒 Security & Role-Based Access Control (RBAC)

The system enforces Government-level authorization with strict data segregation:

| Role | Access |
|---|---|
| 👑 **Administrator** | Full control: user management, rule management, analytics, geo dashboard, approval/rejection of officers |
| 👮 **Government Officer** | Legal verification, AI scanner, inspection management, notices, enforcement, reports, E-Commerce monitor |
| 📦 **Manufacturer** | Private silo: product registry, pre-market compliance audit, submission management, rectification center |

---

## 🏗️ Architecture & Stack

**Frontend**
- **Framework**: Next.js (React)
- **Styling**: TailwindCSS + Shadcn/UI
- **Data Fetching**: Parallelized REST API calls via `Promise.all`
- **Visuals**: Recharts (Analytics), Leaflet (Geo)
- **i18n**: Custom multilingual system (EN / TA / HI)

**Backend**
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL *(mandatory — SQLite strictly prohibited)*
- **AI**: Google Gemini API (Copilot + extraction)
- **OCR**: Singleton-based OCR pipeline with MD5 caching
- **Crawler**: Fast HTTP + Playwright fallback pipeline
- **Background Jobs**: FastAPI BackgroundTasks

**Deployment**

---

## 💻 Local Development Setup

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
# Copy .env.example → .env and fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET_KEY
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

## 📁 Project Structure

```
MetronIQ/
├── frontend/              # Next.js application
│   ├── src/app/
│   │   ├── admin/         # Administrator portal
│   │   ├── officer/       # Government Officer portal
│   │   ├── manufacturer/  # Manufacturer portal
│   │   └── login/         # Authentication
│   └── src/i18n/          # EN / TA / HI translations
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/routes/    # All API endpoints
│   │   ├── ai/            # OCR, extraction, scanner pipeline
│   │   ├── services/      # Crawler, PDF, rules validation
│   │   ├── models/        # SQLAlchemy ORM models
│   │   └── core/          # Config, DB, auth
│   └── requirements.txt
└── README.md
```

---

*Developed for the **Smart India Hackathon (SIH) 2026** — Digital Market Surveillance & Enforcement Track.*
