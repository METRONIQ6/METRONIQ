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
        Applies robust semantic interpretation, multi-line grouping, and positional heuristics.
        """
        import re
        declarations = {}
        unclassified_candidates = []
        
        # Helper for vertical proximity sorting (simulate reading order)
        def get_y1(item): return item.get('bounding_box', [0,0,0,0])[1] if item.get('bounding_box') else 0
        def get_x1(item): return item.get('bounding_box', [0,0,0,0])[0] if item.get('bounding_box') else 0
        
        sorted_texts = sorted(ocr_texts, key=lambda i: (get_y1(i) // 15, get_x1(i)))
        full_text = " \n ".join([i.get("text", "") for i in sorted_texts])
        
        # Semantic regex patterns
        phone_pattern = r'(\+?91[\-\s]?\d{2,5}[\-\s]?\d{3,5}[\-\s]?\d{3,5}|1800[\-\s]?\d{3}[\-\s]?\d{4}|\b\d{10}\b)'
        email_pattern = r'([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})'
        
        for idx, item in enumerate(sorted_texts):
            yolo_region = item.get("yolo_region", "GLOBAL_FALLBACK")
            cleaned_region = yolo_region.replace("GENERIC_", "").upper()
            mapped_field = cleaned_region if cleaned_region in self.target_fields else "UNCLASSIFIED_TEXT"
            
            text = item.get('text', '')
            text_upper = text.upper().replace(" ", "").replace("-", "").replace(":", "")
            normalized_text = text.upper()
            
            if mapped_field == "UNCLASSIFIED_TEXT":
                # Look-ahead window for multi-line context (e.g. "PACKED BY" over 2 lines)
                context_texts = [t.get("text", "") for t in sorted_texts[idx:min(idx+5, len(sorted_texts))]]
                context_upper_joined = " ".join(context_texts).upper().replace(" ", "").replace("-", "").replace(":", "")
                
                if re.search(r'\b(MRP|MAXIMUMRETAILPRICE|MAXRETAILPRICE|₹|RS\.|INR)\b', normalized_text) or "MRP" in text_upper:
                    mapped_field = "MRP"
                elif re.search(r'\b(NETWEIGHT|NETWT|NETQTY|NETQUANTITY|CONTENTS|\d+\s*G|\d+\s*KG|\d+\s*ML|\d+\s*L)\b', normalized_text) or "NETQTY" in text_upper or "NETWEIGHT" in text_upper:
                    mapped_field = "NET_QUANTITY"
                elif re.search(r'(MANUFACTUREDBY|MANUFACTURER|MFDBY|MARKETEDBY)', context_upper_joined):
                    mapped_field = "MANUFACTURER"
                elif re.search(r'(PACKEDBY|PACKER)', context_upper_joined):
                    mapped_field = "PACKER"
                elif re.search(r'(IMPORTEDBY|IMPORTER)', context_upper_joined):
                    mapped_field = "IMPORTER"
                elif re.search(r'\b(MFD|MFG|MANUFACTURED|DATEOFMANUFACTURE|PACKEDON|PKD)\b', normalized_text) and "BY" not in text_upper:
                    mapped_field = "DATE"
                elif re.search(r'\b(BATCH|LOT)\b', normalized_text):
                    mapped_field = "BATCH"
                elif re.search(r'(CONSUMERCARE|CUSTOMERCARE|CUSTOMERSUPPORT|CONTACTUS|COMPLAINTS|FEEDBACK)', context_upper_joined):
                    mapped_field = "CONSUMER_CARE"
                elif re.search(phone_pattern, text) or re.search(email_pattern, text):
                    # Direct alias for loose phone/emails floating nearby
                    mapped_field = "CONSUMER_CARE"
                elif "BRAND" in text_upper:
                    mapped_field = "PRODUCT_NAME"
            
            payload = {
                "field": mapped_field,
                "value": text,
                "confidence": item.get('confidence', 0.0),
                "source": "PaddleOCR",
                "bounding_box": item.get('bounding_box', []),
                "detection_method": "YOLO_BOUNDED_OCR" if yolo_region != "GLOBAL_FALLBACK" else "HOLISTIC_OCR"
            }
            
            if mapped_field == "UNCLASSIFIED_TEXT":
                unclassified_candidates.append(payload)

            if mapped_field not in declarations:
                declarations[mapped_field] = payload
            else:
                # Group related lines for multi-line fields
                mergeable = ["CONSUMER_CARE", "MANUFACTURER", "PACKER", "IMPORTER"]
                if mapped_field in mergeable:
                    if text not in declarations[mapped_field]["value"]:
                        declarations[mapped_field]["value"] += " " + payload["value"]
                        declarations[mapped_field]["confidence"] = max(declarations[mapped_field]["confidence"], payload["confidence"])
                else:
                    if declarations[mapped_field]["confidence"] < payload["confidence"]:
                        declarations[mapped_field] = payload
                
        cleaned_declarations = {k: v for k, v in declarations.items() if k != "UNCLASSIFIED_TEXT"}
        
        # Fallback 1: Holistic Regex Extraction if completely missed
        if "CONSUMER_CARE" not in cleaned_declarations:
            phones = re.findall(phone_pattern, full_text)
            emails = re.findall(email_pattern, full_text)
            if phones or emails:
                val_str = " ".join(set(phones + emails))
                cleaned_declarations["CONSUMER_CARE"] = {
                    "field": "CONSUMER_CARE",
                    "value": val_str,
                    "confidence": 0.85,
                    "source": "PaddleOCR",
                    "bounding_box": [],
                    "detection_method": "HOLISTIC_REGEX"
                }

        # Fallback 2: Product Name
        if "PRODUCT_NAME" not in cleaned_declarations and unclassified_candidates:
            valid_candidates = [
                c for c in unclassified_candidates 
                if 2 <= len(c['value'].strip()) <= 50 and any(char.isalpha() for char in c['value'])
            ]
            if valid_candidates:
                best_candidate = valid_candidates[0].copy()
                best_candidate['field'] = "PRODUCT_NAME"
                cleaned_declarations["PRODUCT_NAME"] = best_candidate
                
        # Inject metadata heuristic for Contextual Applicability logic
        is_imported = False
        if re.search(r'\b(MADE IN \w+|PRODUCT OF \w+|COUNTRY OF ORIGIN)\b', full_text.upper()) and "MADE IN INDIA" not in full_text.upper():
            if "INDIA" not in full_text.upper():
                is_imported = True
                
        cleaned_declarations["_META_IS_IMPORTED"] = {
            "field": "_META_IS_IMPORTED", 
            "value": str(is_imported), 
            "confidence": 1.0, 
            "source": "System"
        }
        
        return cleaned_declarations
