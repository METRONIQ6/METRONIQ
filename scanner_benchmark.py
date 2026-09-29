"""
MetronIQ Scanner Pipeline Benchmark & Rehearsal Test
Measures real timings across the full scan pipeline:
  Upload -> Processing -> OCR -> Rules -> Result

Usage: python scanner_benchmark.py
"""
import requests
import time
import os
import sys

BASE_URL = "http://localhost:8000"
API = f"{BASE_URL}/api/v1"

# Real test image (from INSP-8B89C307 scan)
TEST_IMAGE = r"d:\MetronIQ\backend\app\temp_uploads\INSP-8B89C307.jpg"
FALLBACK_IMAGE = r"d:\MetronIQ\backend\bus.jpg"

# Real credentials (OAuth2 form-data)
CREDENTIALS_TO_TRY = [
    {"username": "admin@metroniq.local", "password": "MetronIQ_Test123"},
    {"username": "officer@metroniq.local", "password": "MetronIQ_Test123"},
    {"username": "admin@metroniq.local", "password": "admin123"},
    {"username": "officer@metroniq.local", "password": "officer123"},
]

timings = []
errors = []
http500s = 0


def login(email, password):
    t0 = time.perf_counter()
    r = requests.post(
        f"{API}/auth/login",
        data={"username": email, "password": password},
        timeout=10
    )
    dt = (time.perf_counter() - t0) * 1000
    if r.status_code == 200:
        token = r.json().get("access_token")
        role = r.json().get("role")
        print(f"  [LOGIN] OK {dt:.0f}ms — {email} ({role})")
        return token, dt
    print(f"  [LOGIN] FAILED {r.status_code} — {r.text[:100]}")
    return None, dt


def try_login():
    for creds in CREDENTIALS_TO_TRY:
        token, dt = login(creds["username"], creds["password"])
        if token:
            return token, dt, creds["username"]
    return None, 0, None


def upload_image(token, image_path):
    t0 = time.perf_counter()
    with open(image_path, "rb") as f:
        r = requests.post(
            f"{API}/scanner/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": (os.path.basename(image_path), f, "image/jpeg")},
            timeout=30
        )
    dt = (time.perf_counter() - t0) * 1000
    if r.status_code == 200:
        scan_id = r.json().get("id")
        print(f"  [UPLOAD] OK {dt:.0f}ms — scan_id: {scan_id}")
        return scan_id, dt
    raise RuntimeError(f"Upload failed: {r.status_code} {r.text[:200]}")


