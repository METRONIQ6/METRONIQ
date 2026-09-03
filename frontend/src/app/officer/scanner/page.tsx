"use client"
import React, { useEffect, useState, useRef } from 'react'
import { getToken } from '@/lib/auth'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Loader2, Info, UploadCloud, Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/i18n"

type FlowState = 'SELECT' | 'CAMERA' | 'PREVIEW' | 'PROCESSING' | 'RESULT'

export default function AIScannerUnified() {
    const { toast } = useToast()
    const { t } = useTranslation()
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

    const steps = [
        "Uploading...",
        "Preprocessing...",
        "OCR Extraction...",
        "Rules Validation...",
        "Generating Evidence...",
        "Complete"
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
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                videoRef.current.play()
            }
        } catch (err) {
            console.error("Camera access denied or unavailable", err)
            toast({ type: 'warning', message: 'Camera access denied or unavailable.', description: 'Please use the upload alternative.' })
        }
    }

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
                toast({ type: 'warning', message: 'No file selected.' })
                setFlowState('SELECT')
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            setLoadingStep(1) // Preprocessing

            const uploadResp = await fetch('http://localhost:8000/api/v1/scanner/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            if (!uploadResp.ok) throw new Error("Failed to upload image")
            const uploadResult = await uploadResp.json();
            const sid = uploadResult.id;
            setScanId(sid);

            setLoadingStep(2) // OCR

            await fetch(`http://localhost:8000/api/v1/scanner/process?scan_id=${sid}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            let status = "PROCESSING";
            while (status === "PROCESSING" || status === "UPLOADED") {
                await new Promise(r => setTimeout(r, 2000));

                // Advance visual steps occasionally
                setLoadingStep(prev => prev < 4 ? prev + 1 : prev)

                const statusResp = await fetch(`http://localhost:8000/api/v1/scanner/${sid}/status`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                const statusData = await statusResp.json();
                status = statusData.status;
                if (status === "FAILED") {
                    throw new Error("Backend processing failed")
                }
            }

            setLoadingStep(5)

            const resultResp = await fetch(`http://localhost:8000/api/v1/scanner/${sid}/result`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const resultData = await resultResp.json();

            const urlParams = new window.URLSearchParams(window.location.search);
            const reinId = urlParams.get('reinspection') || sessionStorage.getItem('currentReinspectionId');
            if (reinId && resultData.compliance !== undefined) {
                await fetch(`http://localhost:8000/api/v1/reinspections/${reinId}/link_scan?scan_id=${sid}`, {
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
            const res = await fetch('http://localhost:8000/api/v1/notices/', {
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
                toast({ type: 'success', message: 'Improvement Notice Issued Successfully' })
            } else {
                toast({ type: 'error', message: 'Failed to issue notice' })
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (flowState === 'SELECT') {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t("scanner.title")}</h2>
                    <p className="text-muted-foreground">{t("scanner.selectPrompt")}</p>
                </div>
                <Card className="mt-8 border-dashed border-2 border-border">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center items-center">
                            <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/30 w-full sm:w-[200px] text-center" style={{ cursor: 'pointer' }} onClick={() => document.getElementById('file-upload')?.click()}>
                                <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
                                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <Button variant="outline" className="w-full">{t("scanner.uploadImage")}</Button>
                            </div>
                            <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/30 w-full sm:w-[200px] text-center" style={{ cursor: 'pointer' }} onClick={startCamera}>
                                <Camera className="w-12 h-12 text-green-500 mb-4" />
                                <Button variant="outline" className="w-full">{t("scanner.captureImage")}</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (flowState === 'CAMERA') {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t("scanner.title")}</h2>
                </div>
                <Card className="mt-8 border-border">
                    <CardContent className="flex flex-col items-center justify-center py-8 px-4 w-full">
                        <div className="bg-black w-full max-w-sm rounded-md overflow-hidden aspect-[3/4] relative mb-6">
                            <video ref={videoRef} autoPlay playsInline muted className="object-cover w-full h-full" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
                            <Button variant="outline" className="w-full" onClick={() => { stopCamera(); setFlowState('SELECT') }}>{t("common.cancel")}</Button>
                            <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={captureImage}>{t("scanner.captureImage")}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (flowState === 'PREVIEW') {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">AI Product Compliance Scanner</h2>
                </div>
                <Card className="mt-8 border-border">
                    <CardContent className="flex flex-col items-center justify-center py-8 px-4 w-full">
                        <h3 className="text-lg font-medium mb-4">IMAGE PREVIEW</h3>
                        {preview && <img src={preview} alt="Preview" className="max-h-80 object-contain rounded-md border mb-6" />}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                            <Button variant="outline" className="w-full sm:w-32" onClick={cancelPreview}>Back</Button>
                            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-32" onClick={processRealData}>Start AI Scan</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (flowState === 'PROCESSING') {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-6">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="text-xl font-medium text-foreground/80 w-64 text-center pb-2">
                    {steps[loadingStep]}
                </div>
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(loadingStep / (steps.length - 1)) * 100}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground/80 mt-4 uppercase">AI Processing Engine Active</p>
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
                            <ShieldAlert className="w-6 h-6" /> NOT VERIFIED — ENVIRONMENT LIMITATION
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-orange-700 font-medium whitespace-pre-wrap">{data?.validation_details?.message || 'OCR unavailable in current environment.'}</p>
                        <p className="text-sm text-orange-600">
                            The PaddleOCR hardware dependencies could not be resolved on this system.
                        </p>
                        <div className="pt-6">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full max-w-xs mx-auto" onClick={cancelPreview}>Acknowledge</Button>
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
                        <CardTitle className="text-xl text-destructive-foreground flex justify-center items-center gap-2">
                            <ShieldAlert className="w-6 h-6" /> INVALID INSPECTION IMAGE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-destructive-foreground font-medium">No valid product/package was detected.</p>
                        <p className="text-sm text-destructive">
                            {data?.validation_details?.message || 'Please upload or capture a clear image of the product/package.'}
                        </p>
                        {preview && (
                            <img src={preview} alt="Invalid Upload" className="mx-auto mt-6 h-48 object-contain rounded-md border border-red-200 opacity-80" />
                        )}
                        <div className="pt-6">
                            <Button className="bg-red-600 hover:bg-red-700 text-white w-full max-w-xs mx-auto" onClick={cancelPreview}>Scan Another Image</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Compliance Result</h2>
                    <p className="text-muted-foreground">{data?.validation_details ? 'Validation Complete' : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={data?.compliance === 'FAIL' ? 'destructive' : 'default'} className="px-4 py-1 text-lg">
                        {data?.compliance || 'UNKNOWN'}
                    </Badge>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Risk Score</span>
                        <span className={`text-xl font-bold uppercase ${data?.risk_score === 'HIGH' ? 'text-destructive' : 'text-orange-500'}`}>{data?.risk_score || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle>Analyzed Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {preview ? (
                            <img src={preview} className="w-full h-auto max-h-[500px] object-contain border rounded-md" alt="Scanned" />
                        ) : (
                            <div className="w-full h-64 bg-muted flex items-center justify-center border rounded-md">
                                No Image Data
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Extracted Declarations & Validations</h3>
                        <Button variant="outline" size="sm" onClick={() => setFlowState('SELECT')}>Scan Another</Button>
                    </div>

                    {(data?.validation_details?.evaluations || []).map((f: any, i: number) => (
                        <Card key={i} className={`border-l-4 ${f.status === 'PASS' || f.status === 'NOT_REQUIRED' || f.status === 'PENDING_RULE_DEF' ? 'border-l-green-500' : 'border-l-red-500'} mb-4`}>
                            <CardContent className="p-4 flex gap-4 items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-foreground">{f.field}</h4>
                                        <Badge variant="outline" className={`text-xs ${f.status === 'PASS' || f.status === 'NOT_REQUIRED' || f.status === 'PENDING_RULE_DEF' ? 'text-success-foreground bg-success/10' : 'text-destructive-foreground bg-destructive/10'}`}>
                                            {f.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium text-foreground/80 bg-muted px-3 py-1 rounded inline-block">
                                        Evidence: {f.evidence}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Message: {f.message}
                                    </div>
                                </div>

                                {f.status === 'FAIL' && (
                                    <Dialog>
                                        <DialogTrigger render={<Button variant="outline" size="sm" className="text-destructive border-red-200 hover:bg-destructive/10" />}>
                                            <Info className="w-4 h-4 mr-2" />
                                            WHY?
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Why this was flagged</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <div>
                                                    <h5 className="font-semibold text-sm text-foreground/80">Issue</h5>
                                                    <p className="text-sm text-foreground">{f.message}</p>
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-sm text-foreground/80">Evidence Extracted</h5>
                                                    <p className="text-sm text-foreground">{f.evidence}</p>
                                                </div>
                                                <div className="bg-muted/30 p-4 rounded-md border text-xs text-muted-foreground italic">
                                                    <p>AI-generated assistance. Verify legal decisions with the applicable rules.</p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex gap-4">
                        {data?.compliance === 'FAIL' && !noticeIssued && (
                            <Button onClick={handleIssueNotice} className="w-full mt-4 bg-red-600 hover:bg-red-700">Issue Improvement Notice</Button>
                        )}
                        {noticeIssued && (
                            <Button disabled className="w-full mt-4 bg-gray-400">Notice Issued</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
