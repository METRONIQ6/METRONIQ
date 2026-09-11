import os, json, re

def get_keys(obj, prefix=''):
    keys = set()
    for k, v in obj.items():
        if isinstance(v, dict):
            keys.update(get_keys(v, prefix+k+'.'))
        else:
            keys.add(prefix+k)
    return keys

with open('frontend/src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_keys = get_keys(json.load(f))

used_keys = set()
for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = re.findall(r"t\(['\"]([^'\"]+)['\"]\)", content)
                used_keys.update(matches)

missing = used_keys - en_keys
print('Missing keys in en.json:')
for m in sorted(missing):
    print(m)
