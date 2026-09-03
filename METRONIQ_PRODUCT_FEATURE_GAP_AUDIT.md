# METRONIQ PRODUCT FEATURE GAP AUDIT

This represents a strictly READ-ONLY gap audit of the current product interface capabilities mapped against the functional backend.

## 1. CURRENT PRODUCT STATUS
The architectural foundation of MetronIQ (Stages 1–6) is successfully integrated. However, the *Product Wrapping*—the user interface and workflow routing necessary to utilize these stages dynamically—is severely incomplete, relying heavily on hardcoded layouts, disconnected logic, and missing routes. Functioning AI alone does not equal a complete product experience.

## 2. IMPLEMENTED FEATURES
* **frontend/**: IMPLEMENTED (Next.js scaffold and routing paths exist)
* **backend/app/**: IMPLEMENTED 
* **database models**: IMPLEMENTED
* **AI scanner UI**: IMPLEMENTED (End-to-End dynamic fetch working for single image scans)
* **compliance/risk UI**: IMPLEMENTED (Evaluated dynamically inside AI scanner page based on rules hit)

## 3. PARTIAL FEATURES
* **API routes**: PARTIAL (Implemented mathematically, but restricted by missing Auth mechanisms)
* **dashboard pages**: PARTIAL (Admin Dashboard fetches real API data; other roles do not)
* **admin pages**: PARTIAL (Rules view reads from API; Add Rule is a non-functional static alert)
* **evidence UI**: PARTIAL (JSON output dumps to screen, but does not format against legal matrices)
* **navigation/sidebar**: PARTIAL (Roles have split routes `admin/`, `officer/`, `manufacturer/`, but lack functional state-driving Context)
* **user/role functionality**: PARTIAL (Backend models expect Roles; Frontend has no way to assume or switch them dynamically)
* **inspection workflow**: PARTIAL (Scanning active, but no way to track, initiate from a schedule, or historically reference)

## 4. NON-FUNCTIONAL FEATURES
* **inspection pages**: NON-FUNCTIONAL (Starts with hardcoded demo image injection on click)
* **manufacturer pages**: NON-FUNCTIONAL (Dashboard utilizes 100% hardcoded metrics)

## 5. MISSING FEATURES
* **authentication pages**: MISSING (No login portal or JWT exchange)
* **database-backed history**: MISSING (No standard UI table fetches or lists past DB inspections)
* **search/filter/sort functionality**: MISSING 
* **notifications**: MISSING 
* **reports**: MISSING 
* **export functionality**: MISSING 
* **review workflow**: MISSING 
* **reinspection workflow**: MISSING 
* **settings/configuration**: MISSING 

## 6. NOT VERIFIED FEATURES
* None - All directories successfully assessed via read-only tools.

---

## 7. FRONTEND GAPS
- **Gap:** Missing React Context Provider traversing JWT Auth state (P0).
- **Gap:** Hardcoded arrays in Officer & Manufacturer Dashboards (P1).

## 8. BACKEND GAPS
- **Gap:** Missing `auth/login` endpoint logic implementation (P0).
- **Gap:** Database history query endpoints require filtering/pagination params (P2).

## 9. DATABASE GAPS
- **Gap:** Image evidentiary records are not persistently linked (S3 URI column) (P1).

## 10. AI/SCANNER GAPS
- **Gap:** Async long-polling fallback to WebSockets; UI pauses relying on timeouts (P2).

## 11. AUTHENTICATION/SECURITY GAPS
- **Gap:** No route guards mapped in Next.js (Anyone navigating to `/admin/...` sees it) (P0).
- **Gap:** JWT dependencies block native endpoints until resolved (P0).

## 12. ADMIN GAPS
- **Gap:** Rule versioning addition UI is entirely static (Alert based popup) (P1).
- **Gap:** District Geo Heatmap maps to synthetic placeholder array (P1).

## 13. OFFICER GAPS
- **Gap:** Missing capability to view local historical inspections assigned to them (P1).
- **Gap:** Hardcoded Priority queue (P2). 

## 14. MANUFACTURER GAPS
- **Gap:** Empty UI wrapper with completely hardcoded dashboard elements (P3).
- **Gap:** Manufacturer Auditor UI has zero AI pipeline hooks (P2).

## 15. INSPECTION WORKFLOW GAPS
- **Gap:** "Confirm and Save" UI triggers no PUT/POST to lock the database status (P1).

## 16. REPORTING/EVIDENCE GAPS
- **Gap:** PDF audit form synthesis missing.

## 17. NAVIGATION/UX GAPS
- **Gap:** No logout capability.

## 18. DEMO/PLACEHOLDER DATA STILL PRESENT
- Officer Priority Queue Array (`priorityCases`)
- Admin Geo Heatmap Targets Array (`districts`)
- Rule Addition Popup Alert
- Hardcopy image bypass inside Officer `NewInspection` hook

## 19. PRIORITY CLASSIFICATION
All gaps evaluated P0 to P3 mapped into Recommended Order below.

---

### A. WHAT IS ACTUALLY COMPLETE
- True AI Pipeline bridging Next.js to FastAPI dynamically mapping YOLO domains to PaddleOCR tensors.
- Strict Legal Metrology dynamic rule validation engine referencing PostgreSQL rules sets.
- Base Next.js Component scaffolding via Tailwind/ShadCN.

### B. WHAT IS ACTUALLY MISSING
- A cohesive User Experience gluing the modules together (No Logins, No Historical Queries, Unconnected UI forms).
- Permanent Evidentiary Object Storage links.
- Admin creation capabilities against the Database.

### C. TOP 10 FEATURES TO IMPLEMENT NEXT
1. JWT Authentication Subsystem (Backend API + Frontend Context) (P0)
2. Next.js Protected Routing hooks for Role Segmentation (P0)
3. Connect "Confirm & Save Inspection" to Live DB Endpoint (P1)
4. Hook Admin Rules Creation Modal to Live DB Endpoint (P1)
5. Hook Officer Dashboard to dynamic `get_inspections()` Endpoint (P1)
6. Implement PDF Artifact Generation from Evidence AI Output (P2)
7. Transition Geo Heat Map to DB queries instead of Mock Data (P2)
8. Connect Manufacturer Auditor Portal to AI pipeline (P2)
9. Establish API Data Tables with Sorting/Filtering capability (P2)
10. S3/Persisted Storage architecture integration for inference items (P1)

### D. RECOMMENDED IMPLEMENTATION ORDER
1. Clean up DEMO data arrays still residing in Dashboards.
2. Build JWT Auth module so all routes pass `deps.py`.
3. Wrap Next.js in Auth Context.
4. Hook remaining UI elements (Rules Creation, Inspection DB listing) tightly to validated Endpoints.

### E. FILES THAT WOULD NEED TO CHANGE
- `backend/app/api/deps.py`
- `backend/app/api/routes/auth.py` (New)
- `frontend/src/app/officer/dashboard/page.tsx`
- `frontend/src/app/officer/inspection/page.tsx`
- `frontend/src/app/admin/geo/page.tsx`
- `frontend/src/app/admin/rules/page.tsx`
- `frontend/src/app/layout.tsx` (To add Providers)

### F. FEATURES THAT MUST NOT BE TOUCHED BECAUSE THEY ARE ALREADY VERIFIED
- `backend/app/ai/pipeline/scanner_pipeline.py`
- `backend/app/detection/yolo_detector.py`
- `backend/app/ocr/paddle_ocr.py`
- `backend/app/services/rules_validation_service.py`
- `backend/app/ai/models/metroniq.pt`
