TRANSLATIONS = {
    "en": {
        "title": "METRONIQ - Official Audit / Inspection Report",
        "case_id": "Case ID:",
        "case_status": "Case Status:",
        "penalty_amount": "Penalty Amount:",
        "timeline_heading": "Audit Timeline",
        "status": "Status:",
        "timestamp_unavailable": "Timestamp unavailable",
        "generated_by": "Generated automatically by MetronIQ AI Inspector System."
    },
    "ta": {
        "title": "மெட்ரோனிக் - அதிகாரப்பூர்வ ஆய்வு அறிக்கை",
        "case_id": "வழக்கு எண்:",
        "case_status": "வழக்கு நிலை:",
        "penalty_amount": "அபராத தொகை:",
        "timeline_heading": "ஆய்வு காலவரிசை",
        "status": "நிலை:",
        "timestamp_unavailable": "நேரம் கிடைக்கவில்லை",
        "generated_by": "மெட்ரோனிக் AI மூலம் தானியங்கியாக உருவாக்கப்பட்டது."
    },
    "hi": {
        "title": "मेट्रोनिक़ - आधिकारिक अंकेक्षण / निरीक्षण रिपोर्ट",
        "case_id": "केस आईडी:",
        "case_status": "केस स्थिति:",
        "penalty_amount": "जुर्माना राशि:",
        "timeline_heading": "अंकेक्षण समयरेखा",
        "status": "स्थिति:",
        "timestamp_unavailable": "समय उपलब्ध नहीं है",
        "generated_by": "मेट्रोनिक़ AI सिस्टम द्वारा स्वचालित रूप से उत्पन्न।"
    }
}

INTERNAL_STATUS_TRANSLATIONS = {
    "en": lambda x: x.replace("_", " ").title(),
    "ta": {
        "INSPECTION": "ஆய்வு",
        "NOTICE_ISSUED": "அறிவிப்பு வழங்கப்பட்டது",
        "RECTIFICATION_SUBMITTED": "திருத்தம் சமர்ப்பிக்கப்பட்டது",
        "REINSPECTION_SCHEDULED": "மறு ஆய்வு திட்டமிடப்பட்டுள்ளது",
        "REINSPECTION_COMPLETED": "மறு ஆய்வு முடிந்தது",
        "ENFORCEMENT_ESCALATED": "அமலாக்கம் அதிகரிக்கப்பட்டுள்ளது",
        "RESOLUTION": "தீர்வு",
        "OPEN": "திறந்துள்ளது",
        "COMPLETED": "முடிந்தது",
        "RESOLVED": "தீர்க்கப்பட்டது",
        "SCHEDULED": "திட்டமிடப்பட்டுள்ளது",
        "SUBMITTED": "சமர்ப்பிக்கப்பட்டது"
    },
    "hi": {
        "INSPECTION": "निरीक्षण",
        "NOTICE_ISSUED": "नोटिस जारी किया गया",
        "RECTIFICATION_SUBMITTED": "सुधार प्रस्तुत किया गया",
        "REINSPECTION_SCHEDULED": "पुनर्निरीक्षण निर्धारित",
        "REINSPECTION_COMPLETED": "पुनर्निरीक्षण पूरा हुआ",
        "ENFORCEMENT_ESCALATED": "प्रवर्तन बढ़ाया गया",
        "RESOLUTION": "संकल्प",
        "OPEN": "खुला है",
        "COMPLETED": "पूरा हुआ",
        "RESOLVED": "हल हो गया",
        "SCHEDULED": "निर्धारित",
        "SUBMITTED": "प्रस्तुत किया गया"
    }
}

def translate_status(status, lang):
    if lang == "en":
        return status.replace("_", " ").title() if status else "N/A"
    return INTERNAL_STATUS_TRANSLATIONS.get(lang, {}).get(status, status)
