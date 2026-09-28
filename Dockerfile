FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for PostgreSQL, PaddleOCR, Playwright, and building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    python3-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Pre-install CPU-only PyTorch to avoid downloading ~3.5GB of CUDA/NVIDIA packages
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Pre-cache lightweight mobile PaddleOCR models into image so container startup requires no network downloads
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(text_detection_model_name='PP-OCRv4_mobile_det', text_recognition_model_name='PP-OCRv4_mobile_rec', use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False)" || true

# Install Playwright Chromium browser and its system dependencies, then clean apt cache
RUN playwright install chromium && \
    playwright install-deps chromium && \
    rm -rf /var/lib/apt/lists/*

COPY backend/ /app/

ENV PORT=8000
EXPOSE 8000

CMD sh -c "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
