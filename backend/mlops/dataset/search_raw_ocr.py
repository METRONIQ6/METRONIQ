import glob
import json

hits = []
for f in glob.glob('backend/mlops/dataset/ocr_results/*.json'):
    try:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            if data and data[0]:
                for region in data[0]:
                    text = region[1][0].lower()
                    if 'marketed' in text or 'mktd' in text:
                        hits.append(text)
    except Exception as e:
        pass
        
print("Found matches:", hits)
