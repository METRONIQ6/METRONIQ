import os, requests, time
def quick_test():
    OFF_API = "https://world.openfoodfacts.org/api/v2/search"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    params = {"countries_tags_en": "india", "fields": "code,product_name,image_front_url", "page_size": 5}
    try:
        r = requests.get(OFF_API, headers=headers, params=params, timeout=10)
        print("V2 API Status:", r.status_code)
        if r.status_code == 200:
            print("Found:", len(r.json().get('products', [])))
    except Exception as e:
        print(e)
quick_test()
