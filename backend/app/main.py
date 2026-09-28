from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(title=settings.PROJECT_NAME)

import os
import logging
from fastapi import Request
import time

# Configure CORS
allowed_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "https://metroniq.vercel.app,http://localhost:3000,http://127.0.0.1:3000").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(name)s - %(message)s",
)
logger = logging.getLogger("MetronIQ-API")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = '{0:.2f}'.format(process_time)
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - {formatted_process_time}ms")
    return response

@app.get("/health")
def health_check():
    import httpx
    ocr_service_url = os.getenv("OCR_SERVICE_URL", "").strip().rstrip("/")
    ocr_status = "unconfigured"
    
    if ocr_service_url:
        try:
            with httpx.Client(timeout=2.0) as client:
                res = client.get(f"{ocr_service_url}/health")
                if res.status_code == 200:
                    ocr_status = "healthy"
                else:
                    ocr_status = f"unhealthy ({res.status_code})"
        except Exception as e:
            ocr_status = f"unreachable"
            
    return {
        "status": "healthy",
        "ocr_service": ocr_status
    }

@app.get("/api/health")
def api_health_check():
    return health_check()


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# ── Scheduler (only runs when NOT on Vercel serverless) ──
if not os.getenv("VERCEL"):
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from app.core.database import SessionLocal
        from app.models.ecommerce import ECommerceMonitor
        from app.api.routes.ecommerce import run_ecommerce_scan
        import datetime

        scheduler = AsyncIOScheduler()

        async def execute_scheduled_crawls():
            if not SessionLocal:
                return
            db = SessionLocal()
            try:
                monitors = db.query(ECommerceMonitor).filter(ECommerceMonitor.status == "ACTIVE").all()
                for monitor in monitors:
                    should_run = False
                    if not monitor.last_run_at:
                        should_run = True
                    else:
                        elapsed = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc) - monitor.last_run_at.replace(tzinfo=datetime.timezone.utc)
                        if monitor.monitoring_frequency == "HOURLY" and elapsed.total_seconds() >= 3600:
                            should_run = True
                        elif monitor.monitoring_frequency == "DAILY" and elapsed.total_seconds() >= 86400:
                            should_run = True
                        elif monitor.monitoring_frequency == "WEEKLY" and elapsed.total_seconds() >= 604800:
                            should_run = True

                    if should_run:
                        # Run scheduled crawls sequentially to prevent concurrent memory spikes in container
                        await run_ecommerce_scan(monitor.id)
            except Exception as e:
                logger.error(f"Error in scheduled crawl: {e}")
            finally:
                db.close()

        @app.on_event("startup")
        async def startup_event():
            scheduler.add_job(
                execute_scheduled_crawls,
                "interval",
                minutes=1,
                max_instances=1,
                coalesce=True
            )
            scheduler.start()
    except ImportError:
        pass




