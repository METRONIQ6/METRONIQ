import json
from deep_translator import GoogleTranslator
import time
import sys
from concurrent.futures import ThreadPoolExecutor

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

translator_ta = GoogleTranslator(source='en', target='ta')
translator_hi = GoogleTranslator(source='en', target='hi')

def try_translate(translator, v):
    for attempt in range(3):
        try:
            return translator.translate(v)
        except Exception as e:
            time.sleep(0.5)
    return v

def translate_dict_concurrent(d, lang):
    res = {}
    translator = translator_ta if lang == 'ta' else translator_hi
    
    # gather all terminal nodes
    jobs = []
    
    # Using a helper class to track references
    class Node:
        def __init__(self, parent, k, v):
            self.parent = parent
            self.k = k
            self.v = v
            self.translated = None

    nodes = []

    def traverse(curr_d, curr_r):
        for k, v in curr_d.items():
            if isinstance(v, dict):
                curr_r[k] = {}
                traverse(v, curr_r[k])
            else:
                if v == "Edit":
                    curr_r[k] = "????????" if lang == 'ta' else "??????? ????"
                else:
                    n = Node(curr_r, k, v)
                    nodes.append(n)

    traverse(d, res)
    
    def process(n):
        n.translated = try_translate(translator, n.v)
        
    with ThreadPoolExecutor(max_workers=20) as executor:
        executor.map(process, nodes)
        
    for n in nodes:
        n.parent[n.k] = n.translated
        
    return res

print("Translating TA...")
ta_data = translate_dict_concurrent(en_data, 'ta')

print("Translating HI...")
hi_data = translate_dict_concurrent(en_data, 'hi')

with open('frontend/src/i18n/locales/ta.json', 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, indent=4, ensure_ascii=False)

with open('frontend/src/i18n/locales/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_data, f, indent=4, ensure_ascii=False)

print("Translations complete.")
