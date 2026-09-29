import requests

def test_live():
    base_url = "https://metroniq-backend-production.up.railway.app"
    
    # Check Health
    print("Checking health...")
    r = requests.get(f"{base_url}/api/health")
    print(r.status_code, r.text)

if __name__ == "__main__":
    test_live()
