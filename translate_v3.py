import json
from deep_translator import GoogleTranslator
import time

def translate_safe(translator, text):
    if not text.strip():
        return text
    # Avoid translation of pure internal codes or status enums if desired
    # but the ones here are actual text.
    for _ in range(3):
        try:
            return translator.translate(text)
        except Exception:
            time.sleep(1)
    return text

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

def translate_dict(d, lang):
    res = {}
    # GoogleTranslator is not thread-safe if you reuse the instance concurrently across 20 threads!
    # So we instantiate per dictionary iteration or just do it sequentially.
    translator = GoogleTranslator(source='en', target=lang)
    for k, v in d.items():
        if isinstance(v, dict):
            res[k] = translate_dict(v, lang)
        else:
            if v.startswith("error.") or v.startswith("success.") or v.startswith("warning."):
                res[k] = v
            else:
                res[k] = translate_safe(translator, v)
    return res

print("Translating to Tamil...")
ta_data = translate_dict(en_data, 'ta')
with open('frontend/src/i18n/locales/ta.json', 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, indent=4, ensure_ascii=False)

print("Translating to Hindi...")
hi_data = translate_dict(en_data, 'hi')
with open('frontend/src/i18n/locales/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_data, f, indent=4, ensure_ascii=False)

print("Done translations.")
