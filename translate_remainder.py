import json
import os
from deep_translator import GoogleTranslator
from concurrent.futures import ThreadPoolExecutor

def get_keys(d, prefix=''):
    keys = {}
    for k, v in d.items():
        if isinstance(v, dict):
            keys.update(get_keys(v, prefix + k + '.'))
        else:
            keys[prefix + k] = v
    return keys

def set_key(d, dot_key, val):
    keys = dot_key.split('.')
    for k in keys[:-1]:
        d = d.setdefault(k, {})
    d[keys[-1]] = val

en = json.load(open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8'))
ta = json.load(open('frontend/src/i18n/locales/ta.json', 'r', encoding='utf-8'))
hi = json.load(open('frontend/src/i18n/locales/hi.json', 'r', encoding='utf-8'))

en_flat = get_keys(en)
ta_flat = get_keys(ta)
hi_flat = get_keys(hi)

missing_ta = [k for k in en_flat if k not in ta_flat or ta_flat[k] == '']
missing_hi = [k for k in en_flat if k not in hi_flat or hi_flat[k] == '']

print(f'Missing TA: {len(missing_ta)}')
print(f'Missing HI: {len(missing_hi)}')

def t_ta(k): 
    try:
        if 'penaltyAmount' in k or 'enterPenaltyAmount' in k:
            return k, en_flat[k]
        res = GoogleTranslator(source='en', target='ta').translate(en_flat[k].replace('\u20b9','INR'))
        return k, res if res else en_flat[k]
    except Exception as e: 
        return k, en_flat[k]

def t_hi(k): 
    try:
        if 'penaltyAmount' in k or 'enterPenaltyAmount' in k:
            return k, en_flat[k]
        res = GoogleTranslator(source='en', target='hi').translate(en_flat[k].replace('\u20b9','INR'))
        return k, res if res else en_flat[k]
    except Exception as e: 
        return k, en_flat[k]

with ThreadPoolExecutor(max_workers=20) as ex:
    ta_res = list(ex.map(t_ta, missing_ta))
    hi_res = list(ex.map(t_hi, missing_hi))

for k, v in ta_res: set_key(ta, k, v)
for k, v in hi_res: set_key(hi, k, v)

json.dump(ta, open('frontend/src/i18n/locales/ta.json', 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
json.dump(hi, open('frontend/src/i18n/locales/hi.json', 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
print('Done bridging translations')
