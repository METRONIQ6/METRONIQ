# MetronIQ ML Environment Architecture

## Purpose
The primary FastAPI backend is platform-agnostic, but Machine Learning tools like PaddleOCR and PyTorch often have bleeding-edge threading incompatibility with modern hardware architectures (like the `ConvertPirAttribute2RuntimeAttribute` OneDNN crash observed on Windows + Python 3.13).

To guarantee **100% REAL inference** in production without falling back to mock UI logic, the CV pipeline is intended to run inside this structurally isolated `linux/amd64` Docker container.

## Composition
- **OS Base:** Ubuntu Bullseye / Python 3.10 (Historically stable for Paddle v2.6.x)
- **Ultralytics YOLO:** Engine maps generically.
- **PaddleOCR:** CPU-mode forced Native C++ binaries

## How to Build
```bash
cd backend
docker build -f docker/Dockerfile.ai -t metroniq-ai-engine .
```

## How to Start
```bash
docker run -p 8000:8000 metroniq-ai-engine
```

## Production Pipeline Hook
In production deployments, the `app/api/routes/scanner.py` on the main REST backend should natively `HTTP POST` the raw image bytes to this isolated Docker container over the private AWS VPC/Docker-compose network instead of executing inference strings on the web-server thread. This prevents ML crashes from harming the standard REST API limits.
