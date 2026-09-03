import os
import requests
import json
import time
from urllib.parse import urlparse

OFF_API = "https://world.openfoodfacts.org/cgi/search.pl"
USER_AGENT = "MetronIQ-Compliance-Scanner/1.0"
RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../external_data/openfoodfacts/raw"))
META_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../external_data/openfoodfacts/metadata"))

def pull_indian_products(limit=10):
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(META_DIR, exist_ok=True)
    
    print("Querying Open Food Facts for Indian packaged goods...")
    
    params = {
        "action": "process",
        "tagtype_0": "countries",
        "tag_contains_0": "contains",
        "tag_0": "india",
        "json": 1,
        "page_size": limit,
        "fields": "code,product_name,image_front_url,image_ingredients_url,image_nutrition_url,nutriments"
    }
    
    headers = {"User-Agent": USER_AGENT}
    
    response = requests.get(OFF_API, params=params, headers=headers)
    if response.status_code != 200:
        print(f"API Failed: {response.status_code}")
        return
        
    data = response.json()
    products = data.get("products", [])
    
    print(f"Total Indian Products found in OFF DB: {data.get('count', 0)}")
    print(f"Inspecting {len(products)} products in current batch request...\n")
    
    downloaded_images = 0
    
    for p in products:
        code = p.get('code')
        name = p.get('product_name', 'Unknown')
        
        images_to_download = []
        if p.get('image_front_url'): images_to_download.append(("front", p['image_front_url']))
        if p.get('image_ingredients_url'): images_to_download.append(("ingredients", p['image_ingredients_url']))
        if p.get('image_nutrition_url'): images_to_download.append(("nutrition", p['image_nutrition_url']))
        
        if not images_to_download:
            continue
            
        metadata_path = os.path.join(META_DIR, f"{code}.json")
        with open(metadata_path, 'w') as f:
            json.dump(p, f, indent=4)
            
        print(f"Downloading images for: {name} [{code}]")
        for tag, url in images_to_download:
            try:
                res = requests.get(url, headers=headers)
                if res.status_code == 200:
                    ext = os.path.splitext(urlparse(url).path)[1]
                    if not ext: ext = ".jpg"
                    img_path = os.path.join(RAW_DIR, f"{code}_{tag}{ext}")
                    with open(img_path, 'wb') as img_f:
                        img_f.write(res.content)
                    downloaded_images += 1
                time.sleep(0.2) # Polite API usage
            except Exception as e:
                print(f" Failed to download {url}")
                
    print(f"\n==============================================")
    print(f"OPEN FOOD FACTS INGESTION COMPLETE")
    print(f"Total Raw Images Buffered: {downloaded_images}")
    print(f"==============================================")

if __name__ == "__main__":
    pull_indian_products(limit=10)
