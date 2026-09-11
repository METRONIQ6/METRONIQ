import subprocess
import time
import requests
import json
import os

print('Starting Backend...')
backend = subprocess.Popen(r'.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001', cwd='backend', shell=True)

API_URL = 'http://127.0.0.1:8001/api/v1'
headers = {}
for i in range(25):
    try:
        resp = requests.get("http://127.0.0.1:8001/docs", timeout=1)
        if resp.status_code == 200:
            print("BACKEND IS UP!")
            break
    except:
        pass
    print(f"Waiting for backend... ({i+1}/25)")
    time.sleep(2)

try:
    print('\n======================================')
    print('[LIVE DEMO API] -> AUTHENTICATION (officer@metroniq.local)')
    print('======================================')
    resp = requests.post(f'{API_URL}/auth/login', data={'username': 'officer@metroniq.local', 'password': 'password', 'grant_type': 'password'})
    if resp.status_code == 200:
        token = resp.json().get('access_token')
        headers['Authorization'] = f'Bearer {token}'
        print('LOGIN: PASS')
        
        print('\n======================================')
        print('[LIVE DEMO API] -> START NEW INSPECTION & UPLOAD IMAGE')
        print('======================================')
        with open('test_label.jpg', 'rb') as f:
            files = {'file': ('test_label.jpg', f, 'image/jpeg')}
            print('Uploading test_label.jpg...')
            resp = requests.post(f'{API_URL}/scanner/upload', headers=headers, files=files)
            
            if resp.status_code == 200:
                data = resp.json()
                scan_id = data.get('scan_id')
                print(f'IMAGE UPLOAD: PASS (Scan ID: {scan_id})')
                
                print('\n======================================')
                print('[LIVE DEMO API] -> AI SCANNER (YOLO, PaddleOCR, Rules)')
                print('======================================')
                print('Waiting for YOLO, PaddleOCR, and Rule Engine to complete (Max 60s)...')
                status_data = None
                for _ in range(40):
                    status_resp = requests.get(f'{API_URL}/scanner/{scan_id}/status', headers=headers)
                    if status_resp.status_code == 200:
                        status_data = status_resp.json()
                        print(f'Status: {status_data.get("status")}')
                        if status_data.get('status') in ['COMPLETED', 'FAILED']:
                            break
                    time.sleep(2)
                
                if status_data.get('status') == 'COMPLETED':
                    print('SCANNER: PASS')
                    print('COMPLIANCE RESULT:', status_data.get('compliance_result'))
                    print('RISK LEVEL:', status_data.get('risk_score'))
                    print('DETAILED EVIDENCE PAYLOAD:')
                    evidence = json.loads(status_data.get('evidence_payload', '{}')) if isinstance(status_data.get('evidence_payload'), str) else status_data.get('evidence_payload', {})
                    cv_data = evidence.get('computer_vision', {})
                    
                    print(f'\nYOLO OUTPUT:\n  Model: {cv_data.get("model_type")}\n  Is Valid Package: {cv_data.get("is_valid_image")}')
                    print(f'  Detections: {cv_data.get("detections", [])}')
                    
                    print(f'\nPADDLEOCR OUTPUT:\n  Characters Found: {len(cv_data.get("ocr_full_text", ""))}')
                    print(f'  Snippet: {repr(cv_data.get("ocr_full_text", "")[:150])}')
                    
                    print(f'\nDECLARATION EXTRACTION:\n  {json.dumps(evidence.get("declarations", {}), indent=2)}')
                    print(f'\nLEGAL METROLOGY RULE VALIDATION:\n  {json.dumps(evidence.get("validation", {}), indent=2)}')
                else:
                    print('SCANNER: FAIL (Timeout or Error)')
            else:
                print(f'IMAGE UPLOAD: FAIL ({resp.status_code})')
    else:
        print(f'LOGIN: FAIL ({resp.status_code} - {resp.text})')

except Exception as e:
    print("FATAL ERROR: ", e)

finally:
    backend.terminate()
    print('Backend terminated.')
