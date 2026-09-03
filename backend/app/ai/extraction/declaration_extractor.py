import logging
from typing import List, Dict, Any

logger = logging.getLogger("MetronIQ-Extractor")

class DeclarationExtractor:
    def __init__(self):
        # Target Ontology Strict Bound
        self.target_fields = [
            "MRP", "NET_QUANTITY", "MANUFACTURER", 
            "PACKER", "IMPORTER", "CONSUMER_CARE",
            "DATE", "BATCH", "PRODUCT_NAME"
        ]

    def extract(self, ocr_texts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Maps textual extraction fragments cleanly into the Legal Domain Output definitions.
        HARDENING: Maps the yolo_region strictly explicitly.
        """
        import re
        declarations = {}
        
        for item in ocr_texts:
            yolo_region = item.get("yolo_region", "GLOBAL_FALLBACK")
            cleaned_region = yolo_region.replace("GENERIC_", "").upper()
            mapped_field = cleaned_region if cleaned_region in self.target_fields else "UNCLASSIFIED_TEXT"
            
            if mapped_field == "UNCLASSIFIED_TEXT":
                text_upper = item.get('text', '').upper()
                # Enhanced robust heuristic patterns
                if re.search(r'\b(MRP|M\.R\.P|MAXIMUM RETAIL PRICE|MAX RETAIL PRICE|₹|RS\.|INR)\b', text_upper):
                    mapped_field = "MRP"
                elif re.search(r'\b(NET WEIGHT|NET WT|NET QTY|NET QUANTITY|CONTENTS|\d+\s*G|\d+\s*KG|\d+\s*ML|\d+\s*L)\b', text_upper):
                    mapped_field = "NET_QUANTITY"
                elif re.search(r'\b(MANUFACTURED BY|MANUFACTURER|MANUFACTURED & MARKETED BY|MFD BY|MARKETED BY)\b', text_upper):
                    mapped_field = "MANUFACTURER"
                elif re.search(r'\b(PACKED BY|PACKER|PACKED AND MARKETED BY)\b', text_upper):
                    mapped_field = "PACKER"
                elif re.search(r'\b(IMPORTED BY|IMPORTER)\b', text_upper):
                    mapped_field = "IMPORTER"
                elif re.search(r'\b(MFD|MFG|MANUFACTURED|DATE OF MANUFACTURE|PACKED ON|PKD)\b', text_upper) and not "BY" in text_upper:
                    mapped_field = "DATE"
                elif re.search(r'\b(BATCH|LOT)\b', text_upper):
                    mapped_field = "BATCH"
                elif re.search(r'\b(CONSUMER CARE|CUSTOMER CARE|CUSTOMER SERVICE|CONTACT US)\b', text_upper):
                    mapped_field = "CONSUMER_CARE"
                elif "BRAND" in text_upper:
                    mapped_field = "PRODUCT_NAME"
            
            payload = {
                "field": mapped_field,
                "value": item.get('text', ''),
                "confidence": item.get('confidence', 0.0),
                "source": "PaddleOCR",
                "bounding_box": item.get('bounding_box', []),
                "detection_method": "YOLO_BOUNDED_OCR" if yolo_region != "GLOBAL_FALLBACK" else "HOLISTIC_OCR"
            }
            
            # Store in unified dictionary (safely avoiding overwrite of primary bounds if multiple exist, appending later can be supported)
            if mapped_field not in declarations or declarations[mapped_field]['confidence'] < payload['confidence']:
                declarations[mapped_field] = payload
                
        # Clean out unclassified mappings for structured response array requirements
        cleaned_declarations = {k: v for k, v in declarations.items() if k != "UNCLASSIFIED_TEXT"}
        
        return cleaned_declarations
