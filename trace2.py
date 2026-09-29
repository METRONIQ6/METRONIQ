import httpx

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
    
if __name__ == "__main__":
    run()
