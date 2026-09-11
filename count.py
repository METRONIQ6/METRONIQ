import json
with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

count = 0
def flatten(d):
    global count
    for k, v in d.items():
        if isinstance(v, dict):
            flatten(v)
        else:
            count += 1
            
flatten(en_data)
print("Total keys:", count)
