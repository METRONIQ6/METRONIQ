from typing import Dict, Any, List

class EvidenceGenerator:
    """Bundles inferences into the final formatted Matrix for the EvidenceViewer React Component"""
    
    def generate(self, objects: List[Any], ocr_texts: List[Any], declarations: Dict[str, Any], meta: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "success",
            "metadata": meta,
            "yolo_objects": objects,
            "raw_ocr": ocr_texts,
            "legal_declarations": declarations
        }
