"""
Full MetronIQ Scanner Pipeline Verification
Tests: Upload → Process → Poll → Result → Notice
Using a real existing image from backend/uploads
"""
import requests
import time
import json

BASE = "http://localhost:8000/api/v1"

# --- LOGIN ---
print("=" * 60)
print("METRONIQ SCANNER PIPELINE VERIFICATION")
print("=" * 60)

login = requests.post(f"{BASE}/auth/login",
    data={"username": "officer@metroniq.local", "password": "password123"})
assert login.status_code == 200, f"Login failed: {login.text}"
token = login.json()["access_token"]
h = {"Authorization": f"Bearer {token}"}
print("LOGIN: PASS")

# --- STEP 1: UPLOAD ---
image_path = "backend/uploads/73351cf1d07e4632a5ffaa6ae0c80f81.jpg"
print(f"\nSTEP 1: Upload real image ({image_path})")

with open(image_path, "rb") as f:
    upload_resp = requests.post(
        f"{BASE}/scanner/upload",
        headers=h,
        files={"file": ("label.jpg", f, "image/jpeg")}
    )

print(f"  Upload status: {upload_resp.status_code}")
if not upload_resp.ok:
    print(f"  UPLOAD FAIL: {upload_resp.text[:300]}")
    exit(1)

upload_data = upload_resp.json()
scan_id = upload_data.get("id")
print(f"  scan_id: {scan_id}")
print(f"  upload status field: {upload_data.get('status')}")
print("UPLOAD: PASS")

# --- STEP 2: PROCESS ---
print(f"\nSTEP 2: Trigger processing (scan_id={scan_id})")
process_resp = requests.post(
    f"{BASE}/scanner/process?scan_id={scan_id}",
    headers=h
)
print(f"  Process trigger status: {process_resp.status_code}")
if not process_resp.ok:
    print(f"  PROCESS FAIL: {process_resp.text[:300]}")
    exit(1)
print("PROCESS TRIGGER: PASS")

# --- STEP 3: POLL FOR COMPLETION ---
print(f"\nSTEP 3: Polling pipeline status...")
status = "PROCESSING"
max_polls = 30
polls = 0
while status in ("PROCESSING", "UPLOADED") and polls < max_polls:
    time.sleep(3)
    polls += 1
    sr = requests.get(f"{BASE}/scanner/{scan_id}/status", headers=h)
    if sr.ok:
        status = sr.json().get("status", "UNKNOWN")
        ocr_failed = sr.json().get("ocr_failed", None)
        print(f"  poll #{polls}: status={status} ocr_failed={ocr_failed}")
    else:
        print(f"  poll #{polls}: status check failed {sr.status_code}")

print(f"\nFinal pipeline status: {status}")
if status == "FAILED":
    print("PIPELINE STATUS: FAILED (backend processing error)")
elif status in ("COMPLETED", "DONE"):
    print("PIPELINE STATUS: PASS")
else:
    print(f"PIPELINE STATUS: UNEXPECTED ({status})")

# --- STEP 4: GET RESULT ---
print(f"\nSTEP 4: Fetch result")
result_resp = requests.get(f"{BASE}/scanner/{scan_id}/result", headers=h)
print(f"  Result status: {result_resp.status_code}")
if result_resp.ok:
    result = result_resp.json()
    print(f"  compliance: {result.get('compliance')}")
    print(f"  result field: {result.get('result')}")
    vd = result.get("validation_details") or {}
    evals = vd.get("evaluations", [])
    print(f"  rule evaluations: {len(evals)}")
    for ev in evals[:5]:
        print(f"    field={ev.get('field')} status={ev.get('status')} rule={ev.get('rule_id','')[:20]}")
    detected = result.get("detected_declarations") or {}
    print(f"  detected_declarations keys: {list(detected.keys())[:8]}")
    ocr_text = result.get("raw_ocr_text", "")
    print(f"  raw_ocr_text length: {len(ocr_text) if ocr_text else 0} chars")
    if ocr_text:
        print(f"  ocr sample: {str(ocr_text)[:200]}")
    print("RESULT FETCH: PASS")
else:
    print(f"  RESULT FAIL: {result_resp.text[:300]}")

# --- STEP 5: NOTICES API ---
print(f"\nSTEP 5: Verify Notice issuable (if FAIL result)")
if result_resp.ok and result.get("compliance") is False:
    violations = [ev.get("field") for ev in evals if ev.get("status") == "FAIL"]
    notice_resp = requests.post(
        f"{BASE}/notices/",
        headers={**h, "Content-Type": "application/json"},
        json={
            "inspection_id": scan_id,
            "violations": ", ".join(violations),
            "due_date": "2026-09-15T00:00:00"
        }
    )
    print(f"  Notice POST: {notice_resp.status_code}")
    if notice_resp.ok:
        nd = notice_resp.json()
        print(f"  Notice id: {nd.get('id')} status={nd.get('status')}")
        print("NOTICE: PASS")
    else:
        print(f"  NOTICE FAIL: {notice_resp.text[:200]}")
elif result_resp.ok and result.get("compliance") is True:
    print("  Scan is PASS — no notice needed (correct behavior)")
    print("NOTICE: SKIP (compliant scan)")
else:
    print("  NOTICE: NOT VERIFIED (result fetch failed)")

# --- SUMMARY ---
print("\n" + "=" * 60)
print("SCANNER PIPELINE SUMMARY")
print("=" * 60)
print(f"  scan_id:          {scan_id}")
print(f"  final_status:     {status}")
if result_resp.ok:
    print(f"  compliance:       {result.get('compliance')}")
    print(f"  rule_evals:       {len(evals)}")
    print(f"  ocr_text_len:     {len(ocr_text) if ocr_text else 0}")
    print(f"  ocr_executed:     {'YES' if ocr_text else 'NO — OCR returned empty/None'}")
