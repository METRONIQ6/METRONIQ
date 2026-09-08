from fpdf import FPDF
import datetime
import os
from .i18n_pdf import TRANSLATIONS, translate_status

class PDF(FPDF):
    def header(self):
        # Premium Deep Navy Banner
        self.set_fill_color(11, 31, 58)
        self.rect(0, 0, 210, 35, 'F')
        # Accent Blue Strip
        self.set_fill_color(37, 99, 235)
        self.rect(0, 35, 210, 3, 'F')
        
    def footer(self):
        self.set_y(-20)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.line(10, self.get_y(), 200, self.get_y())
        self.set_y(-18)
        self.cell(0, 10, 'MetronIQ Legal Metrology Ecosystem  |  Generated automatically, no physical signature required.', 0, 0, 'L')
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'R')

def generate_audit_pdf(audit_data: dict, output_path: str, lang: str = "en"):
    if lang not in TRANSLATIONS:
        lang = "en"
    t = TRANSLATIONS[lang]
    
    pdf = PDF()
    pdf.add_page()
    
    # Initialize basic Arial font to bypass PyFPDF unicode complexity for simple layout 
    # (assuming most core terms will map fine, or we restrict explicitly here for design)
    pdf.set_font("Arial", "", 12)
    
    def safe_font(size=12, style="", family="Arial"):
        pdf.set_font(family, style, size)

    # --- BRAND HEADER TEXT ---
    pdf.set_y(12)
    pdf.set_text_color(255, 255, 255)
    safe_font(20, "B")
    pdf.cell(10)
    pdf.cell(100, 10, txt="METRONIQ", ln=0, align='L')
    
    safe_font(10, "")
    pdf.set_text_color(200, 210, 230)
    pdf.cell(80, 10, txt=str(t["title"]).upper(), ln=1, align='R')
    
    pdf.ln(25) # push below header
    
    # --- REPORT IDENTIFICATION & BADGE ---
    pdf.set_text_color(0, 0, 0)
    safe_font(16, "B")
    pdf.cell(10)
    pdf.cell(120, 10, txt="OFFICIAL AUDIT DOSSIER", ln=0)
    
    # Generated Date
    safe_font(10, "")
    pdf.set_text_color(100, 100, 100)
    now_str = datetime.datetime.now().strftime("%d %b %Y, %H:%M")
    pdf.cell(60, 10, txt=f"Generated: {now_str}", ln=1, align='R')
    
    pdf.set_draw_color(220, 220, 220)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(10)
    
    # --- CASE METADATA (Grid Layout) ---
    pdf.set_fill_color(248, 250, 252) # Slate-50 background for card
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(20, pdf.get_y(), 170, 35, 'FD')
    
    current_y = pdf.get_y()
    
    pdf.set_y(current_y + 5)
    pdf.set_x(25)
    safe_font(9, "B")
    pdf.set_text_color(148, 163, 184) # slate-400
    pdf.cell(60, 6, txt="CASE IDENTIFIER", ln=0)
    pdf.cell(60, 6, txt="CURRENT STATUS", ln=0)
    
    if audit_data.get("penalty_amount"):
         pdf.cell(50, 6, txt="PENALTY ASSESSED", ln=0)
         
    pdf.ln(8)
    pdf.set_x(25)
    safe_font(11, "B")
    pdf.set_text_color(15, 23, 42) # slate-900
    
    # Display Case ID, truncated if needed, or complete
    cid = str(audit_data.get("case_id", "N/A"))
    if len(cid) > 20: cid = cid[:17] + "..."
    pdf.cell(60, 6, txt=cid, ln=0)
    
    raw_status = audit_data.get("case_status", "UNKNOWN")
    translated_status = translate_status(raw_status, lang)
    
    # Status coloring depending on value
    if raw_status.upper() in ["COMPLIANT", "RESOLVED"]:
        pdf.set_text_color(22, 163, 74) # green-600
    elif raw_status.upper() in ["FAIL", "NOTICE", "REJECTED"]:
        pdf.set_text_color(220, 38, 38) # red-600
    else:
        pdf.set_text_color(37, 99, 235) # blue-600
        
    pdf.cell(60, 6, txt=translated_status.upper(), ln=0)
    
    pdf.set_text_color(15, 23, 42)
    if audit_data.get("penalty_amount"):
         pdf.cell(50, 6, txt=f"INR {audit_data['penalty_amount']}", ln=0)
         
    pdf.ln(25)
    
    # --- EVENT TIMELINE ---
    safe_font(12, "B")
    pdf.set_text_color(30, 41, 59)
    pdf.cell(10)
    pdf.cell(180, 10, txt="CHRONOLOGICAL EVENT LOG", ln=1)
    
    # Table Header
    pdf.set_fill_color(241, 245, 249) # slate-100
    pdf.cell(10)
    safe_font(9, "B")
    pdf.set_text_color(100, 116, 139) # slate-500
    pdf.cell(45, 10, txt=" TIMESTAMP", border="B", ln=0, fill=True)
    pdf.cell(85, 10, txt=" EVENT / ACTION", border="B", ln=0, fill=True)
    pdf.cell(40, 10, txt=" RESULTING STATUS", border="B", ln=1, fill=True, align="C")
    
    # Table Rows
    pdf.set_text_color(30, 41, 59)
    fill = False
    
    for event in audit_data.get("timeline", []):
        event_name = event.get('event', 'UNKNOWN')
        status = event.get('status', 'N/A')
        ts = event.get('timestamp')
        
        if isinstance(ts, datetime.datetime):
            ts = ts.strftime("%d %b %Y, %H:%M")
        elif not ts:
            ts = "-"
        else:
            try:
                # Basic parsing if ISO string
                ts = str(ts)[:16].replace('T', ' ')
            except:
                ts = str(ts)
                
        translated_event = translate_status(event_name, lang)
        translated_status_val = translate_status(status, lang)
        
        safe_font(9, "")
        pdf.set_fill_color(248, 250, 252) # slate-50 alternating
        pdf.cell(10)
        pdf.cell(45, 12, txt=" " + ts, border=0, ln=0, fill=fill)
        
        safe_font(9, "B") # Bold the event name
        pdf.cell(85, 12, txt=" " + str(translated_event).upper(), border=0, ln=0, fill=fill)
        
        safe_font(9, "")
        
        # Colorize statuses
        r, g, b = 30, 41, 59
        stat_upper = str(translated_status_val).upper()
        if stat_upper in ["PASS", "COMPLIANT", "RESOLVED", "SUCCESS"]:
             r, g, b = 22, 163, 74
        elif stat_upper in ["FAIL", "REJECTED", "ERROR"]:
             r, g, b = 220, 38, 38
             
        pdf.set_text_color(r, g, b)
        pdf.cell(40, 12, txt=stat_upper, border=0, ln=1, fill=fill, align="C")
        pdf.set_text_color(30, 41, 59) # restore
        
        fill = not fill
        
    pdf.output(output_path)
    return output_path
