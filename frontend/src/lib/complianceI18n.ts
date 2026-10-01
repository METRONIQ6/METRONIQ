/**
 * Centralized Legal Metrology compliance localization engine.
 * Translates all scanner results, field declarations, statuses, risk scores,
 * evidence descriptions, rule names, rule descriptions, recommendations,
 * and audit timeline events to English, Tamil, and Hindi.
 */

export type StrictLanguage = 'en' | 'ta' | 'hi';
export type SupportedLanguage = StrictLanguage | string;

export function normalizeLang(lang?: SupportedLanguage): StrictLanguage {
    if (lang === 'ta' || lang === 'hi') return lang;
    return 'en';
}

const FIELD_TRANSLATIONS: Record<string, Record<StrictLanguage, string>> = {
    MRP: {
        en: "Maximum Retail Price (MRP)",
        ta: "அதிகபட்ச சில்லறை விலை (MRP)",
        hi: "अधिकतम खुदरा मूल्य (MRP)"
    },
    NET_QUANTITY: {
        en: "Net Quantity",
        ta: "நிகர அளவு",
        hi: "शुद्ध मात्रा"
    },
    NET_WEIGHT: {
        en: "Net Weight",
        ta: "நிகர எடை",
        hi: "शुद्ध वजन"
    },
    MANUFACTURER: {
        en: "Manufacturer Details",
        ta: "உற்பத்தியாளர் விவரங்கள்",
        hi: "निर्माता विवरण"
    },
    MANUFACTURER_NAME: {
        en: "Manufacturer Name",
        ta: "உற்பத்தியாளர் பெயர்",
        hi: "निर्माता का नाम"
    },
    MANUFACTURER_ADDRESS: {
        en: "Manufacturer Address",
        ta: "உற்பத்தியாளர் முகவரி",
        hi: "निर्माता का पता"
    },
    PACKER: {
        en: "Packer Details",
        ta: "பேக்கர் விவரங்கள்",
        hi: "पैकर विवरण"
    },
    PACKER_NAME: {
        en: "Packer Name",
        ta: "பேக்கர் பெயர்",
        hi: "पैकर का नाम"
    },
    PACKER_ADDRESS: {
        en: "Packer Address",
        ta: "பேக்கர் முகவரி",
        hi: "पैकर का पता"
    },
    IMPORTER: {
        en: "Importer Details",
        ta: "இறக்குமதியாளர் விவரங்கள்",
        hi: "ஆयातक विवरण"
    },
    IMPORTER_NAME: {
        en: "Importer Name",
        ta: "இறக்குமதியாளர் பெயர்",
        hi: "आयातक का नाम"
    },
    IMPORTER_ADDRESS: {
        en: "Importer Address",
        ta: "இறக்குமதியாளர் முகவரி",
        hi: "आयातक का पता"
    },
    CONSUMER_CARE: {
        en: "Consumer Care Details",
        ta: "நுகர்வோர் குறைதீர்ப்பு விவரங்கள்",
        hi: "उपभोक्ता सेवा विवरण"
    },
    DATE: {
        en: "Date of Manufacture / Packing",
        ta: "தயாரிப்பு / பேக்கிங் தேதி",
        hi: "निर्माण / पैकिंग की तिथि"
    },
    DATE_OF_MANUFACTURE: {
        en: "Date of Manufacture",
        ta: "தயாரிப்பு தேதி",
        hi: "निर्माण की तिथि"
    },
    DATE_OF_PACKING: {
        en: "Date of Packing",
        ta: "பேக்கிங் தேதி",
        hi: "पैकिंग की तिथि"
    },
    BATCH: {
        en: "Batch / Lot Number",
        ta: "தொகுதி / லாட் எண்",
        hi: "बैच / लॉट संख्या"
    },
    BATCH_NUMBER: {
        en: "Batch Number",
        ta: "தொகுதி எண்",
        hi: "बैच संख्या"
    },
    PRODUCT_NAME: {
        en: "Product Generic Name",
        ta: "பொருளின் பொதுப் பெயர்",
        hi: "उत्पाद का सामान्य नाम"
    },
    COUNTRY_OF_ORIGIN: {
        en: "Country of Origin",
        ta: "உற்பத்தி நாடு",
        hi: "मूल देश"
    },
    BEST_BEFORE: {
        en: "Best Before / Expiry Date",
        ta: "காலாவதி தேதி / பயன்பாட்டுத் தேதி",
        hi: "सर्वोत्तम उपयोग / समाप्ति तिथि"
    },
    EXPIRY_DATE: {
        en: "Expiry Date",
        ta: "காலாவதி தேதி",
        hi: "समाप्ति तिथि"
    },
    WEIGHT: {
        en: "Weight",
        ta: "எடை",
        hi: "वजन"
    },
    UNIT_SALE_PRICE: {
        en: "Unit Sale Price",
        ta: "அலகு விற்பனை விலை",
        hi: "इकाई विक्रय मूल्य"
    },
    DIMENSIONS: {
        en: "Dimensions",
        ta: "பரிமாணங்கள்",
        hi: "विमाएं"
    },
    INGREDIENTS: {
        en: "Ingredients",
        ta: "மூலப்பொருட்கள்",
        hi: "सामग्री"
    },
    NUTRITIONAL_INFO: {
        en: "Nutritional Information",
        ta: "ஊட்டச்சத்து தகவல்",
        hi: "पोषण संबंधी जानकारी"
    },
    BARCODE: {
        en: "Barcode",
        ta: "பார்கோடு",
        hi: "बारकोड"
    },
    FSSAI_LICENSE: {
        en: "FSSAI License",
        ta: "FSSAI உரிமம்",
        hi: "FSSAI लाइसेंस"
    },
    FSSAI: {
        en: "FSSAI License / Number",
        ta: "FSSAI உணவு உரிம எண்",
        hi: "FSSAI लाइसेंस नंबर"
    },
    ISI_MARK: {
        en: "ISI Quality Mark",
        ta: "ISI தரச் சான்றிதழ் குறி",
        hi: "ISI प्रमाणन चिह्न"
    }
};

