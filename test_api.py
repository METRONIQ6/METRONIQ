import importlib
import subprocess
try:
    import requests
except ImportError:
    subprocess.check_call(['pip', 'install', 'requests'])
    import requests

import time
print("Testing APIs...")
try:
    r = requests.get('https://world.openfoodfacts.org/api/v2/search?countries_tags_en=india&page_size=3', headers={'User-Agent': 'Mozilla/5.0'})
    print('V2 STATUS:', r.status_code)
except Exception as e:
    print('V2 ERROR:', e)
