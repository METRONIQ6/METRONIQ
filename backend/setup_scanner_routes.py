import os

backend_dir = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend"
routes_dir = os.path.join(backend_dir, "app", "api", "routes")
router_file = os.path.join(backend_dir, "app", "api", "router.py")

scanner_route_content = """from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException
import uuid
import shutil
import os
import cv2
from typing import Dict, Any

from app.ai.pipeline.scanner_pipeline import ScannerPipeline

router = APIRouter()
pipeline = ScannerPipeline()

# In-memory dictionary representing standard async job tracking
# In production, this proxies to Redis/PostgreSQL or Celery State.
job_store: Dict[str, Any] = {}

# Strict OS limits for disk buffering
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image file.")
        
    scan_id = str(uuid.uuid4())
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

def execute_cv_pipeline(scan_id: str):
    job = job_store.get(scan_id)
    if not job:
        return
        
    job["status"] = "PROCESSING"
    try:
        # Pass to OpenCV
        image = cv2.imread(job["file_path"])
        
        # Fire unified Pipeline Engine!
        evidence_payload = pipeline.run(image, filename=os.path.basename(job["file_path"]))
        
        # Legal Metrology Stub Generator based on findings
        declarations = evidence_payload.get("legal_declarations", {})
        
        compliance_check = "PASS" if "net_quantity" in declarations else "FLAGGED"
        
        job["result"] = {
            "compliance": compliance_check,
            "rules_verified": len(declarations.keys()),
            "risk_score": "LOW" if compliance_check == "PASS" else "HIGH"
        }
        job["evidence"] = evidence_payload
        job["status"] = "COMPLETED"
    except Exception as e:
        job["status"] = "FAILED"
        job["error"] = str(e)
        import logging
        logging.getLogger("MetronIQ-API-Scanner").error(f"Scan crash: {str(e)}")

@router.post("/process")
async def process_image(scan_id: str, background_tasks: BackgroundTasks):
    if scan_id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
        
    current_status = job_store[scan_id]["status"]
    if current_status != "UPLOADED":
        return {"id": scan_id, "status": current_status, "message": "Already processing."}
        
    # Queue inference asynchronously
    background_tasks.add_task(execute_cv_pipeline, scan_id)
    return {"id": scan_id, "status": "PROCESSING"}

@router.get("/{id}/status")
async def get_status(id: str):
    if id not in job_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    # Return strict payload bounds
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

# Write the new scanner routing block
with open(os.path.join(routes_dir, "scanner.py"), "w", encoding="utf-8") as f:
    f.write(scanner_route_content)

# Remove the old cv.py standalone to keep architecture clean and non-duplicative
old_cv = os.path.join(routes_dir, "cv.py")
if os.path.exists(old_cv):
    os.remove(old_cv)

# Remap main router API endpoints globally
with open(router_file, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(" cv\n", " scanner\n").replace(", cv", ", scanner")
content = content.replace(
    'api_router.include_router(cv.router, prefix="/cv", tags=["computer-vision"])',
    'api_router.include_router(scanner.router, prefix="/scanner", tags=["scanner"])'
)

with open(router_file, "w", encoding="utf-8") as f:
    f.write(content)

print("Mapped Asynchronous Async Job Router securely into FastAPI limits.")
