import logging
import json
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.inspection import Inspection

logger = logging.getLogger("MetronIQ-Analytics")

class AnalyticsService:
    def get_overview(self, db: Session):
        """Returns fundamental real counts."""
        total = db.query(Inspection).count()
        completed = db.query(Inspection).filter(Inspection.status == "COMPLETED").count()
        processing = db.query(Inspection).filter(Inspection.status == "PROCESSING").count()
        failed = db.query(Inspection).filter(Inspection.status == "FAILED").count()
        
        # Calculate AI scan metrics natively
        # AI Scans represent all entries possessing an evidence payload
        ai_scans = db.query(Inspection).filter(Inspection.evidence_payload.isnot(None)).count()
        
        pending_rules = db.query(Inspection).filter(Inspection.result == "PENDING_RULES").count()

        return {
            "total_inspections": total,
            "completed_inspections": completed,
            "processing_inspections": processing,
            "failed_inspections": failed,
            "total_ai_scans": ai_scans,
            "pending_rule_evaluations": pending_rules
        }

    def get_trends(self, db: Session, days: int = 7):
        """Returns time-series inspection aggregations."""
        start_date = datetime.now() - timedelta(days=days)
        
        # SQLite dialect compatible date extraction (using Date truncation theoretically across sqlalchemy)
        # Using string slicing for generic SQLite YYYY-MM-DD
        results = db.query(
            func.substr(Inspection.created_at, 1, 10).label('date'),
            func.count(Inspection.id).label('count')
        ).filter(Inspection.created_at >= start_date) \
         .group_by('date') \
         .order_by('date').all()
         
        trends = [{"date": r[0], "inspections": r[1]} for r in results]
        return trends

    def get_ai_observations(self, db: Session):
        """Calculates exact AI confidence averages based on real declarations inside the db."""
        inspections = db.query(Inspection.evidence_payload).filter(Inspection.status == "COMPLETED", Inspection.evidence_payload.isnot(None)).all()
        
        observation_frequency = {}
        confidence_sums = {}
        confidence_counts = {}
        total_detections = 0
        total_evidence_records = 0
        
        for (payload_str,) in inspections:
            if not payload_str:
                continue
            
            try:
                payload = json.loads(payload_str)
                declarations = payload.get("legal_declarations", {})
                
                total_evidence_records += 1
                total_detections += len(declarations)
                
                for field, data in declarations.items():
                    field_key = field.upper()
                    observation_frequency[field_key] = observation_frequency.get(field_key, 0) + 1
                    
                    conf = data.get("confidence", 0)
                    confidence_sums[field_key] = confidence_sums.get(field_key, 0) + conf
                    confidence_counts[field_key] = confidence_counts.get(field_key, 0) + 1
            except Exception as e:
                logger.error(f"Failed to parse payload: {e}")
                
        # Compute exact averages
        averages = {}
        for k in confidence_counts.keys():
            averages[k] = round((confidence_sums[k] / confidence_counts[k]) * 100, 1) # Yields 94.5%
            
        return {
            "total_evidence_records": total_evidence_records,
            "total_detections": total_detections,
            "frequency": [{"field": k, "count": v} for k, v in observation_frequency.items()],
            "confidence": [{"field": k, "average_confidence": v} for k, v in averages.items()]
        }
