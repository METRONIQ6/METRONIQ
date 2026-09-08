from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(title=settings.PROJECT_NAME)

import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


import logging
from fastapi import Request
import time

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
    return {"status": "ok"}

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.ecommerce import ECommerceMonitor
from app.api.routes.ecommerce import run_ecommerce_scan
import datetime

scheduler = AsyncIOScheduler()

async def execute_scheduled_crawls():
    db = SessionLocal()
    try:
        # simplistic naive scheduler
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
                # Add individual task to background to not block loop
                import asyncio
                asyncio.create_task(run_ecommerce_scan(monitor.id))
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    scheduler.add_job(execute_scheduled_crawls, "interval", minutes=1)
    scheduler.start()