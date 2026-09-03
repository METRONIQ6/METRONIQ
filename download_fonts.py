import urllib.request
import os

fonts_to_download = {
    "NotoSans-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Regular.ttf",
    "NotoSansTamil-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/notosanstamil/NotoSansTamil-Regular.ttf",
    "NotoSansDevanagari-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari-Regular.ttf"
}

os.makedirs("backend/fonts", exist_ok=True)

for font_name, url in fonts_to_download.items():
    path = os.path.join("backend/fonts", font_name)
    if not os.path.exists(path):
        print(f"Downloading {font_name}...")
        urllib.request.urlretrieve(url, path)
        print(f"Downloaded {font_name}")

print("Font download complete.")
