# System Architecture

The MetronIQ system follows a modular monolith approach designed for simplicity, scalability, and ease of deployment by a small team.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients
        Web[Web Client - Next.js]
        Mobile[Mobile Client - Flutter]
    end

    subgraph API Gateway
        FastAPI[FastAPI Backend]
        Auth[Authentication - JWT/RBAC]
    end

    subgraph Application Services
        IS[Inspection Service]
        ScanS[Scanner Service]
        LabS[Label Audit Service]
        OCR[OCR & Extraction Service]
        CatS[Categorization Service]
        CompS[Compliance Service]
        RuleS[Rule Control Service]
        EvidS[Evidence Service]
        RiskS[Risk Service]
        ReinsS[Reinspection Service]
        RepS[Report Service]
        NotS[Notification Service]
        AnaS[Analytics Service]
    end

    subgraph Data Store
        DB[(PostgreSQL)]
        S3[(Object Storage / MinIO)]
    end

    subgraph Background Queue
        Celery Worker
        Redis Queue
    end

    Web <--> FastAPI
    Mobile <--> FastAPI

    FastAPI --> Auth
    Auth --> Application Services

    Application Services --> DB
    Application Services --> S3
    
    ScanS -.->|Async Heavy Tasks| Redis Queue
    Redis Queue -.-> Celery Worker
    Celery Worker -.-> DB
```

## Description
- **Clients:** A responsive Next.js Web App (Dashboard & Admin) and Flutter Mobile App (Field Officer).
- **API Layer:** FastAPI provides async capabilities out-of-the-box and validates data using Pydantic.
- **Application Services:** Distinct logical modules within the same backend application. This prevents unnecessary microservice complexity while keeping code decoupled.
- **Data & Storage:** PostgreSQL is the single source of truth for structured data. S3-compatible storage handles images and generated reports.
- **Background Jobs:** Celery and Redis are utilized exclusively for heavy workloads, such as asynchronous AI pipelines or generating complex reports.
