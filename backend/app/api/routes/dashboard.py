from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from sqlalchemy import func, desc
from datetime import datetime, date

from app.models.audit import AuditLog
from app.models.inspection import Inspection
from app.models.notice import ImprovementNotice
from app.models.reinspection import Reinspection
from app.models.enforcement import EnforcementCase

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db), user = Depends(get_current_user)):
    total_inspections = db.query(Inspection).count()
    failed_inspections = db.query(Inspection).filter(Inspection.result == 'FAIL').count()
    passed_inspections = db.query(Inspection).filter(Inspection.result == 'PASS').count()
    high_risk_cases = db.query(Inspection).filter(Inspection.risk_level == 'HIGH').count()
    open_notices = db.query(ImprovementNotice).filter(ImprovementNotice.status.in_(['ISSUED', 'RECTIFICATION_SUBMITTED'])).count()
    pending_rectifications = db.query(ImprovementNotice).filter(ImprovementNotice.status == 'RECTIFICATION_SUBMITTED').count()
    reinspections_due = db.query(Reinspection).filter(Reinspection.status == 'SCHEDULED').count()
    active_enforcement = db.query(EnforcementCase).filter(EnforcementCase.status.in_(['OPEN', 'UNDER_REVIEW', 'PENALTY_PENDING'])).count()
    penalties_pending = db.query(EnforcementCase).filter(EnforcementCase.status == 'PENALTY_PENDING').count()
    today = date.today()
    inspections_today = db.query(Inspection).filter(func.date(Inspection.created_at) == today).count()

    return {
        "totalInspections": total_inspections,
        "inspectionsToday": inspections_today,
        "failedInspections": failed_inspections,
        "passedInspections": passed_inspections,
        "highRiskCases": high_risk_cases,
        "openNotices": open_notices,
        "pendingRectifications": pending_rectifications,
        "reinspectionsDue": reinspections_due,
        "activeEnforcement": active_enforcement,
        "penaltiesPending": penalties_pending
    }

@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db), user = Depends(get_current_user)):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(10).all()
    return [{
        "id": str(log.id),
        "action": log.action,
        "entity": log.entity,
        "entity_id": log.entity_id,
        "timestamp": log.created_at.isoformat() if log.created_at else None
    } for log in logs]