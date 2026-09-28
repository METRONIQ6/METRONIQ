import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from fastapi.responses import FileResponse

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.enforcement import EnforcementCase
from app.models.reinspection import Reinspection
from app.models.notice import ImprovementNotice
from app.models.inspection import Inspection
from app.models.product import Product

router = APIRouter()

@router.get("/{id}")
def get_case_audit_trail(id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    orig_insp = None
    notice = None
    rein = None
    case = None
    new_insp = None

    if id.startswith("INSP-"):
        orig_insp = db.query(Inspection).filter(Inspection.id == id).first()
        if not orig_insp:
            raise HTTPException(status_code=404, detail="Inspection not found")
            
        notice = db.query(ImprovementNotice).filter(ImprovementNotice.inspection_id == orig_insp.id).first()
        if notice:
            rein = db.query(Reinspection).filter(Reinspection.notice_id == notice.id).first()
            if rein:
                new_insp = db.query(Inspection).filter(Inspection.id == rein.new_inspection_id).first()
                case = db.query(EnforcementCase).filter(EnforcementCase.reinspection_id == rein.id).first()
                
    else:
        try:
            parsed_id = uuid.UUID(id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid ID format")
            
        # Try to find what this ID is
        case = db.query(EnforcementCase).filter(EnforcementCase.id == parsed_id).first()
        if case:
            rein = db.query(Reinspection).filter(Reinspection.id == case.reinspection_id).first()
            if rein:
                new_insp = db.query(Inspection).filter(Inspection.id == rein.new_inspection_id).first()
                orig_insp = db.query(Inspection).filter(Inspection.id == rein.original_inspection_id).first()
                if rein.notice_id:
                    notice = db.query(ImprovementNotice).filter(ImprovementNotice.id == rein.notice_id).first()
        else:
            notice = db.query(ImprovementNotice).filter(ImprovementNotice.id == parsed_id).first()
            if notice:
                orig_insp = db.query(Inspection).filter(Inspection.id == notice.inspection_id).first()
                rein = db.query(Reinspection).filter(Reinspection.notice_id == notice.id).first()
                if rein:
                    new_insp = db.query(Inspection).filter(Inspection.id == rein.new_inspection_id).first()
                    case = db.query(EnforcementCase).filter(EnforcementCase.reinspection_id == rein.id).first()
            else:
                raise HTTPException(status_code=404, detail="Report entity not found")

    if not orig_insp:
        raise HTTPException(status_code=404, detail="Underlying inspection not found for report")

    # ----- AUTHORIZATION CHECK -----
    if current_user.role == "MANUFACTURER":
        if orig_insp.product_id:
            product = db.query(Product).filter(Product.id == orig_insp.product_id).first()
            if not product or product.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access Denied")
        else:
            raise HTTPException(status_code=403, detail="Access Denied")
    elif current_user.role == "OFFICER":
        # Check if they are the officer who did the inspection
        # if orig_insp.officer_id != current_user.id:
        #    raise HTTPException(status_code=403, detail="Access Denied")
        pass # Some systems allow officers to see all reports. We will restrict to own or let it be? The prompt says "according to officer permissions". Let's assume officer can see all for now, or just their own. Wait! The prompt says "Unauthorized cross-user access must remain blocked." So if current_user.role == "OFFICER", restrict to orig_insp.officer_id == current_user.id. Wait, what if another officer does the reinspection? Let's check orig_insp.officer_id or new_insp.officer_id!
        authorized = False
        if orig_insp.officer_id == current_user.id:
            authorized = True
        if new_insp and new_insp.officer_id == current_user.id:
            authorized = True
        if not authorized:
            raise HTTPException(status_code=403, detail="Access Denied")
    elif current_user.role == "ADMIN":
        pass
    else:
        raise HTTPException(status_code=403, detail="Access Denied")
    # ---------------------------------
    
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
            
    if case:
        timeline.append({"event": "ENFORCEMENT_ESCALATED", "status": case.status, "timestamp": case.created_at})
        if case.status == "RESOLVED":
            timeline.append({"event": "RESOLUTION", "status": case.status, "timestamp": case.resolved_at})
        
    timeline.sort(key=lambda x: x["timestamp"].timestamp() if getattr(x["timestamp"], "timestamp", None) else 0)
    
    return {
        "case_id": str(case.id) if case else None,
        "case_status": case.status if case else None,
        "penalty_amount": case.penalty_amount if case else None,
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

@router.get("/{id}/pdf")
def download_case_pdf(id: str, lang: str = "en", db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    audit_data = get_case_audit_trail(id, db, current_user)
    from app.services.pdf_generator import generate_audit_pdf
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    os.makedirs(temp_dir, exist_ok=True)
    output_path = os.path.join(temp_dir, f"MetronIQ_Audit_Report_{id}.pdf")
    generate_audit_pdf(audit_data, output_path, lang)
    return FileResponse(output_path, filename=f"MetronIQ_Audit_Report_{id}.pdf", media_type="application/pdf")
