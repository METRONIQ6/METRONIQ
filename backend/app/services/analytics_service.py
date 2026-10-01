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
            func.date(Inspection.created_at).label('date'),
            func.count(Inspection.id).label('count')
        ).filter(Inspection.created_at >= start_date) \
         .group_by(func.date(Inspection.created_at)) \
         .order_by(func.date(Inspection.created_at)).all()
         
        trends = [{"date": str(r[0]), "inspections": r[1]} for r in results]
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

    def get_geo_analytics(self, db: Session, current_user):
        """
        Yields role-scoped geospatial enforcement intelligence and density analytics.
        ADMIN: Sees system-wide geographic records across all officers.
        OFFICER: Sees strictly their assigned inspection records.
        """
        from app.models.product import Product, Manufacturer
        from app.models.user import User

        # 1. Query inspections according to role scope
        query = db.query(Inspection)
        if current_user.role == "OFFICER":
            query = query.filter(Inspection.officer_id == current_user.id)
        elif current_user.role != "ADMIN":
            return {
                "total_records": 0,
                "jurisdictions_count": 0,
                "summary": {
                    "total_inspections": 0,
                    "high_risk": 0,
                    "medium_risk": 0,
                    "low_risk": 0,
                    "non_compliant": 0,
                    "compliant": 0,
                    "compliance_rate": 0.0
                },
                "jurisdictions": [],
                "points": [],
                "role_scope": current_user.role
            }

        inspections = query.order_by(Inspection.created_at.desc()).all()

        # Coordinate reference dictionary for Indian jurisdictions
        COORDINATE_LOOKUP = {
            "chennai": {"lat": 13.0827, "lng": 80.2707, "city": "Chennai", "state": "Tamil Nadu", "district": "Chennai"},
            "dehradun": {"lat": 30.3165, "lng": 78.0322, "city": "Dehradun", "state": "Uttarakhand", "district": "Dehradun"},
            "ludhiana": {"lat": 30.9010, "lng": 75.8573, "city": "Ludhiana", "state": "Punjab", "district": "Ludhiana"},
            "pune": {"lat": 18.5204, "lng": 73.8567, "city": "Pune", "state": "Maharashtra", "district": "Pune"},
            "kolkata": {"lat": 22.5726, "lng": 88.3639, "city": "Kolkata", "state": "West Bengal", "district": "Kolkata"},
            "hyderabad": {"lat": 17.3850, "lng": 78.4867, "city": "Hyderabad", "state": "Telangana", "district": "Hyderabad"},
            "bengaluru": {"lat": 12.9716, "lng": 77.5946, "city": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban"},
            "bangalore": {"lat": 12.9716, "lng": 77.5946, "city": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban"},
            "mumbai": {"lat": 19.0760, "lng": 72.8777, "city": "Mumbai", "state": "Maharashtra", "district": "Mumbai"},
            "delhi": {"lat": 28.6139, "lng": 77.2090, "city": "New Delhi", "state": "Delhi", "district": "New Delhi"},
            "jaipur": {"lat": 26.9124, "lng": 75.7873, "city": "Jaipur", "state": "Rajasthan", "district": "Jaipur"},
            "ahmedabad": {"lat": 23.0225, "lng": 72.5714, "city": "Ahmedabad", "state": "Gujarat", "district": "Ahmedabad"},
            "coimbatore": {"lat": 11.0168, "lng": 76.9558, "city": "Coimbatore", "state": "Tamil Nadu", "district": "Coimbatore"},
            "madurai": {"lat": 9.9252, "lng": 78.1198, "city": "Madurai", "state": "Tamil Nadu", "district": "Madurai"},
            "kochi": {"lat": 9.9312, "lng": 76.2673, "city": "Kochi", "state": "Kerala", "district": "Ernakulam"},
            "lucknow": {"lat": 26.8467, "lng": 80.9462, "city": "Lucknow", "state": "Uttar Pradesh", "district": "Lucknow"},
            "chandigarh": {"lat": 30.7333, "lng": 76.7794, "city": "Chandigarh", "state": "Punjab", "district": "Chandigarh"},
            "guwahati": {"lat": 26.1445, "lng": 91.7362, "city": "Guwahati", "state": "Assam", "district": "Kamrup Metropolitan"},
            "bhopal": {"lat": 23.2599, "lng": 77.4126, "city": "Bhopal", "state": "Madhya Pradesh", "district": "Bhopal"},
            "patna": {"lat": 25.5941, "lng": 85.1376, "city": "Patna", "state": "Bihar", "district": "Patna"},
            "bhubaneswar": {"lat": 20.2961, "lng": 85.8245, "city": "Bhubaneswar", "state": "Odisha", "district": "Khordha"},
            "surat": {"lat": 21.1702, "lng": 72.8311, "city": "Surat", "state": "Gujarat", "district": "Surat"},
            "nagpur": {"lat": 21.1458, "lng": 79.0882, "city": "Nagpur", "state": "Maharashtra", "district": "Nagpur"},
            "indore": {"lat": 22.7196, "lng": 75.8577, "city": "Indore", "state": "Madhya Pradesh", "district": "Indore"}
        }

        # Cache products and manufacturers in memory to avoid N+1 queries
        product_ids = [i.product_id for i in inspections if i.product_id]
        products_map = {}
        manufacturers_map = {}

        if product_ids:
            prods = db.query(Product).filter(Product.id.in_(product_ids)).all()
            for p in prods:
                products_map[p.id] = p
            
            mfg_ids = [p.manufacturer_id for p in prods if p.manufacturer_id]
            if mfg_ids:
                mfgs = db.query(Manufacturer).filter(Manufacturer.id.in_(mfg_ids)).all()
                for m in mfgs:
                    manufacturers_map[m.id] = m

        def resolve_location(insp, prod, mfg):
            """Extracts jurisdiction text and coordinates."""
            loc_text = ""
            if mfg and mfg.location:
                loc_text = mfg.location
            elif prod and prod.manufacturer_name:
                loc_text = prod.manufacturer_name
            elif insp.evidence_payload:
                try:
                    p = json.loads(insp.evidence_payload)
                    loc_text = p.get("legal_declarations", {}).get("MANUFACTURER", {}).get("value", "")
                except Exception:
                    pass

            if not loc_text:
                return None

            loc_lower = loc_text.lower()
            for key, info in COORDINATE_LOOKUP.items():
                if key in loc_lower:
                    return {
                        "jurisdiction": f"{info['city']}, {info['state']}",
                        "city": info["city"],
                        "state": info["state"],
                        "district": info["district"],
                        "latitude": info["lat"],
                        "longitude": info["lng"]
                    }
            
            return None

        points = []
        jurisdiction_buckets = {}

        for insp in inspections:
            prod = products_map.get(insp.product_id)
            mfg = manufacturers_map.get(prod.manufacturer_id) if prod and prod.manufacturer_id else None

            geo_info = resolve_location(insp, prod, mfg)
            if not geo_info:
                continue

            risk = (insp.risk_level or "LOW").upper()
            result = (insp.result or "PASS").upper()
            status = (insp.status or "DRAFT").upper()

            point_record = {
                "id": insp.id,
                "product_name": prod.name if prod else (insp.evidence_payload and json.loads(insp.evidence_payload).get("legal_declarations", {}).get("PRODUCT_NAME", {}).get("value", "General Commodity")) if insp.evidence_payload else "Inspected Package",
                "category": prod.category if prod else "Packaged Commodity",
                "manufacturer_name": mfg.name if mfg else (prod.manufacturer_name if prod else "Statutory Entity"),
                "jurisdiction": geo_info["jurisdiction"],
                "city": geo_info["city"],
                "state": geo_info["state"],
                "district": geo_info["district"],
                "latitude": geo_info["latitude"],
                "longitude": geo_info["longitude"],
                "risk_level": risk,
                "result": result,
                "status": status,
                "is_reinspection": bool(insp.is_reinspection),
                "created_at": insp.created_at.isoformat() if insp.created_at else None
            }
            points.append(point_record)

            # Accumulate into jurisdiction buckets
            j_key = geo_info["jurisdiction"]
            if j_key not in jurisdiction_buckets:
                jurisdiction_buckets[j_key] = {
                    "jurisdiction": j_key,
                    "city": geo_info["city"],
                    "state": geo_info["state"],
                    "district": geo_info["district"],
                    "latitude": geo_info["latitude"],
                    "longitude": geo_info["longitude"],
                    "total_inspections": 0,
                    "high_risk": 0,
                    "medium_risk": 0,
                    "low_risk": 0,
                    "non_compliant": 0,
                    "compliant": 0,
                    "last_inspection": point_record["created_at"]
                }

            bucket = jurisdiction_buckets[j_key]
            bucket["total_inspections"] += 1
            if risk == "HIGH":
                bucket["high_risk"] += 1
            elif risk == "MEDIUM":
                bucket["medium_risk"] += 1
            else:
                bucket["low_risk"] += 1

            if result == "FAIL":
                bucket["non_compliant"] += 1
            else:
                bucket["compliant"] += 1

            if point_record["created_at"] and (not bucket["last_inspection"] or point_record["created_at"] > bucket["last_inspection"]):
                bucket["last_inspection"] = point_record["created_at"]

        # Calculate pass rates and format jurisdictions
        jurisdictions_list = []
        for b in jurisdiction_buckets.values():
            total = b["total_inspections"]
            b["pass_rate"] = round((b["compliant"] / total * 100), 1) if total > 0 else 100.0
            # Density score (1 to 100) based on inspections and risk
            b["density_score"] = min(100, int((b["high_risk"] * 30) + (b["medium_risk"] * 15) + (b["total_inspections"] * 5)))
            jurisdictions_list.append(b)

        # Sort jurisdictions by total inspections desc
        jurisdictions_list.sort(key=lambda x: x["total_inspections"], reverse=True)

        total_records = len(points)
        high_risk_total = sum(j["high_risk"] for j in jurisdictions_list)
        medium_risk_total = sum(j["medium_risk"] for j in jurisdictions_list)
        low_risk_total = sum(j["low_risk"] for j in jurisdictions_list)
        non_compliant_total = sum(j["non_compliant"] for j in jurisdictions_list)
        compliant_total = sum(j["compliant"] for j in jurisdictions_list)
        overall_compliance_rate = round((compliant_total / total_records * 100), 1) if total_records > 0 else 0.0

        return {
            "total_records": total_records,
            "jurisdictions_count": len(jurisdictions_list),
            "summary": {
                "total_inspections": total_records,
                "high_risk": high_risk_total,
                "medium_risk": medium_risk_total,
                "low_risk": low_risk_total,
                "non_compliant": non_compliant_total,
                "compliant": compliant_total,
                "compliance_rate": overall_compliance_rate
            },
            "jurisdictions": jurisdictions_list,
            "points": points,
            "role_scope": current_user.role
        }

