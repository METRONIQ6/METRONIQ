import json
import os

files = ['en.json', 'ta.json', 'hi.json']

data = {
    'en': {
        "dashboard": "Dashboard",
        "aiScanner": "AI Scanner",
        "ecommerce": "E-Commerce Monitor",
        "enforcement": "Legal Docket",
        "reinspections": "Re-inspection Queue",
        "notices": "Improvement Notices",
        "reports": "Audit Reports",
        "geoAnalytics": "Geo Analytics",
        "rules": "Rule Management",
        "labelAuditor": "Label Auditor",
        "logout": "Logout"
    },
    'ta': {
        "dashboard": "முகப்புப்பலகை",
        "aiScanner": "AI ஸ்கேனர்",
        "ecommerce": "மின் வணிகம் கண்காணிப்பு",
        "enforcement": "சட்ட ஆவணம்",
        "reinspections": "மறு ஆய்வு வரிசை",
        "notices": "மேம்பாட்டு அறிவிப்புகள்",
        "reports": "ஆய்வு அறிக்கைகள்",
        "geoAnalytics": "புவியியல் பகுப்பாய்வு",
        "rules": "விதிகள் மேலாண்மை",
        "labelAuditor": "லேபிள் தணிக்கையாளர்",
        "logout": "வெளியேறு"
    },
    'hi': {
        "dashboard": "डैशबोर्ड",
        "aiScanner": "AI स्कैनर",
        "ecommerce": "ई-कॉमर्स मॉनिटर",
        "enforcement": "कानूनी डॉकेट",
        "reinspections": "पुनर्निरीक्षण कतार",
        "notices": "सुधार नोटिस",
        "reports": "अंकेक्षण रिपोर्ट",
        "geoAnalytics": "भू-विश्लेषिकी",
        "rules": "नियम प्रबंधन",
        "labelAuditor": "लेबल ऑडिटर",
        "logout": "लॉग आउट"
    }
}

for f in files:
    path = f"frontend/src/i18n/locales/{f}"
    with open(path, "r", encoding="utf-8") as file:
        d = json.load(file)
    
    lang = f.split(".")[0]
    
    if "navigation" not in d:
        d["navigation"] = {}
    
    for k, v in data[lang].items():
        if k == "logout":
            d["common"]["logout"] = v
        else:
            d["navigation"][k] = v

    with open(path, "w", encoding="utf-8") as file:
        json.dump(d, file, ensure_ascii=False, indent=4)

print("Dictionaries updated.")
