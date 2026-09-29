import httpx
import time

def run():
    client = httpx.Client()
    resp = client.post('https://metroniq-backend-production.up.railway.app/api/v1/auth/login', data={'username': 'officer@metroniq.local', 'password': 'password123'})
    token = resp.json()['access_token']
    headers = {'Authorization': 'Bearer ' + token}
    
    with open('backend/bus.jpg', 'rb') as f:
        res = client.post('https://metroniq-backend-production.up.railway.app/api/v1/scanner/upload', files={'file': ('bus.jpg', f, 'image/jpeg')}, headers=headers).json()
        
    print('UPLOAD:', res)
    sid = res["id"]
    
    proc = client.post(f'https://metroniq-backend-production.up.railway.app/api/v1/scanner/{sid}/process', headers=headers)
    print('PROCESS:', proc.status_code, proc.text)
    
    for i in range(20):
        time.sleep(2)
        stat = client.get(f'https://metroniq-backend-production.up.railway.app/api/v1/scanner/{sid}/status', headers=headers)
        print(f"POLL {i}:", stat.text)
        if "COMPLETED" in stat.text or "FAILED" in stat.text:
            break
            
    res_final = client.get(f'https://metroniq-backend-production.up.railway.app/api/v1/scanner/{sid}/result', headers=headers)
    print('RESULT:', res_final.text[:200])
    
if __name__ == "__main__":
    run()
