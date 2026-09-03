# MetronIQ

AI-assisted Legal Metrology Compliance, Inspection and Decision-Support Platform.
**Target: Smart India Hackathon 2026 — SIH26034**

## Repository Structure

```
metroniq/
├── apps/
│   ├── web/                     # Next.js Web Dashboard
│   └── mobile/                  # Flutter Mobile Application
│
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI routers and endpoints
│   │   ├── core/                # Config, security, and DB initialization
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Core business logic processing
│   │   ├── repositories/        # Database access layer
│   │   ├── rules/               # Deterministic rule evaluation logic
│   │   ├── ai/                  # CV, OCR, and AI interfaces
│   │   ├── risk/                # Risk scoring calculators
│   │   ├── workflows/           # Corrective/reinspection workflows
│   │   └── main.py              # FastAPI entry point
│   │
│   └── tests/                   # Pytest automation
│
├── database/                    # SQL init scripts (if any)
├── ai/                          # Standalone AI resources or model weights
├── docs/                        
│   └── architecture/            # Architectural documentation
├── sample-data/                 # Mock rules and testing images
├── tests/                       # E2E Playwright tests
├── docker/                      # Dockerfiles and Compose configurations
└── README.md
```

## Documentation
Please refer to `docs/architecture/` for detailed breakdown of API, Database, Backend pipelines, and security protocols.
