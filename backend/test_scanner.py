import asyncio
import base64
from app.core.database import SessionLocal
from app.models.user import User
from app.models.inspection import Inspection
from app.api.routes.scanner import process_image_query, get_result, upload_image, get_status
import uuid
import os

from fastapi import UploadFile
import io

class MockBackgroundTasks:
    def add_task(self, func, *args, **kwargs):
        self.func = func
        self.args = args
        self.kwargs = kwargs

async def test_scanner():
    db = SessionLocal()
    user = db.query(User).first()
    
    file_path = "bus.jpg"
    with open(file_path, "rb") as f:
        img_data = f.read()
        
    class MockFile:
        filename = "bus.jpg"
        file = io.BytesIO(img_data)

    uf = UploadFile(filename="bus.jpg", file=MockFile().file)
    
    res1 = await upload_image(file=uf, user=user, db=db)
    scan_id = res1["id"]
    print(f"Uploaded: {scan_id}")
    
    bt = MockBackgroundTasks()
    res2 = await process_image_query(background_tasks=bt, scan_id=scan_id, user=user)
    print(f"Process triggered: {res2}")
    
    if res2["status"] != "COMPLETED":
        # now run the background task directly
        bt.func(*bt.args, **bt.kwargs)
    
    res3 = await get_status(scan_id, db=db, user=user)
    print(f"Status: {res3}")
    
    res4 = await get_result(scan_id, db=db, user=user)
    print(f"Result: {res4['compliance']}")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(test_scanner())
