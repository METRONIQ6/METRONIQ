import os
import shutil
import uuid
import logging
import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends, Query
from sqlalchemy.orm import Session
import cv2

from app.api.deps import get_db, get_current_user
from app.core.database import SessionLocal
from app.models.inspection import Inspection
from app.models.user import User
from app.services.rules_validation_service import RulesValidationService
from app.ai.pipeline.scanner_pipeline import ScannerPipeline

logger = logging.getLogger("MetronIQ-ScannerRoute")
router = APIRouter()

TEMP_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "temp_uploads")
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

job_store: Dict[str, Dict[str, Any]] = {}

def execute_cv_pipeline(scan_id: str):
    """Runs the full CV pipeline in a background thread with its own DB session."""
    if not SessionLocal:
        logger.error("Database session factory not configured — cannot run pipeline.")
        if scan_id in job_store:
            job_store[scan_id]["status"] = "FAILED"
            job_store[scan_id]["error"] = "Database not configured"
        return

    db = SessionLocal()
    try:
        job = job_store.get(scan_id)
        if not job:
            return

        file_path = job["file_path"]
        job["status"] = "PROCESSING"

        image = cv2.imread(file_path)
        if image is None:
            job["status"] = "FAILED"
            job["error"] = "Failed to decode submitted file payload"
            return
            
        pipeline = ScannerPipeline()
        evidence_payload = pipeline.run(image, filename=os.path.basename(file_path))
        meta = evidence_payload.get("metadata", {})
        
        if meta.get("ocr_status") == "FAILED":
            compliance_check = "NOT VERIFIED / OCR SERVICE UNAVAILABLE"
            validation_output = {
                "compliance": compliance_check,
                "risk_score": "LOW",
                "evaluations": [],
                "message": f"OCR service unavailable ({meta.get('ocr_error', 'Unreachable')}). Inspection marked as NOT VERIFIED to prevent false legal violations."
            }
            evidence_payload["validation"] = validation_output
        elif not meta.get("is_valid_image", True):
            compliance_check = "IMAGE_INVALID"
            validation_output = {
                "compliance": compliance_check,
                "risk_score": "HIGH",
                "evaluations": [],
                "message": f"Image Quality Rejection: {meta.get('image_quality', {}).get('reason', 'Poor quality')}"
            }
            evidence_payload["validation"] = validation_output
        else:
            validator = RulesValidationService(db)
            validation_output = validator.validate(evidence_payload.get("legal_declarations", {}))
            evidence_payload["validation"] = validation_output
            compliance_check = validation_output.get("compliance", "NON_COMPLIANT")

        inspection = db.query(Inspection).filter(Inspection.id == scan_id).first()
        if inspection:
            inspection.status = "COMPLETED"
            inspection.result = compliance_check
            inspection.risk_level = validation_output.get("risk_score", "MEDIUM")
            # Must serialize the dictionary to JSON string
            inspection.evidence_payload = json.dumps(evidence_payload)
            db.commit()
            db.refresh(inspection)

        job["status"] = "COMPLETED"
        job["result"] = {
            "compliance": compliance_check,
            "risk_score": validation_output.get("risk_score", "MEDIUM"),
            "declarations": evidence_payload.get("legal_declarations", {}),
            "yolo_detections": evidence_payload.get("yolo_objects", []),
            "metadata": evidence_payload.get("metadata", {}),
            "validation_details": validation_output
        }

    except Exception as e:
        logger.error(f"Execution Error during Scanning Pipeline: {str(e)}")
        if scan_id in job_store:
            job_store[scan_id]["status"] = "FAILED"
            job_store[scan_id]["error"] = str(e)
            
        try:
            inspection = db.query(Inspection).filter(Inspection.id == scan_id).first()
            if inspection:
                inspection.status = "FAILED"
                inspection.evidence_payload = json.dumps({"error": str(e)})
                db.commit()
        except Exception as db_err:
            logger.error(f"Failed to persist error state: {db_err}")
    finally:
        db.close()


@router.post("/upload")
async def upload_image(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan_id = f"INSP-{uuid.uuid4().hex[:8].upper()}"
    file_path = os.path.join(TEMP_UPLOAD_DIR, f"{scan_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job_store[scan_id] = {
        "file_path": file_path,
        "status": "UPLOADED",
        "result": None,
        "error": None
    }
    
    new_inspection = Inspection(
        id=scan_id,
        officer_id=user.id,
        status="UPLOADED",
        result="UNVERIFIED",
        risk_level="LOW",
        evidence_payload=json.dumps({"image_path": file_path})
    )
    db.add(new_inspection)
    db.commit()
    
    return {"id": scan_id, "status": "UPLOADED"}

@router.post("/process")
async def process_image_query(
    background_tasks: BackgroundTasks,
    scan_id: str = Query(..., description="The scan ID to process"),
    user = Depends(get_current_user)
):
    """Process endpoint accepting scan_id as query parameter (frontend's format)."""
    return await _do_process(scan_id, background_tasks)

@router.post("/{scan_id}/process")
async def process_image_path(scan_id: str, background_tasks: BackgroundTasks, user = Depends(get_current_user)):
    """Process endpoint accepting scan_id as path parameter (backwards compat)."""
    return await _do_process(scan_id, background_tasks)

async def _do_process(scan_id: str, background_tasks: BackgroundTasks):
    if scan_id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
        
    current_status = job_store[scan_id]["status"]
    if current_status != "UPLOADED":
        return {"id": scan_id, "status": current_status, "message": "Already processing."}
        
    background_tasks.add_task(execute_cv_pipeline, scan_id)
    return {"id": scan_id, "status": "PROCESSING"}

@router.get("/{id}/status")
async def get_status(id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Prefer in-memory status (updated immediately by background task)
    if id in job_store:
        return {"id": id, "status": job_store[id]["status"]}
    
    # Fallback to DB for completed/historical inspections
    db_inspection = db.query(Inspection).filter(Inspection.id == id).first()
    if db_inspection:
        return {"id": id, "status": db_inspection.status}
    
    raise HTTPException(status_code=404, detail="Inspection not found")

@router.get("/{id}/result")
async def get_result(id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    db_inspection = db.query(Inspection).filter(Inspection.id == id).first()
    if db_inspection and db_inspection.status == "COMPLETED":
        payload = json.loads(db_inspection.evidence_payload) if db_inspection.evidence_payload else {}
        validation = payload.get("validation", {})
        return {
            "id": db_inspection.id,
            "status": db_inspection.status,
            "compliance": db_inspection.result,
            "risk_score": db_inspection.risk_level,
            "declarations": payload.get("legal_declarations", {}),
            "yolo_detections": payload.get("yolo_objects", []),
            "metadata": payload.get("metadata", {}),
            "validation_details": validation,
            "evidence": payload
        }
        
    if id in job_store:
        job = job_store[id]
        if job["status"] == "COMPLETED":
            result = job["result"] or {}
            return {
                "id": id,
                "status": job["status"],
                "compliance": result.get("compliance"),
                "risk_score": result.get("risk_score"),
                "declarations": result.get("declarations", {}),
                "yolo_detections": result.get("yolo_detections", []),
                "metadata": result.get("metadata", {}),
                "validation_details": result.get("validation_details", {}),
            }
        if job["status"] == "FAILED":
            return {"id": id, "status": "FAILED", "error": job["error"]}
        return {"id": id, "status": job["status"]}
        
    raise HTTPException(status_code=404, detail="Inspection not found")
