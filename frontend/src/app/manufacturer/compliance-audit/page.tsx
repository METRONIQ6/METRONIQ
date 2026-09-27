"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadCloud, Camera, X, ShieldCheck, ShieldAlert, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'
import { useToast } from "@/components/ui/use-toast"

export default function ComplianceAudit() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [result, setResult] = useState<any>(null)
    const [evidence, setEvidence] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [statusKey, setStatusKey] = useState("")
    const { t } = useTranslation()
    const { toast } = useToast()
    const [isSubmittingToGov, setIsSubmittingToGov] = useState(false)
    const [isSubmittedToGov, setIsSubmittedToGov] = useState(false)

    const [isCameraActive, setIsCameraActive] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreview(URL.createObjectURL(f))
            setIsCameraActive(false)
            stopCamera()
            setIsSubmittedToGov(false)
        }
    }

    const startCamera = async () => {
        setIsSubmittedToGov(false)
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            setStream(mediaStream)
            setIsCameraActive(true)
            setFile(null)
            setPreview(null)
        } catch (err) {
            console.error("Camera access denied or unavailable", err)
            alert(t('warning.camera_denied') || "Camera access denied or unavailable. Please upload a photo instead.")
        }
    }

    useEffect(() => {
        if (isCameraActive && videoRef.current && stream) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => console.error("Video play error:", e))
        }
    }, [isCameraActive, stream])

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setIsCameraActive(false)
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
                    }
                }, "image/jpeg", 0.9)
            }
        }
    }

    const clearSelection = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
        setIsCameraActive(false)
        stopCamera()
        setIsSubmittedToGov(false)
    }

    const submitForGovApproval = async () => {
        setIsSubmittingToGov(true)
        try {
            const token = getToken()

            // 1. Determine a product name from scan result if possible
            let prodName = "Audited Product"
            if (result && result.validation_details && result.validation_details.evaluations) {
                const nameEval = result.validation_details.evaluations.find((e: any) => e.field === 'PRODUCT_NAME' || e.rule_name === 'PRODUCT_NAME' || e.rule === 'PRODUCT_NAME')
                if (nameEval && nameEval.evidence && nameEval.evidence.trim().length > 0 && nameEval.evidence !== 'MISSING_FROM_PACKAGE') {
                    prodName = nameEval.evidence.trim()
                } else if (result.id) {
                    prodName = `Scanned Item - ${result.id.substring(0, 8)}`
                }
            }

            // 2. Create the Product in backend to keep track of it
            const pRes = await fetch('/api/v1/manufacturer/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: prodName,
                    category: "Scanned Audit"
                })
            })
            if (!pRes.ok) throw new Error("Failed to create product record")
            const productData = await pRes.json()

            // 3. Submit it for government approval
            const sRes = await fetch('/api/v1/manufacturer/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productData.id
                })
            })
            if (!sRes.ok) throw new Error("Failed to submit to government")

            setIsSubmittingToGov(false)
            setIsSubmittedToGov(true)
            toast({ type: 'success', message: t('manufacturer.compliance_audit.submit_success') || "Successfully sent for government approval! Tracking details available in History." })
        } catch (e: any) {
            console.error(e)
            setIsSubmittingToGov(false)
            toast({ type: 'error', message: e.message || "Failed to submit for approval." })
        }
    }

    const scan = async () => {
        if (!file) return
        setIsSubmittedToGov(false)
        setLoading(true)
        setStatusKey("uploading")
        const fd = new FormData()
        fd.append('file', file)

        try {
            const token = getToken()
            // 1. Upload
            const upRes = await fetch('/api/v1/scanner/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            })
            if (!upRes.ok) throw new Error("Upload failed")
            const { id } = await upRes.json()

            // 2. Process
            setStatusKey("processing")
            await fetch(`/api/v1/scanner/process?scan_id=${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            // 3. Poll
            let completed = false
            while (!completed) {
                await new Promise(r => setTimeout(r, 800))
                const stRes = await fetch(`/api/v1/scanner/${id}/status`, { headers: { 'Authorization': `Bearer ${token}` } })
                const stData = await stRes.json()
                if (stData.status === 'COMPLETED') completed = true
                else if (stData.status === 'FAILED') throw new Error(stData.error || "Processing failed")
            }

            // 4. Result & Evidence
            setStatusKey("fetching")
            const resData = await (await fetch(`/api/v1/scanner/${id}/result`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
            const evData = await (await fetch(`/api/v1/scanner/${id}/evidence`, { headers: { 'Authorization': `Bearer ${token}` } })).json()

            setResult(resData)
            setEvidence(evData)
        } catch (e: any) {
            console.error(e)
            setResult({ compliance: "AUDIT_ERROR", errorKey: mapManufacturerError(undefined, e.message) })
        } finally {
            setLoading(false)
            setStatusKey("")
        }
    }

    const isFail = (c: string) => c === 'FAIL' || c === 'NON_COMPLIANT' || c === 'NON-COMPLIANT' || c === 'AUDIT_ERROR'
    const dispStatus = statusKey ? (t(`manufacturer.compliance_audit.${statusKey}`) || statusKey) : (t('manufacturer.compliance_audit.runAudit') || "Run Compliance Audit")

    const normalizeAuditEvaluation = (ev: any) => {
        const rawField = ev.field || ev.rule_name || ev.rule || '';
        let ruleKey = `RULE_${rawField}`;
        if (rawField === 'MANUFACTURER') ruleKey = 'RULE_MANUFACTURER_DETAILS';
        if (rawField === 'PACKER') ruleKey = 'RULE_PACKER_DETAILS';
        if (rawField === 'IMPORTER') ruleKey = 'RULE_IMPORTER_DETAILS';
        if (rawField === 'DATE') ruleKey = 'RULE_DATE_DECLARATION';
        if (rawField === 'PRODUCT_NAME') ruleKey = 'RULE_GENERIC_NAME';

        const statusObj = (ev.status || 'UNKNOWN').toUpperCase();

        return {
            ruleKey,
            ruleStr: rawField ? (t(`manufacturer.rules.${ruleKey}`) || rawField) : (t('common.unknown') || "Compliance rule"),
            statusStr: t(`manufacturer.status.${statusObj}`) || statusObj,
            isPass: statusObj === 'PASS',
            isFail: statusObj === 'FAIL' || statusObj === 'INVALID_IMAGE',
            isNotApplicable: statusObj === 'NOT_APPLICABLE' || statusObj === 'NOT_REQUIRED',
            isNotVerified: statusObj === 'NOT_VERIFIED' || statusObj === 'OCR_UNCERTAIN' || statusObj === 'REVIEW_REQUIRED',
            reason: ev.message || ev.reason || '',
            evidence: ev.evidence || ''
        };
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white">{t('manufacturer.compliance_audit.title')}</h2>

            <Card className="rounded-xl border border-border shadow-sm">
                <CardContent className="pt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-32 flex flex-col items-center justify-center gap-3 border-dashed border-2 hover:bg-muted/50 transition-colors bg-card"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                            <UploadCloud className="w-10 h-10 text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">{t('scanner.uploadImage') || "Upload Photo"}</span>
                            <input id="photo-upload" type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-32 flex flex-col items-center justify-center gap-3 border-dashed border-2 hover:bg-muted/50 transition-colors bg-card"
                            onClick={startCamera}
                        >
                            <Camera className="w-10 h-10 text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">{t('scanner.liveCamera') || "Live Camera"}</span>
                        </Button>
                    </div>

                    {isCameraActive && (
                        <div className="relative border rounded-xl overflow-hidden bg-black flex flex-col items-center min-h-[400px] shadow-sm">
                            <video ref={videoRef} className="w-full max-h-[60vh] object-contain" autoPlay playsInline muted />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                                <Button onClick={captureImage} className="bg-white text-black hover:bg-gray-200 shadow-xl h-12 px-8 rounded-full font-bold">{t('scanner.takePhoto') || "Take Photo"}</Button>
                                <Button variant="destructive" onClick={stopCamera} className="shadow-xl h-12 px-6 rounded-full">{t('common.cancel') || "Cancel"}</Button>
                            </div>
                        </div>
                    )}

                    {preview && !isCameraActive && (
                        <div className="relative border rounded-xl overflow-hidden bg-muted/20 p-4 shadow-inner">
                            <img src={preview} alt="Preview" className="w-full max-h-[50vh] object-contain rounded-md shadow-sm border" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-6 right-6 rounded-full h-10 w-10 shadow-lg"
                                onClick={clearSelection}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-end pt-5 border-t w-full">
                        <Button onClick={scan} disabled={!file || loading} className="w-full sm:w-auto bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white shadow-sm font-semibold h-12 px-8 text-lg rounded-xl transition-all">
                            {dispStatus}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card className="rounded-xl border border-border mt-8 shadow-sm">
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="text-2xl font-bold tracking-tight mb-4">{t('manufacturer.compliance_audit.auditResult')}</h3>
                        <div className="flex gap-4 flex-wrap">
                            <Badge variant={isFail(result.compliance) ? 'destructive' : 'default'} className="text-base font-semibold tracking-wide py-1.5 px-4 shadow-sm">
                                {t(`manufacturer.status.${result.compliance}`) || result.compliance || "UNKNOWN"}
                            </Badge>
                            <Badge variant="outline" className="text-base font-semibold tracking-wide py-1.5 px-4 shadow-sm bg-card">
                                {t('manufacturer.compliance_audit.risk')} {result.risk_score ? (t(`manufacturer.risk.${result.risk_score.toUpperCase()}`) || result.risk_score) : (t('manufacturer.compliance_audit.na'))}
                            </Badge>
                        </div>

                        {result.errorKey && <p className="text-red-500 font-medium py-2">{t(`manufacturer.errors.${result.errorKey}`)}</p>}
                        {result.error && !result.errorKey && <p className="text-red-500 font-medium py-2">{result.error}</p>}
                        {result.validation_details?.message && <p className="text-orange-500 font-medium">{result.validation_details.message}</p>}

                        {result.validation_details?.evaluations && result.validation_details.evaluations.length > 0 && (
                            <div className="pt-4">
                                <h4 className="font-bold text-lg mb-4 tracking-tight border-b pb-2">{t('manufacturer.compliance_audit.complianceChecklist')}</h4>
                                <ul className="space-y-4 pt-2">
                                    {result.validation_details.evaluations.map((ev: any, idx: number) => {
                                        const norm = normalizeAuditEvaluation(ev);
                                        let bgClass = 'border-border bg-card'
                                        let iconClass = 'bg-muted text-muted-foreground'
                                        let textClass = 'text-foreground'

                                        if (norm.isFail) {
                                            bgClass = 'border-red-200 bg-red-50/50 dark:bg-red-900/10'
                                            iconClass = 'bg-red-100 text-red-600'
                                            textClass = 'text-destructive'
                                        } else if (norm.isPass) {
                                            bgClass = 'border-green-200 bg-green-50/50 dark:bg-green-900/10'
                                            iconClass = 'bg-green-100 text-green-600'
                                            textClass = 'text-green-600'
                                        } else if (norm.isNotVerified) {
                                            bgClass = 'border-amber-200 bg-amber-50/50 dark:bg-amber-900/10'
                                            iconClass = 'bg-amber-100 text-amber-600'
                                            textClass = 'text-amber-600'
                                        } else if (norm.isNotApplicable) {
                                            bgClass = 'border-muted bg-muted/20'
                                            iconClass = 'bg-slate-100 text-slate-500'
                                            textClass = 'text-muted-foreground'
                                        }

                                        return (
                                            <li key={idx} className={`flex gap-4 items-start p-4 rounded-xl border shadow-sm ${bgClass}`}>
                                                <div className={`mt-0.5 rounded-full p-1.5 ${iconClass}`}>
                                                    {norm.isPass ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-foreground text-lg">
                                                        {norm.ruleStr}: <span className={`ml-1 font-bold ${textClass}`}>{norm.statusStr}</span>
                                                    </div>
                                                    {norm.evidence && norm.evidence !== "MISSING_FROM_PACKAGE" && norm.evidence !== "Field not present" && (
                                                        <div className="mt-2 p-2 bg-background/50 rounded border text-sm font-mono text-muted-foreground break-all">
                                                            Detected Value: {norm.evidence}
                                                        </div>
                                                    )}
                                                    {norm.reason && <p className="text-sm mt-2 text-muted-foreground">{norm.reason}</p>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Submission Button */}
                        <div className="pt-6 mt-6 border-t flex justify-end gap-4">
                            <Button
                                onClick={submitForGovApproval}
                                disabled={isSubmittingToGov || isSubmittedToGov}
                                className={`h-14 px-8 text-lg font-bold shadow-md rounded-xl transition-all ${isSubmittedToGov ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                            >
                                {isSubmittingToGov ? (
                                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> {t('common.processing') || "Processing..."}</>
                                ) : isSubmittedToGov ? (
                                    <><CheckCircle2 className="w-5 h-5 mr-3" /> {t('manufacturer.compliance_audit.submitted') || "Submitted for Approval"}</>
                                ) : (
                                    <><Send className="w-5 h-5 mr-3" /> {t('manufacturer.compliance_audit.sendForApproval') || "Send for Government Approval"}</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