const STATUS_TRANSLATIONS: Record<string, Record<StrictLanguage, string>> = {
    PASS: {
        en: "Compliant",
        ta: "விதிமுறைகளுக்கு உட்பட்டது",
        hi: "अनुपालन"
    },
    COMPLIANT: {
        en: "Compliant",
        ta: "விதிமுறைகளுக்கு உட்பட்டது",
        hi: "अनुपालन"
    },
    FAIL: {
        en: "Non-Compliant",
        ta: "விதிமீறல்",
        hi: "गैर-अनुपालन"
    },
    NON_COMPLIANT: {
        en: "Non-Compliant",
        ta: "விதிமீறல்",
        hi: "गैर-अनुपालन"
    },
    NONCOMPLIANT: {
        en: "Non-Compliant",
        ta: "விதிமீறல்",
        hi: "गैर-अनुपालन"
    },
    PARTIAL: {
        en: "Partially Compliant",
        ta: "பகுதி இணக்கம்",
        hi: "आंशिक अनुपालन"
    },
    PARTIALLY_COMPLIANT: {
        en: "Partially Compliant",
        ta: "பகுதி இணக்கம்",
        hi: "आंशिक अनुपालन"
    },
    REVIEW_REQUIRED: {
        en: "Review Required",
        ta: "மறுஆய்வு தேவை",
        hi: "समीक्षा आवश्यक"
    },
    NOT_VERIFIED: {
        en: "Not Verified",
        ta: "சரிபார்க்கப்படவில்லை",
        hi: "सत्यापित नहीं"
    },
    UNVERIFIED: {
        en: "Not Verified",
        ta: "சரிபார்க்கப்படவில்லை",
        hi: "सत्यापित नहीं"
    },
    NOT_APPLICABLE: {
        en: "Not Applicable",
        ta: "பொருந்தாது",
        hi: "लागू नहीं"
    },
    NA: {
        en: "Not Applicable",
        ta: "பொருந்தாது",
        hi: "लागू नहीं"
    },
    N_A: {
        en: "Not Applicable",
        ta: "பொருந்தாது",
        hi: "लागू नहीं"
    },
    PENDING_RULE_DEF: {
        en: "Pending Rule Definition",
        ta: "விதி வரையறை நிலுவையில்",
        hi: "नियम परिभाषा प्रतीक्षित"
    },
    OCR_UNCERTAIN: {
        en: "OCR Uncertain",
        ta: "OCR தெளிவற்றது",
        hi: "OCR अनिश्चित"
    },
    ENVIRONMENT_ERROR: {
        en: "Environment Error",
        ta: "கணினி சூழல் பிழை",
        hi: "पर्यावरण त्रुटि"
    },
    OCR_SERVICE_UNAVAILABLE: {
        en: "OCR Service Unavailable",
        ta: "OCR சேவை கிடைக்கவில்லை",
        hi: "OCR सेवा अनुपलब्ध"
    },
    NOT_VERIFIED___OCR_SERVICE_UNAVAILABLE: {
        en: "Not Verified / OCR Service Unavailable",
        ta: "சரிபார்க்கப்படவில்லை / OCR சேவை கிடைக்கவில்லை",
        hi: "सत्यापित नहीं / OCR सेवा अनुपलब्ध"
    },
    "NOT VERIFIED / OCR SERVICE UNAVAILABLE": {
        en: "Not Verified / OCR Service Unavailable",
        ta: "சரிபார்க்கப்படவில்லை / OCR சேவை கிடைக்கவில்லை",
        hi: "सत्यापित नहीं / OCR सेवा अनुपलब्ध"
    },
    INVALID_IMAGE: {
        en: "Invalid Image",
        ta: "செல்லுபடியாகாத படம்",
        hi: "अमान्य छवि"
    },
    IMAGE_INVALID: {
        en: "Invalid Image",
        ta: "செல்லுபடியாகாத படம்",
        hi: "अमान्य छवि"
    },
    MISSING_DECLARATION: {
        en: "Missing Declaration",
        ta: "விடுபட்ட பிரகடனம்",
        hi: "लापता घोषणा"
    },
    UPLOADED: {
        en: "Uploaded",
        ta: "பதிவேற்றப்பட்டது",
        hi: "अपलोड किया गया"
    },
    PROCESSING: {
        en: "Processing",
        ta: "செயலாக்கப்படுகிறது",
        hi: "प्रक्रिया जारी"
    },
    COMPLETED: {
        en: "Completed",
        ta: "நிறைவடைந்தது",
        hi: "पूर्ण हुआ"
    },
    FAILED: {
        en: "Failed",
        ta: "தோல்வியடைந்தது",
        hi: "विफल"
    },
    PENDING: {
        en: "Pending",
        ta: "நிலுவையில் உள்ளது",
        hi: "लंबित"
    },
    RESOLVED: {
        en: "Resolved",
        ta: "தீர்க்கப்பட்டது",
        hi: "सुलझाया गया"
    },
    ACTIVE: {
        en: "Active",
        ta: "செயலில் உள்ளது",
        hi: "सक्रिय"
    },
    INACTIVE: {
        en: "Inactive",
        ta: "செயலற்றது",
        hi: "निष्क्रिय"
    },
    SUSPENDED: {
        en: "Suspended",
        ta: "இடைநீக்கம் செய்யப்பட்டது",
        hi: "निलंबित"
    },
    APPROVED: {
        en: "Approved",
        ta: "அங்கீகரிக்கப்பட்டது",
        hi: "स्वीकृत"
    },
    REJECTED: {
        en: "Rejected",
        ta: "நிராகரிக்கப்பட்டது",
        hi: "अस्वीकृत"
    },
    FINAL: {
        en: "Final",
        ta: "இறுதி",
        hi: "अंतिम"
    },
    SCHEDULED: {
        en: "Scheduled",
        ta: "திட்டமிடப்பட்டது",
        hi: "निर्धारित"
    },
    ISSUED: {
        en: "Issued",
        ta: "வழங்கப்பட்டது",
        hi: "जारी किया गया"
    },
    RECTIFICATION_SUBMITTED: {
        en: "Rectification Submitted",
        ta: "திருத்தம் சமர்ப்பிக்கப்பட்டது",
        hi: "सुधार प्रस्तुत किया गया"
    },
    OPEN: {
        en: "Open Case",
        ta: "திறந்த வழக்கு",
        hi: "खुला मामला"
    },
    UNDER_REVIEW: {
        en: "Under Review",
        ta: "மறுஆய்வில் உள்ளது",
        hi: "समीक्षाधीन"
    },
    PENALTY_PENDING: {
        en: "Penalty Pending",
        ta: "அபராதம் நிலுவையில்",
        hi: "जुर्माना लंबित"
    },
    PENALTY_ISSUED: {
        en: "Penalty Issued",
        ta: "அபராதம் விதிக்கப்பட்டது",
        hi: "जुर्माना जारी किया गया"
    },
    ESCALATED: {
        en: "Case Escalated",
        ta: "வழக்கு தீவிரப்படுத்தப்பட்டது",
        hi: "मामला आगे बढ़ाया गया"
    },
    SEIZED: {
        en: "Seized",
        ta: "கைப்பற்றப்பட்டது",
        hi: "जब्त किया गया"
    },
    COMPOUNDED: {
        en: "Compounded & Paid",
        ta: "அபராதம் செலுத்தப்பட்டு இணக்கம்",
        hi: "जुर्माना भुगतान व समाधान"
    },
    CONFORMANT: {
        en: "Conformant",
        ta: "விதிமுறைகளுக்கு உட்பட்டது",
        hi: "अनुरूप"
    },
    VIOLATION: {
        en: "Violation",
        ta: "விதிமீறல்",
        hi: "उल्लंघन"
    },
    UNKNOWN: {
        en: "Unknown",
        ta: "தெரியவில்லை",
        hi: "अज्ञात"
    }
};

