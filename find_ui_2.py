import os, json, re
results = {}
for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all JSX text nodes (heuristically)
            for m in re.finditer(r'>\s*([A-Za-z][^<>{}\_]+\b)\s*<', content):
                val = m.group(1).strip()
                if len(val) > 2 and 't(' not in val and 'className' not in val:
                    results.setdefault(path, set()).add(val)
                    
            # Find placeholders
            for m in re.finditer(r'placeholder=(?:\"|\')([A-Za-z][^\"\']+)(?:\"|\')', content):
                val = m.group(1).strip()
                results.setdefault(path, set()).add(val)

out = {k: list(v) for k, v in results.items()}
with open('hardcoded.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=4)
