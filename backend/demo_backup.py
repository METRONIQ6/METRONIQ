from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MetronIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/inspections", response_model=list[schemas.InspectionOut])
def get_inspections(db: Session = Depends(get_db)):
    return db.query(models.Inspection).all()

@app.post("/api/inspections", response_model=schemas.InspectionOut)
def create_inspection(inspection: schemas.InspectionCreate, db: Session = Depends(get_db)):
    db_inspection = models.Inspection(**inspection.dict())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

@app.post("/api/ai/scan", response_model=schemas.ScanResponse)
def mock_ai_scan(req: schemas.ScanRequest):
    # Mock realistic response for Demo Data
    return {
        "status": "NON-COMPLIANT",
        "summary": "4 passed, 1 fail",
        "risk_score": 87,
        "risk_level": "HIGH",
        "fields": [
            {
                "field": "MRP",
                "selected_value": "₹50",
                "confidence": 0.98,
                "status": "PASS",
                "evidence": "Extracted from bottom left corner",
                "rule_id": "LM-PKG-001",
                "rule_version": "v2.1"
            },
            {
                "field": "Net Quantity",
                "selected_value": "100 g",
                "confidence": 0.96,
                "status": "PASS",
                "evidence": "Detected text '100g'",
                "rule_id": "LM-PKG-002",
                "rule_version": "v1.5"
            },
            {
                "field": "Consumer Care",
                "selected_value": "Missing",
                "confidence": 0.42,
                "status": "FAIL",
                "evidence": "Detected package region does not contain required consumer-care information.",
                "rule_id": "LM-PKG-003",
                "rule_version": "v2.1"
            }
        ]
    }

@app.get("/api/rules", response_model=list[schemas.RuleBase])
def get_rules(db: Session = Depends(get_db)):
    rules = db.query(models.Rule).all()
    # Mock data if empty
    if not rules:
        return [
            {"id": "LM-PKG-001", "requirement": "MRP Declaration", "category": "Packaged Commodities", "version": "v2.1", "status": "ACTIVE"},
            {"id": "LM-PKG-003", "requirement": "Consumer Care Details", "category": "General", "version": "v2.1", "status": "ACTIVE"}
        ]
    return rules

@app.get("/api/analytics/overview")
def get_analytics():
    return {
        "total_inspections": 428,
        "total_violations": 137,
        "compliance_rate": "68%",
        "high_risk_cases": 42
    }
