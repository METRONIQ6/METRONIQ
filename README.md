# ⚖️ MetronIQ
**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

MetronIQ is a robust, enterprise-grade software system designed to autonomously evaluate product packaging artworks and real-world commodity captures against live, version-controlled **Legal Metrology (Packaged Commodities) Rules, 2011**. 

By integrating state-of-the-art Optical Character Recognition (OCR) and Generative AI directly into deterministic regulation evaluators, MetronIQ serves as the central operational backbone for Government Enforcement Directorates.

---

## 🚀 Key Platform Capabilities

1. **AI Product Compliance Scanner**
   - Upload or natively capture product imagery.
   - Extracts localized entity declarations (MRP, Best Before, Manufacturer Address) instantly using advanced GenAI and OCR processing pipelines.
   - Cross-checks all tokens against strict, dynamic Meta-Rules engineered by Administrators, immediately computing Confidence and Risk Scores.

2. **Full-Stack Regulatory Enforcement Lifecycle**
   - **Improvement Notices**: Automatically generate formal improvement notices targeting deficient Manufacturers.
   - **Reinspection Queues**: Intelligent scheduling algorithms ensure flagged products receive localized follow-ups.
   - **Enforcement & Legal Dockets**: Issues trackable compounding penalties & legal interventions for rigid offenders.

3. **E-Commerce Auto Monitor**
   - Headless telemetry scanner targeting active digital marketplaces.
   - Allows agents to feed live URLs; MetronIQ crawls the endpoints dynamically to ensure physical compliance equates digital compliance.

4. **MetronIQ Copilot (AI)**
   - Context-aware virtual assistant explicitly trained to reason through internal Legal Metrology documentation.
   - Aids investigating officers by deciphering convoluted requirements directly alongside the active dashboard.

5. **Vernacular / Multilingual Support**
   - Fully localized UI/UX interface rendering seamlessly in **English, Tamil, and Hindi**. 

---

## 🔒 Security & Role-Based Access Control (RBAC)

The system deploys absolute data segregation strictly enforcing Government-level authorization perimeters:

* **👑 System Administrators**: Owns full `suspend`, `reject`, and `approve` capabilities over active field teams and rule-sets.
* **👮 Government Officers**: Must be explicitly approved by Admins following registration. Restricted exclusively to legal verification and notice issuances.
* **📦 Manufacturers**: Can isolate pre-market artworks against identical Government AI models for proactive error-checking and to rectify impending fines.

---

## 🏗️ Architecture & Stack

**Frontend (Client)**
* **Framework**: React / Next.js
* **Styling**: TailwindCSS, Shadcn/UI (Strictly adhering to clean governmental Navy/Blue design language)
* **Visuals**: Recharts (Analytics), Leaflet (Geo-Analytics)

**Backend (API & MLOps)**
* **Framework**: FastAPI (Python)
* **Persistence**: PostgreSQL / SQLite (Configurable via SQLAlchemy)
* **AI Tooling**: Google Gemini APIs, OpenCV, PaddleOCR hooks.

---

## 💻 Setup & Installation 

### Prerequisites
- Node.js `(v18+)`
- Python `(v3.10+)` 
- Valid `GEMINI_API_KEY` for OCR Engine Inference.

### 1. Backend Initialization
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate   # (Windows)
source venv/bin/activate  # (Mac/Linux)

# Install Dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Duplicate `.env.example` to `.env` and insert your GEMINI_API_KEY
```
Launch the Development Server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Initialization
```bash
cd frontend

# Install Node dependencies
npm install

# Launch Development Client
npm run dev
```
Navigate to **`http://localhost:3000`** in your browser.

---

## 🤝 Contribution & Auditing
- **Deployment Script**: Run root `docker-compose.yml` for unified production-grade Kubernetes orchestration.
- **Seeding Users**: To seed an immutable Root Administrator securely bypassing the frontend HTTP restrictions, execute `venv\Scripts\python seed_users.py` in the backend directly.

*Developed explicitly for the **Smart India Hackathon (SIH)** — Digital Market Surveillance & Enforcement Track.*
