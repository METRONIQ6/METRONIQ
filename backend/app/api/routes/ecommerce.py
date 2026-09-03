from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import asyncio
import uuid
import datetime
import json

from app.core.database import get_db
from app.api.deps import get_current_officer, get_current_user
from app.models.ecommerce import ECommerceMonitor
from app.services.crawler_service import scrape_and_screenshot, SSRFError
from app.api.routes.scanner import job_store, execute_cv_pipeline

router = APIRouter()

class MonitorCreate(BaseModel):
    target_url: str
    monitoring_frequency: str = "DAILY"

@router.post("/")
def create_monitor(payload: MonitorCreate, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    monitor = ECommerceMonitor(
        target_url=payload.target_url,
        monitoring_frequency=payload.monitoring_frequency,
        created_by=current_user.id
    )
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    return monitor

@router.get("/")
def get_monitors(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(ECommerceMonitor).all()

from app.core.database import get_db, SessionLocal

async def run_ecommerce_scan(monitor_id: uuid.UUID):
    db = SessionLocal()
    try:
        monitor = db.query(ECommerceMonitor).filter(ECommerceMonitor.id == monitor_id).first()
        if not monitor:
            return
        
        data = await scrape_and_screenshot(monitor.target_url)
        
        # Insert into Scanner job store
        scan_id = f"INSP-WEB-{str(uuid.uuid4())[:8].upper()}"
        job_store[scan_id] = {
            "id": scan_id,
            "status": "UPLOADED",
            "file_path": data["screenshot_path"],
            "result": None,
            "evidence": None
        }
        
        # Execute the CV pipeline normally in a separate thread so we don't block the async loop
        await asyncio.to_thread(execute_cv_pipeline, scan_id, db)
        
        # Link result to monitor
        job = job_store.get(scan_id)
        if job and job["status"] == "COMPLETED":
            monitor.last_scan_result = job["result"].get("compliance") if job.get("result") else "FAIL"
            
            # The pipeline created the physical database Inspection record dynamically inside execute_cv_pipeline.
            # We can find it and update it with the original source URL.
            from app.models.inspection import Inspection
            insp = db.query(Inspection).filter(Inspection.id == scan_id).first()
            if insp:
                payload = {}
                if insp.evidence_payload:
                    payload = json.loads(insp.evidence_payload)
                payload["source_url"] = data["source_url"]
                payload["ecommerce_monitor_id"] = str(monitor_id)
                payload["ecommerce_title"] = data.get("title")
                payload["ecommerce_dom_price"] = data.get("dom_price")
                payload["ecommerce_dom_seller"] = data.get("dom_seller")
                insp.evidence_payload = json.dumps(payload)
                
        else:
            monitor.last_scan_result = "FAIL_PROCESSING"
            
    except SSRFError as se:
        traceback_str = "SECURITY_BLOCKED"
        monitor.last_scan_result = traceback_str
        print("SSRF Error:", se)
    except Exception as e:
        err_msg = str(e)
        if "NOT_PRODUCT_PAGE" in err_msg:
            monitor.last_scan_result = "NOT_PRODUCT_PAGE"
        elif "Timeout" in err_msg:
            monitor.last_scan_result = "CRAWL_TIMEOUT"
        else:
            monitor.last_scan_result = "CRAWL_ERROR"
        print("Scrape Error:", e)
    finally:
        monitor.last_run_at = datetime.datetime.utcnow()
        db.commit()
        db.close()

@router.post("/{monitor_id}/scan")
async def trigger_scan(monitor_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user = Depends(get_current_officer)):
    try:
        m_id = uuid.UUID(monitor_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    monitor = db.query(ECommerceMonitor).filter(ECommerceMonitor.id == m_id).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
        
    background_tasks.add_task(run_ecommerce_scan, m_id)
    return {"status": "SCAN_TRIGGERED", "monitor_id": str(m_id)}
