# Security Architecture

## Authentication & Authorization
- **JWT (JSON Web Tokens):** Standard Bearer token authentication flow.
- **RBAC (Role Based Access Control):** Matrix strictly enforced at the FastAPI middleware/route dependency level using role lists.
  - *Officer*: Field operations, scans, inspections, notices.
  - *Manufacturer*: Read-only for their own findings, upload abilities for rectifications.
  - *Admin*: User management, rule management, dashboard analytics.

## Audit Logging & Traceability
- **Entity Immutability:** Legal rules are immutable once active. Active rules cannot be edited, only versioned and retired.
- **Decision Auditability:** Every single COMPLIANCE_RESULT traces back to a specific `rule_version_id`, an explicit expected condition, and the literal bounding-box evidence that triggered the violation. 
- **Audit Logs:** Standard operations (logging in, activating a rule, issuing a notice) create rows in an `audit_logs` table tracking user, timestamp, action, and target.

## Infrastructure Security
- **File Uploads:** S3 generates signed URLs. File mime-types are validated both client-side and via python-magic server-side.
- **Secrets:** Pydantic `BaseSettings` pulls all credentials (DB, JWT secrets, LLM keys) from environment variables safely.
- **CORS:** Only configured to accept traffic from the recognized Next.js/Flutter origins.
- **Rate Limiting:** Protects the AI scanner routes using Redis limiters to prevent resource abuse.
