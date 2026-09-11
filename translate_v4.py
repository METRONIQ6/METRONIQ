import json
from deep_translator import GoogleTranslator
import time
from concurrent.futures import ThreadPoolExecutor

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

def translate_safe(text, lang):
    if not text.strip(): return text
    if text.startswith("error.") or text.startswith("success.") or text.startswith("warning."): return text
    # NEW INSTANCE EVERY CALL = THREAD SAFE!
    translator = GoogleTranslator(source='en', target=lang)
    for _ in range(3):
        try:
            return translator.translate(text)
        except Exception:
            time.sleep(0.5)
    return text

def translate_fast(lang):
    print(f"Starting {lang}...")
    res = {}
    
    class Node:
        def __init__(self, parent, k, v):
            self.parent = parent
            self.k = k
            self.v = v
    
    nodes = []
    
    def traverse(curr_d, curr_r):
        for k, v in curr_d.items():
            if isinstance(v, dict):
                curr_r[k] = {}
                traverse(v, curr_r[k])
            else:
                nodes.append(Node(curr_r, k, v))
                
    traverse(en_data, res)

    def process(n):
        n.parent[n.k] = translate_safe(n.v, lang)

    with ThreadPoolExecutor(max_workers=30) as ex:
        ex.map(process, nodes)

    with open(f'frontend/src/i18n/locales/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=4, ensure_ascii=False)
    print(f"Done {lang}")

translate_fast('ta')
translate_fast('hi')
