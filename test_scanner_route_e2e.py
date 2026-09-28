import os
import sys
import uuid
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.inspection import Inspection
from app.models.rule import Rule

test_engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(test_engine)
TestSession = sessionmaker(bind=test_engine)
db = TestSession()

# 1. Test with active OCR service
os.environ["OCR_SERVICE_URL"] = "http://localhost:8009"

from app.api.routes.scanner import job_store, execute_cv_pipeline, hash_cache
from app.ai.pipeline.scanner_pipeline import _scanner_pipeline_instance
import app.ai.pipeline.scanner_pipeline as sp_module

scan_id_success = f"TEST-SUCCESS-{uuid.uuid4().hex[:6].upper()}"
img_path = os.path.join(os.path.dirname(__file__), "backend", "app", "temp_uploads", "INSP-8B89C307.jpg")

job_store[scan_id_success] = {
    "id": scan_id_success,
    "status": "UPLOADED",
    "file_path": img_path,
    "result": None,
    "evidence": None
}

print(f"\n--- Testing execute_cv_pipeline with active OCR service ({scan_id_success}) ---")
execute_cv_pipeline(scan_id_success, db)
job_success = job_store[scan_id_success]
print("Job status:", job_success["status"])
print("Job compliance:", job_success.get("result", {}).get("compliance"))
print("Job risk score:", job_success.get("result", {}).get("risk_score"))

assert job_success["status"] == "COMPLETED"
assert job_success["result"]["compliance"] in ["COMPLIANT", "NON_COMPLIANT", "PARTIAL"]
print("VERIFIED: Active OCR service pipeline completed successfully and evaluated legal rules!")

# 2. Test fail-safe behavior when external OCR is down
# Clear hash cache and reset pipeline singleton to simulate failing external OCR service
hash_cache.cache.clear()
os.environ["OCR_SERVICE_URL"] = "http://localhost:9999"
sp_module._scanner_pipeline_instance = None  # Reset singleton to pick up new OCR_SERVICE_URL

scan_id_fail = f"TEST-FAIL-{uuid.uuid4().hex[:6].upper()}"
job_store[scan_id_fail] = {
    "id": scan_id_fail,
    "status": "UPLOADED",
    "file_path": img_path,
    "result": None,
    "evidence": None
}

print(f"\n--- Testing execute_cv_pipeline with DOWN OCR service ({scan_id_fail}) ---")
execute_cv_pipeline(scan_id_fail, db)
job_fail = job_store[scan_id_fail]
print("Job status:", job_fail["status"])
print("Job compliance:", job_fail.get("result", {}).get("compliance"))
print("Job risk score:", job_fail.get("result", {}).get("risk_score"))
print("Job validation details message:", job_fail.get("result", {}).get("validation_details", {}).get("message"))

assert job_fail["status"] == "COMPLETED"
assert job_fail["result"]["compliance"] == "NOT VERIFIED / OCR SERVICE UNAVAILABLE"
assert job_fail["result"]["risk_score"] == "LOW"
print("VERIFIED: When OCR microservice is down, scan is marked 'NOT VERIFIED / OCR SERVICE UNAVAILABLE' and NOT legally non-compliant!")

db.close()
print("\nALL SCANNER ROUTE END-TO-END TESTS PASSED PERFECTLY!")
