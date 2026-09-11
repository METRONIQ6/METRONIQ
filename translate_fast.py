import json
from deep_translator import GoogleTranslator
import os

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Flatten
flat_keys = []
flat_vals = []
def flatten(d, p=""):
    for k, v in d.items():
        if isinstance(v, dict):
            flatten(v, p + k + ".")
        else:
            flat_keys.append(p + k)
            flat_vals.append(v)
            
flatten(en_data)

# GoogleTranslator handles up to ~5000 chars. We have few hundred chars.
translator_ta = GoogleTranslator(source='en', target='ta')
translator_hi = GoogleTranslator(source='en', target='hi')

print("Sending batch to TA...")
ta_trans = translator_ta.translate_batch(flat_vals)
print("Sending batch to HI...")
hi_trans = translator_hi.translate_batch(flat_vals)

def unflatten(keys, vals):
    res = {}
    for i, full_k in enumerate(keys):
        parts = full_k.split('.')
        cur = res
        for p in parts[:-1]:
            if p not in cur:
                cur[p] = {}
            cur = cur[p]
        cur[parts[-1]] = vals[i]
    return res

ta_data = unflatten(flat_keys, ta_trans)
hi_data = unflatten(flat_keys, hi_trans)

# Write out
with open('frontend/src/i18n/locales/ta.json', 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, indent=4, ensure_ascii=False)

with open('frontend/src/i18n/locales/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_data, f, indent=4, ensure_ascii=False)

print("Done generating JSON files!")
