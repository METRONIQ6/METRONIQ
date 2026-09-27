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
    from sqlalchemy import case
    today = date.today()
    
    insp_stats = db.query(
        func.count(Inspection.id).label('total'),
        func.sum(case((Inspection.result == 'FAIL', 1), else_=0)).label('failed'),
        func.sum(case((Inspection.result == 'PASS', 1), else_=0)).label('passed'),
        func.sum(case((Inspection.risk_level == 'HIGH', 1), else_=0)).label('high_risk'),
        func.sum(case((func.date(Inspection.created_at) == today, 1), else_=0)).label('today')
    ).first()

    notice_stats = db.query(
        func.sum(case((ImprovementNotice.status.in_(['ISSUED', 'RECTIFICATION_SUBMITTED']), 1), else_=0)).label('open'),
        func.sum(case((ImprovementNotice.status == 'RECTIFICATION_SUBMITTED', 1), else_=0)).label('pending')
    ).first()

    reinspections_due = db.query(Reinspection).filter(Reinspection.status == 'SCHEDULED').count()
    
    enf_stats = db.query(
        func.sum(case((EnforcementCase.status.in_(['OPEN', 'UNDER_REVIEW', 'PENALTY_PENDING']), 1), else_=0)).label('active'),
        func.sum(case((EnforcementCase.status == 'PENALTY_PENDING', 1), else_=0)).label('pending_pen')
    ).first()

    return {
        "totalInspections": insp_stats.total or 0,
        "inspectionsToday": insp_stats.today or 0,
        "failedInspections": insp_stats.failed or 0,
        "passedInspections": insp_stats.passed or 0,
        "highRiskCases": insp_stats.high_risk or 0,
        "openNotices": notice_stats.open or 0,
        "pendingRectifications": notice_stats.pending or 0,
        "reinspectionsDue": reinspections_due or 0,
        "activeEnforcement": enf_stats.active or 0,
        "penaltiesPending": enf_stats.pending_pen or 0
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
