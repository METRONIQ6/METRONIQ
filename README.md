# âš–ï¸ MetronIQ

**AI-Assisted Legal Metrology Compliance, Inspection, and Decision-Support Platform.**

MetronIQ is a robust, enterprise-grade software system designed to autonomously evaluate product packaging artworks and real-world commodity captures against live, version-controlled **Legal Metrology (Packaged Commodities) Rules, 2011**.

By integrating state-of-the-art Optical Character Recognition (OCR), Headless E-Commerce Crawling, and Generative AI directly into deterministic regulation evaluators, MetronIQ serves as the central operational backbone for Government Enforcement Directorates.

---

## ðŸ“ Project Structure

```
MetronIQ/
â”œâ”€â”€ frontend/              # Next.js application
â”‚   â”œâ”€â”€ src/app/
â”‚   â”‚   â”œâ”€â”€ admin/         # Administrator portal
â”‚   â”‚   â”œâ”€â”€ officer/       # Government Officer portal
â”‚   â”‚   â”œâ”€â”€ manufacturer/  # Manufacturer portal
â”‚   â”‚   â””â”€â”€ login/         # Authentication
â”‚   â””â”€â”€ src/i18n/          # EN / TA / HI translations
â”œâ”€â”€ backend/               # FastAPI application
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ api/routes/    # All API endpoints
â”‚   â”‚   â”œâ”€â”€ ai/            # OCR, extraction, scanner pipeline
â”‚   â”‚   â”œâ”€â”€ services/      # Crawler, PDF, rules validation
â”‚   â”‚   â”œâ”€â”€ models/        # SQLAlchemy ORM models
â”‚   â”‚   â””â”€â”€ core/          # Config, DB, auth
â”‚   â””â”€â”€ requirements.txt
â””â”€â”€ README.md
```

---

*Developed for the **Smart India Hackathon (SIH) 2026** â€” Digital Market Surveillance & Enforcement Track.*
