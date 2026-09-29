import asyncio
from app.core.database import SessionLocal
from app.models.ecommerce import ECommerceMonitor
from app.models.user import User
from app.api.routes.ecommerce import run_ecommerce_scan
import uuid

async def test_ecommerce():
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        return
    # Create monitor
    monitor = ECommerceMonitor(
        id=uuid.uuid4(),
        target_url="https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html?test=product",
        monitoring_frequency="DAILY",
        created_by=user.id
    )
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    print(f"Created Monitor: {monitor.id}")
    
    # Run scan
    await run_ecommerce_scan(monitor.id)
    
    # Check result
    db = SessionLocal()
    monitor = db.query(ECommerceMonitor).filter(ECommerceMonitor.id == monitor.id).first()
    print(f"Result: {monitor.last_scan_result}")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(test_ecommerce())
