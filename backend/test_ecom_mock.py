import asyncio
from app.core.database import SessionLocal
from app.models.ecommerce import ECommerceMonitor
from app.api.routes.ecommerce import run_ecommerce_scan
from app.services.crawler_service import CRAWL_CACHE
import time
from app.models.user import User
import uuid

async def test_ecommerce_mocked():
    db = SessionLocal()
    user = db.query(User).first()
    norm_url = "https://example.com/api?test=product"
    
    CRAWL_CACHE[norm_url] = {
        "time": time.time(),
        "data": {
            "title": "Mock Product",
            "source_url": norm_url,
            "product_data": {"name": "Mock Product", "brand": "MetronIQ"},
            "dom_price": "$99",
            "dom_seller": "MetronIQ",
            "screenshot_path": None,
            "automation": "HTTP"
        }
    }
    
    monitor = ECommerceMonitor(
        id=uuid.uuid4(),
        target_url=norm_url,
        monitoring_frequency="DAILY",
        created_by=user.id
    )
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    print(f"Created Monitor: {monitor.id}")
    
    await run_ecommerce_scan(monitor.id)
    
    db.refresh(monitor)
    print(f"Result without screenshot: {monitor.last_scan_result}")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(test_ecommerce_mocked())
