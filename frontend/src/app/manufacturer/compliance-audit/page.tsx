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
import { translateField, translateComplianceStatus, translateRiskScore, translateEvaluationMessage, translateEvidence } from '@/lib/complianceI18n'

export default function ComplianceAudit() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [result, setResult] = useState<any>(null)
    const [evidence, setEvidence] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [statusKey, setStatusKey] = useState("")
    const { t, language } = useTranslation()
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
            if (!upRes.ok) {
                const errText = await upRes.text().catch(() => "Unknown");
                throw new Error(`Upload failed: [${upRes.status}] ${errText}`);
            }
            const { id } = await upRes.json()

            // 2. Process
            setStatusKey("processing")
            await fetch(`/api/v1/scanner/process?scan_id=${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            // 3. Poll
            let completed = false
            let pollCount = 0
            let consecutiveErrors = 0
            while (!completed) {
                if (pollCount >= 180) throw new Error("Processing timed out. Please retry.")
                pollCount++
                await new Promise(r => setTimeout(r, 1000))
                try {
                    const stRes = await fetch(`/api/v1/scanner/${id}/status`, { headers: { 'Authorization': `Bearer ${token}` } })
                    if (!stRes.ok) {
                        consecutiveErrors++
                        if (consecutiveErrors >= 10) throw new Error("Failed to check status.")
                        continue
                    }
                    consecutiveErrors = 0
                    const stData = await stRes.json()
                    if (stData.status === 'COMPLETED') completed = true
                    else if (stData.status === 'FAILED') throw new Error(stData.error || "Processing failed")
                } catch (netErr: any) {
                    consecutiveErrors++
                    if (consecutiveErrors >= 10) throw netErr
                }
            }

            // 4. Result & Evidence
            setStatusKey("fetching")
            let resData = null
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    const res = await fetch(`/api/v1/scanner/${id}/result`, { headers: { 'Authorization': `Bearer ${token}` } })
                    if (res.ok) {
                        resData = await res.json()
                        break
                    }
                } catch (fetchErr) {
                    // brief pause before retry
                }
                await new Promise(r => setTimeout(r, 1000))
            }
            if (!resData) throw new Error("Failed to retrieve audit result")

            setResult(resData)
            setEvidence(resData.evidence)
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
            ruleStr: rawField ? translateField(rawField, language) : (t('common.unknown') || "Compliance rule"),
            statusStr: translateComplianceStatus(statusObj, language),
            isPass: statusObj === 'PASS',
            isFail: statusObj === 'FAIL' || statusObj === 'INVALID_IMAGE',
            isNotApplicable: statusObj === 'NOT_APPLICABLE' || statusObj === 'NOT_REQUIRED',
            isNotVerified: statusObj === 'NOT_VERIFIED' || statusObj === 'OCR_UNCERTAIN' || statusObj === 'REVIEW_REQUIRED',
            reason: translateEvaluationMessage(ev.message || ev.reason || '', rawField, language),
            evidence: translateEvidence(ev.evidence || '', language)
        };
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
                    {t('manufacturer.compliance_audit.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('manufacturerUI.complianceAuditSubtitle') || 'Pre-market automated statutory Legal Metrology compliance verification and declaration audit.'}
                </p>
            </div>

            <Card className="rounded-lg border border-border shadow-xs bg-card">
                <CardContent className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-28 flex flex-col items-center justify-center gap-2.5 border-dashed border-2 hover:bg-muted/40 transition-colors bg-card rounded-lg"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                            <UploadCloud className="w-8 h-8 text-muted-foreground" />
                            <span className="font-medium text-sm text-foreground">{t('scanner.uploadImage') || "Upload Photo"}</span>
                            <input id="photo-upload" type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-28 flex flex-col items-center justify-center gap-2.5 border-dashed border-2 hover:bg-muted/40 transition-colors bg-card rounded-lg"
                            onClick={startCamera}
                        >
                            <Camera className="w-8 h-8 text-muted-foreground" />
                            <span className="font-medium text-sm text-foreground">{t('scanner.liveCamera') || "Live Camera"}</span>
                        </Button>
                    </div>

                    {isCameraActive && (
                        <div className="relative border border-border rounded-lg overflow-hidden bg-black flex flex-col items-center min-h-[360px]">
                            <video ref={videoRef} className="w-full max-h-[50vh] object-contain" autoPlay playsInline muted />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                                <Button onClick={captureImage} className="bg-white text-black hover:bg-gray-100 shadow-md h-9 px-5 rounded-md font-medium text-sm">
                                    {t('scanner.takePhoto') || "Take Photo"}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={stopCamera} className="h-9 px-4 rounded-md text-sm">
                                    {t('common.cancel') || "Cancel"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {preview && !isCameraActive && (
                        <div className="relative border border-border rounded-lg overflow-hidden bg-muted/20 p-3">
                            <img src={preview} alt="Preview" className="w-full max-h-[45vh] object-contain rounded border border-border" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-5 right-5 rounded-full h-8 w-8 shadow-sm"
                                onClick={clearSelection}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-end pt-3 border-t border-border">
                        <Button 
                            onClick={scan} 
                            disabled={!file || loading} 
                            className="w-full sm:w-auto bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white font-medium h-9 px-5 text-sm rounded-md transition-colors"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {dispStatus}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card className="rounded-lg border border-border shadow-xs bg-card overflow-hidden">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground tracking-tight">
                            {t('manufacturer.compliance_audit.auditResult')}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Badge variant={isFail(result.compliance) ? 'destructive' : 'success'} className="font-mono text-xs uppercase">
                                {translateComplianceStatus(result.compliance, language)}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs uppercase">
                                {t('manufacturer.compliance_audit.risk')}: {translateRiskScore(result.risk_score, language)}
                            </Badge>
                        </div>
                    </div>
                    <CardContent className="p-5 space-y-4">
                        {result.errorKey && <p className="text-sm text-destructive font-medium">{t(`manufacturer.errors.${result.errorKey}`)}</p>}
                        {result.error && !result.errorKey && <p className="text-sm text-destructive font-medium">{result.error}</p>}
                        {result.validation_details?.message && <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{result.validation_details.message}</p>}

                        {result.validation_details?.evaluations && result.validation_details.evaluations.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('manufacturer.compliance_audit.complianceChecklist')}
                                </h4>
                                <ul className="space-y-2.5">
                                    {result.validation_details.evaluations.map((ev: any, idx: number) => {
                                        const norm = normalizeAuditEvaluation(ev);
                                        let bgClass = 'border-border bg-card'
                                        let badgeVar: "success" | "destructive" | "warning" | "neutral" = "neutral"

                                        if (norm.isFail) {
                                            bgClass = 'border-destructive/20 bg-destructive/5'
                                            badgeVar = "destructive"
                                        } else if (norm.isPass) {
                                            bgClass = 'border-emerald-500/20 bg-emerald-500/5'
                                            badgeVar = "success"
                                        } else if (norm.isNotVerified) {
                                            bgClass = 'border-amber-500/20 bg-amber-500/5'
                                            badgeVar = "warning"
                                        } else if (norm.isNotApplicable) {
                                            bgClass = 'border-border bg-muted/20'
                                            badgeVar = "neutral"
                                        }

                                        return (
                                            <li key={idx} className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 ${bgClass}`}>
                                                <div className="mt-0.5 shrink-0">
                                                    {norm.isPass ? (
                                                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <ShieldAlert className="w-4 h-4 text-destructive" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-semibold text-foreground text-sm">{norm.ruleStr}</span>
                                                        <Badge variant={badgeVar} className="font-mono text-xs uppercase shrink-0">
                                                            {norm.statusStr}
                                                        </Badge>
                                                    </div>
                                                    {norm.evidence && norm.evidence !== "MISSING_FROM_PACKAGE" && norm.evidence !== "Field not present" && (
                                                        <div className="mt-1.5 p-2 bg-background rounded border border-border text-xs font-mono text-muted-foreground break-all">
                                                            Detected Value: <span className="text-foreground">{norm.evidence}</span>
                                                        </div>
                                                    )}
                                                    {norm.reason && <p className="text-xs mt-1 text-muted-foreground">{norm.reason}</p>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Submission Button */}
                        <div className="pt-4 border-t border-border flex justify-end">
                            <Button
                                onClick={submitForGovApproval}
                                disabled={isSubmittingToGov || isSubmittedToGov}
                                className={`h-9 px-5 text-sm font-medium transition-colors ${
                                    isSubmittedToGov 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                        : 'bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white'
                                }`}
                            >
                                {isSubmittingToGov ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('common.processing') || "Processing..."}</>
                                ) : isSubmittedToGov ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> {t('manufacturer.compliance_audit.submitted') || "Submitted for Approval"}</>
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> {t('manufacturer.compliance_audit.sendForApproval') || "Send for Government Approval"}</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
