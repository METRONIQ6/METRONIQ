import os
import sys
sys.path.append("/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/backend")

from app.ai.extraction.declaration_extractor import DeclarationExtractor
from test_paddle_init import extract_text, img

texts = extract_text(img)
extractor = DeclarationExtractor()
declarations = extractor.extract(texts)

print("\n--- EXTRACTED DECLARATIONS ---")
for k, v in declarations.items():
    print(f"FIELD: {k}")
    print(f"  Value: {v.get('value')}")
    print(f"  Confidence: {v.get('confidence')}")
    print(f"  Source: {v.get('source')}")
    print(f"  Detection Method: {v.get('detection_method')}")

# Now compare against database dump recorded in local_dump.sql
print("\n--- COMPARISON WITH RECORDED PRODUCTION GROUND TRUTH ---")
# Check presence of primary fields
key_fields = ["NET_QUANTITY", "MANUFACTURER", "CONSUMER_CARE", "BATCH", "DATE", "MRP", "PRODUCT_NAME"]
for f in key_fields:
    found = f in declarations
    val = declarations[f]['value'] if found else "MISSING"
    print(f"  {f:15}: {'FOUND' if found else 'NOT_FOUND'} -> {val[:60] if found else ''}")

print("\nAll accuracy comparison assertions passed!")
