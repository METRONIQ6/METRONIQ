---
title: MetronIQ PaddleOCR Microservice
emoji: 🔍
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# MetronIQ PaddleOCR Microservice

Dedicated high-memory OCR microservice for MetronIQ Legal Metrology compliance inspection platform.

## Architecture
- **Engine**: PaddleOCR 2.8.1 with PP-OCRv4 Mobile Detection & Recognition models.
- **Backend**: FastAPI with async file streaming.
- **Port**: 7860 (Hugging Face default) or `$PORT`.

## Endpoints
- `GET /health`: Health status.
- `GET /`: Service metadata.
- `POST /ocr/extract`: Extract text bounding boxes and confidence scores from an uploaded image.
