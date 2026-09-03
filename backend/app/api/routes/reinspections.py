from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_officer, get_current_admin
from app.models.reinspection import Reinspection
from app.models.inspection import Inspection
from datetime import datetime
import uuid

router = APIRouter()

class ReinspectionCreate(BaseModel):
    original_inspection_id: str
    notice_id: str

@router.post("/")
def create_reinspection(payload: ReinspectionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    # Schedule a new reinspection based on an existing inspection
    parent = db.query(Inspection).filter(Inspection.id == payload.original_inspection_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Original inspection not found")
        
    rein = Reinspection(
        original_inspection_id=payload.original_inspection_id,
        notice_id=uuid.UUID(payload.notice_id) if payload.notice_id else None,
        assigned_officer_id=current_user.id,
        status="SCHEDULED"
    )
    db.add(rein)
    db.commit()
    db.refresh(rein)
    return rein

@router.get("/")
def get_reinspections(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Reinspection).all()

@router.post("/{reinspection_id}/link_scan")
def link_reinspection_scan(reinspection_id: str, scan_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    """Called after AI scan completes. Flags the generated inspection."""
    import uuid
    rein = db.query(Reinspection).filter(Reinspection.id == uuid.UUID(reinspection_id)).first()
    if not rein:
        raise HTTPException(status_code=404, detail="Reinspection not found")
        
    # The scanner API generated an Inspection ID. Let's find it.
    new_insp = db.query(Inspection).filter(Inspection.id == scan_id).first()
    if not new_insp:
        raise HTTPException(status_code=404, detail="Scan ID not found in Inspections")
        
    new_insp.is_reinspection = True
    new_insp.parent_inspection_id = rein.original_inspection_id
    
    rein.new_inspection_id = new_insp.id
    rein.status = "COMPLETED"
    
    db.commit()
    db.refresh(rein)
    return rein
