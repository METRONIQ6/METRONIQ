# API Architecture

The FastAPI REST architecture logically separates sub-domains.

## Base Groups

### Auth & Users
- `POST /auth/login` - Returns JWT.
- `GET /users/me` 
- `GET /users` - Admin only.

### Inspections & Scanning
- `POST /inspections` - Create a new inspection instance.
- `GET /inspections/{id}` 
- `POST /scanner/upload` - Upload image, trigger async pipeline.
- `GET /scanner/status/{job_id}` 

### Modules & Pipeline Access
- `POST /ocr/extract` - Raw OCR pass.
- `POST /declarations/parse` - Structural declaration mapping.
- `POST /compliance/evaluate` - Test parsed data against active rules.
- `GET /evidence/{finding_id}` - Retrieve stored evidence arrays.

### Rules & Control Dashboard (Admin Only)
- `GET /rules`
- `POST /rules` - Create base rule.
- `POST /rule-versions` - Propose a new version (DRAFT).
- `PUT /rule-versions/{id}/activate` - Transition to ACTIVE, retire previous.
- `POST /rules/simulate` - Rule Simulator (Pass mock structured data to test logic).

### Workflow & Violation
- `GET /violations`
- `POST /notices` - Issue improvement notice for a violation.
- `POST /rectifications` - Manufacture uploads corrected collateral.
- `POST /reinspections` - Link an old inspection to a new verification pass.

### Enforcements & Dashboard
- `GET /risk/{manufacturer_id}` - Fetch calculated risk tier and explanation.
- `GET /dashboard/stats` - Enforcement insights, aggregation for charts.
- `GET /ecommerce/scan` - Process sample online URL.

## API Principles
- Use Pydantic models for strict Data Validation.
- Throw 403 for RBAC violations.
- Include structured error handling for validation exceptions.
