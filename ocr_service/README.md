# MetronIQ PaddleOCR Microservice

Dedicated OCR microservice for the MetronIQ Legal Metrology compliance inspection platform.

## Architecture
- **Engine**: PaddleOCR PP-OCRv4 mobile detection & recognition models
- **Framework**: FastAPI with async file streaming
- **Deployment**: Railway (Docker container)
- **Port**: `$PORT` (default 7860)

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Service metadata and status |
| `GET` | `/health` | Health check (returns `{"status":"ok"}`) |
| `POST` | `/ocr/extract` | Extract text from uploaded image |

## Deployment on Railway

This service is designed to be deployed as a **separate Railway service** in the same project as the MetronIQ backend.

1. In your Railway project, create a new service
2. Connect to the same GitHub repo (`METRONIQ6/METRONIQ`)
3. Set **Root Directory** to `/` (repository root)
4. Railway will use `ocr_service/railway.toml` to build with `ocr_service/Dockerfile`
5. After deployment, copy the generated Railway URL
6. Set `OCR_SERVICE_URL=https://<your-ocr-service>.up.railway.app` in the backend service's environment variables

## Notes

- First build takes 10-15 minutes (PP-OCRv4 model download + PyTorch + PaddleOCR install)
- Models are pre-cached in the Docker image — subsequent deploys are faster
- The service runs on CPU only (no GPU required)
- Memory requirement: ~1.5GB RAM minimum (Railway Hobby plan is sufficient)
