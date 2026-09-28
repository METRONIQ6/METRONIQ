FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=7860 \
    FLAGS_use_mkldnn=0 \
    FLAGS_enable_mkldnn=0 \
    FLAGS_enable_pir_api=0 \
    PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Pre-install CPU-only PyTorch to prevent pulling ~3.5GB CUDA packages later
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

# Pre-cache PP-OCRv4 mobile models into image so container startup needs no network downloads
RUN python -c "\
from paddleocr import PaddleOCR; \
PaddleOCR( \
  text_detection_model_name='PP-OCRv4_mobile_det', \
  text_recognition_model_name='PP-OCRv4_mobile_rec', \
  use_doc_orientation_classify=False, \
  use_doc_unwarping=False, \
  use_textline_orientation=False \
)" || true

COPY . .

EXPOSE 7860

CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"
