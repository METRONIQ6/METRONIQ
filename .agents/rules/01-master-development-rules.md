# METRONIQ MASTER DEVELOPMENT RULES

## PROJECT OVERVIEW
* **Project Name**: MetronIQ
* **Project Type**: AI-powered Legal Metrology Compliance, Inspection and Decision-Support Platform.
* **Target**: Smart India Hackathon 2026 — SIH26034.
* **Team**: 6 members.

## DEVELOPMENT PROCESS (STRICT)
Do NOT build the entire project in one step. We will build MetronIQ incrementally through clearly defined stages.

For every stage:
1. Inspect the existing project.
2. Understand the current architecture.
3. Create a short implementation plan.
4. Implement only the requested stage.
5. Run appropriate tests.
6. Verify the UI where applicable.
7. Fix obvious errors.
8. Report exactly what was completed.
9. Do not modify unrelated modules.

Do not skip stages unless explicitly instructed.

## COMPLIANCE ARCHITECTURE (STRICT)
**NEVER use: Image → LLM → Legal Decision**

Instead use:
`Image → Computer Vision → OCR → Declaration Extraction → Product Categorization → Applicable Versioned Rule Set → Deterministic Rule Engine → PASS / REVIEW / FAIL → Evidence + Rule Trace → Human Review where required → AI Explanation`

The LLM is NOT the final legal decision-maker. The deterministic compliance engine is responsible for structured rule evaluation. 
AI may assist with: extraction, classification, explanation, summarization.
AI must not invent legal requirements or regulatory rules. Use clearly labelled DEMO/SAMPLE rules during development unless verified regulatory data is provided.

## DATA PRINCIPLES
* Never fabricate government data.
* Never present mock data as real government data. Demo data must be clearly labelled.
* Legal rules must be clearly distinguished from sample/demo rules unless authoritative regulatory sources have been incorporated and verified.

## DESIGN SYSTEM
* Clean, premium, modern, professional, trustworthy, government-grade, AI-powered, responsive, accessible, fast, hackathon-demo ready.
* Visual direction: Modern enterprise SaaS + Government-grade trust + Subtle AI aesthetic.
* Colors: deep navy, white, slate, blue accent. Staus: PASS = green, REVIEW = amber, FAIL = red. Do not use excessive colors.
* Avoid: excessive gradients, excessive glassmorphism, giant typography, random animations, visual clutter, too many cards, unnecessary decorative elements.
* Use: clear hierarchy, generous spacing, rounded cards, subtle shadows, professional charts, meaningful icons, consistent badges, clean tables, excellent empty/loading/error states.

## TECH STACK
* **WEB**: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts
* **MOBILE**: Flutter, Dart (Optimized for field work: camera-first, fast nav, large touch targets, minimal typing)
* **BACKEND**: Python, FastAPI, Pydantic
* **COMPUTER VISION & OCR**: OpenCV, YOLO-family object detection, PaddleOCR, Tesseract (optional fallback)
* **NLP & LLM**: Python, Regex, structured extraction, AI assistance. LLM for explanation/summarization only.
* **DATABASE & STORAGE**: PostgreSQL, S3-compatible storage (or MinIO for local dev)
* **BACKGROUND PROCESSING**: Celery + Redis
* **AUTH**: JWT, Role-Based Access Control
* **REPORTS**: ReportLab
* **TESTING**: Pytest, Playwright, Flutter tests
* **DEPLOYMENT**: Docker, Docker Compose, Cloud/VPS
* **VCS**: Git, GitHub

## DEVELOPMENT PRINCIPLES
* Prefer simple architecture.
* Do NOT introduce unnecessary: microservices, Kubernetes, blockchain, multiple databases, multiple frontend frameworks, unnecessary AI models.
* Keep the system achievable by a 6-member hackathon team.
* Prefer a modular monolith/backend architecture unless a real reason exists for separation.
* Prioritize: reliability, demo stability, maintainability, clear architecture, explainability, security, performance, good UX.
* Security: secure auth, RBAC, API/file validation, input sanitization, secure password handling, env variables, audit logs, CORS, rate limiting. Never expose secrets in frontend.
