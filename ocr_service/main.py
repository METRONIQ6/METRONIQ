import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

import logging
from typing import List, Dict, Any
import numpy as np
import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MetronIQ-OCR-Microservice")

# PaddlePredictor self-attention patch for Linux AVX CPU architectures
try:
    import paddle.inference as paddle_infer
    _orig_create_predictor = paddle_infer.create_predictor
    def _patched_create_predictor(config):
        try:
            config.delete_pass("self_attention_fuse_pass")
        except Exception:
            pass
        return _orig_create_predictor(config)
    paddle_infer.create_predictor = _patched_create_predictor
except Exception as e:
    logger.warning(f"Could not patch paddle predictor: {e}")

from paddleocr import PaddleOCR

logger.info("Initializing PaddleOCR with PP-OCRv4 Mobile models...")
try:
    ocr_engine = PaddleOCR(
        text_detection_model_name='PP-OCRv4_mobile_det',
        text_recognition_model_name='PP-OCRv4_mobile_rec',
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        enable_mkldnn=False
    )
    logger.info("PaddleOCR Primary Mobile Constructor loaded successfully.")
except Exception as e:
    logger.warning(f"Primary constructor failed ({e}), attempting fallback constructor...")
    try:
        ocr_engine = PaddleOCR(
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            lang='en',
            enable_mkldnn=False
        )
    except Exception:
        ocr_engine = PaddleOCR(use_angle_cls=False, lang='en')

app = FastAPI(
    title="MetronIQ OCR Microservice",
    version="1.0.0",
    description="Dedicated microservice running unchanged PaddleOCR PP-OCRv4 for MetronIQ Legal Metrology Scanner."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_ocr(image: np.ndarray) -> List[Dict[str, Any]]:
    try:
        from paddleocr.tools.infer.utility import get_rotate_crop_image
        from paddleocr.tools.infer.predict_system import sorted_boxes

        dt_boxes, _ = ocr_engine.text_detector(image)
        if dt_boxes is None or len(dt_boxes) == 0:
            return []

        dt_boxes = sorted_boxes(dt_boxes)
        img_crop_list = [get_rotate_crop_image(image, box) for box in dt_boxes]

        rec_res = []
        chunk_size = 10
        for i in range(0, len(img_crop_list), chunk_size):
            chunk = img_crop_list[i:i + chunk_size]
            res, _ = ocr_engine.text_recognizer(chunk)
            rec_res.extend(res)

        data = []
        for box, (text, score) in zip(dt_boxes, rec_res):
            if score >= ocr_engine.drop_score:
                x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
                data.append({
                    "text": text,
                    "confidence": round(float(score), 4),
                    "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
                })
        return data
    except Exception as e:
        logger.warning(f"Optimized chunked OCR failed ({e}), falling back to default ocr_engine.ocr...")
        result = ocr_engine.ocr(image)
        data = []
        if not result or result[0] is None:
            return data

        if isinstance(result[0], dict):
            r_dict = result[0]
            rec_texts = r_dict.get('rec_texts', [])
            rec_scores = r_dict.get('rec_scores', [])
            dt_polys = r_dict.get('dt_polys', [])
            for text, score, box in zip(rec_texts, rec_scores, dt_polys):
                x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
                data.append({
                    "text": text,
                    "confidence": round(float(score), 4),
                    "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
                })
            return data

        for line in result[0]:
            box = line[0]
            x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
            data.append({
                "text": line[1][0],
                "confidence": round(float(line[1][1]), 4),
                "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
            })
        return data

@app.get("/")
def root():
    return {
        "service": "metroniq-ocr",
        "status": "online",
        "engine": "PaddleOCR-PP-OCRv4",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "metroniq-ocr"}

@app.post("/ocr/extract")
async def extract_ocr(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file or decoding failed")

        data = run_ocr(img)
        return {
            "status": "success",
            "count": len(data),
            "results": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during OCR execution: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e), "results": []}
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "7860"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
