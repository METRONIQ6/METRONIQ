import os
import uuid

backend_dir = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend"
routes_dir = os.path.join(backend_dir, "app", "api", "routes")

scanner_file = os.path.join(routes_dir, "scanner.py")

replacement_content = """from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid
import shutil
import os
import cv2
import json
from typing import Dict, Any

from app.core.database import get_db
from app.models.inspection import Inspection
from app.ai.pipeline.scanner_pipeline import ScannerPipeline
from app.core.security import get_current_user

router = APIRouter()
pipeline = ScannerPipeline()

job_store: Dict[str, Any] = {}
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
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
        
        declarations = evidence_payload.get("legal_declarations", {})
        compliance_check = "PASS" if "net_quantity" in declarations else "FAIL"
        
        # Write to Database
        db_inspection = Inspection(
            id=scan_id,
            status="COMPLETED",
            result=compliance_check,
            risk_level="LOW" if compliance_check == "PASS" else "HIGH"
        )
        db.add(db_inspection)
        db.commit()
        db.refresh(db_inspection)
        
        job["result"] = {
            "compliance": compliance_check,
            "rules_verified": len(declarations.keys()),
            "risk_score": db_inspection.risk_level
        }
        job["evidence"] = evidence_payload
        job["status"] = "COMPLETED"
    except Exception as e:
        job["status"] = "FAILED"
        job["error"] = str(e)
        import logging
        logging.getLogger("MetronIQ-API-Scanner").error(f"Scan crash: {str(e)}")

@router.post("/process")
async def process_image(scan_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if scan_id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
        
    current_status = job_store[scan_id]["status"]
    if current_status != "UPLOADED":
        return {"id": scan_id, "status": current_status, "message": "Already processing."}
        
    # Queue inference DB asynchronously
    background_tasks.add_task(execute_cv_pipeline, scan_id, db)
    return {"id": scan_id, "status": "PROCESSING"}

@router.get("/{id}/status")
async def get_status(id: str):
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    payload = {"id": id, "status": job_store[id]["status"]}
    if job_store[id]["status"] == "FAILED":
        payload["error"] = job_store[id].get("error", "Unknown pipeline crash")
    return payload

@router.get("/{id}/result")
async def get_result(id: str):
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    if job_store[id]["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Scan not completed yet")
    return job_store[id]["result"]

@router.get("/{id}/evidence")
async def get_evidence(id: str):
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    if job_store[id]["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Scan not completed yet")
    return job_store[id]["evidence"]
"""

with open(scanner_file, "w", encoding="utf-8") as f:
    f.write(replacement_content)
    
print("Scanner route bridged natively to PostgreSQL/SQLite via SQLAlchemy!")