const RISK_TRANSLATIONS: Record<string, Record<StrictLanguage, string>> = {
    HIGH: {
        en: "High Risk",
        ta: "அதிக ஆபத்து",
        hi: "उच्च जोखिम"
    },
    MEDIUM: {
        en: "Medium Risk",
        ta: "நடுத்தர ஆபத்து",
        hi: "मध्यम जोखिम"
    },
    LOW: {
        en: "Low Risk",
        ta: "குறைந்த ஆபத்து",
        hi: "कम जोखिम"
    },
    CRITICAL: {
        en: "Critical Risk",
        ta: "தீவிர ஆபத்து",
        hi: "गंभीर जोखिम"
    },
    UNKNOWN: {
        en: "N/A",
        ta: "பொருந்தாது",
        hi: "लागू नहीं"
    }
};

export function translateField(fieldName: string, lang: SupportedLanguage = 'en'): string {
    if (!fieldName) return '';
    const l = normalizeLang(lang);
    const key = fieldName.trim().toUpperCase().replace(/[\s-]/g, '_');
    if (FIELD_TRANSLATIONS[key]?.[l]) {
        return FIELD_TRANSLATIONS[key][l];
    }
    return fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function translateComplianceStatus(status: string | null | undefined, lang: SupportedLanguage = 'en'): string {
    const l = normalizeLang(lang);
    if (!status) return l === 'ta' ? 'தெரியவில்லை' : l === 'hi' ? 'अज्ञात' : 'Unknown';
    const trimmed = String(status).trim();
    if (STATUS_TRANSLATIONS[trimmed]?.[l]) {
        return STATUS_TRANSLATIONS[trimmed][l];
    }
    const key = trimmed.toUpperCase().replace(/[\s-\/]+/g, '_');
    if (STATUS_TRANSLATIONS[key]?.[l]) {
        return STATUS_TRANSLATIONS[key][l];
    }
    return trimmed.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function translateRiskScore(risk: string | number | null | undefined, lang: SupportedLanguage = 'en'): string {
    const l = normalizeLang(lang);
    if (risk === null || risk === undefined || risk === '') {
        return l === 'ta' ? 'பொருந்தாது' : l === 'hi' ? 'लागू नहीं' : 'N/A';
    }
    if (typeof risk === 'number') {
        const score = risk;
        const category = score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW';
        return `${RISK_TRANSLATIONS[category][l]} (${score}%)`;
    }
    const key = String(risk).trim().toUpperCase();
    if (RISK_TRANSLATIONS[key]?.[l]) {
        return RISK_TRANSLATIONS[key][l];
    }
    return String(risk);
}

export function translateEvidence(evidence: string | null | undefined, lang: SupportedLanguage = 'en'): string {
    if (!evidence) return '';
    const l = normalizeLang(lang);
    const str = String(evidence).trim();

    if (str === "MISSING_FROM_PACKAGE" || str.toLowerCase().includes("missing from package")) {
        return l === 'ta' ? 'பேக்கேஜில் விடுபட்டுள்ளது' : l === 'hi' ? 'पैकेज से गायब है' : 'Missing from package';
    }

    if (str.includes("No matching declaration detected") || str.includes("not detected after OCR")) {
        return l === 'ta' 
            ? 'OCR சரிபார்ப்புக்குப் பின் பொருந்தக்கூடிய பிரகடனம் எதுவும் கண்டறியப்படவில்லை.' 
            : l === 'hi' 
                ? 'OCR सत्यापन के बाद कोई मिलान घोषणा नहीं मिली।' 
                : 'No matching declaration detected after OCR verification.';
    }

    if (str === "Field not present" || str.includes("not present")) {
        return l === 'ta' ? 'புலம் பேக்கேஜில் இல்லை' : l === 'hi' ? 'फ़ील्ड पैकेज पर मौजूद नहीं है' : 'Field not present on package';
    }

    const confMatch = str.match(/OCR confidence \(([0-9.]+)\) insufficient/i);
    if (confMatch) {
        const conf = (parseFloat(confMatch[1]) * 100).toFixed(0);
        return l === 'ta' 
            ? `OCR நம்பகத்தன்மை (${conf}%) இணக்கத்தை தீர்மானிக்க போதுமானதாக இல்லை.` 
            : l === 'hi' 
                ? `OCR विश्वास स्तर (${conf}%) अनुपालन निर्धारित करने के लिए अपर्याप्त है।` 
                : `OCR confidence (${conf}%) insufficient to determine compliance.`;
    }

    return str;
}

export function translateEvaluationMessage(
    message: string | null | undefined,
    fieldName: string,
    lang: SupportedLanguage = 'en'
): string {
    if (!message) return '';
    const l = normalizeLang(lang);
    const msg = String(message).trim();
    const localizedField = translateField(fieldName, l);

    if (msg.includes("could not be verified")) {
        if (l === 'ta') return `தேவையான பிரகடனம் (${localizedField}) சரிபார்க்க முடியவில்லை.`;
        if (l === 'hi') return `आवश्यक घोषणा (${localizedField}) सत्यापित नहीं की जा सकी।`;
        return `Required field ${localizedField} could not be verified.`;
    }

    const successMatch = msg.match(/successfully verified \(Confidence:\s*([0-9.%]+)\)/i);
    if (successMatch) {
        const conf = successMatch[1];
        if (l === 'ta') return `${localizedField} வெற்றிகரமாக சரிபார்க்கப்பட்டது (நம்பகத்தன்மை: ${conf}).`;
        if (l === 'hi') return `${localizedField} सफलतापूर्वक सत्यापित किया गया (विश्वास: ${conf})।`;
        return `${localizedField} successfully verified (Confidence: ${conf}).`;
    }

    if (msg.includes("Manual review required") || msg.includes("manual review")) {
        if (l === 'ta') return `${localizedField} புலத்திற்கு மனித நேரடி மறுஆய்வு தேவை.`;
        if (l === 'hi') return `${localizedField} के लिए मैन्युअल समीक्षा आवश्यक है।`;
        return `Manual review required for ${localizedField}.`;
    }

    if (msg.includes("Awaiting Legal Metrology rule definition")) {
        if (l === 'ta') return `${localizedField} க்கான சட்ட அளவியல் விதி வரையறை நிலுவையில் உள்ளது.`;
        if (l === 'hi') return `${localizedField} के लिए विधिक मापविज्ञान नियम परिभाषा प्रतीक्षित है।`;
        return `Awaiting Legal Metrology rule definition for ${localizedField}.`;
    }

    if (msg.includes("Importer details not applicable")) {
        if (l === 'ta') return "உள்நாட்டு தயாரிப்புகளுக்கு இறக்குமதியாளர் விவரங்கள் பொருந்தாது.";
        if (l === 'hi') return "घरेलू उत्पादों के लिए आयातक विवरण लागू नहीं है।";
        return "Importer details not applicable for domestic products.";
    }

    if (msg.includes("Packer details often not strictly separated")) {
        if (l === 'ta') return "இறக்குமதி செய்யப்பட்ட பொருட்களுக்கு பேக்கர் விவரங்கள் தனித்தனியாக பிரிக்கப்படுவதில்லை.";
        if (l === 'hi') return "आयातित उत्पादों के लिए पैकर विवरण अलग से आवश्यक नहीं हैं।";
        return "Packer details often not strictly separated for imported products.";
    }

    if (msg.includes("is not required and not present")) {
        if (l === 'ta') return `${localizedField} புலம் அவசியமில்லை மற்றும் பேக்கேஜில் இல்லை.`;
        if (l === 'hi') return `${localizedField} फ़ील्ड आवश्यक नहीं है और मौजूद नहीं है।`;
        return `Field ${localizedField} is not required and not present.`;
    }

    if (msg.includes("OCR service unavailable")) {
        if (l === 'ta') return "OCR சேவை தற்காலிகமாக கிடைக்கவில்லை. தவறான சட்ட விதிமீறல்களைத் தவிர்க்க ஆய்வு சரிபார்க்கப்படவில்லை எனக் குறிக்கப்பட்டது.";
        if (l === 'hi') return "OCR सेवा अनुपलब्ध है। गलत कानूनी उल्लंघनों को रोकने के लिए निरीक्षण को सत्यापित नहीं के रूप में चिह्नित किया गया है।";
        return "OCR service unavailable. Inspection marked as NOT VERIFIED to prevent false legal violations.";
    }

    if (msg.includes("Image Quality Rejection")) {
        if (l === 'ta') return "படத்தின் தரம் போதுமானதாக இல்லாததால் நிராகரிக்கப்பட்டது. போதுமான வெளிச்சத்துடன் தெளிவான படத்தை மீண்டும் பதிவேற்றவும்.";
        if (l === 'hi') return "छवि गुणवत्ता अस्वीकृति: कृपया पर्याप्त रोशनी के साथ स्पष्ट छवि अपलोड करें।";
        return "Image Quality Rejection: Please upload a clearer image with adequate lighting.";
    }

    return msg;
}

export function translateScannerStep(stepIndex: number, lang: SupportedLanguage = 'en'): string {
    const l = normalizeLang(lang);
    const steps: Record<StrictLanguage, string[]> = {
        en: [
            "Uploading image...",
            "Preprocessing & enhancement...",
            "YOLO detection & OCR extraction...",
            "Rules validation (PCR 2011)...",
            "Generating audit evidence...",
            "Analysis complete"
        ],
        ta: [
            "படம் பதிவேற்றப்படுகிறது...",
            "முன் செயலாக்கம் மற்றும் மேம்பாடு...",
            "YOLO கண்டறிதல் மற்றும் OCR பிரித்தெடுத்தல்...",
            "விதி சரிபார்ப்பு (PCR 2011)...",
            "தணிக்கை ஆதாரம் உருவாக்கப்படுகிறது...",
            "ஆய்வு நிறைவடைந்தது"
        ],
        hi: [
            "छवि अपलोड की जा रही है...",
            "पूर्व-प्रसंस्करण और सुधार...",
            "YOLO पहचान और OCR निष्कर्षण...",
            "नियम सत्यापन (PCR 2011)...",
            "ऑडिट साक्ष्य तैयार किया जा रहा है...",
            "विश्लेषण पूर्ण"
        ]
    };
    const list = steps[l] || steps.en;
    return list[stepIndex] || list[list.length - 1];
}

const TIMELINE_EVENT_TRANSLATIONS: Record<string, Record<StrictLanguage, string>> = {
    INSPECTION: {
        en: "Statutory Inspection Logged",
        ta: "சட்டப்பூர்வ ஆய்வு பதிவு செய்யப்பட்டது",
        hi: "वैधानिक निरीक्षण दर्ज किया गया"
    },
    INITIAL_INSPECTION: {
        en: "Statutory Inspection Logged",
        ta: "சட்டப்பூர்வ ஆய்வு பதிவு செய்யப்பட்டது",
        hi: "वैधानिक निरीक्षण दर्ज किया गया"
    },
    SCAN_COMPLETED: {
        en: "AI Scanner Audit Completed",
        ta: "AI ஸ்கேனர் ஆய்வு நிறைவடைந்தது",
        hi: "AI स्कैनर ऑडिट पूर्ण हुआ"
    },
    NOTICE_ISSUED: {
        en: "Improvement Notice Issued",
        ta: "மேம்பாட்டு அறிவிப்பு வழங்கப்பட்டது",
        hi: "सुधार नोटिस जारी किया गया"
    },
    NOTICE: {
        en: "Improvement Notice Issued",
        ta: "மேம்பாட்டு அறிவிப்பு வழங்கப்பட்டது",
        hi: "सुधार नोटिस जारी किया गया"
    },
    RECTIFICATION_SUBMITTED: {
        en: "Manufacturer Rectification Submitted",
        ta: "உற்பத்தியாளர் திருத்தம் சமர்ப்பிக்கப்பட்டது",
        hi: "निर्माता सुधार प्रस्तुत किया गया"
    },
    REINSPECTION: {
        en: "Official Reinspection Performed",
        ta: "அதிகாரப்பூர்வ மறுஆய்வு செய்யப்பட்டது",
        hi: "आधिकारिक पुनः निरीक्षण किया गया"
    },
    REINSPECTION_COMPLETED: {
        en: "Official Reinspection Performed",
        ta: "அதிகாரப்பூர்வ மறுஆய்வு செய்யப்பட்டது",
        hi: "आधिकारिक पुनः निरीक्षण किया गया"
    },
    ENFORCEMENT: {
        en: "Enforcement Action Escalated",
        ta: "அமலாக்க நடவடிக்கை தீவிரப்படுத்தப்பட்டது",
        hi: "प्रवर्तन कार्रवाई आगे बढ़ाई गई"
    },
    CASE_ESCALATED: {
        en: "Enforcement Action Escalated",
        ta: "அமலாக்க நடவடிக்கை தீவிரப்படுத்தப்பட்டது",
        hi: "प्रवर्तन कार्रवाई आगे बढ़ाई गई"
    },
    CASE_COMPOUNDED: {
        en: "Penalty Compounded & Paid",
        ta: "அபராதம் செலுத்தப்பட்டு இணக்கம்",
        hi: "जुर्माना भरा गया और मामला सुलझाया गया"
    },
    CASE_CLOSED: {
        en: "Inspection Dossier Closed",
        ta: "ஆய்வு கோப்பு முடித்து வைக்கப்பட்டது",
        hi: "निरीक्षण डोजियर बंद किया गया"
    }
};

export function translateTimelineEvent(eventName: string, lang: SupportedLanguage = 'en'): string {
    const l = normalizeLang(lang);
    if (!eventName) return l === 'ta' ? 'அதிகாரப்பூர்வ நிகழ்வு' : l === 'hi' ? 'आधिकारिक घटना' : 'Official Event';
    const key = eventName.trim().toUpperCase().replace(/[\s-]/g, '_');
    if (TIMELINE_EVENT_TRANSLATIONS[key]?.[l]) {
        return TIMELINE_EVENT_TRANSLATIONS[key][l];
    }
    return eventName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export interface RuleInfo {
    citation: string;
    name: string;
    description: string;
}

interface RawRuleData {
    name: string;
    description: string;
}

const RULE_CITATIONS: Record<string, string> = {
    MRP: "Rule 6(1)(e)",
    NET_QUANTITY: "Rule 12",
    MANUFACTURER: "Rule 6(1)(a)",
    PACKER: "Rule 6(1)(a)",
    IMPORTER: "Rule 6(1)(a)",
    DATE: "Rule 6(1)(d)",
    BEST_BEFORE: "Rule 6(1)(d)",
    CONSUMER_CARE: "Rule 6(1)(n)",
    COUNTRY_OF_ORIGIN: "Rule 6(1)(f)",
    BATCH: "Rule 6(1)(g)",
    PRODUCT_NAME: "Rule 6(1)(b)"
};

const RULE_METADATA: Record<string, Record<StrictLanguage, RawRuleData>> = {
    MRP: {
        en: {
            name: "Maximum Retail Price Rule (Rule 6(1)(e))",
            description: "Maximum Retail Price inclusive of all taxes must be declared in Indian currency on the principal display panel."
        },
        ta: {
            name: "அதிகபட்ச சில்லறை விலை விதி (விதி 6(1)(e))",
            description: "அனைத்து வரிகளும் உள்ளடக்கிய MRP இந்திய ரூபாயில் முதன்மை காட்சி பேனலில் தெளிவாகக் குறிப்பிடப்பட வேண்டும்."
        },
        hi: {
            name: "अधिकतम खुदरा मूल्य नियम (नियम 6(1)(e))",
            description: "सभी करों सहित अधिकतम खुदरा मूल्य (MRP) मुख्य प्रदर्शन पैनल पर भारतीय मुद्रा में घोषित होना चाहिए।"
        }
    },
    NET_QUANTITY: {
        en: {
            name: "Net Quantity Declaration Rule (Rule 12)",
            description: "Net quantity in standard SI metric units (g, kg, ml, l) must be declared without non-standard symbols."
        },
        ta: {
            name: "நிகர அளவு அறிவிப்பு விதி (விதி 12)",
            description: "நிலையான SI மெட்ரிக் அலகுகளில் (g, kg, ml, l) நிகர எடை அல்லது அளவு பேக்கேஜில் தெளிவாக இருக்க வேண்டும்."
        },
        hi: {
            name: "शुद्ध मात्रा घोषणा नियम (नियम 12)",
            description: "शुद्ध मात्रा मानक SI मीट्रिक इकाइयों (ग्राम, किग्रा, मिली, लीटर) में बिना गैर-मानक प्रतीकों के घोषित होनी चाहिए।"
        }
    },
    MANUFACTURER: {
        en: {
            name: "Manufacturer / Packer Identification (Rule 6(1)(a))",
            description: "Name and complete physical registered address of the manufacturer, packer, or importer must be legibly displayed."
        },
        ta: {
            name: "உற்பத்தியாளர் / பேக்கர் அடையாள விதி (விதி 6(1)(a))",
            description: "உற்பத்தியாளர் அல்லது பேக்கரின் முழுப் பெயர் மற்றும் தெளிவான வணிக முகவரி பேக்கேஜில் குறிப்பிடப்பட வேண்டும்."
        },
        hi: {
            name: "निर्माता / पैकर पहचान नियम (नियम 6(1)(a))",
            description: "निर्माता, पैकर या आयातक का पूरा पंजीकृत नाम और भौतिक पता स्पष्ट रूप से प्रदर्शित होना चाहिए।"
        }
    },
    DATE: {
        en: {
            name: "Date of Manufacture / Packing Rule (Rule 6(1)(d))",
            description: "Month and year of manufacture or pre-packing must be stated clearly for consumer awareness."
        },
        ta: {
            name: "தயாரிப்பு / பேக்கிங் தேதி விதி (விதி 6(1)(d))",
            description: "தயாரிப்பு அல்லது பேக்கிங் செய்யப்பட்ட மாதம் மற்றும் ஆண்டு நுகர்வோர் எளிதில் படிக்கும் வண்ணம் இருக்க வேண்டும்."
        },
        hi: {
            name: "निर्माण / पैकिंग तिथि नियम (नियम 6(1)(d))",
            description: "उपभोक्ता जागरूकता के लिए निर्माण या प्री-पैकिंग का महीना और वर्ष स्पष्ट रूप से लिखा होना चाहिए।"
        }
    },
    CONSUMER_CARE: {
        en: {
            name: "Consumer Grievance Redressal (Rule 6(1)(n))",
            description: "Contact details of the consumer grievance redressal officer including phone number and email address must be declared."
        },
        ta: {
            name: "நுகர்வோர் குறைதீர்ப்பு விதி (விதி 6(1)(n))",
            description: "நுகர்வோர் புகார்களைத் தீர்ப்பதற்கான தொலைபேசி எண் மற்றும் மின்னஞ்சல் முகவரி தெளிவாகக் குறிப்பிடப்பட வேண்டும்."
        },
        hi: {
            name: "उपभोक्ता शिकायत निवारण नियम (नियम 6(1)(n))",
            description: "उपभोक्ता शिकायत अधिकारी का फोन नंबर और ईमेल पता पैकेज पर घोषित किया जाना अनिवार्य है।"
        }
    },
    COUNTRY_OF_ORIGIN: {
        en: {
            name: "Country of Origin Rule (Rule 6(1)(f))",
            description: "The country of manufacture or origin must be prominently stated on imported and packaged commodities."
        },
        ta: {
            name: "உற்பத்தி நாடு விதி (விதி 6(1)(f))",
            description: "பொருள் உற்பத்தி செய்யப்பட்ட நாட்டின் பெயர் அனைத்து பேக்கேஜ் செய்யப்பட்ட பொருட்களிலும் தெளிவாக இருக்க வேண்டும்."
        },
        hi: {
            name: "मूल देश नियम (नियम 6(1)(f))",
            description: "सभी पैकेज्ड वस्तुओं, विशेष रूप से आयात पर उत्पादन या मूल देश का नाम प्रमुखता से घोषित होना चाहिए।"
        }
    },
    BATCH: {
        en: {
            name: "Batch Traceability Identification (Rule 6(1)(g))",
            description: "A distinctive batch or lot number must be declared to facilitate statutory recall and legal verification."
        },
        ta: {
            name: "தொகுதி / லாட் அடையாள விதி (விதி 6(1)(g))",
            description: "சட்டப்பூர்வ ஆய்வு மற்றும் கண்காணிப்புக்காக தனித்துவமான தொகுதி அல்லது லாட் எண் குறிப்பிடப்பட வேண்டும்."
        },
        hi: {
            name: "बैच ट्रेसेबिलिटी पहचान नियम (नियम 6(1)(g))",
            description: "वैधानिक रिकॉल और कानूनी सत्यापन की सुविधा के लिए एक विशिष्ट बैच या लॉट संख्या घोषित होनी चाहिए।"
        }
    },
    PRODUCT_NAME: {
        en: {
            name: "Generic Commodity Name (Rule 6(1)(b))",
            description: "Common generic name of the commodity must be prominently displayed to prevent consumer deception."
        },
        ta: {
            name: "பொருளின் பொதுப் பெயர் விதி (விதி 6(1)(b))",
            description: "நுகர்வோர் ஏமாற்றப்படுவதைத் தடுக்க பொருளின் பொதுவான அல்லது வர்த்தக பெயர் தெளிவாகக் காட்டப்பட வேண்டும்."
        },
        hi: {
            name: "सामान्य वस्तु नाम नियम (नियम 6(1)(b))",
            description: "उपभोक्ता भ्रम से बचने के लिए वस्तु का सामान्य या मानक नाम प्रमुखता से प्रदर्शित होना चाहिए।"
        }
    }
};

export function getRuleInfo(fieldName: string, lang: SupportedLanguage = 'en'): RuleInfo {
    const l = normalizeLang(lang);
    const key = (fieldName || '').trim().toUpperCase().replace(/[\s-]/g, '_');
    const citation = RULE_CITATIONS[key] || "PCR 2011";
    if (RULE_METADATA[key]?.[l]) {
        const item = RULE_METADATA[key][l];
        return {
            citation,
            name: item.name,
            description: item.description
        };
    }
    const localized = translateField(fieldName, l);
    return {
        citation,
        name: l === 'ta' ? `${localized} விதி (PCR 2011)` : l === 'hi' ? `${localized} नियम (PCR 2011)` : `${localized} Rule (PCR 2011)`,
        description: l === 'ta' ? `சட்ட அளவியல் (PCR 2011) விதிகளின்படி ${localized} பேக்கேஜில் கட்டாயம் இருக்க வேண்டும்.` : l === 'hi' ? `विधिक मापविज्ञान (PCR 2011) नियमों के अनुसार ${localized} पैकेज पर अनिवार्य है।` : `Mandatory declaration of ${localized} under Legal Metrology (PCR 2011) rules.`
    };
}

export function getRecommendations(
    evaluations: any[] = [],
    overallCompliance?: string,
    lang: SupportedLanguage = 'en'
): string[] {
    const l = normalizeLang(lang);
    const recs: string[] = [];

    const isFail = overallCompliance === 'FAIL' || overallCompliance === 'NON_COMPLIANT' || evaluations.some(e => e.status === 'FAIL' || e.status === 'NON_COMPLIANT');
    const isReview = overallCompliance === 'REVIEW_REQUIRED' || evaluations.some(e => e.status === 'REVIEW_REQUIRED' || e.status === 'NOT_VERIFIED');

    for (const ev of evaluations) {
        if (ev.status === 'FAIL' || ev.status === 'NON_COMPLIANT') {
            const field = (ev.field || '').toUpperCase();
            if (field.includes('MRP')) {
                recs.push(
                    l === 'ta' 
                        ? 'அனைத்து வரிகளும் உள்ளடக்கிய MRP-ஐ பேக்கேஜில் தெளிவான எழுத்துகளில் அச்சிட்டு திருத்தவும் (விதி 6(1)(e)).' 
                        : l === 'hi' 
                            ? 'सभी करों सहित अधिकतम खुदरा मूल्य (MRP) स्पष्ट अक्षरों में मुद्रित करें (नियम 6(1)(e))।' 
                            : 'Rectify package artwork to include Maximum Retail Price (MRP) inclusive of all taxes (Rule 6(1)(e)).'
                );
            } else if (field.includes('NET') || field.includes('QUANTITY')) {
                recs.push(
                    l === 'ta' 
                        ? 'நிலையான சட்டப்பூர்வ மெட்ரிக் அலகுகளுடன் (g, kg, ml, l) நிகர அளவை அச்சிடவும் (விதி 12).' 
                        : l === 'hi' 
                            ? 'मानक कानूनी मीट्रिक इकाइयों (ग्राम, किग्रा, मिली, लीटर) के साथ शुद्ध मात्रा मुद्रित करें (नियम 12)।' 
                            : 'Print statutory Net Quantity with standardized legal metric units without non-standard symbols (Rule 12).'
                );
            } else if (field.includes('MANUFACTURER') || field.includes('PACKER')) {
                recs.push(
                    l === 'ta' 
                        ? 'உற்பத்தியாளர் அல்லது பேக்கரின் முழு பதிவு செய்யப்பட்ட பெயர் மற்றும் முகவரியை அறிவிக்கவும் (விதி 6(1)(a)).' 
                        : l === 'hi' 
                            ? 'निर्माता या पैकर का पूरा पंजीकृत नाम और भौतिक कॉर्पोरेट पता घोषित करें (नियम 6(1)(a))।' 
                            : 'Declare full registered corporate name and complete physical address of manufacturer or packer (Rule 6(1)(a)).'
                );
            } else if (field.includes('CONSUMER')) {
                recs.push(
                    l === 'ta' 
                        ? 'நுகர்வோர் புகார்களுக்கான தொலைபேசி எண் மற்றும் மின்னஞ்சல் முகவரியை தெளிவாக வழங்கவும் (விதி 6(1)(n)).' 
                        : l === 'hi' 
                            ? 'उपभोक्ता शिकायतों के लिए हेल्पलाइन नंबर और ईमेल पता स्पष्ट रूप से प्रदान करें (नियम 6(1)(n))।' 
                            : 'Provide official telephone number and active email address for consumer grievance redressal (Rule 6(1)(n)).'
                );
            } else if (field.includes('DATE')) {
                recs.push(
                    l === 'ta' 
                        ? 'தயாரிப்பு அல்லது பேக்கிங் செய்யப்பட்ட மாதம் மற்றும் ஆண்டை தெளிவாகக் குறிப்பிடவும் (விதி 6(1)(d)).' 
                        : l === 'hi' 
                            ? 'निर्माण या प्री-पैकिंग का महीना और वर्ष स्पष्ट रूप से मुद्रित करें (नियम 6(1)(d))।' 
                            : 'Print month and year of manufacture or pre-packing legibly on the commodity (Rule 6(1)(d)).'
                );
            }
        }
    }

    if (isFail && recs.length === 0) {
        recs.push(
            l === 'ta' 
                ? 'சட்ட அளவியல் சட்டம் பிரிவு 39-ன் கீழ் 14 நாட்கள் அவகாசத்துடன் கூடிய மேம்பாட்டு அறிவிப்பை வழங்கவும்.' 
                : l === 'hi' 
                    ? 'विधिक मापविज्ञान अधिनियम की धारा 39 के तहत 14 दिनों के भीतर सुधार का नोटिस जारी करें।' 
                    : 'Issue statutory Improvement Notice under Legal Metrology Act section 39 mandating 14-day rectification.'
        );
    }

    if (isReview) {
        recs.push(
            l === 'ta' 
                ? 'குறைந்த OCR நம்பகத்தன்மை காரணமாக ஆய்வாளர் தயாரிப்பு பேக்கேஜிங்கை நேரடி ஆய்வு மூலம் மறுஆய்வு செய்ய வேண்டும்.' 
                : l === 'hi' 
                    ? 'कम OCR स्पष्टता के कारण अधिकारी द्वारा उत्पाद पैकेजिंग का भौतिक सत्यापन किया जाना चाहिए।' 
                    : 'Conduct physical inspection of commodity packaging due to low OCR confidence threshold.'
        );
    }

    if (!isFail && !isReview) {
        recs.push(
            l === 'ta' 
                ? 'அனைத்து சட்டப்பூர்வ பிரகடனங்களும் சட்ட அளவியல் விதிகள் 2011-க்கு முழுமையாக இணங்குகின்றன. வணிக விநியோகத்திற்கு சான்றளிக்கப்பட்டது.' 
                : l === 'hi' 
                    ? 'सभी वैधानिक घोषणाएं विधिक मापविज्ञान नियम 2011 के अनुरूप हैं। वाणिज्यिक वितरण के लिए प्रमाणित।' 
                    : 'All statutory declarations conform to Legal Metrology (Packaged Commodities) Rules, 2011. Certified for commercial distribution.'
        );
    }

    return Array.from(new Set(recs));
}
