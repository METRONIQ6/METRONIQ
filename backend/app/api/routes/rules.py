from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_admin, get_current_user
from app.models.rule import Rule, RuleVersion
from app.schemas.rule import RuleResponse, RuleCreate
import uuid

router = APIRouter()

@router.get("/", response_model=List[RuleResponse])
def get_rules(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return db.query(Rule).all()

@router.post("/", response_model=RuleResponse)
def create_rule(rule_in: RuleCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    if db.query(Rule).filter(Rule.id == rule_in.id).first():
        raise HTTPException(status_code=400, detail="Rule ID already exists")
    
    rule = Rule(id=rule_in.id, name=rule_in.name, category=rule_in.category)
    db.add(rule)
    
    ver = RuleVersion(rule_id=rule.id, version_number=1, status="DRAFT", logic_payload=rule_in.initial_logic)
    db.add(ver)
    
    db.commit()
    db.refresh(rule)
    return rule

@router.post("/simulate")
def simulate_rule(admin = Depends(get_current_admin)):
    return {"status": "SIMULATION", "result": "PASS", "confidence": 0.95}

@router.post("/{version_id}/approve")
def approve_rule_version(version_id: str, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    ver = db.query(RuleVersion).filter(RuleVersion.id == version_id).first()
    if not ver:
        raise HTTPException(404, "Not found")
    if ver.status != "REVIEW":
        raise HTTPException(400, "Invalid transition. Must be in REVIEW.")
    ver.status = "APPROVED"
    db.commit()
    return {"message": "Rule Approved"}