def start_processing(token, scan_id):
    """Try both URL patterns that the frontend uses."""
    global http500s
    t0 = time.perf_counter()
    # Pattern 1: /scanner/process?scan_id=XXX (frontend uses this)
    r = requests.post(
        f"{API}/scanner/process",
        params={"scan_id": scan_id},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    dt = (time.perf_counter() - t0) * 1000
    if r.status_code != 404:
        print(f"  [PROCESS TRIGGER] HTTP {r.status_code} {dt:.0f}ms" + (f" — {r.json()}" if r.status_code == 200 else ""))
        if r.status_code >= 500:
            http500s += 1
        return r.status_code, dt

    # Pattern 2: /scanner/{scan_id}/process (backend route)
    t0 = time.perf_counter()
    r2 = requests.post(
        f"{API}/scanner/{scan_id}/process",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    dt2 = (time.perf_counter() - t0) * 1000
    print(f"  [PROCESS TRIGGER ALT] HTTP {r2.status_code} {dt2:.0f}ms")
    if r2.status_code >= 500:
        http500s += 1
    return r2.status_code, dt2


def poll_status(token, scan_id, max_wait=120):
    poll_start = time.perf_counter()
    poll_count = 0
    status = "PROCESSING"

    while status in ("PROCESSING", "UPLOADED"):
        time.sleep(0.8)
        r = requests.get(
            f"{API}/scanner/{scan_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        poll_count += 1
        elapsed = time.perf_counter() - poll_start

        if r.status_code == 200:
            status = r.json().get("status", "UNKNOWN")
        else:
            print(f"  [STATUS] HTTP {r.status_code} at poll #{poll_count}")

        if elapsed > max_wait:
            return "TIMEOUT", elapsed * 1000, poll_count

        if status == "FAILED":
            break

    total_poll = (time.perf_counter() - poll_start) * 1000
    print(f"  [STATUS] {status} after {poll_count} polls, {total_poll:.0f}ms")
    return status, total_poll, poll_count


def get_result(token, scan_id):
    t0 = time.perf_counter()
    r = requests.get(
        f"{API}/scanner/{scan_id}/result",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    dt = (time.perf_counter() - t0) * 1000
    if r.status_code == 200:
        data = r.json()
        compliance = data.get("compliance", "UNKNOWN")
        risk = data.get("risk_score", "UNKNOWN")
        print(f"  [RESULT] OK {dt:.0f}ms — Compliance: {compliance}, Risk: {risk}")
        return data, dt
    print(f"  [RESULT] HTTP {r.status_code}")
    return None, dt


def get_report(token, scan_id):
    t0 = time.perf_counter()
    r = requests.get(
        f"{API}/reports/{scan_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    dt = (time.perf_counter() - t0) * 1000
    if r.status_code == 200:
        print(f"  [REPORT] OK {dt:.0f}ms")
        return r.json(), dt
    print(f"  [REPORT] HTTP {r.status_code} — {r.text[:100]}")
    return None, dt


def download_pdf(token, scan_id):
    t0 = time.perf_counter()
    r = requests.get(
        f"{API}/reports/{scan_id}/pdf",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30
    )
    dt = (time.perf_counter() - t0) * 1000
    if r.status_code == 200:
        size = len(r.content)
        print(f"  [PDF] OK {dt:.0f}ms — {size} bytes")
        return True, dt
    print(f"  [PDF] HTTP {r.status_code}")
    return False, dt


def run_single_scan(token, image_path, scan_num=1, test_report=False):
    global http500s
    print(f"\n--- SCAN #{scan_num} [{os.path.basename(image_path)}] ---")
    t_total = time.perf_counter()
    result = {
        "scan_num": scan_num,
        "upload_ms": 0,
        "proc_ms": 0,
        "poll_ms": 0,
        "result_ms": 0,
        "total_ms": 0,
        "compliance": None,
        "scan_id": None,
        "status": "UNKNOWN",
        "error": None,
    }

    try:
        scan_id, upload_ms = upload_image(token, image_path)
        result["scan_id"] = scan_id
        result["upload_ms"] = upload_ms

        proc_code, proc_ms = start_processing(token, scan_id)
        result["proc_ms"] = proc_ms
        if proc_code >= 500:
            raise RuntimeError(f"Process trigger HTTP {proc_code}")

        final_status, poll_ms, poll_count = poll_status(token, scan_id)
        result["poll_ms"] = poll_ms
        result["status"] = final_status

        if final_status == "TIMEOUT":
            raise RuntimeError("Scan timed out after 120s")

        data, result_ms = get_result(token, scan_id)
        result["result_ms"] = result_ms
        if data:
            result["compliance"] = data.get("compliance")

        if test_report:
            report_data, report_ms = get_report(token, scan_id)
            if report_data:
                pdf_ok, pdf_ms = download_pdf(token, scan_id)

        result["total_ms"] = (time.perf_counter() - t_total) * 1000
        print(f"  [TOTAL] {result['total_ms']:.0f}ms")

    except Exception as e:
        result["error"] = str(e)
        result["total_ms"] = (time.perf_counter() - t_total) * 1000
        errors.append({"scan": scan_num, "error": str(e)})
        print(f"  [ERROR] Scan #{scan_num}: {e}")

    timings.append(result)
    return result


def print_summary():
    print("\n" + "=" * 60)
    print("  METRONIQ SCANNER REHEARSAL SUMMARY")
    print("=" * 60)

    completed = [t for t in timings if t["error"] is None]
    failed = [t for t in timings if t["error"] is not None]

    print(f"\nTotal scans run  : {len(timings)}")
    print(f"Completed        : {len(completed)}")
    print(f"Failed           : {len(failed)}")
    print(f"HTTP 500 errors  : {http500s}")

    if completed:
        totals = [t["total_ms"] for t in completed]
        polls = [t["poll_ms"] for t in completed]

        print(f"\nTotal scan time:")
        print(f"  Average : {sum(totals)/len(totals)/1000:.1f}s ({sum(totals)/len(totals):.0f}ms)")
        print(f"  Fastest : {min(totals)/1000:.1f}s ({min(totals):.0f}ms)")
        print(f"  Slowest : {max(totals)/1000:.1f}s ({max(totals):.0f}ms)")

        print(f"\nProcessing time (OCR+YOLO+Rules, from poll):")
        print(f"  Average : {sum(polls)/len(polls)/1000:.1f}s")
        print(f"  Fastest : {min(polls)/1000:.1f}s")
        print(f"  Slowest : {max(polls)/1000:.1f}s")

        compliance_map = {}
        for t in completed:
            c = t.get("compliance") or "UNKNOWN"
            compliance_map[c] = compliance_map.get(c, 0) + 1
        print(f"\nCompliance results:")
        for c, cnt in compliance_map.items():
            print(f"  {c}: {cnt}")

    # Duplicate scan ID check
    scan_ids = [t.get("scan_id") for t in timings if t.get("scan_id")]
    unique_ids = set(scan_ids)
    duplicate_ok = len(scan_ids) == len(unique_ids)
    print(f"\nDuplicate scan ID check: {'PASS (no duplicates)' if duplicate_ok else 'FAIL (duplicates found!)'}")

    if errors:
        print(f"\nErrors:")
        for e in errors:
            print(f"  #{e['scan']}: {e['error']}")

    print("\n" + "=" * 60)
    print("REHEARSAL READINESS VERDICT:")
    if not completed:
        print("  NOT READY — No scans completed successfully")
    elif failed:
        pct = len(completed) / len(timings) * 100
        print(f"  PARTIAL — {len(completed)}/{len(timings)} scans succeeded ({pct:.0f}%)")
    else:
        avg = sum(t["total_ms"] for t in completed) / len(completed) / 1000
        print(f"  READY — All {len(completed)} scans completed, avg {avg:.1f}s")
    print("=" * 60)


def main():
    print("=" * 60)
    print("  METRONIQ SCANNER PIPELINE BENCHMARK")
    print(f"  {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Health check
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        d = r.json()
        print(f"[HEALTH] Backend: {d.get('status')}, OCR: {d.get('ocr_service')}")
    except Exception as e:
        print(f"[HEALTH] Cannot reach backend: {e}")
        sys.exit(1)

    # Choose image
    image_path = TEST_IMAGE
    if not os.path.exists(image_path):
        image_path = FALLBACK_IMAGE
    if not os.path.exists(image_path):
        print("No test image found. Add an image to backend/app/temp_uploads/INSP-8B89C307.jpg")
        sys.exit(1)
    print(f"Test image: {image_path} ({os.path.getsize(image_path):,} bytes)")

    # Login
    print("\n[1] AUTHENTICATION")
    token, login_ms, user = try_login()
    if not token:
        print("Authentication failed.")
        sys.exit(1)
    print(f"Authenticated as: {user} ({login_ms:.0f}ms)")

    # Single scan with report
    print("\n[2] SINGLE SCAN (real image, with report + PDF download)")
    run_single_scan(token, image_path, scan_num=1, test_report=True)

    # 5 consecutive scans
    print("\n[3] 5 CONSECUTIVE SCANS")
    for i in range(2, 7):
        run_single_scan(token, image_path, scan_num=i)

    # 10 consecutive scans
    print("\n[4] 10 CONSECUTIVE SCANS (total = 16)")
    for i in range(7, 17):
        run_single_scan(token, image_path, scan_num=i)

    print_summary()


if __name__ == "__main__":
    main()
