import os
import requests
import time
import hashlib
from urllib.parse import urlparse

OFF_API = "https://world.openfoodfacts.org/api/v2/search"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../external_data/openfoodfacts_expansion"))

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def pull_data(target=30):
    os.makedirs(RAW_DIR, exist_ok=True)
    
    downloaded = 0
    existing_hashes = set()
    found_products = 0
    
    for page in range(1, (target // 10) + 2):
        params = {
            "countries_tags_en": "india",
            "page_size": 10,
            "page": page,
            "fields": "code,product_name,image_front_url,image_ingredients_url,image_packaging_url"
        }
        
        try:
            response = requests.get(OFF_API, params=params, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                print(f"API V2 Response Code: {response.status_code} on page {page}")
                break
        except Exception as e:
            print(f"API V2 Error: {e}")
            break
            
        data = response.json()
        products = data.get("products", [])
        if not products: break
        
        found_products += len(products)
        
        for p in products:
            code = p.get('code')
            urls = []
            if p.get('image_front_url'): urls.append(("front", p['image_front_url']))
            if p.get('image_ingredients_url'): urls.append(("ingredients", p['image_ingredients_url']))
            if p.get('image_packaging_url'): urls.append(("packaging", p['image_packaging_url']))
                
            for tag, url in urls:
                try:
                    res = requests.get(url, headers=HEADERS, timeout=10)
                    if res.status_code == 200:
                        ext = os.path.splitext(urlparse(url).path)[1]
                        if not ext: ext = ".jpg"
                        img_path = os.path.join(RAW_DIR, f"{code}_{tag}{ext}")
                        with open(img_path, 'wb') as img_f:
                            img_f.write(res.content)
                            
                        file_hash = calculate_sha256(img_path)
                        if file_hash in existing_hashes:
                            os.remove(img_path)
                        else:
                            existing_hashes.add(file_hash)
                            downloaded += 1
                            print(f"Downloaded {img_path}")
                    time.sleep(0.5)
                except Exception as e:
                    pass
                    
        time.sleep(2)
                    
    return found_products, downloaded

if __name__ == "__main__":
    pull_data(40)
