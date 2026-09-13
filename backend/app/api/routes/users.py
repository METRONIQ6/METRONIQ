from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.api.deps import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized. Admin role required.")
    return current_user

@router.get("/counts", response_model=dict)
def get_user_counts(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_manufacturers = db.query(User).filter(User.role == "MANUFACTURER").count()
    total_officers = db.query(User).filter(User.role == "OFFICER").count()
    pending_officers = db.query(User).filter(User.role == "OFFICER", User.status == "PENDING_APPROVAL").count()
    approved_officers = db.query(User).filter(User.role == "OFFICER", User.status == "APPROVED").count()
    rejected_officers = db.query(User).filter(User.role == "OFFICER", User.status == "REJECTED").count()
    
    return {
        "manufacturers": total_manufacturers,
        "officers_total": total_officers,
        "officers_pending": pending_officers,
        "officers_approved": approved_officers,
        "officers_rejected": rejected_officers
    }

@router.get("/", response_model=List[UserOut])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by email"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    if status:
        query = query.filter(User.status == status.upper())
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
        
    return query.order_by(User.created_at.desc()).all()


@router.post("/{user_id}/approve", response_model=UserOut)
def approve_user(user_id: UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot approve yourself.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.status = "APPROVED"
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/reject", response_model=UserOut)
def reject_user(user_id: UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot reject yourself.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.status = "REJECTED"
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/suspend", response_model=UserOut)
def suspend_user(user_id: UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.status = "SUSPENDED"
    db.commit()
    db.refresh(user)
    return user

