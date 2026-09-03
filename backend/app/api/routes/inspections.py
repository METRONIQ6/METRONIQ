from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionResponse

router = APIRouter()

@router.get("/", response_model=List[InspectionResponse])
def get_inspections(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return db.query(Inspection).all()