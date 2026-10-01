from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_officer
from sqlalchemy import func, desc
from datetime import datetime, date, timedelta

from app.models.audit import AuditLog
from app.models.inspection import Inspection
from app.models.notice import ImprovementNotice
from app.models.reinspection import Reinspection
from app.models.enforcement import EnforcementCase

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db), user = Depends(get_current_officer)):
    from sqlalchemy import case
    today = date.today()
    
    # 1. Base Inspection Query scoped to current officer
    insp_query = db.query(Inspection)
    if user.role == "OFFICER":
        insp_query = insp_query.filter(Inspection.officer_id == user.id)

    insp_stats = insp_query.with_entities(
        func.count(Inspection.id).label('total'),
        func.sum(case((Inspection.result.in_(['FAIL', 'NON_COMPLIANT']), 1), else_=0)).label('failed'),
        func.sum(case((Inspection.result.in_(['PASS', 'COMPLIANT']), 1), else_=0)).label('passed'),
        func.sum(case((Inspection.risk_level == 'HIGH', 1), else_=0)).label('high_risk'),
        func.sum(case((Inspection.risk_level == 'MEDIUM', 1), else_=0)).label('medium_risk'),
        func.sum(case((Inspection.risk_level == 'LOW', 1), else_=0)).label('low_risk'),
        func.sum(case((func.date(Inspection.created_at) == today, 1), else_=0)).label('today')
    ).first()

    # 2. Notices Query scoped to officer
    notice_query = db.query(ImprovementNotice)
    if user.role == "OFFICER":
        officer_insp_ids = db.query(Inspection.id).filter(Inspection.officer_id == user.id)
        notice_query = notice_query.filter(ImprovementNotice.inspection_id.in_(officer_insp_ids))

    notice_stats = notice_query.with_entities(
        func.sum(case((ImprovementNotice.status.in_(['ISSUED', 'RECTIFICATION_SUBMITTED']), 1), else_=0)).label('open'),
        func.sum(case((ImprovementNotice.status == 'RECTIFICATION_SUBMITTED', 1), else_=0)).label('pending')
    ).first()

    # 3. Reinspections Query scoped to officer
    reinsp_query = db.query(Reinspection).filter(Reinspection.status == 'SCHEDULED')
    if user.role == "OFFICER":
        reinsp_query = reinsp_query.filter(Reinspection.assigned_officer_id == user.id)
    reinspections_due = reinsp_query.count()
    
    # 4. Enforcement Query scoped to officer
    enf_query = db.query(EnforcementCase)
    if user.role == "OFFICER":
        enf_query = enf_query.filter(EnforcementCase.assigned_officer_id == user.id)

    enf_stats = enf_query.with_entities(
        func.sum(case((EnforcementCase.status.in_(['OPEN', 'UNDER_REVIEW', 'PENALTY_PENDING']), 1), else_=0)).label('active'),
        func.sum(case((EnforcementCase.status == 'PENALTY_PENDING', 1), else_=0)).label('pending_pen')
    ).first()

    # 5. 7-Day Time Series for Compliance Trend
    start_date = datetime.now() - timedelta(days=7)
    trend_rows = insp_query.filter(Inspection.created_at >= start_date).with_entities(
        func.date(Inspection.created_at).label('date'),
        func.sum(case((Inspection.result.in_(['PASS', 'COMPLIANT']), 1), else_=0)).label('passed'),
        func.sum(case((Inspection.result.in_(['FAIL', 'NON_COMPLIANT']), 1), else_=0)).label('failed'),
        func.count(Inspection.id).label('total')
    ).group_by(func.date(Inspection.created_at)).order_by(func.date(Inspection.created_at)).all()

    compliance_trend = [
        {
            "date": str(r.date),
            "passed": int(r.passed or 0),
            "failed": int(r.failed or 0),
            "total": int(r.total or 0)
        }
        for r in trend_rows
    ]

    # 6. Risk Distribution metrics
    low_count = int(insp_stats.low_risk or 0)
    med_count = int(insp_stats.medium_risk or 0)
    high_count = int(insp_stats.high_risk or 0)
    risk_distribution = [
        {"name": "Low Risk", "value": low_count, "key": "LOW"},
        {"name": "Medium Risk", "value": med_count, "key": "MEDIUM"},
        {"name": "High Risk", "value": high_count, "key": "HIGH"}
    ]

    return {
        "totalInspections": insp_stats.total or 0,
        "inspectionsToday": insp_stats.today or 0,
        "failedInspections": insp_stats.failed or 0,
        "passedInspections": insp_stats.passed or 0,
        "highRiskCases": insp_stats.high_risk or 0,
        "mediumRiskCases": med_count,
        "lowRiskCases": low_count,
        "openNotices": notice_stats.open or 0,
        "pendingRectifications": notice_stats.pending or 0,
        "reinspectionsDue": reinspections_due or 0,
        "activeEnforcement": enf_stats.active or 0,
        "penaltiesPending": enf_stats.pending_pen or 0,
        "riskDistribution": risk_distribution,
        "complianceTrend": compliance_trend
    }

@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db), user = Depends(get_current_officer)):
    query = db.query(AuditLog)
    if user.role == "OFFICER":
        query = query.filter(AuditLog.user_id == user.id)
    logs = query.order_by(desc(AuditLog.created_at)).limit(10).all()
    return [{
        "id": str(log.id),
        "action": log.action,
        "entity": log.entity,
        "entity_id": log.entity_id,
        "timestamp": log.created_at.isoformat() if log.created_at else None
    } for log in logs]
