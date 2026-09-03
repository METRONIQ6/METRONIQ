import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_officer, get_current_admin
from app.models.enforcement import EnforcementCase
from app.models.reinspection import Reinspection
from app.models.inspection import Inspection

router = APIRouter()

class EscalateRequest(BaseModel):
    reinspection_id: str

@router.post("/escalate")
def escalate_reinspection(payload: EscalateRequest, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    try:
        r_id = uuid.UUID(payload.reinspection_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reinspection_id format")

    rein = db.query(Reinspection).filter(Reinspection.id == r_id).first()
    if not rein:
        raise HTTPException(status_code=404, detail="Reinspection not found")
        
    if rein.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Reinspection is not completed")
        
    if not rein.new_inspection_id:
        raise HTTPException(status_code=400, detail="Reinspection is completed but has no resulting inspection linked")
        
    # Check the result of the new inspection
    new_insp = db.query(Inspection).filter(Inspection.id == rein.new_inspection_id).first()
    if not new_insp or new_insp.result != "FAIL":
        raise HTTPException(status_code=400, detail="Only failed reinspections can be escalated")
        
    # Check for duplicates
    existing = db.query(EnforcementCase).filter(EnforcementCase.reinspection_id == r_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Enforcement case already exists for this reinspection")
        
    case = EnforcementCase(
        reinspection_id=r_id,
        original_inspection_id=rein.original_inspection_id,
        assigned_officer_id=current_user.id,
        status="OPEN"
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.get("/")
def get_cases(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(EnforcementCase).all()

class StatusUpdate(BaseModel):
    status: str
    penalty_amount: Optional[float] = None

@router.post("/{case_id}/status")
def update_case_status(case_id: str, payload: StatusUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    try:
        c_id = uuid.UUID(case_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid format")
        
    case = db.query(EnforcementCase).filter(EnforcementCase.id == c_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    valid_states = ["OPEN", "UNDER_REVIEW", "PENALTY_PENDING", "PENALTY_ISSUED", "RESOLVED"]
    if payload.status not in valid_states:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    case.status = payload.status
    if payload.penalty_amount is not None:
        case.penalty_amount = payload.penalty_amount
        
    if payload.status == "RESOLVED":
        case.resolved_at = datetime.utcnow()
        
    db.commit()
    db.refresh(case)
    return case
