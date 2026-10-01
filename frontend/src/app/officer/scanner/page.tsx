"use client"
import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Loader2, Info, UploadCloud, Camera, FileText, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/i18n"
import { 
    translateField, 
    translateComplianceStatus, 
    translateRiskScore, 
    translateEvidence, 
    translateEvaluationMessage, 
    translateScannerStep,
    getRuleInfo,
    getRecommendations
} from '@/lib/complianceI18n'

type FlowState = 'SELECT' | 'CAMERA' | 'PREVIEW' | 'PROCESSING' | 'RESULT'

export default function AIScannerUnified() {
    const { toast } = useToast()
    const { t, language } = useTranslation()
    const [flowState, setFlowState] = useState<FlowState>('SELECT')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loadingStep, setLoadingStep] = useState(0)
    const [data, setData] = useState<any>(null)
    const [scanId, setScanId] = useState<string | null>(null)
    const [noticeIssued, setNoticeIssued] = useState(false)

    // Camera refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const getSteps = () => [
        t('scanner.stepUploading') || 'Uploading...',
        t('scanner.stepPreprocessing') || 'Preprocessing...',
        t('scanner.stepOcr') || 'OCR Extraction...',
        t('scanner.stepRules') || 'Rules Validation...',
        t('scanner.stepEvidence') || 'Generating Evidence...',
        t('scanner.stepComplete') || 'Complete'
    ]

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreview(URL.createObjectURL(f))
            setFlowState('PREVIEW')
        }
    }

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            setStream(mediaStream)
            setFlowState('CAMERA')
        } catch (err) {
            console.error("Camera access denied or unavailable", err)
            toast({ type: 'warning', message: t("warning.camera_denied"), description: 'Please use the upload alternative.' })
        }
    }

    useEffect(() => {
        if (flowState === 'CAMERA' && videoRef.current && stream) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => console.error("Video play error:", e))
        }
    }, [flowState, stream])

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth
                canvasRef.current.height = videoRef.current.videoHeight
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        const capturedFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" })
                        setFile(capturedFile)
                        setPreview(URL.createObjectURL(capturedFile))
                        stopCamera()
                        setFlowState('PREVIEW')
                    }
                }, "image/jpeg", 0.9)
            }
        }
    }

    const cancelPreview = () => {
        setFile(null)
        setPreview(null)
        setFlowState('SELECT')
    }

    const processRealData = async () => {
        setFlowState('PROCESSING')
        setLoadingStep(0)

        try {
            if (!file) {
                toast({ type: 'warning', message: t("warning.no_file") })
                setFlowState('SELECT')
                return;
            }

            const compressImage = (f: File): Promise<File> => new Promise((res, rej) => { const reader = new FileReader(); reader.onload = (e) => { const img = new Image(); img.onload = () => { const canvas = document.createElement('canvas'); const MAX = 1200; let w = img.width; let h = img.height; if (w > h && w > MAX) { h *= MAX / w; w = MAX; } else if (h >= w && h > MAX) { w *= MAX / h; h = MAX; } canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, w, h); canvas.toBlob(blob => blob ? res(new File([blob], f.name, { type: 'image/jpeg' })) : rej(new Error('fail')), 'image/jpeg', 0.85); }; img.onerror = rej; img.src = e.target?.result as string; }; reader.onerror = rej; reader.readAsDataURL(f); });

            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedFile);

            setLoadingStep(1) // Preprocessing

            const uploadResp = await fetch('/api/v1/scanner/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            if (!uploadResp.ok) {
                if (uploadResp.status === 502 || uploadResp.status === 504 || uploadResp.status === 530) {
                    throw new Error(t('scanner.backendUnavailable') || 'Backend Unavailable. Please ensure the backend is running.')
                }
                let errDetail = "Failed to upload image"
                try {
                    const errStr = await uploadResp.json()
                    if (errStr.detail) errDetail = errStr.detail
                } catch (e) { }
                throw new Error(errDetail)
            }
            const uploadResult = await uploadResp.json();
            const sid = uploadResult.id;
            setScanId(sid);

            setLoadingStep(2) // OCR

            const processResp = await fetch(`/api/v1/scanner/process?scan_id=${sid}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!processResp.ok) {
                if (processResp.status === 502 || processResp.status === 504 || processResp.status === 530) {
                    throw new Error("Backend Unavailable. Please ensure the backend is running and the tunnel is active.")
                }
                let errDetail = `Failed to start processing`;
                let bodyText = "";
                try {
                    bodyText = await processResp.text();
                    const errStr = JSON.parse(bodyText);
                    if (errStr.detail) errDetail = errStr.detail;
                } catch (e) { }
                throw new Error(JSON.stringify({
                    error: errDetail,
                    method: 'POST',
                    endpoint: `/api/v1/scanner/process?scan_id=${sid}`,
                    scan_id: sid,
                    status: processResp.status,
                    body: bodyText
                }));
            }

            let status = "PROCESSING";
            let pollCount = 0;
            const maxPolls = 180; // Allow up to 3 minutes for local AI models
            let consecutiveErrors = 0;

            while (status === "PROCESSING" || status === "UPLOADED") {
                if (pollCount >= maxPolls) {
                    throw new Error(t('scanner.processingTimedOut') || 'Processing timed out. Please retry.')
                }
                pollCount++;

                await new Promise(r => setTimeout(r, 1000));

                // Advance visual steps occasionally
                setLoadingStep(prev => prev < 4 ? prev + 1 : prev)

                let statusResp;
                try {
                    statusResp = await fetch(`/api/v1/scanner/${sid}/status`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    });
                } catch (netErr) {
                    consecutiveErrors++;
                    if (consecutiveErrors >= 10) {
                        throw new Error("Connection lost while checking status. Please retry.")
                    }
                    continue;
                }

                if (!statusResp.ok) {
                    consecutiveErrors++;
                    if (consecutiveErrors >= 10) {
                        if (statusResp.status === 502 || statusResp.status === 504 || statusResp.status === 530) {
                            throw new Error("Backend Unavailable. Please ensure the backend is running.")
                        }
                        throw new Error("Failed to check status.")
                    }
                    continue;
                }

                consecutiveErrors = 0;
                let statusData;
                try {
                    statusData = await statusResp.json();
                } catch (jsonErr) {
                    continue;
                }

                status = statusData.status;
                if (status === "FAILED") {
                    throw new Error("Backend processing failed")
                }
            }

            setLoadingStep(5)

            let resultData = null;
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    const resultResp = await fetch(`/api/v1/scanner/${sid}/result`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    });
                    if (resultResp.ok) {
                        resultData = await resultResp.json();
                        break;
                    }
                } catch (fetchErr) {
                    // brief pause before retry
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            if (!resultData) {
                throw new Error("Failed to fetch result.")
            }

            const urlParams = new window.URLSearchParams(window.location.search);
            const reinId = urlParams.get('reinspection') || sessionStorage.getItem('currentReinspectionId');
            if (reinId && resultData.compliance !== undefined) {
                await fetch(`/api/v1/reinspections/${reinId}/link_scan?scan_id=${sid}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                sessionStorage.removeItem('currentReinspectionId');
            }

            setData(resultData);
            setFlowState('RESULT')
        } catch (e: any) {
            console.error(e)
            toast({ type: 'error', message: e.message || "An error occurred during scanning." })
            setFlowState('PREVIEW')
        }
    }

    const handleIssueNotice = async () => {
        if (!scanId || !data) return;
        const violations = (data.validation_details?.evaluations || []).filter((e: any) => e.status === 'FAIL').map((e: any) => e.field).join(", ");

        try {
            const res = await fetch('/api/v1/notices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    inspection_id: scanId,
                    violations: violations,
                    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                })
            })
            if (res.ok) {
                setNoticeIssued(true)
                toast({ type: 'success', message: t("success.notice_issued") })
            } else {
                toast({ type: 'error', message: t("error.notice_issue_failed") })
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (flowState === 'SELECT') {
        return (
            <div className="max-w-3xl mx-auto space-y-6 font-sans">
                <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("scanner.title")}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{t("scanner.selectPrompt")}</p>
                </div>
                <Card className="border-dashed border-2 border-border shadow-xs bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-14 px-6">
                        <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
                            <div 
                                className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-muted/30 hover:bg-muted/60 hover:border-[#2563EB]/50 transition-colors text-center cursor-pointer group"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <div className="w-12 h-12 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#2563EB] mb-3 group-hover:scale-105 transition-transform">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-foreground mb-1">{t("scanner.uploadImage")}</span>
                                <span className="text-[11px] text-muted-foreground">JPEG, PNG, WEBP</span>
                                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div 
                                className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-muted/30 hover:bg-muted/60 hover:border-[#2563EB]/50 transition-colors text-center cursor-pointer group"
                                onClick={startCamera}
                            >
                                <div className="w-12 h-12 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-foreground mb-1">{t("scanner.captureImage")}</span>
                                <span className="text-[11px] text-muted-foreground">{language === 'ta' ? 'கேமரா ஸ்ட்ரீம்' : language === 'hi' ? 'कैमरा स्ट्रीम' : 'Mobile/Webcam Stream'}</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground text-center mt-6 max-w-sm">
                            {language === 'ta' 
                                ? 'அனைத்து கட்டாய பிரகடனங்களும் (MRP, நிகர அளவு, உற்பத்தியாளர் முகவரி, சிறந்த பயன்பாட்டு தேதி) தெளிவாகவும் வெளிச்சமாகவும் இருப்பதை உறுதிப்படுத்தவும்.' 
                                : language === 'hi' 
                                    ? 'सुनिश्चित करें कि सभी अनिवार्य घोषणाएं (MRP, शुद्ध मात्रा, निर्माता का पता, सर्वोत्तम उपयोग) स्पष्ट और पढ़ने योग्य हैं।' 
                                    : 'Ensure all mandatory declarations (MRP, Net Quantity, Manufacturer Address, Best Before) are illuminated and legible.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (flowState === 'CAMERA') {
        return (
            <div className="max-w-2xl mx-auto space-y-6 font-sans">
                <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("scanner.title")}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ta' ? 'பேக்கேஜ் செய்யப்பட்ட பொருளின் லேபிளை சட்டகத்திற்குள் பொருத்தவும்.' : language === 'hi' ? 'पैकेज्ड कमोडिटी लेबल को फ्रेम के अंदर रखें।' : 'Position the packaged commodity label within the frame.'}
                    </p>
                </div>
                <Card className="border-border shadow-xs bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-6 px-4 w-full">
                        <div className="bg-black w-full max-w-sm rounded-lg overflow-hidden aspect-[3/4] relative mb-5 border border-border">
                            <video ref={videoRef} autoPlay playsInline muted className="object-cover w-full h-full" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex gap-3 w-full max-w-sm justify-center">
                            <Button variant="outline" className="flex-1" onClick={() => { stopCamera(); setFlowState('SELECT') }}>
                                {t("common.cancel")}
                            </Button>
                            <Button className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white" onClick={captureImage}>
                                <Camera className="w-4 h-4 mr-2" />
                                {t("scanner.captureImage")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (flowState === 'PREVIEW') {
        return (
            <div className="max-w-2xl mx-auto space-y-6 font-sans">
                <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('scanner.title')}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ta' ? 'AI பிரித்தெடுத்தலைத் தொடங்குவதற்கு முன் லேபிள் படத்தை மதிப்பாய்வு செய்யவும்.' : language === 'hi' ? 'AI निष्कर्षण निष्पादित करने से पहले लेबल छवि की समीक्षा करें।' : 'Review the label image before executing AI extraction.'}
                    </p>
                </div>
                <Card className="border-border shadow-xs bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-6 px-4 w-full">
                        <h3 className="text-sm font-semibold mb-3 text-foreground">{t('scanner.preview')}</h3>
                        {preview && (
                            <img src={preview} alt="Preview" className="max-h-80 object-contain rounded-md border border-border mb-6 shadow-xs" />
                        )}
                        <div className="flex gap-3 w-full sm:w-auto justify-center">
                            <Button variant="outline" className="w-32" onClick={cancelPreview}>
                                {t('common.back')}
                            </Button>
                            <Button className="w-36 bg-[#0B1F3A] hover:bg-[#132F54] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white" onClick={processRealData}>
                                <ShieldCheck className="w-4 h-4 mr-1.5" />
                                {t('scanner.startScan')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (flowState === 'PROCESSING') {
        return (
            <div className="max-w-xl mx-auto py-12 px-4 space-y-6 font-sans text-center">
                <Card className="border border-border bg-card p-8 shadow-xs">
                    <div className="flex flex-col items-center justify-center space-y-5">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#2563EB]">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">{translateScannerStep(loadingStep, language)}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{t('scanner.engineActive')}</p>
                        </div>

                        {/* Visual Step Timeline */}
                        <div className="w-full max-w-sm space-y-2 pt-2">
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                                <div 
                                    className="h-full bg-[#2563EB] transition-all duration-500 ease-out" 
                                    style={{ width: `${Math.max(10, ((loadingStep + 1) / getSteps().length) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                                <span>{language === 'ta' ? 'படி' : language === 'hi' ? 'चरण' : 'Step'} {loadingStep + 1} / {getSteps().length}</span>
                                <span>{Math.round(((loadingStep + 1) / getSteps().length) * 100)}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 w-full pt-3 text-[11px] text-muted-foreground border-t border-border">
                            <div className="text-center p-2 rounded bg-muted/40">
                                <span className="font-semibold block text-foreground">YOLO11n</span>
                                <span>{language === 'ta' ? 'பொருள் கண்டறிதல்' : language === 'hi' ? 'वस्तु पहचान' : 'Object Detection'}</span>
                            </div>
                            <div className="text-center p-2 rounded bg-muted/40">
                                <span className="font-semibold block text-foreground">PaddleOCR</span>
                                <span>{language === 'ta' ? 'உரை பிரித்தெடுத்தல்' : language === 'hi' ? 'टेक्स्ट निष्कर्षण' : 'Text Extraction'}</span>
                            </div>
                            <div className="text-center p-2 rounded bg-muted/40">
                                <span className="font-semibold block text-foreground">PCR 2011</span>
                                <span>{language === 'ta' ? 'விதி சரிபார்ப்பு' : language === 'hi' ? 'नियम सत्यापन' : 'Rule Validation'}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    // flowState === 'RESULT'
    if (data?.compliance === 'ENVIRONMENT_ERROR') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto text-center mt-12">
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-xl text-orange-700 flex justify-center items-center gap-2">
                            <ShieldAlert className="w-6 h-6" />{translateComplianceStatus('ENVIRONMENT_ERROR', language)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-orange-700 font-medium whitespace-pre-wrap">{translateEvaluationMessage(data?.validation_details?.message, 'OCR', language) || t('status.ocrUnavailable')}</p>
                        <p className="text-sm text-orange-600">
                            {t('status.ocrHardwareWarning')}
                        </p>
                        <div className="pt-6">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full max-w-xs mx-auto" onClick={cancelPreview}>{t('common.acknowledge')}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (data?.compliance === 'INVALID_IMAGE') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto text-center mt-12">
                <Card className="border-red-200 bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="text-xl text-destructive dark:text-red-400 font-bold flex justify-center items-center gap-2">
                            <ShieldAlert className="w-6 h-6" />{translateComplianceStatus('INVALID_IMAGE', language)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-destructive dark:text-red-400 font-bold font-medium">
                            {language === 'ta' ? 'முறையான தயாரிப்பு அல்லது பேக்கேஜ் கண்டறியப்படவில்லை.' : language === 'hi' ? 'कोई वैध उत्पाद या पैकेज नहीं मिला।' : 'No valid product/package was detected.'}
                        </p>
                        <p className="text-sm text-destructive">
                            {data?.validation_details?.message ? translateEvaluationMessage(data?.validation_details?.message, 'IMAGE', language) : (language === 'ta' ? 'தயாரிப்பின் தெளிவான படத்தை பதிவேற்றவும் அல்லது பிடிக்கவும்.' : language === 'hi' ? 'कृपया उत्पाद/पैकेज की स्पष्ट छवि अपलोड करें।' : 'Please upload or capture a clear image of the product/package.')}
                        </p>
                        {preview && (
                            <img src={preview} alt="Invalid Upload" className="mx-auto mt-6 h-48 object-contain rounded-md border border-red-200 opacity-80" />
                        )}
                        <div className="pt-6">
                            <Button className="bg-red-600 hover:bg-red-700 text-white w-full max-w-xs mx-auto" onClick={cancelPreview}>{t('scanner.scanAnotherFull')}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mb-1.5">
                        {t('scanner.legalMetrologyReport') || 'Legal Metrology Verification Report'}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('scanner.complianceResult')}</h2>
                    <p className="text-xs text-muted-foreground">{data?.validation_details ? (language === 'ta' ? 'PCR 2011 விதிகளின்படி சரிபார்ப்பு முடிந்தது' : language === 'hi' ? 'PCR 2011 नियमों के तहत सत्यापन पूर्ण' : 'Deterministic Rule Engine PCR 2011 Complete') : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge 
                        variant={
                            data?.compliance === 'PASS' || data?.compliance === 'COMPLIANT' 
                                ? 'success' 
                                : data?.compliance === 'FAIL' || data?.compliance === 'NON_COMPLIANT'
                                    ? 'destructive'
                                    : 'warning'
                        } 
                        className="px-3 py-1 text-sm font-bold uppercase tracking-wider"
                    >
                        {translateComplianceStatus(data?.compliance, language)}
                    </Badge>
                    <div className="flex flex-col items-end pl-3 border-l border-border">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t('scanner.riskScore')}</span>
                        <span className={`text-base font-bold font-mono uppercase ${
                            data?.risk_score === 'HIGH' ? 'text-destructive' : data?.risk_score === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                            {translateRiskScore(data?.risk_score, language)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                <Card className="sticky top-6 shadow-xs border-border">
                    <CardHeader className="py-3 px-4 border-b border-border">
                        <CardTitle className="text-sm font-semibold">{t('scanner.analyzedImage')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {preview ? (
                            <img src={preview} className="w-full h-auto max-h-[480px] object-contain border border-border rounded-md bg-muted/20" alt="Scanned" />
                        ) : (
                            <div className="w-full h-64 bg-muted/40 flex items-center justify-center border border-border rounded-md text-xs text-muted-foreground">{t('warning.noImage')}</div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t('scanner.extractedDeclarations')}</h3>
                        <div className="flex items-center gap-2">
                            {scanId && (
                                <Link href={`/officer/reports/${scanId}`} target="_blank">
                                    <Button variant="outline" size="sm" className="h-8 border-[#2563EB]/40 text-[#2563EB] hover:bg-[#2563EB]/10 gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        {language === 'ta' ? 'அதிகாரப்பூர்வ PDF அறிக்கை' : language === 'hi' ? 'आधिकारिक पीडीएफ रिपोर्ट' : 'Official PDF Report'}
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" size="sm" className="h-8" onClick={() => setFlowState('SELECT')}>
                                {t('scanner.scanAnother')}
                            </Button>
                        </div>
                    </div>

                    {/* Missing Declarations Alert */}
                    {(() => {
                        const missing = (data?.validation_details?.evaluations || []).filter(
                            (e: any) => e.evidence === 'MISSING_FROM_PACKAGE' || e.evidence === 'Field not present' || (e.status === 'FAIL' && !e.evidence)
                        );
                        if (missing.length === 0) return null;
                        return (
                            <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30">
                                <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300 mb-1.5">
                                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                                    <span>{language === 'ta' ? 'விடுபட்ட கட்டாய பிரகடனங்கள்' : language === 'hi' ? 'लापता अनिवार्य घोषणाएं' : 'Missing Mandatory Declarations'}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {missing.map((m: any, idx: number) => (
                                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800">
                                            {translateField(m.field, language)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Extracted Declarations Cards */}
                    <div className="space-y-3">
                        {(data?.validation_details?.evaluations || []).map((f: any, i: number) => {
                            const isPass = f.status === 'PASS' || f.status === 'COMPLIANT';
                            const isFail = f.status === 'FAIL' || f.status === 'NON_COMPLIANT';
                            const isWarn = f.status === 'NOT_VERIFIED' || f.status === 'OCR_UNCERTAIN' || f.status === 'REVIEW_REQUIRED';

                            const localizedField = translateField(f.field, language);
                            const localizedStatus = translateComplianceStatus(f.status, language);
                            const localizedEvidence = translateEvidence(f.evidence, language);
                            const localizedMessage = translateEvaluationMessage(f.message, f.field, language);
                            const ruleInfo = getRuleInfo(f.field, language);

                            return (
                                <Card key={i} className={`border-l-4 shadow-xs ${
                                    isPass ? 'border-l-emerald-600 dark:border-l-emerald-500' : 
                                    isFail ? 'border-l-red-600 dark:border-l-red-500' : 
                                    isWarn ? 'border-l-amber-500' : 'border-l-slate-400'
                                }`}>
                                    <CardContent className="p-3.5 flex gap-3 items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-semibold text-sm text-foreground">{localizedField}</h4>
                                                <Badge 
                                                    variant={isPass ? 'success' : isFail ? 'destructive' : isWarn ? 'warning' : 'neutral'}
                                                    className="text-[10px]"
                                                >
                                                    {localizedStatus}
                                                </Badge>
                                            </div>
                                            <div className="text-[11px] font-mono text-muted-foreground mb-1.5">
                                                {ruleInfo.citation} • {ruleInfo.name}
                                            </div>
                                            {f.evidence && f.evidence !== "MISSING_FROM_PACKAGE" && f.evidence !== "Field not present" && (
                                                <div className="text-xs font-mono bg-muted/70 px-2.5 py-1 rounded border border-border text-foreground/90 inline-block break-all mt-1">
                                                    <span className="font-sans font-semibold text-muted-foreground mr-1.5">{t('scanner.evidence') || (language === 'ta' ? 'ஆதாரம்' : language === 'hi' ? 'साक्ष्य' : 'Evidence')}:</span>
                                                    {localizedEvidence}
                                                </div>
                                            )}
                                            {(f.evidence === "MISSING_FROM_PACKAGE" || f.evidence === "Field not present") && (
                                                <div className="text-xs font-medium px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 inline-block mt-1">
                                                    {localizedEvidence}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                                {localizedMessage}
                                            </div>
                                        </div>

                                        {isFail && (
                                            <Dialog>
                                                <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "text-destructive border-red-200 dark:border-red-900 hover:bg-destructive/10 text-xs shrink-0" })}>
                                                    <Info className="w-3.5 h-3.5 mr-1" />
                                                    {language === 'ta' ? 'ஏன்?' : language === 'hi' ? 'कारण?' : 'WHY?'}
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-base">{t('scanner.whyFlagged')}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-3 mt-3 text-sm">
                                                        <div>
                                                            <h5 className="font-semibold text-xs text-muted-foreground uppercase">{ruleInfo.citation}</h5>
                                                            <p className="text-xs font-semibold text-foreground">{ruleInfo.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{ruleInfo.description}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-xs text-muted-foreground uppercase">{t('scanner.issueTitle')}</h5>
                                                            <p className="text-sm text-foreground mt-1">{localizedMessage}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-xs text-muted-foreground uppercase">{t('scanner.evidence')}</h5>
                                                            <p className="text-sm font-mono bg-muted p-2 rounded border border-border mt-1">{localizedEvidence || (language === 'ta' ? 'ஆதாரம் இல்லை' : language === 'hi' ? 'कोई साक्ष्य नहीं' : 'No evidence recorded')}</p>
                                                        </div>
                                                        <div className="bg-muted/40 p-3 rounded-md border border-border text-xs text-muted-foreground italic">
                                                            {language === 'ta' 
                                                                ? 'AI-உதவி விதி ஆய்வு. அனைத்து முடிவுகளும் PCR 2011 விதிகளுக்கு உட்பட்டவை.' 
                                                                : language === 'hi' 
                                                                    ? 'AI-सहायता प्राप्त नियम निरीक्षण। सभी निष्कर्ष PCR 2011 नियमों द्वारा शासित हैं।' 
                                                                    : 'AI-assisted rule inspection. All findings governed by PCR 2011 rules.'}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Recommendations Section */}
                    {(() => {
                        const recs = getRecommendations(data?.validation_details?.evaluations || [], data?.compliance, language);
                        if (recs.length === 0) return null;
                        return (
                            <Card className="border-border shadow-xs bg-muted/20">
                                <CardHeader className="py-2.5 px-3.5 border-b border-border">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                                        {language === 'ta' ? 'சட்டரீதியான பரிந்துரைகள்' : language === 'hi' ? 'वैधानिक सिफारिशें' : 'Statutory Recommendations'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3.5 space-y-2 text-xs">
                                    {recs.map((rec, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                                            <span className="font-bold text-[#2563EB] shrink-0">{idx + 1}.</span>
                                            <span className="leading-relaxed">{rec}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })()}

                    {/* Notice & PDF Export Actions */}
                    <div className="pt-2 space-y-2">
                        {(data?.compliance === 'FAIL' || data?.compliance === 'REVIEW_REQUIRED' || data?.compliance === 'NON_COMPLIANT') && !noticeIssued && (
                            <Button onClick={handleIssueNotice} className="w-full h-10 bg-destructive hover:bg-destructive/90 text-white font-semibold">
                                {t('scanner.issueNotice')}
                            </Button>
                        )}
                        {noticeIssued && (
                            <Button disabled className="w-full h-10 bg-muted text-muted-foreground">
                                {t('scanner.noticeIssued')}
                            </Button>
                        )}
                        {scanId && (
                            <Link href={`/officer/reports/${scanId}`} className="block w-full">
                                <Button variant="outline" className="w-full h-10 border-border hover:bg-muted font-medium text-foreground gap-2">
                                    <FileText className="w-4 h-4 text-[#2563EB]" />
                                    {language === 'ta' ? 'முழு ஆய்வு அறிக்கையைக் காண்க / பதிவிறக்குக' : language === 'hi' ? 'पूर्ण निरीक्षण रिपोर्ट देखें / डाउनलोड करें' : 'View / Download Complete Inspection Report (PDF)'}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

