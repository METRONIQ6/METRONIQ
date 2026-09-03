from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid
import shutil
import os
import cv2
import json
from typing import Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_officer
from app.models.inspection import Inspection
from app.ai.pipeline.scanner_pipeline import ScannerPipeline


router = APIRouter()
pipeline = ScannerPipeline()

job_store: Dict[str, Any] = {}
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), officer = Depends(get_current_officer)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image file.")
        
    scan_id = f"INSP-{str(uuid.uuid4())[:8].upper()}"
    file_path = os.path.join(UPLOAD_DIR, f"{scan_id}.jpg")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job_store[scan_id] = {
        "id": scan_id,
        "status": "UPLOADED",
        "file_path": file_path,
        "result": None,
        "evidence": None
    }
    
    return {"id": scan_id, "status": "UPLOADED"}

def execute_cv_pipeline(scan_id: str, db: Session):
    job = job_store.get(scan_id)
    if not job:
        return
        
    job["status"] = "PROCESSING"
    try:
        image = cv2.imread(job["file_path"])
        evidence_payload = pipeline.run(image, filename=os.path.basename(job["file_path"]))
        
        # VALID IMAGE GATE & OCR ENVIRONMENT GATE
        meta = evidence_payload.get("metadata", {})
        
        if meta.get("ocr_status") == "FAILED":
            compliance_check = "ENVIRONMENT_ERROR"
            validation_output = {
                "compliance": compliance_check,
                "risk_score": "LOW",
                "evaluations": [],
                "message": "OCR unavailable in current environment. Hardware incompatible with PaddlePaddle."
            }
            evidence_payload["validation"] = validation_output
        elif not meta.get("is_valid_image", True):
            compliance_check = "INVALID_IMAGE"
            validation_output = {
                "compliance": compliance_check,
                "risk_score": "LOW",
                "evaluations": [],
                "message": meta.get("validation_note", "No valid product/package detected for inspection")
            }
            evidence_payload["validation"] = validation_output
        else:
            declarations = evidence_payload.get("legal_declarations", {})
            
            from app.services.rules_validation_service import RulesValidationService
            validator = RulesValidationService(db)
            validation_output = validator.validate(declarations)
            
            compliance_check = validation_output["compliance"]
            evidence_payload["validation"] = validation_output
        
        # Write to Database
        db_inspection = Inspection(
            id=scan_id,
            status="COMPLETED",
            result=compliance_check,
            risk_level=validation_output["risk_score"],
            evidence_payload=json.dumps(evidence_payload) if evidence_payload else None
        )
        db.add(db_inspection)
        db.commit()
        db.refresh(db_inspection)
        
        job["result"] = {
            "compliance": compliance_check,
            "rules_verified": len(declarations.keys()),
            "risk_score": validation_output["risk_score"],
            "validation_details": validation_output
        }
        job["evidence"] = evidence_payload
        job["status"] = "COMPLETED"
    except Exception as e:
        job["status"] = "FAILED"
        job["error"] = str(e)
        import logging
        logging.getLogger("MetronIQ-API-Scanner").error(f"Scan crash: {str(e)}")

@router.post("/process")
async def process_image(scan_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), officer = Depends(get_current_officer)):
    if scan_id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
        
    current_status = job_store[scan_id]["status"]
    if current_status != "UPLOADED":
        return {"id": scan_id, "status": current_status, "message": "Already processing."}
        
    # Queue inference DB asynchronously
    background_tasks.add_task(execute_cv_pipeline, scan_id, db)
    return {"id": scan_id, "status": "PROCESSING"}

@router.get("/{id}/status")
async def get_status(id: str, db: Session = Depends(get_db), officer = Depends(get_current_officer)):
    db_inspection = db.query(Inspection).filter(Inspection.id == id).first()
    if db_inspection:
        return {"id": id, "status": db_inspection.status}
        
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    payload = {"id": id, "status": job_store[id]["status"]}
    if job_store[id]["status"] == "FAILED":
        payload["error"] = job_store[id].get("error", "Unknown pipeline crash")
    return payload

@router.get("/{id}/result")
async def get_result(id: str, db: Session = Depends(get_db), officer = Depends(get_current_officer)):
    db_inspection = db.query(Inspection).filter(Inspection.id == id).first()
    if db_inspection and db_inspection.status == "COMPLETED":
        evidence = json.loads(db_inspection.evidence_payload) if db_inspection.evidence_payload else {}
        declarations = evidence.get("legal_declarations", {})
        validation = evidence.get("validation", {})
        return {
            "compliance": db_inspection.result,
            "rules_verified": len(declarations.keys()),
            "risk_score": db_inspection.risk_level,
            "validation_details": validation
        }
        
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    if job_store[id]["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Scan not completed yet")
    return job_store[id]["result"]

@router.get("/{id}/evidence")
async def get_evidence(id: str, db: Session = Depends(get_db), officer = Depends(get_current_officer)):
    db_inspection = db.query(Inspection).filter(Inspection.id == id).first()
    if db_inspection and db_inspection.status == "COMPLETED":
        return json.loads(db_inspection.evidence_payload) if db_inspection.evidence_payload else None
        
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    if job_store[id]["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Scan not completed yet")
    return job_store[id]["evidence"]
