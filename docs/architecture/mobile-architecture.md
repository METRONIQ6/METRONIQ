# Mobile Architecture (Flutter)

The mobile application is purpose-built for the **Legal Metrology Field Officer**. It is NOT a direct responsive port of the web administration panel.

## UX Principles
- **Camera-First:** The primary action is quickly capturing label photos.
- **Large Touch Targets:** Usable in varying outdoor/warehouse lighting.
- **Fast Navigation:** Minimal typography and immediate visual status mapping.

## Main Application Flow
1. **Login**
2. **Dashboard / Priorities:** Shows immediate `HIGH` risk targets derived from the Risk Engine.
3. **Capture Process:**
   - Tap "New Inspection".
   - Viewfinder with overlay guides open.
   - Snaps front and back of package.
4. **Processing & Feedback:**
   - Uploads to FastAPI backend.
   - Short loading state while CV/OCR extracts.
   - Shows "Quality Warning: Too Blur" or proceeds to Results.
5. **Results View:**
   - Giant Green PASS, Amber REVIEW, or Red FAIL.
   - Evidence chips (bounding box crops) listed below the result.
6. **Action:**
   - Issue Notice or Save Inspection.

## Component Stack
- **State Management:** Riverpod / Provider.
- **Networking:** Dio (handles interceptors for JWT auth and multipart image uploads).
- **Camera:** `camera` package with potential edge-detection guides.
