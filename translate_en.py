import json
from deep_translator import GoogleTranslator
import time

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

translator_ta = GoogleTranslator(source='en', target='ta')
translator_hi = GoogleTranslator(source='en', target='hi')

override_ta = {
    "METRONIQ LEGAL METROLOGY COMPLIANCE PLATFORM": "?????????? ??????????? ???????? ????? ????",
    "AI Scanner": "AI ???????",
    "Dashboard": "????????? ????",
    "DashboardTitle": "??????? ???? ???????????? ????"
}

override_hi = {
    "METRONIQ LEGAL METROLOGY COMPLIANCE PLATFORM": "???????????? ????? ??? ??????? ??????? ???",
    "AI Scanner": "??? ??????",
    "Dashboard": "????????",
    "DashboardTitle": "?????? ????? ????????"
}

def translate_dict(d, lang='ta'):
    res = {}
    translator = translator_ta if lang == 'ta' else translator_hi
    overrides = override_ta if lang == 'ta' else override_hi
    for k, v in d.items():
        if isinstance(v, dict):
            res[k] = translate_dict(v, lang)
        else:
            if v in overrides:
                res[k] = overrides[v]
            elif isinstance(v, str):
                try:
                    res[k] = translator.translate(v)
                    time.sleep(0.05) # rate limit
                except Exception as e:
                    print(f"Error translating '{v}': {e}")
                    res[k] = v
            else:
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

print("Translations generated cleanly with native Python unicode.")
