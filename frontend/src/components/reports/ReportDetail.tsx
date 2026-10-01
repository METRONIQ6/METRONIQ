"use client"
import React, { useEffect, useState, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ServerCrash, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, CheckCircle2, UserCheck, Building2, Package, Scale, FileText } from "lucide-react"
import { getToken, getLoggedInUser } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { 
    translateField, 
    translateComplianceStatus, 
    translateRiskScore, 
    translateEvidence, 
    translateEvaluationMessage,
    translateTimelineEvent,
    getRuleInfo,
    getRecommendations
} from '@/lib/complianceI18n'

interface ReportDetailProps {
    id: string;
    basePath: string; // e.g. '/officer/reports', '/manufacturer/reports', '/admin/reports'
}

export default function ReportDetail({ id, basePath }: ReportDetailProps) {
    const { t, language } = useTranslation()
    const [report, setReport] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [downloadingPdf, setDownloadingPdf] = useState(false)
    const [officerName, setOfficerName] = useState<string>('Officer')
    const reportRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const u = getLoggedInUser('officer')
        if (u.name) setOfficerName(u.name)
    }, [])

    useEffect(() => {
        if (!id) return
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/v1/reports/${id}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    setReport(await res.json())
                } else {
                    let detail = `HTTP ${res.status}`
                    try { detail = (await res.json()).detail } catch (_) { }
                    setErrorMsg(
                        language === 'ta' 
                            ? `அறிக்கையை ஏற்ற முடியவில்லை: ${detail}` 
                            : language === 'hi' 
                                ? `रिपोर्ट लोड करने में असमर्थ: ${detail}` 
                                : `Unable to load report. ${detail}`
                    )
                }
            } catch (e: any) {
                setErrorMsg(
                    language === 'ta' 
                        ? "பிணைய இணைப்பு தோல்வி அடைந்தது." 
                        : language === 'hi' 
                            ? "नेटवर्क ट्रांसमिशन विफलता।" 
                            : "Network transmission failure"
                )
            }
        }
        fetchReport()
    }, [id, language])

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true)
            if (typeof window !== 'undefined') {
                const html2canvasModule = await import('html2canvas')
                const html2canvas = (html2canvasModule as any).default || html2canvasModule
                const { jsPDF } = await import('jspdf')

                const element = reportRef.current
                if (!element) throw new Error("Report element not found")

                // Temporarily filter out unsupported color warnings from console during html2canvas parsing
                const originalConsoleError = console.error
                const originalConsoleWarn = console.warn
                const filterColorWarnings = (orig: any) => (...args: any[]) => {
                    if (typeof args[0] === 'string' && (args[0].includes('oklab') || args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('color-mix'))) {
                        return
                    }
                    orig.apply(console, args)
                }
                console.error = filterColorWarnings(originalConsoleError)
                console.warn = filterColorWarnings(originalConsoleWarn)

                let canvas: HTMLCanvasElement
                try {
                    canvas = await html2canvas(element, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        onclone: (clonedDoc: Document) => {
                            try {
                                // 1. Sanitize all <style> tags in clonedDoc
                                const styleTags = clonedDoc.querySelectorAll('style')
                                styleTags.forEach((styleTag) => {
                                    if (styleTag.textContent && (styleTag.textContent.includes('oklab') || styleTag.textContent.includes('oklch') || styleTag.textContent.includes('color-mix'))) {
                                        styleTag.textContent = styleTag.textContent
                                            .replace(/oklab\([^)]+\)/gi, '#0B1F3A')
                                            .replace(/oklch\([^)]+\)/gi, '#0B1F3A')
                                            .replace(/color-mix\([^)]+\)/gi, '#0B1F3A')
                                    }
                                })

                                // 2. Normalize inline & computed styles on elements
                                const elements = clonedDoc.getElementsByTagName('*')
                                for (let i = 0; i < elements.length; i++) {
                                    const el = elements[i] as HTMLElement
                                    if (!el || !el.style) continue
                                    const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'] as const
                                    props.forEach((prop) => {
                                        const val = el.style[prop as any]
                                        if (val && (val.includes('oklab') || val.includes('color-mix') || val.includes('oklch'))) {
                                            el.style[prop as any] = '#0B1F3A'
                                        }
                                    })
                                }
                            } catch {
                                // Fallback silently
                            }
                        }
                    })
                } finally {
                    console.error = originalConsoleError
                    console.warn = originalConsoleWarn
                }

                const imgData = canvas.toDataURL('image/jpeg', 0.95)
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                })

                const pageWidth = 210
                const pageHeight = 297
                const margin = 8
                const contentWidth = pageWidth - (margin * 2)
                const contentHeight = (canvas.height * contentWidth) / canvas.width
                let heightLeft = contentHeight
                let position = margin

                pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight)
                heightLeft -= (pageHeight - margin * 2)

                while (heightLeft > 0) {
                    position = heightLeft - contentHeight + margin
                    pdf.addPage()
                    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight)
                    heightLeft -= (pageHeight - margin * 2)
                }

                pdf.save(`MetronIQ_Report_${id}_${language}.pdf`)
            }
        } catch (clientErr) {
            console.warn("Client PDF generation fallback to backend API:", clientErr)
            try {
                const res = await fetch(`/api/v1/reports/${id}/pdf?lang=${language}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    const blob = await res.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `MetronIQ_Report_${id}_${language}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                } else {
                    throw new Error(`Server returned HTTP ${res.status}`)
                }
            } catch (serverErr) {
                console.error("PDF Export error:", serverErr)
            }
        } finally {
            setDownloadingPdf(false)
        }
    }

    if (errorMsg) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
            <ServerCrash className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-[#0B1F3A] dark:text-white">{t('error.accessDenied')}</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-sm">{errorMsg}</p>
        </div>
    )

    if (!report) return (
        <div className="flex items-center justify-center min-h-[60vh] p-12">
            <div className="text-center font-medium text-muted-foreground animate-pulse text-sm">
                {language === 'ta' ? 'ஆய்வு அறிக்கை ஏற்றப்படுகிறது...' : language === 'hi' ? 'ऑडिट रिपोर्ट लोड हो रही है...' : 'Loading Audit Report...'}
            </div>
        </div>
    )

    const isStandalone = !report.case_id && report.inspection?.id?.startsWith("INSP-")
    const hasValidation = report.validation && (report.validation.evaluations?.length > 0 || report.validation.compliance)
    const evaluations = report.validation?.evaluations || []
    const declarations = report.declarations || {}
    const overallResult = report.inspection?.result || report.validation?.compliance || report.result || 'PENDING'
    const riskLevel = report.inspection?.risk_level || report.validation?.risk_score || report.risk_level || 'LOW'

    // Missing declarations detection
    const missingEvaluations = evaluations.filter((ev: any) => 
        ev.status === 'FAIL' || 
        ev.status === 'NON_COMPLIANT' || 
        ev.evidence === 'MISSING_FROM_PACKAGE' || 
        (ev.message && String(ev.message).toLowerCase().includes('could not be verified'))
    )

    const recommendations = getRecommendations(evaluations, overallResult, language)

    const inspectionDate = report.inspection?.created_at || report.created_at || new Date().toISOString()
    const formattedDate = new Date(inspectionDate).toLocaleString(
        language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    )

    return (
        <div 
            ref={reportRef} 
            className="min-h-screen bg-card text-foreground p-6 sm:p-10 md:p-12 print:p-0 font-sans max-w-[960px] mx-auto border-x border-border/60 shadow-xs print:border-none print:shadow-none"
            style={{
                fontFamily: language === 'ta' 
                    ? 'var(--font-noto-tamil), "Noto Sans Tamil", Arial, sans-serif' 
                    : language === 'hi' 
                        ? 'var(--font-noto-devanagari), "Noto Sans Devanagari", Arial, sans-serif' 
                        : 'var(--font-sans), Inter, system-ui, sans-serif'
            }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 12mm; }
                    body { -webkit-print-color-adjust: exact; background-color: white !important; color: black !important; }
                    .no-print { display: none !important; }
                }
            `}} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 border-b-2 border-[#0B1F3A] dark:border-blue-600/60 pb-5">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] mb-1 font-mono">
                        {language === 'ta' 
                            ? 'MetronIQ இணக்கம் & சரிபார்ப்பு தளம்' 
                            : language === 'hi' 
                                ? 'MetronIQ अनुपालन एवं सत्यापन मंच' 
                                : 'MetronIQ Compliance & Verification Platform'}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B1F3A] dark:text-white">
                        {language === 'ta'
                            ? 'இணக்க தணிக்கை அறிக்கை'
                            : language === 'hi'
                                ? 'अनुपालन ऑडिट रिपोर्ट'
                                : 'Compliance Audit Report'}
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                        {language === 'ta' 
                            ? 'சட்ட அளவியல் (பேக்கேஜ் செய்யப்பட்ட பொருட்கள்) விதிகள், 2011 • தணிக்கை ஆவணம்' 
                            : language === 'hi' 
                                ? 'विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 • ऑडिट दस्तावेज़' 
                                : 'Legal Metrology (Packaged Commodities) Rules, 2011 • Audit Dossier'}
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="no-print flex items-center px-4 py-2 bg-[#2563EB] text-white font-semibold rounded-md text-xs hover:bg-[#2563EB]/90 transition-colors shadow-xs disabled:opacity-75 cursor-pointer"
                    >
                        {downloadingPdf ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        {t("reports.downloadPdf")}
                    </button>
                </div>
            </div>

            {/* Officer & Verification Meta Bar */}
            <div className="bg-muted/30 border border-border rounded-lg p-3.5 mb-6 text-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {language === 'ta' ? 'ஆய்வு அதிகாரி' : language === 'hi' ? 'निरीक्षण अधिकारी' : 'Inspecting Officer'}
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                        {officerName}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {language === 'ta' ? 'சரிபார்ப்பு பிரிவு' : language === 'hi' ? 'सत्यापन प्रभाग' : 'Verification Module'}
                    </span>
                    <span className="font-medium text-foreground mt-0.5 block">
                        {language === 'ta' ? 'இணக்க மதிப்பீடு' : language === 'hi' ? 'अनुपालन मूल्यांकन' : 'Compliance Assessment'}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {language === 'ta' ? 'ஆய்வு தேதி & நேரம்' : language === 'hi' ? 'निरीक्षण तिथि एवं समय' : 'Audit Date & Time'}
                    </span>
                    <span className="font-mono text-muted-foreground mt-0.5 block">
                        {formattedDate}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {language === 'ta' ? 'செயல்பாட்டு நிலை' : language === 'hi' ? 'परिचालन स्थिति' : 'Operational Status'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        {language === 'ta' ? 'செயலில் உள்ளது / சரிபார்க்கப்பட்டது' : language === 'hi' ? 'सक्रिय एवं सत्यापित' : 'Active / Verified'}
                    </span>
                </div>
            </div>

            {/* Reference Identifiers & Final Executive Verdict */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-muted/20 border-border shadow-none rounded-md">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                        {language === 'ta' ? 'குறிப்பு அடையாளங்காட்டிகள்' : language === 'hi' ? 'संदर्भ पहचानकर्ता' : 'Reference Identifiers'}
                    </h3>
                    <div className="space-y-2 text-xs">
                        <p className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">{language === 'ta' ? 'ஆய்வு எண்:' : language === 'hi' ? 'निरीक्षण आईडी:' : 'Inspection ID:'}</span>
                            <span className="font-mono font-bold text-[#0B1F3A] dark:text-blue-400">{report.inspection?.id || id || 'N/A'}</span>
                        </p>
                        {report.case_id && (
                            <p className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">{language === 'ta' ? 'டாக்கெட் எண்:' : language === 'hi' ? 'डॉक्युमेंट आईडी:' : 'Docket ID:'}</span>
                                <span className="font-mono font-medium">{report.case_id?.substring(0, 8).toUpperCase()}</span>
                            </p>
                        )}
                        {report.notice?.id && (
                            <p className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">{language === 'ta' ? 'அறிவிப்பு குறிப்பு:' : language === 'hi' ? 'नोटिस संदर्भ:' : 'Notice Ref:'}</span>
                                <span className="font-mono font-medium">{report.notice.id.substring(0, 8).toUpperCase()}</span>
                            </p>
                        )}
                        <p className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">{language === 'ta' ? 'விதிமுறை:' : language === 'hi' ? 'नियम:' : 'Framework:'}</span>
                            <span className="font-mono text-muted-foreground">PCR 2011 / Sec 39</span>
                        </p>
                    </div>
                </Card>

                <Card className="p-4 bg-muted/20 border-border shadow-none rounded-md">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#2563EB]" />
                        {language === 'ta' ? 'இணக்க முடிவு' : language === 'hi' ? 'अनुपालन परिणाम' : 'Compliance Verdict'}
                    </h3>
                    <div className="space-y-2 text-xs">
                        <p className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">{language === 'ta' ? 'இணக்க முடிவு:' : language === 'hi' ? 'अनुपालन परिणाम:' : 'Compliance Result:'}</span>
                            <span className={`font-bold uppercase px-2 py-0.5 rounded text-[11px] ${
                                overallResult === 'PASS' || overallResult === 'COMPLIANT' 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                    : overallResult === 'FAIL' || overallResult === 'NON_COMPLIANT' 
                                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800' 
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}>
                                {translateComplianceStatus(overallResult, language)}
                            </span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">{language === 'ta' ? 'ஆபத்து நிலை:' : language === 'hi' ? 'जोखिम स्तर:' : 'Risk Level:'}</span>
                            <span className={`font-mono font-bold uppercase ${
                                riskLevel === 'HIGH' ? 'text-destructive' :
                                riskLevel === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                                {translateRiskScore(riskLevel, language)}
                            </span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">{language === 'ta' ? 'தணிக்கை நிலை:' : language === 'hi' ? 'ऑडिट स्थिति:' : 'Audit Status:'}</span>
                            <span className="font-mono uppercase text-muted-foreground font-medium">
                                {translateComplianceStatus(report.inspection?.status || report.case_status || 'COMPLETED', language)}
                            </span>
                        </p>
                        {report.penalty_amount && (
                            <p className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">{language === 'ta' ? 'விதிக்கப்பட்ட அபராதம்:' : language === 'hi' ? 'आकलित जुर्माना:' : 'Assessed Penalty:'}</span>
                                <span className="font-mono font-bold text-destructive">
                                    ₹{report.penalty_amount.toLocaleString()}
                                </span>
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Product & Legal Declarations Summary */}
            <div className="mb-6">
                <h3 className="text-xs font-bold border-b border-border/80 pb-2 mb-3 uppercase text-[#0B1F3A] dark:text-white tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2563EB]" />
                    {language === 'ta' ? 'தயாரிப்பு மற்றும் அறிவிக்கப்பட்ட பிரகடனங்கள்' : language === 'hi' ? 'उत्पाद एवं घोषित घोषणाएं' : 'Product & Legal Declarations'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <Card className="p-3 bg-muted/15 border-border shadow-none rounded-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            {translateField('PRODUCT_NAME', language)}
                        </span>
                        <p className="text-xs font-semibold text-foreground break-words">
                            {declarations.PRODUCT_NAME?.value || (language === 'ta' ? 'அறிவிக்கப்படவில்லை' : language === 'hi' ? 'घोषित नहीं' : 'Not Declared')}
                        </p>
                    </Card>

                    <Card className="p-3 bg-muted/15 border-border shadow-none rounded-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            {translateField('NET_QUANTITY', language)}
                        </span>
                        <p className="text-xs font-semibold text-foreground break-words">
                            {declarations.NET_QUANTITY?.value || (language === 'ta' ? 'அறிவிக்கப்படவில்லை' : language === 'hi' ? 'घोषित नहीं' : 'Not Declared')}
                        </p>
                    </Card>

                    <Card className="p-3 bg-muted/15 border-border shadow-none rounded-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            {translateField('MRP', language)}
                        </span>
                        <p className="text-xs font-semibold text-foreground break-words font-mono">
                            {declarations.MRP?.value || (language === 'ta' ? 'அறிவிக்கப்படவில்லை' : language === 'hi' ? 'घोषित नहीं' : 'Not Declared')}
                        </p>
                    </Card>

                    <Card className="p-3 bg-muted/15 border-border shadow-none rounded-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            {translateField('MANUFACTURER', language)}
                        </span>
                        <p className="text-xs font-semibold text-foreground break-words">
                            {declarations.MANUFACTURER?.value || (language === 'ta' ? 'அறிவிக்கப்படவில்லை' : language === 'hi' ? 'घोषित नहीं' : 'Not Declared')}
                        </p>
                    </Card>

                    <Card className="p-3 bg-muted/15 border-border shadow-none rounded-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            {translateField('DATE', language)}
                        </span>
                        <p className="text-xs font-semibold text-foreground break-words font-mono">
                            {declarations.DATE?.value || (language === 'ta' ? 'அறிவிக்கப்படவில்லை' : language === 'hi' ? 'घोषित नहीं' : 'Not Declared')}
                        </p>
                    </Card>

                    <Card className="p-3 bg-muted/15 border-border shadow-none rounded-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            {translateField('CONSUMER_CARE', language)}
                        </span>
                        <p className="text-xs font-semibold text-foreground break-words">
                            {declarations.CONSUMER_CARE?.value || (language === 'ta' ? 'அறிவிக்கப்படவில்லை' : language === 'hi' ? 'घोषित नहीं' : 'Not Declared')}
                        </p>
                    </Card>
                </div>
            </div>

            {/* Validation Details — Rule by Rule Verification */}
            {evaluations.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-bold border-b border-border/80 pb-2 mb-3 uppercase text-[#0B1F3A] dark:text-white tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                            {language === 'ta' ? 'விதி சரிபார்ப்பு முடிவுகள் (PCR 2011)' : language === 'hi' ? 'नियम सत्यापन परिणाम (PCR 2011)' : 'Rule Validation Findings (PCR 2011)'}
                        </span>
                        <span className="text-[10px] font-mono font-normal text-muted-foreground">
                            {evaluations.length} {language === 'ta' ? 'விதிகள் சோதிக்கப்பட்டன' : language === 'hi' ? 'नियम जाँचे गए' : 'rules evaluated'}
                        </span>
                    </h3>
                    <div className="space-y-3">
                        {evaluations.map((ev: any, idx: number) => {
                            const isPass = ev.status === 'PASS' || ev.status === 'COMPLIANT' || ev.status === 'NOT_APPLICABLE';
                            const isFail = ev.status === 'FAIL' || ev.status === 'NON_COMPLIANT';
                            const isWarn = ev.status === 'NOT_VERIFIED' || ev.status === 'OCR_UNCERTAIN' || ev.status === 'REVIEW_REQUIRED';

                            const localizedField = translateField(ev.field, language);
                            const localizedStatus = translateComplianceStatus(ev.status, language);
                            const localizedEvidence = translateEvidence(ev.evidence, language);
                            const localizedMessage = translateEvaluationMessage(ev.message, ev.field, language);
                            const ruleInfo = getRuleInfo(ev.field, language);

                            return (
                                <Card 
                                    key={idx} 
                                    className={`border-l-4 p-3.5 bg-card rounded-md shadow-none ${
                                        isPass ? 'border-l-emerald-600 dark:border-l-emerald-500' : 
                                        isFail ? 'border-l-red-600 dark:border-l-red-500' : 
                                        isWarn ? 'border-l-amber-500' : 'border-l-slate-400'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {isPass ? (
                                                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                ) : isFail ? (
                                                    <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                                )}
                                                <span className="font-bold text-xs text-[#0B1F3A] dark:text-white">
                                                    {ruleInfo.name}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {ruleInfo.description}
                                            </p>
                                        </div>
                                        <Badge 
                                            variant={isPass ? 'success' : isFail ? 'destructive' : 'warning'} 
                                            className="text-[10px] uppercase font-bold shrink-0"
                                        >
                                            {localizedStatus}
                                        </Badge>
                                    </div>

                                    {ev.evidence && ev.evidence !== "MISSING_FROM_PACKAGE" && ev.evidence !== "Field not present" && (
                                        <div className="text-xs text-foreground bg-muted/50 px-2.5 py-1 rounded mt-2 font-mono break-all border border-border/40">
                                            <span className="font-sans font-semibold text-muted-foreground mr-1.5">
                                                {language === 'ta' ? 'கண்டறியப்பட்ட ஆதாரம்:' : language === 'hi' ? 'पहचाना गया साक्ष्य:' : 'Detected Evidence:'}
                                            </span>
                                            {localizedEvidence}
                                        </div>
                                    )}

                                    {ev.evidence === "MISSING_FROM_PACKAGE" && (
                                        <div className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 inline-block mt-2">
                                            {language === 'ta' ? 'பேக்கேஜில் பிரகடனம் விடுபட்டுள்ளது' : language === 'hi' ? 'पैकेज पर घोषणा मौजूद नहीं है' : 'Mandatory Declaration Missing from Package'}
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-medium">
                                        {localizedMessage}
                                    </p>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Missing Declarations Alert Section */}
            {missingEvaluations.length > 0 && (
                <div className="mb-6 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase text-red-800 dark:text-red-300 tracking-wider flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-destructive" />
                        {language === 'ta' ? 'விடுபட்ட கட்டாய பிரகடனங்கள்' : language === 'hi' ? 'लापता अनिवार्य घोषणाएं' : 'Missing Mandatory Declarations'}
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-400 mb-2.5">
                        {language === 'ta' 
                            ? 'சட்ட அளவியல் விதிகள் 2011-ன் படி பின்வரும் பிரகடனங்கள் லேபிளில் கண்டறியப்படவில்லை:' 
                            : language === 'hi' 
                                ? 'विधिक मापविज्ञान नियम 2011 के अनुसार निम्नलिखित घोषणाएं लेबल पर नहीं पाई गईं:' 
                                : 'Under Legal Metrology (Packaged Commodities) Rules, 2011, the following mandatory declarations were not detected on the label:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {missingEvaluations.map((ev: any, idx: number) => (
                            <div key={idx} className="bg-card border border-red-200 dark:border-red-900/60 rounded px-2.5 py-1.5 text-xs flex items-center justify-between">
                                <span className="font-semibold text-foreground">{translateField(ev.field, language)}</span>
                                <Badge variant="destructive" className="text-[10px] py-0">
                                    {translateComplianceStatus('MISSING_DECLARATION', language)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mb-6 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase text-blue-900 dark:text-blue-300 tracking-wider flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                        {language === 'ta' ? 'பரிந்துரைகள் மற்றும் வழிகாட்டுதல்கள்' : language === 'hi' ? 'सिफारिशें एवं निर्देश' : 'Recommendations & Directives'}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-200">
                        {recommendations.map((rec: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-2">
                                <span className="text-[#2563EB] font-bold text-sm leading-none">•</span>
                                <span className="leading-relaxed">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Chronological Audit Timeline */}
            <div className="mb-6">
                <h3 className="text-xs font-bold border-b border-border/80 pb-2 mb-4 uppercase text-[#0B1F3A] dark:text-white tracking-wider flex items-center justify-between">
                    <span>
                        {language === 'ta' ? 'காலவரிசைப்படி தணிக்கை நிகழ்வுகள்' : language === 'hi' ? 'कालानुक्रमिक ऑडिट समयरेखा' : 'Chronological Audit Timeline'}
                    </span>
                    <span className="text-[10px] font-mono font-normal text-muted-foreground">
                        {report.timeline?.length || 1} {language === 'ta' ? 'பதிவுகள்' : language === 'hi' ? 'प्रविष्टियां' : 'logged entries'}
                    </span>
                </h3>
                <div className="relative border-l-2 border-border ml-3 pl-6 space-y-5">
                    {report.timeline?.map((event: any, index: number) => (
                        <div key={index} className="relative group">
                            <div className="absolute -left-[31px] bg-card border-4 border-[#2563EB] rounded-full w-3.5 h-3.5 mt-0.5"></div>
                            <div className="text-xs font-bold text-[#0B1F3A] dark:text-white uppercase tracking-wide">
                                {translateTimelineEvent(event.event, language)}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-medium bg-muted/40 inline-block px-2 py-0.5 rounded border border-border/40">
                                {language === 'ta' ? 'நிலை:' : language === 'hi' ? 'स्थिति:' : 'Status:'} {translateComplianceStatus(event.status || event.result, language)}
                            </div>
                            <div className="text-[10px] text-muted-foreground/80 font-mono mt-1 flex items-center">
                                {event.timestamp 
                                    ? new Date(event.timestamp).toLocaleString(language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN') 
                                    : formattedDate}
                            </div>
                        </div>
                    ))}
                    {(!report.timeline || report.timeline.length === 0) && (
                        <div className="relative group">
                            <div className="absolute -left-[31px] bg-card border-4 border-[#2563EB] rounded-full w-3.5 h-3.5 mt-0.5"></div>
                            <div className="text-xs font-bold text-[#0B1F3A] dark:text-white uppercase tracking-wide">
                                {translateTimelineEvent('INSPECTION', language)}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-medium bg-muted/40 inline-block px-2 py-0.5 rounded border border-border/40">
                                {language === 'ta' ? 'முடிவு:' : language === 'hi' ? 'परिणाम:' : 'Result:'} {translateComplianceStatus(overallResult, language)}
                            </div>
                            <div className="text-[10px] text-muted-foreground/80 font-mono mt-1">
                                {formattedDate}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-5 border-t border-border">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-widest text-center sm:text-left">
                    <span>
                        {language === 'ta' 
                            ? 'MetronIQ இணக்க அமைப்பால் உருவாக்கப்பட்டது' 
                            : language === 'hi' 
                                ? 'MetronIQ अनुपालन प्रणाली द्वारा निर्मित' 
                                : 'Generated by MetronIQ Compliance System'}
                    </span>
                    <span>
                        {language === 'ta' 
                            ? 'தானியங்கி தணிக்கை பதிவு' 
                            : language === 'hi' 
                                ? 'स्वचालित ऑडिट रिकॉर्ड' 
                                : 'Automated Audit Record'}
                    </span>
                    <span>
                        {language === 'ta' 
                            ? 'தணிக்கை ஆவணம்' 
                            : language === 'hi' 
                                ? 'ऑडिट दस्तावेज़' 
                                : 'Audit Dossier'}
                    </span>
                </div>
            </div>
        </div>
    )
}
