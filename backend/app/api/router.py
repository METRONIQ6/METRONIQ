from fastapi import APIRouter
from .routes import auth, rules, inspections, dashboard, scanner, analytics, notices, reinspections, enforcement, reports, ecommerce

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(rules.router, prefix="/rules", tags=["rules"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["inspections"])
api_router.include_router(scanner.router, prefix="/scanner", tags=["scanner"])
api_router.include_router(notices.router, prefix="/notices", tags=["notices"])
api_router.include_router(reinspections.router, prefix="/reinspections", tags=["reinspections"])
api_router.include_router(enforcement.router, prefix="/enforcement", tags=["enforcement"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(ecommerce.router, prefix="/ecommerce", tags=["ecommerce"])