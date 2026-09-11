import json
from deep_translator import GoogleTranslator
import time
import sys

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

def translate_dict(d, lang):
    translator = GoogleTranslator(source='en', target=lang)
    res = {}
    for k, v in d.items():
        if isinstance(v, dict):
            res[k] = translate_dict(v, lang)
        else:
            if v == "Edit":
                if lang == 'ta': res[k] = "????????"
                else: res[k] = "??????? ????"
                continue
            
            success = False
            for attempt in range(3):
                try:
                    res[k] = translator.translate(v)
                    time.sleep(0.01)
                    success = True
                    break
                except Exception as e:
                    time.sleep(0.5)
            if not success:
                print(f"Failed parsing {v}")
                res[k] = v
    return res

print("Translating to Tamil...")
ta_data = translate_dict(en_data, 'ta')

print("Translating to Hindi...")
hi_data = translate_dict(en_data, 'hi')

with open('frontend/src/i18n/locales/ta.json', 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, indent=4, ensure_ascii=False)

with open('frontend/src/i18n/locales/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_data, f, indent=4, ensure_ascii=False)

print("Translations complete.")
