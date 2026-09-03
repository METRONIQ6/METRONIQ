import requests
import json
print("Attempting old .json api...")
try:
    r = requests.get("https://world.openfoodfacts.org/category/indian-groceries.json", headers={"User-Agent":"Mozilla/5.0"})
    print("Status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        print("Products:", len(data.get("products", [])))
except Exception as e:
    print("Error:", e)
