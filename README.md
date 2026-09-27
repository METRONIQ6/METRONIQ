# ?? MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

MetronIQ is a robust, enterprise-grade software system designed to autonomously evaluate product packaging artworks and real-world commodity captures against live, version-controlled **Legal Metrology (Packaged Commodities) Rules, 2011**.

By integrating state-of-the-art Optical Character Recognition (OCR), Headless E-Commerce Crawling, and Generative AI directly into deterministic regulation evaluators, MetronIQ serves as the central operational backbone for Government Enforcement Directorates.

---

## ?? Key Platform Capabilities

1. **AI Product Compliance Scanner**
   - Upload or natively capture product imagery.
   - Extracts localized entity declarations (MRP, Best Before, Manufacturer Address) instantly using an optimized singleton OCR pass and GenAI extraction pipelines.
   - Cross-checks all tokens against strict, dynamic Meta-Rules engineered by Administrators, rendering deterministic PASS / FAIL / NOT VERIFIED evaluations.
   - Preserves legal compliance rules directly separating visual MRP from Offer Prices.

2. **Full-Stack Regulatory Enforcement Lifecycle**
   - **Improvement Notices**: Automatically generate formal improvement notices targeting deficient Manufacturers.
   - **Rectification Workflow**: Allows assigned manufacturers to safely submit corrections for direct government review.
   - **Reinspection Queues**: Intelligent scheduling algorithms ensure flagged products receive localized follow-ups.
   - **Enforcement & Legal Dockets**: Issues trackable compounding penalties & legal interventions for rigid offenders.

3. **E-Commerce Auto Monitor**
   - High-performance deterministic E-Commerce URL crawler utilizing Fast HTTP.
   - Intelligently cascades from JSON-LD / @graph extraction to Playwright DOM rendering upon HTTP failures mapping technical states (SSRF, crawler blocks) independent from legal evaluations.

4. **MetronIQ Copilot (AI)**
   - Context-aware virtual assistant explicitly trained to reason through internal Legal Metrology documentation.
   - Aids investigating officers by deciphering convoluted requirements directly alongside the active dashboard.

5. **Vernacular / Multilingual Support**
   - Fully localized UI/UX interface rendering seamlessly in **English, Tamil, and Hindi**.
   - Dynamically leverages language-aware typography (including strictly localized Noto Sans Tamil fonts).

---

## ?? Security & Role-Based Access Control (RBAC)

The system deploys absolute data segregation strictly enforcing Government-level authorization perimeters:

* **?? System Administrators**: Own full dashboard capabilities encompassing geo-analytics, rule set management, and absolute approval/rejection gates over actively registering field teams.
* **?? Government Officers**: Restricted to verified governmental officials. Granted complete access to active legal verification, AI scanners, and compliance issuance portals.
* **?? Manufacturers**: Limited strictly to their private operational silo. Enables isolated pre-market compliance audits, rule verification, rule history tracking, and active submission management without interacting or overlapping with concurrent competitor data.

---

## ??? Architecture & Stack

**Frontend (Client)**
* **Framework**: React / Next.js
* **Styling**: TailwindCSS, Shadcn/UI
* **State & Fetching**: Parallelized REST API loaders spanning dynamic NextJS pages.
* **Visuals**: Recharts (Analytics), Leaflet (Geo-Analytics)

**Backend (API & MLOps)**
* **Framework**: FastAPI (Python)
* **Persistence**: PostgreSQL (Strict enforcement)
* **AI Tooling**: Google Gemini APIs
* **Processing**: Background queues, robust connection pooling, and OCR caching strategies integrated natively for scalability.

---

## ?? Setup & Installation

### Prerequisites
- Node.js `(v18+)`
- Python `(v3.10+)`
- PostgreSQL Runtime Server
- Valid `GEMINI_API_KEY`

### 1. Database Initialization
Ensure a local or remote PostgreSQL instance is running configured with:
- Database Name: `metroniq`
- Port: `5432`

### 2. Backend Initialization
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate   # (Windows)
source venv/bin/activate  # (Mac/Linux)

# Install Dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Duplicate `.env.example` to `.env` and insert your GEMINI_API_KEY and DATABASE_URL
```
Launch the Development Server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Initialization
```bash
cd frontend

# Install Node dependencies
npm install

# Launch Development Client
npm run dev
# OR for production build:
# npm run build && npm start
```
Navigate to **`http://localhost:3000`** in your browser.

---

*Developed explicitly for the **Smart India Hackathon (SIH)** � Digital Market Surveillance & Enforcement Track.*
