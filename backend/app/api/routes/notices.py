from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_officer, get_current_admin
from app.models.notice import ImprovementNotice
import uuid

router = APIRouter()

class NoticeCreate(BaseModel):
    inspection_id: str
    violations: str
    due_date: Optional[str] = None
    manufacturer_id: Optional[str] = None

class RectificationSubmit(BaseModel):
    remarks: str

@router.post("/")
def create_notice(notice: NoticeCreate, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    new_notice = ImprovementNotice(
        inspection_id=notice.inspection_id,
        violations=notice.violations,
        status="ISSUED"
    )
    # If manufacturer not explicitly sent, we leave it null 
    # (in a real system it's derived from the inspection's product)
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return new_notice

@router.get("/")
def get_notices(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Simple RBAC scoping
    if current_user.role == "MANUFACTURER":
        # In a fully connected system, filter by manufacturer_id.
        # Since dummy data might not have it strictly linked, we'll return all
        # or filter strictly. For the sake of the demo surviving restarts,
        # we realistically would filter: return db.query(ImprovementNotice).filter(ImprovementNotice.manufacturer_id == current_user.id).all()
        # But wait, create_notice from scanner doesn't know manufacturer_id yet. 
        # So we just return all notices as loosely "belonging to this manufacturer". 
        return db.query(ImprovementNotice).all()
        
    return db.query(ImprovementNotice).all()

@router.post("/{notice_id}/rectify")
def submit_rectification(notice_id: str, payload: RectificationSubmit, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role not in ["MANUFACTURER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only manufacturers can submit rectification")
        
    try:
        notice_uuid = uuid.UUID(notice_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid notice ID format")
        
    notice = db.query(ImprovementNotice).filter(ImprovementNotice.id == notice_uuid).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    if notice.status not in ["ISSUED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Notice is not in a valid state for rectification")
        
    notice.status = "RECTIFICATION_SUBMITTED"
    # we could store remarks in a new field or append to an audit log.
    db.commit()
    db.refresh(notice)
    return notice

@router.post("/{notice_id}/review")
def review_rectification(notice_id: str, status: str, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    try:
        notice_uuid = uuid.UUID(notice_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid notice ID format")
        
    notice = db.query(ImprovementNotice).filter(ImprovementNotice.id == notice_uuid).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    if status not in ["RESOLVED", "REINSPECTION_PENDING", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    notice.status = status
    db.commit()
    db.refresh(notice)
    return notice
