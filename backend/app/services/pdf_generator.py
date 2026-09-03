from fpdf import FPDF
import datetime
import os
from .i18n_pdf import TRANSLATIONS, translate_status

def generate_audit_pdf(audit_data: dict, output_path: str, lang: str = "en"):
    if lang not in TRANSLATIONS:
        lang = "en"
    t = TRANSLATIONS[lang]
    
    pdf = FPDF()
    pdf.add_page()
    
    font_path = "C:\\Windows\\Fonts\\Nirmala.ttf"
    has_unicode = os.path.exists(font_path)
    
    if has_unicode:
        pdf.add_font("Nirmala", "", font_path, uni=True)
        # Using a faux bold by just keeping text strong (or relying on fpdf2 not complaining about missing B if not strictly needed)
        # for simplicity we will just use the standard Nirmala for everything
        pdf.set_font("Nirmala", size=12)
    else:
        pdf.set_font("Arial", size=12)
    
    # Title
    pdf.set_font(pdf.font_family, size=16)
    pdf.cell(200, 10, txt=t["title"], ln=True, align='C')
    pdf.ln(10)
    
    # Headers
    pdf.set_font(pdf.font_family, size=12)
    pdf.cell(50, 10, txt=t["case_id"], ln=False)
    pdf.cell(150, 10, txt=audit_data["case_id"], ln=True)
    
    pdf.cell(50, 10, txt=t["case_status"], ln=False)
    # Translate status
    translated_status = translate_status(audit_data["case_status"], lang)
    pdf.cell(150, 10, txt=translated_status, ln=True)
    
    if audit_data.get("penalty_amount"):
        pdf.cell(50, 10, txt=t["penalty_amount"], ln=False)
        pdf.cell(150, 10, txt=f"INR {audit_data['penalty_amount']}", ln=True)
        
    pdf.ln(10)
    
    # Timeline
    pdf.set_font(pdf.font_family, size=14)
    pdf.cell(200, 10, txt=t["timeline_heading"], ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_font(pdf.font_family, size=11)
    for event in audit_data["timeline"]:
        event_name = event.get('event', 'UNKNOWN')
        status = event.get('status', 'N/A')
        ts = event.get('timestamp')
        if isinstance(ts, datetime.datetime):
            ts = ts.strftime("%Y-%m-%d %H:%M:%S")
        elif not ts:
            ts = t["timestamp_unavailable"]
            
        translated_event = translate_status(event_name, lang)
        translated_status_val = translate_status(status, lang)
        
        pdf.cell(80, 8, txt=translated_event, ln=False)
        pdf.cell(50, 8, txt=f'{t["status"]} {translated_status_val}', ln=False)
        pdf.cell(60, 8, txt=str(ts), ln=True)
        
    pdf.ln(10)
    pdf.set_font(pdf.font_family, size=10)
    pdf.cell(200, 10, txt=t["generated_by"], ln=True, align='C')
    
    pdf.output(output_path)
    return output_path
