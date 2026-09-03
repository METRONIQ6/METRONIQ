# Database Architecture

The PostgreSQL schema ensures strict traceability, version control for rules, and separated hierarchies for users and findings.

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PERMISSIONS : "has"
    USERS {
        uuid id PK
        string role "OFFICER, MANUFACTURER, ADMIN"
        string email
        string password_hash
        timestamp created_at
    }

    MANUFACTURERS ||--o{ PRODUCTS : "produces"
    MANUFACTURERS {
        uuid id PK
        string name
        uuid user_id FK
    }

    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "groups"
    PRODUCTS ||--o{ INSPECTIONS : "subject of"
    
    INSPECTIONS ||--o{ INSPECTION_ITEMS : "contains"
    INSPECTIONS {
        uuid id PK
        uuid officer_id FK
        uuid product_id FK
        string status
        timestamp created_at
    }

    INSPECTIONS ||--o{ PACKAGE_IMAGES : "has"
    PACKAGE_IMAGES ||--o{ OCR_RESULTS : "analyzed as"
    OCR_RESULTS ||--o{ DECLARATIONS : "yields"
    
    DECLARATIONS {
        uuid id PK
        uuid image_id FK
        string field_name
        string extracted_value
        string source_text
        string bounding_box
        float confidence
    }

    RULES ||--o{ RULE_VERSIONS : "versions"
    RULES {
        uuid id PK
        string rule_name
        string product_category
    }

    RULE_VERSIONS {
        uuid id PK
        uuid rule_id FK
        string requirement
        string validation_logic
        string severity
        string status "DRAFT, ACTIVE, RETIRED"
        integer version
        timestamp effective_date
    }

    INSPECTION_ITEMS ||--o{ COMPLIANCE_RESULTS : "generates"
    COMPLIANCE_RESULTS ||--|{ EVIDENCE : "supported by"
    COMPLIANCE_RESULTS {
        uuid id PK
        uuid rule_version_id FK
        string expected_condition
        string observed_value
        string result "PASS, REVIEW, FAIL"
        string reason
    }
    
    COMPLIANCE_RESULTS ||--o{ VIOLATIONS : "triggers"
    VIOLATIONS ||--o{ NOTICES : "leads to"
    NOTICES ||--o{ RECTIFICATIONS : "resolves via"
    RECTIFICATIONS ||--o{ REINSPECTIONS : "requires"

    RISK_SCORES {
        uuid id PK
        uuid manufacturer_id FK
        uuid product_id FK
        integer score
        string risk_level "LOW, MEDIUM, HIGH"
        string risk_factors
    }
```

## Traceability Principles
- Nothing is physically deleted; statuses are toggled (soft delete).
- `RULE_VERSIONS` allows a `COMPLIANCE_RESULT` to clearly identify exactly what logic evaluated it at that specific moment in time.
- Evidence references explicit declaration IDs, bounding boxes, and images.
