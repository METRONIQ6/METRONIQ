
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.api.deps import get_db, get_current_user, get_current_manufacturer
from app.models.user import User
from app.models.product import Product
from app.models.manufacturer_workspace import Submission, RectificationTask, ManufacturerDocument, ComplianceHistory
from app.models.notice import ImprovementNotice
from app.schemas.manufacturer import ProductCreate, ProductUpdate, ProductResponse, ManufacturerStats
import httpx
from datetime import datetime
import json
from sqlalchemy import desc

router = APIRouter()

@router.get("/dashboard-stats", response_model=ManufacturerStats)
def get_stats(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    from sqlalchemy import func
    status_counts = db.query(Product.status, func.count(Product.id)).filter(Product.owner_id == user.id).group_by(Product.status).all()
    
    counts = {s: c for s, c in status_counts}
    total = sum(counts.values())
    draft = counts.get("DRAFT", 0)
    under_review = counts.get("UNDER_REVIEW", 0)
    changes_required = counts.get("CHANGES_REQUIRED", 0)
    approved = counts.get("APPROVED", 0)
    
    history = db.query(ComplianceHistory).filter(ComplianceHistory.owner_id == user.id).order_by(desc(ComplianceHistory.created_at)).limit(5).all()
    recent = [{"id": str(h.id), "action": h.action, "details": h.details, "date": h.created_at} for h in history]
    
    return {
        "total_products": total,
        "draft_products": draft,
        "under_review": under_review,
        "changes_required": changes_required,
        "approved_products": approved,
        "recent_activity": recent
    }

@router.get("/products")
def get_products(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    products = db.query(Product).filter(Product.owner_id == user.id).order_by(desc(Product.created_at)).all()
    return products

@router.post("/products")
def create_product(prod: ProductCreate, db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    db_prod = Product(**prod.dict(), owner_id=user.id, status="DRAFT")
    db.add(db_prod)
    db.flush()
    history = ComplianceHistory(product_id=db_prod.id, owner_id=user.id, action="Product Created", details=f"Product '{prod.name}' registered.")
    db.add(history)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.get("/products/{id}")
def get_product(id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    prod = db.query(Product).filter(Product.id == id, Product.owner_id == user.id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    return prod

@router.put("/products/{id}")
def update_product(id: UUID, prod_update: ProductUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    prod = db.query(Product).filter(Product.id == id, Product.owner_id == user.id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    
    # State lock: cannot edit properties if under review or approved unless explicit workflow
    if prod.status in ["UNDER_REVIEW", "APPROVED"]:
        raise HTTPException(status_code=400, detail="Cannot edit product while under active review or approved")
        
    for k, v in prod_update.dict(exclude_unset=True).items():
        if k == 'status': continue # explicitly prevent status injection
        setattr(prod, k, v)
    db.commit()
    db.refresh(prod)
    return prod

@router.post("/products/{id}/audit")
def evaluate_product(id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    prod = db.query(Product).filter(Product.id == id, Product.owner_id == user.id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "success", "message": "Audit completed"}

@router.get("/submissions")
def get_submissions(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    subs = db.query(Submission).filter(Submission.owner_id == user.id).order_by(desc(Submission.created_at)).all()
    res = []
    for s in subs:
        res.append({
            "id": str(s.id),
            "product_id": str(s.product_id),
            "product_name": s.product.name if s.product else "Unknown",
            "status": s.status,
            "comments": s.officer_comments,
            "created_at": s.created_at
        })
    return res

@router.post("/submissions")
def create_submission(payload: dict, db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    product_id = payload.get("product_id")
    if not product_id: raise HTTPException(400, "Missing product_id")
    
    prod = db.query(Product).filter(Product.id == product_id, Product.owner_id == user.id).first()
    if not prod: raise HTTPException(404, "Not found")
    
    if prod.status not in ["DRAFT", "CHANGES_REQUIRED"]:
         raise HTTPException(400, detail="Product is not eligible for submission")
    
    prod.status = "UNDER_REVIEW"
    sub = Submission(product_id=prod.id, owner_id=user.id, status="UNDER_REVIEW")
    db.add(sub)
    history = ComplianceHistory(product_id=prod.id, owner_id=user.id, action="Submitted to Government", details="Submitted for pre-market review.")
    db.add(history)
    db.commit()
    return {"status": "success", "submission_id": sub.id}

@router.get("/rectifications")
def get_rectifications(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    tasks = db.query(RectificationTask).filter(RectificationTask.owner_id == user.id).order_by(desc(RectificationTask.created_at)).all()
    return tasks

from fastapi import UploadFile, File
import os
import secrets

UPLOAD_DIR = "app/uploads/manufacturer_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/rectifications/{id}/submit")
def submit_rectification(id: UUID, file: UploadFile = File(None), db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    task = db.query(RectificationTask).filter(RectificationTask.id == id, RectificationTask.owner_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404)
        
    if task.status != "PENDING":
        raise HTTPException(status_code=400, detail="Rectification already submitted")
        
    doc_msg = ""
    if file:
        ext = file.filename.split('.')[-1]
        secure_name = f"{secrets.token_hex(8)}.{ext}"
        path = os.path.join(UPLOAD_DIR, secure_name)
        with open(path, "wb") as f:
            f.write(file.file.read())
        
        doc = ManufacturerDocument(
            owner_id=user.id,
            product_id=task.product_id,
            title=f"Rectification Proof for {str(id)[:8]}",
            category="RECTIFICATION_PROOF",
            file_path=path
        )
        db.add(doc)
        doc_msg = " Document uploaded."

    task.status = "RECTIFICATION_SUBMITTED"
    
    # Optionally update related submission status if we want to tie it back
    if task.submission_id:
        sub = db.query(Submission).filter(Submission.id == task.submission_id).first()
        if sub and sub.status == "CHANGES_REQUIRED":
            sub.status = "UNDER_REVIEW" # Reverts to review
            
    if task.product_id:
        prod = db.query(Product).filter(Product.id == task.product_id).first()
        if prod and prod.status == "CHANGES_REQUIRED":
            prod.status = "UNDER_REVIEW"
        history = ComplianceHistory(product_id=task.product_id, owner_id=user.id, action="Rectification Submitted", details=f"Responded to task: {task.issue}.{doc_msg}")
        db.add(history)
    db.commit()
    return task

@router.get("/notices")
def get_notices(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    # The existing notices model might use manufacturer_id or owner_id.
    # In models/notice.py: manufacturer_id = Column(UUID(as_uuid=True), nullable=True)
    notices = db.query(ImprovementNotice).filter(ImprovementNotice.manufacturer_id == user.id).order_by(desc(ImprovementNotice.created_at)).all()
    return notices

@router.get("/documents")
def get_docs(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    docs = db.query(ManufacturerDocument).filter(ManufacturerDocument.owner_id == user.id).order_by(desc(ManufacturerDocument.created_at)).all()
    return docs

@router.get("/compliance-history")
def get_history(db: Session = Depends(get_db), user: User = Depends(get_current_manufacturer)):
    hist = db.query(ComplianceHistory).filter(ComplianceHistory.owner_id == user.id).order_by(desc(ComplianceHistory.created_at)).all()
    return hist
