from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionResponse

router = APIRouter()

@router.get("", response_model=List[InspectionResponse])
def get_inspections(limit: int = 50, offset: int = 0, db: Session = Depends(get_db), user = Depends(get_current_user)):
    from sqlalchemy import desc
    return db.query(Inspection).order_by(desc(Inspection.created_at)).offset(offset).limit(limit).all()
