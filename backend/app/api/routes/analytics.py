from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_admin, get_current_user
from app.models.user import User
from app.core.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter()
analytics_svc = AnalyticsService()

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """Yields strict structural KPIs for the smart dashboard."""
    return analytics_svc.get_overview(db)

@router.get("/trends")
def get_inspection_trends(days: int = 7, db: Session = Depends(get_db)):
    """Time-series execution block."""
    return analytics_svc.get_trends(db, days)

@router.get("/ai-observations")
def get_ai_observations(db: Session = Depends(get_db)):
    """Dynamically calculates AI Detections avoiding N+1 loops where possible, but runs Python JSON loads parsing."""
    return analytics_svc.get_ai_observations(db)

@router.get("/geo")
def get_geo_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Yields role-scoped geographic compliance inspection data for Admin (system-wide) and Officer (assigned)."""
    if current_user.role not in ["ADMIN", "OFFICER"]:
        raise HTTPException(status_code=403, detail="Not authorized to access Geo Analytics")
    if current_user.role == "OFFICER" and current_user.status != "APPROVED":
        raise HTTPException(status_code=403, detail="Officer account is pending admin approval")
    return analytics_svc.get_geo_analytics(db, current_user)

