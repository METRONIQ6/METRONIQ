import os
import datetime
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from .i18n_pdf import TRANSLATIONS, translate_status

FONT_FAMILY = "Nirmala"

def setup_pdf_fonts(pdf: FPDF) -> str:
    """Setup universal Unicode fonts for English, Tamil, and Hindi rendering."""
    windows_fonts = [
        ("Nirmala", "", "C:/Windows/Fonts/Nirmala.ttf"),
        ("Nirmala", "B", "C:/Windows/Fonts/NirmalaB.ttf"),
        ("Nirmala", "I", "C:/Windows/Fonts/NirmalaS.ttf"),
    ]
    
    loaded = False
    for family, style, path in windows_fonts:
        if os.path.exists(path):
            try:
                pdf.add_font(family, style, path)
                loaded = True
            except Exception:
                pass
                
    if loaded:
        return "Nirmala"
        
    return "helvetica"

class AuditPDF(FPDF):
    def __init__(self, lang="en", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.lang = lang
        self.font_name = setup_pdf_fonts(self)
        self.t = TRANSLATIONS.get(lang, TRANSLATIONS["en"])

    def header(self):
        # Deep Navy Top Banner
        self.set_fill_color(11, 31, 58)
        self.rect(0, 0, 210, 30, 'F')
        # Accent Blue Strip
        self.set_fill_color(37, 99, 235)
        self.rect(0, 30, 210, 2, 'F')
        
        # Header Text
        self.set_y(8)
        self.set_text_color(255, 255, 255)
        self.set_font(self.font_name, "B", 16)
        self.set_x(15)
        self.cell(90, 8, text="METRONIQ", align='L')
        
        self.set_font(self.font_name, "", 9)
        self.set_text_color(203, 213, 225)
        title_text = str(self.t.get("title", "Compliance Audit Report"))
        self.cell(90, 8, text=title_text, align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_y(36)

    def footer(self):
        self.set_y(-18)
        self.set_font(self.font_name, "", 7)
        self.set_text_color(148, 163, 184)
        self.set_draw_color(226, 232, 240)
        self.line(15, self.get_y(), 195, self.get_y())
        self.set_y(-14)
        footer_text = str(self.t.get("footer_note", "MetronIQ Compliance & Verification Platform | Automated Audit Document."))
        self.set_x(15)
        self.cell(140, 8, text=footer_text, align='L')
        self.cell(40, 8, text=f"Page {self.page_no()}", align='R')


def generate_audit_pdf(audit_data: dict, output_path: str, lang: str = "en") -> str:
    if lang not in TRANSLATIONS:
        lang = "en"
    t = TRANSLATIONS[lang]
    
    pdf = AuditPDF(lang=lang)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    fn = pdf.font_name

    # --- Title & Metadata Bar ---
    pdf.set_text_color(15, 23, 42)
    pdf.set_font(fn, "B", 13)
    pdf.set_x(15)
    pdf.cell(110, 8, text=t.get("official_dossier", "AUDIT DOSSIER & SUMMARY"))
    
    pdf.set_font(fn, "", 8)
    pdf.set_text_color(100, 116, 139)
    now_str = datetime.datetime.now().strftime("%d %b %Y, %H:%M")
    pdf.cell(70, 8, text=f"{t.get('generated', 'Generated:')} {now_str}", align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.ln(2)
    pdf.set_draw_color(226, 232, 240)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)

    # --- Audit Overview Card ---
    card_y = pdf.get_y()
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(15, card_y, 180, 26, 'FD')
    
    pdf.set_y(card_y + 3)
    pdf.set_x(20)
    pdf.set_font(fn, "B", 8)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(60, 5, text=t.get("case_identifier", "CASE / INSP IDENTIFIER"))
    pdf.cell(60, 5, text=t.get("current_status", "CURRENT STATUS"))
    if audit_data.get("penalty_amount"):
        pdf.cell(50, 5, text=t.get("penalty_assessed", "PENALTY ASSESSED"))
    pdf.ln(5)

    pdf.set_x(20)
    pdf.set_font(fn, "B", 10)
    pdf.set_text_color(15, 23, 42)
    
    # Identifier
    identifier = audit_data.get("case_id") or (audit_data.get("inspection", {}) or {}).get("id") or "N/A"
    if len(str(identifier)) > 22:
        identifier = str(identifier)[:19] + "..."
    pdf.cell(60, 6, text=str(identifier))
    
    # Status
    raw_status = audit_data.get("case_status") or (audit_data.get("inspection", {}) or {}).get("result") or "PENDING"
    translated_status = translate_status(raw_status, lang)
    stat_upper = str(raw_status).upper()
    if stat_upper in ["COMPLIANT", "RESOLVED", "PASS"]:
        pdf.set_text_color(22, 163, 74)
    elif stat_upper in ["FAIL", "NOTICE", "REJECTED", "NON_COMPLIANT"]:
        pdf.set_text_color(220, 38, 38)
    else:
        pdf.set_text_color(37, 99, 235)
    pdf.cell(60, 6, text=str(translated_status).upper())
    
    if audit_data.get("penalty_amount"):
        pdf.set_text_color(15, 23, 42)
        pdf.cell(50, 6, text=f"INR {audit_data['penalty_amount']}")
        
    pdf.set_y(card_y + 30)

    # --- Product & Legal Declarations (Dynamic Grid) ---
    declarations = audit_data.get("declarations", {}) or {}
    if declarations:
        pdf.set_font(fn, "B", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.set_x(15)
        pdf.cell(180, 6, text=t.get("product_info_heading", "PRODUCT & LEGAL DECLARATIONS"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)

        # Table Header
        pdf.set_fill_color(241, 245, 249)
        pdf.set_draw_color(226, 232, 240)
        pdf.set_font(fn, "B", 8)
        pdf.set_text_color(71, 85, 105)
        pdf.set_x(15)
        pdf.cell(85, 6, text=f" {t.get('rule_name', 'DECLARATION FIELD')}", border=1, fill=True)
        pdf.cell(95, 6, text=f" {t.get('detected_value', 'DETECTED VALUE')}", border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        fill = False
        for field_key, field_obj in declarations.items():
            if str(field_key).startswith("_META"):
                continue
            field_name = translate_status(field_key, lang)
            val = field_obj.get("value") if isinstance(field_obj, dict) else str(field_obj)
            if not val:
                val = "-"
            if len(str(val)) > 55:
                val = str(val)[:52] + "..."

            pdf.set_font(fn, "", 8)
            pdf.set_text_color(30, 41, 59)
            pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(255, 255, 255)

            pdf.set_x(15)
            pdf.cell(85, 6, text=f" {field_name}", border="B", fill=True)
            pdf.set_font(fn, "B" if field_key in ["PRODUCT_NAME", "MRP", "NET_QUANTITY"] else "", 8)
            pdf.cell(95, 6, text=f" {val}", border="B", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            fill = not fill

        pdf.ln(4)

    # --- Validation Evaluations & Compliance Matrix ---
    validation = audit_data.get("validation", {}) or {}
    evaluations = validation.get("evaluations", []) or []
    
    if evaluations:
        pdf.set_font(fn, "B", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.set_x(15)
        pdf.cell(180, 6, text=t.get("declarations_heading", "RULE VALIDATION FINDINGS (PCR 2011)"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)
        
        # Table Header
        pdf.set_fill_color(241, 245, 249)
        pdf.set_draw_color(226, 232, 240)
        pdf.set_font(fn, "B", 8)
        pdf.set_text_color(71, 85, 105)
        pdf.set_x(15)
        pdf.cell(75, 6, text=f" {t.get('rule_name', 'RULE / DECLARATION')}", border=1, fill=True)
        pdf.cell(65, 6, text=f" {t.get('detected_value', 'DETECTED VALUE / EVIDENCE')}", border=1, fill=True)
        pdf.cell(40, 6, text=f" {t.get('verification', 'STATUS')}", border=1, fill=True, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        # Table Rows
        fill = False
        for ev in evaluations:
            rule_id = str(ev.get("rule_id", ev.get("rule_code", "RULE")))
            rule_name = str(ev.get("rule_name", ev.get("declaration_type", rule_id)))
            field_name = translate_status(ev.get("field", rule_name), lang)
            if len(field_name) > 36: field_name = field_name[:33] + "..."
            
            val_text = str(ev.get("detected_value", ev.get("evidence", "DETECTED")))
            if len(val_text) > 32: val_text = val_text[:29] + "..."
            
            ev_status = str(ev.get("status", "PASS")).upper()
            status_disp = translate_status(ev_status, lang)
            
            pdf.set_font(fn, "", 8)
            pdf.set_text_color(30, 41, 59)
            pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(255, 255, 255)
                
            pdf.set_x(15)
            pdf.cell(75, 6, text=f" {field_name}", border="B", fill=True)
            pdf.cell(65, 6, text=f" {val_text}", border="B", fill=True)
            
            if ev_status in ["PASS", "COMPLIANT"]:
                pdf.set_text_color(22, 163, 74)
            elif ev_status in ["FAIL", "NON_COMPLIANT"]:
                pdf.set_text_color(220, 38, 38)
            else:
                pdf.set_text_color(217, 119, 6)
                
            pdf.set_font(fn, "B", 8)
            pdf.cell(40, 6, text=str(status_disp).upper(), border="B", fill=True, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            fill = not fill
            
        pdf.ln(4)

    # --- Timeline Section ---
    timeline = audit_data.get("timeline", []) or []
    if timeline:
        pdf.set_font(fn, "B", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.set_x(15)
        pdf.cell(180, 6, text=t.get("chronological_log", "CHRONOLOGICAL EVENT LOG"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)
        
        pdf.set_fill_color(241, 245, 249)
        pdf.set_draw_color(226, 232, 240)
        pdf.set_font(fn, "B", 8)
        pdf.set_text_color(71, 85, 105)
        pdf.set_x(15)
        pdf.cell(45, 6, text=f" {t.get('timestamp', 'TIMESTAMP')}", border=1, fill=True)
        pdf.cell(85, 6, text=f" {t.get('event_action', 'EVENT / ACTION')}", border=1, fill=True)
        pdf.cell(50, 6, text=f" {t.get('resulting_status', 'RESULTING STATUS')}", border=1, fill=True, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        fill = False
        for event in timeline:
            event_name = event.get('event', 'UNKNOWN')
            status_val = event.get('status', 'N/A')
            ts = event.get('timestamp')
            
            if isinstance(ts, datetime.datetime):
                ts_str = ts.strftime("%d %b %Y, %H:%M")
            elif not ts:
                ts_str = "-"
            else:
                ts_str = str(ts)[:16].replace('T', ' ')
                
            translated_event = translate_status(event_name, lang)
            translated_status_val = translate_status(status_val, lang)
            
            pdf.set_font(fn, "", 8)
            pdf.set_text_color(30, 41, 59)
            pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(255, 255, 255)
                
            pdf.set_x(15)
            pdf.cell(45, 6, text=f" {ts_str}", border="B", fill=True)
            pdf.set_font(fn, "B", 8)
            pdf.cell(85, 6, text=f" {str(translated_event).upper()}", border="B", fill=True)
            
            st_upper = str(status_val).upper()
            if st_upper in ["PASS", "COMPLIANT", "RESOLVED", "SUCCESS", "COMPLETED"]:
                pdf.set_text_color(22, 163, 74)
            elif st_upper in ["FAIL", "REJECTED", "ERROR"]:
                pdf.set_text_color(220, 38, 38)
            else:
                pdf.set_text_color(37, 99, 235)
                
            pdf.cell(50, 6, text=str(translated_status_val).upper(), border="B", fill=True, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            fill = not fill

    pdf.output(output_path)
    return output_path
