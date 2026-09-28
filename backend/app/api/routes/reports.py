import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from fastapi.responses import FileResponse
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.enforcement import EnforcementCase
from app.models.reinspection import Reinspection
from app.models.notice import ImprovementNotice
from app.models.inspection import Inspection
from app.models.product import Product

router = APIRouter()

# ── List Reports (returns inspections visible to the current user) ──
@router.get("")
def list_reports(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Returns inspections as reports, scoped to the user's role and ownership.
    Officers see inspections they created. Manufacturers see inspections linked
    to their products. Admins see all.
    """
    query = db.query(Inspection)

    if current_user.role == "OFFICER":
        query = query.filter(Inspection.officer_id == current_user.id)
    elif current_user.role == "MANUFACTURER":
        query = query.join(Product, Inspection.product_id == Product.id, isouter=True).filter(
            (Inspection.officer_id == current_user.id) | (Product.owner_id == current_user.id)
        )
    # ADMIN sees all

    inspections = query.order_by(desc(Inspection.created_at)).limit(100).all()

    results = []
    for insp in inspections:
        evidence = {}
        if insp.evidence_payload:
            try:
                evidence = json.loads(insp.evidence_payload)
            except Exception:
                pass

        results.append({
            "id": insp.id,
            "type": "INSPECTION",
            "status": insp.status,
            "result": insp.result,
            "risk_level": insp.risk_level,
            "created_at": insp.created_at.isoformat() if insp.created_at else None,
            "has_validation": bool(evidence.get("validation")),
        })

    return results

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

        # --- Handle standalone inspection (no enforcement chain) ---
        if not notice and not case:
            # Authorize
            authorized = False
            if current_user.role == "ADMIN":
                authorized = True
            elif orig_insp.officer_id == current_user.id:
                authorized = True
            elif orig_insp.product_id:
                product = db.query(Product).filter(Product.id == orig_insp.product_id).first()
                if product and product.owner_id == current_user.id:
                    authorized = True
            if not authorized:
                raise HTTPException(status_code=403, detail="Access Denied")

            # Parse evidence payload for validation details
            evidence = {}
            if orig_insp.evidence_payload:
                try:
                    evidence = json.loads(orig_insp.evidence_payload)
                except Exception:
                    pass

            validation = evidence.get("validation", {})
            declarations = evidence.get("legal_declarations", {})
            metadata = evidence.get("metadata", {})

            timeline = [
                {
                    "event": "INSPECTION",
                    "status": orig_insp.status,
                    "result": orig_insp.result,
                    "timestamp": orig_insp.created_at
                }
            ]

            return {
                "case_id": None,
                "case_status": None,
                "penalty_amount": None,
                "inspection": {
                    "id": orig_insp.id,
                    "result": orig_insp.result,
                    "status": orig_insp.status,
                    "risk_level": orig_insp.risk_level,
                },
                "notice": {"id": None, "status": None},
                "reinspection": {"id": None, "status": None, "result": None},
                "timeline": timeline,
                "validation": validation,
                "declarations": {k: v for k, v in declarations.items() if not k.startswith("_META")},
                "metadata": metadata,
            }
                
    else:
        try:
            parsed_id = uuid.UUID(id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid ID format")
            
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

    authorized = False
    if current_user.role == "ADMIN":
        authorized = True
    elif orig_insp.officer_id == current_user.id:
        authorized = True
    elif new_insp and new_insp.officer_id == current_user.id:
        authorized = True
    elif orig_insp.product_id:
        product = db.query(Product).filter(Product.id == orig_insp.product_id).first()
        if product and product.owner_id == current_user.id:
            authorized = True

    if not authorized:
        raise HTTPException(status_code=403, detail="Access Denied")
    
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
