import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from fastapi.responses import FileResponse

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_officer, get_current_admin
from app.models.enforcement import EnforcementCase
from app.models.reinspection import Reinspection
from app.models.notice import ImprovementNotice
from app.models.inspection import Inspection

router = APIRouter()

@router.get("/{case_id}")
def get_case_audit_trail(case_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        c_id = uuid.UUID(case_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid case ID")
        
    case = db.query(EnforcementCase).filter(EnforcementCase.id == c_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Enforcement case not found")
        
    rein = db.query(Reinspection).filter(Reinspection.id == case.reinspection_id).first()
    notice = None
    orig_insp = None
    new_insp = None
    
    if rein:
        new_insp = db.query(Inspection).filter(Inspection.id == rein.new_inspection_id).first()
        orig_insp = db.query(Inspection).filter(Inspection.id == rein.original_inspection_id).first()
        if rein.notice_id:
            notice = db.query(ImprovementNotice).filter(ImprovementNotice.id == rein.notice_id).first()
            if not notice and orig_insp:
                notice = db.query(ImprovementNotice).filter(ImprovementNotice.inspection_id == orig_insp.id).first()
    
    timeline = []
    
    if orig_insp:
        timeline.append({"event": "INSPECTION", "status": orig_insp.status, "result": orig_insp.result, "timestamp": orig_insp.created_at})
    
    if notice:
        timeline.append({"event": "NOTICE_ISSUED", "status": notice.status, "timestamp": notice.created_at})
        if notice.status == "RECTIFICATION_SUBMITTED":
            timeline.append({"event": "RECTIFICATION_SUBMITTED", "status": "SUBMITTED", "timestamp": notice.updated_at})
            
    if rein:
        timeline.append({"event": "REINSPECTION_SCHEDULED", "status": "SCHEDULED", "timestamp": rein.created_at})
        if rein.status == "COMPLETED":
            timeline.append({"event": "REINSPECTION_COMPLETED", "result": new_insp.result if new_insp else "UNKNOWN", "timestamp": rein.updated_at})
            
    timeline.append({"event": "ENFORCEMENT_ESCALATED", "status": case.status, "timestamp": case.created_at})
    if case.status == "RESOLVED":
        timeline.append({"event": "RESOLUTION", "status": case.status, "timestamp": case.resolved_at})
        
    timeline.sort(key=lambda x: x["timestamp"].timestamp() if getattr(x["timestamp"], "timestamp", None) else 0)
    
    return {
        "case_id": str(case.id),
        "case_status": case.status,
        "penalty_amount": case.penalty_amount,
        "inspection": {
            "id": orig_insp.id if orig_insp else None,
            "result": orig_insp.result if orig_insp else None,
        },
        "notice": {
            "id": str(notice.id) if notice else None,
            "status": notice.status if notice else None
        },
        "reinspection": {
            "id": str(rein.id) if rein else None,
            "status": rein.status if rein else None,
            "result": new_insp.result if new_insp else None
        },
        "timeline": timeline
    }

@router.get("/{case_id}/pdf")
def download_case_pdf(case_id: str, lang: str = "en", db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    audit_data = get_case_audit_trail(case_id, db, current_user)
    from app.services.pdf_generator import generate_audit_pdf
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    os.makedirs(temp_dir, exist_ok=True)
    output_path = os.path.join(temp_dir, f"MetronIQ_Audit_Report_{case_id}.pdf")
    generate_audit_pdf(audit_data, output_path, lang)
    return FileResponse(output_path, filename=f"MetronIQ_Audit_Report_{case_id}.pdf", media_type="application/pdf")
