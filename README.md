# MetronIQ

AI-assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.
**Target: Smart India Hackathon 2026 — SIH26034**

## Overview
MetronIQ evaluates standard product packaging artworks and real-world commodity captures against live, version-controlled governmental Legal Metrology rules. The system integrates real-time Optical Character Recognition (OCR) and YOLO neural classification directly into deterministic regulation evaluators to output unified, fully automated compliance verification logic.

## Repository Structure

```
metroniq/
├── frontend/                        # Next.js Web Application (React, Tailwind CSS, shadcn/ui)
│   ├── src/app/                     # Modernized Route Endpoints
│   │   ├── admin/                   # Admin System Control Console (Rules, Geo Analytics)
│   │   ├── officer/                 # Officer Field Scanner, Notice Directory, and Queue
│   │   ├── manufacturer/            # Manufacturer pre-market compliance validation workspace
│   │   └── login/                   # JWT Automated Authentication
│   └── public/                      # Static Assets
│
├── backend/                         # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                 # Secure Router Definitions
│   │   ├── core/                # DB setup (SQLite) and Configurations
│   │   ├── models/              # System ORM Models (SQLAlchemy)
│   │   ├── rules/               # Live Validation Engine
│   │   └── ai/                  # AI Inference Pipeline (OCR/CV)
│   └── metroniq-dev.db          # Persistence Layer
│
├── README.md
└── docker-compose.yml               # Production Orchestration
```

## Modernization Highlights & Features

- **Enterprise Navy/Blue UI Specifications:** Complete redesign of the application using strict government/enterprise-grade style metrics. Eliminates placeholder Tailwind variants in exchange for highly structured dashboards and robust action-bar elements.
- **Role-Based Workflows:** Distinct, fully-backed UI perspectives for **Officers**, **System Admins**, and **Manufacturers**.
- **Real-time API Integrations:** Every view connects directly to the Live SQLite database and operational endpoints natively eliminating hardcoded data. 
- **Manufacturer Pipeline Parity:** The Manufacturer Label Auditor subsystem executes against the same live internal `scanner.py` NLP pipeline utilized by field officers, guaranteeing identical regulatory thresholds and reporting.

## Setup Instructions

1. **Backend**:
   Navigate to `/backend`, activate the environment:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend**:
   Navigate to `/frontend`, install packages, and deploy locally:
   ```bash
   npm install
   npm run dev
   ```

Access the system at `http://localhost:3000`.
