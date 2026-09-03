# METRONIQ ARCHITECTURE & MODULES

## SEVEN MAJOR MODULES
1. AI PRODUCT COMPLIANCE SCANNER
2. AI LABEL COMPLIANCE AUDITOR
3. LEGAL COMPLIANCE BRAIN
4. RULE CONTROL DASHBOARD
5. SMART ENFORCEMENT DASHBOARD
6. E-COMMERCE COMPLIANCE MONITOR
7. RISK-BASED INSPECTION PRIORITIZATION

## CORE WORKFLOW
`Violation → applicable corrective/improvement workflow → rectification → reinspection → resolved or escalated.`

## USER ROLES
1. **LEGAL_METROLOGY_OFFICER**: Create inspection, capture/upload package, run scan, review extraction, view compliance results, view evidence, review violations, perform reinspection, view risk priorities, view dashboards, generate reports.
2. **MANUFACTURER**: Upload label artwork, perform pre-market audit, view findings, submit rectification, upload corrected artwork/package, request/review recheck status.
3. **ADMIN / AUTHORIZED REGULATORY USER**: Manage users, manage product categories, manage rule versions, review rule changes, activate/deactivate applicable rules, inspect audit logs, view analytics, manage system configuration.

## KEY MODULE SPECIFICATIONS

### Rule Control Dashboard
Must manage VERSIONED RULE DATA.
Rule fields: `rule_id`, `rule_name`, `requirement`, `product_category`, `conditions`, `validation_logic`, `severity`, `effective_date`, `version`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`.
Rule lifecycle: `DRAFT → REVIEW → APPROVED → ACTIVE → RETIRED`.
* Do NOT silently modify active rules. A change to an active rule should create a new version.
* Only authorized users can change rules. AI cannot independently change or activate legal rules.
* Includes **Rule Simulator** to test rules using sample structured data safely without modifying production rules.

### AI Product Scanner & Extraction Pipeline
`Package Image → Image Quality Check → Image Preprocessing → Computer Vision → OCR → Declaration Extraction → Product Categorization → Rule Selection → Compliance Engine → Result`
* Structured extraction fields: MRP, Net Quantity, Manufacturer, Packer, Importer, Consumer Care Information, Country of Origin, Relevant dates, others.
* Each field should contain: field, value, source_text, bounding_box, confidence.
* Low-confidence extraction eligible for REVIEW.

### Compliance Result & Evidence Engine
* Outcomes: **PASS / REVIEW / FAIL**
* Each finding contains: requirement, observed value, expected condition, result, severity, rule ID, rule version, confidence, reason, evidence.
* **Evidence Engine**: Every finding traceable to evidence. Store/reference original image, cropped evidence, OCR text, extracted value, bounding box, confidence, rule ID/version, decision, timestamp.
* UI should answer: WHAT? WHERE? WHY? EVIDENCE? RULE? CONFIDENCE?

### AI Explanation
* Create a human-readable explanation layer that receives VERIFIED structured results from the compliance engine.
* Explain: what was detected, what requirement was evaluated, why it failed/requires review, what evidence supports it, possible corrective guidance. 
* Do not allow the LLM to change the compliance decision. Clearly label AI-generated explanations.

### Risk Engine
* Explainable weighted scoring model returning: `risk_score`, `risk_level` (LOW/MEDIUM/HIGH), `risk_factors`, `priority`.
* Always explain WHY the risk score was assigned. Do not claim predictive accuracy without validated historical data.

### E-Commerce Monitor
* For hackathon: DO NOT build large-scale scraping first.
* Use controlled screenshots, sample URLs, mock marketplace data, uploaded online product images.

### Corrective Workflow & Reinspection
* Not every violation qualifies for an improvement notice; use configurable workflow logic.
* Statuses: `DETECTED, REVIEW, NOTICE_ISSUED, RECTIFICATION_SUBMITTED, REINSPECTION_PENDING, RESOLVED, ESCALATED`.
* Reinspection supports: previous inspection, old/new evidence, before/after comparison, new compliance evaluation.

## HACKATHON DEMO STORY
* Target duration: 3-5 minutes.
* Flow: Officer opens dashboard → high-risk case appears → opens inspection → captures package → image quality check → OCR → declaration extraction → product categorization → rule evaluation → FAIL → evidence highlighted → officer clicks WHY → rule trace displayed → explanation displayed → applicable corrective workflow → manufacturer submits corrected package → reinspection → PASS → dashboard updates → risk/inspection intelligence updates.

## IMPLEMENTATION STRATEGY
Follow the 30-stage plan explicitly. Currently at Stage 0 (Rules). Next is Stage 1: Technical architecture.
RULE CONTROL DASHBOARD must be implemented as part of the Compliance Brain/admin architecture and treated as a first-class module.
