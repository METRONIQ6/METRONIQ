import json
import os
import re
import sys

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_keys(d, prefix=""):
    keys = set()
    for k, v in d.items():
        if isinstance(v, dict):
            keys.update(extract_keys(v, prefix + k + "."))
        else:
            keys.add(prefix + k)
    return keys

def get_empty_values(d, prefix=""):
    empties = []
    for k, v in d.items():
        if isinstance(v, dict):
            empties.extend(get_empty_values(v, prefix + k + "."))
        elif not str(v).strip():
            empties.append(prefix + k)
    return empties

base_path = 'frontend/src/i18n/locales'
en = load_json(os.path.join(base_path, 'en.json'))
ta = load_json(os.path.join(base_path, 'ta.json'))
hi = load_json(os.path.join(base_path, 'hi.json'))

en_keys = extract_keys(en)
ta_keys = extract_keys(ta)
hi_keys = extract_keys(hi)

issues = []

# 1. Missing keys
missing_ta = en_keys - ta_keys
missing_hi = en_keys - hi_keys
if missing_ta:
    issues.append(f"Tamil is missing {len(missing_ta)} keys")
if missing_hi:
    issues.append(f"Hindi is missing {len(missing_hi)} keys")

# 2. Blank values
blank_en = get_empty_values(en)
blank_ta = get_empty_values(ta)
blank_hi = get_empty_values(hi)
if blank_en:
    issues.append(f"English has {len(blank_en)} blank values")
if blank_ta:
    issues.append(f"Tamil has {len(blank_ta)} blank values")
if blank_hi:
    issues.append(f"Hindi has {len(blank_hi)} blank values")

# 3. Check code for hardcoded UI strings (very basic heuristic)
hardcoded = []
for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            # looking for standard UI strings in tags (e.g. >Word<) ignoring t(...)
            matches = re.findall(r'>\s*([A-Z][a-z0-9A-Z\s]{2,}?)\s*<', content)
            for m in matches:
                if 't(' not in m and '{' not in m:
                    # Filter out common false positives like "XYZ" or pure data
                    hardcoded.append(f"{file}: '{m}'")

if hardcoded:
    issues.append(f"Found {len(set(hardcoded))} potentially hardcoded strings (check manually)")

# 4. Check missing-key fallbacks: t('key') || "string"
fallbacks = []
for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if re.search(r't\([^)]*\)\s*\|\|', content):
                fallbacks.append(file)
if fallbacks:
    issues.append(f"Found translation fallbacks in: {', '.join(fallbacks)}")

if issues:
    print("TRANSLATION COVERAGE ISSUES FOUND:")
    for issue in issues:
        print(f" - {issue}")
    if hardcoded:
        print("Sample hardcoded:")
        for h in list(set(hardcoded))[:10]:
            print(f"   {h}")
    sys.exit(1)
    
print("TRANSLATION COVERAGE TEST PASSED")
sys.exit(0)
