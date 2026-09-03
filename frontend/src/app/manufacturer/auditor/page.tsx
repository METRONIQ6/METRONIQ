"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadCloud, CheckCircle, ShieldAlert, FileSearch, RefreshCw, Box, Layers, PlayCircle } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from '@/i18n'

export default function LabelAuditor() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    type FlowState = 'IDLE' | 'PROCESSING' | 'RESULT'
    const [flowState, setFlowState] = useState<FlowState>('IDLE')
    const [scanData, setScanData] = useState<any>(null)
    const [progressStatus, setProgressStatus] = useState<string>('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreview(URL.createObjectURL(f))
            setFlowState('IDLE')
            setScanData(null)
        }
    }

    const resetAuditor = () => {
        setFile(null)
        setPreview(null)
        setFlowState('IDLE')
        setScanData(null)
    }

    const runComplianceAudit = async () => {
        if (!file) return;
        setFlowState('PROCESSING')
        setScanData(null)

        try {
            setProgressStatus('Uploading artwork layer...')
            const formData = new FormData()
            formData.append('file', file)

            const uploadResp = await fetch('http://localhost:8000/api/v1/scanner/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            })
            if (!uploadResp.ok) throw new Error("Upload rejection: Server transmission failed")
            const uploadResult = await uploadResp.json()
            const sid = uploadResult.id

            setProgressStatus('Sequence initiated: Target inference engine...')
            await fetch(`http://localhost:8000/api/v1/scanner/process?scan_id=${sid}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            setProgressStatus('Executing primary rule processing matrix...')
            let status = "PROCESSING"
            while (status === "PROCESSING" || status === "UPLOADED") {
                await new Promise(r => setTimeout(r, 2000))
                const statusResp = await fetch(`http://localhost:8000/api/v1/scanner/${sid}/status`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                const statusData = await statusResp.json()
                status = statusData.status
                if (status === "FAILED") throw new Error("Pipeline aborted: Processing failure")
            }

            setProgressStatus('Finalizing validation matrix...')
            const resultResp = await fetch(`http://localhost:8000/api/v1/scanner/${sid}/result`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (!resultResp.ok) throw new Error("Failed to retrieve metrics")

            setScanData(await resultResp.json())
            setFlowState('RESULT')

        } catch (e: any) {
            toast({ type: 'error', message: e.message || 'Audit execution anomaly established.' })
            setFlowState('IDLE')
        }
    }

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1400px] w-full mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-3">
                        <FileSearch className="w-8 h-8 text-[#2563EB]" /> Pre-Market Compliance Auditor
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Verify packaging artwork against semantic legal rules prior to mass production.</p>
                </div>
            </div>

            {flowState === 'IDLE' && (
                <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden transition-all duration-300 hover:border-[#2563EB]/40">
                    <CardContent className="flex flex-col items-center justify-center py-24 px-8 text-center relative overflow-hidden">

                        {/* Decorative background vectors */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-gradient-to-br from-[#2563EB] to-[#0B1F3A] blur-[120px] rounded-full transform rotate-12"></div>
                        </div>

                        {!preview ? (
                            <>
                                <div className="p-5 rounded-2xl bg-muted/40 mb-6 group-hover:scale-105 transition-transform">
                                    <UploadCloud className="w-16 h-16 text-[#2563EB]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0B1F3A] mb-2 z-10">Upload Label Matrix</h3>
                                <p className="text-muted-foreground mb-8 font-medium max-w-sm z-10">Drop digital artwork assets (supported: PNG, JPG) to initiate autonomous compliance verification.</p>
                                <label className="z-10 cursor-pointer">
                                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-12 px-10 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white cursor-pointer hover:-translate-y-0.5 ease-out duration-200">
                                        Select Target Media
                                    </div>
                                </label>
                            </>
                        ) : (
                            <div className="flex flex-col items-center w-full z-10 max-w-3xl">
                                <h3 className="text-lg font-bold uppercase tracking-widest text-[#0B1F3A] mb-4">Target Visualization</h3>
                                <div className="p-2 border-2 border-dashed border-[#2563EB]/30 rounded-xl bg-card shadow-sm mb-8 w-full max-h-[400px] flex items-center justify-center overflow-hidden relative">
                                    <img src={preview} alt="Target Layer" className="max-h-[380px] object-contain rounded-md" />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="h-11 px-6 font-semibold" onClick={resetAuditor}>Discard Target</Button>
                                    <Button className="h-11 px-8 font-semibold bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-sm" onClick={runComplianceAudit}>
                                        <PlayCircle className="w-4 h-4 mr-2" /> Execute Protocol
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {flowState === 'PROCESSING' && (
                <Card className="rounded-xl shadow-sm border border-[#2563EB]/30 bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-28 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#2563EB]/5 animate-pulse"></div>
                        <RefreshCw className="w-16 h-16 text-[#2563EB] animate-spin mb-8 relative z-10" />
                        <h3 className="text-2xl font-bold text-[#0B1F3A] mb-3 relative z-10 text-center tracking-tight">Active Neural Processing</h3>
                        <p className="text-muted-foreground font-medium relative z-10 text-sm max-w-md text-center">{progressStatus}</p>
                    </CardContent>
                </Card>
            )}

            {flowState === 'RESULT' && scanData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="rounded-xl border border-border shadow-sm bg-card overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Compliance Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    {scanData.risk_level < 40 ? <CheckCircle className="w-8 h-8 text-green-600" /> : <ShieldAlert className="w-8 h-8 text-red-600" />}
                                    <div className="text-3xl font-extrabold tracking-tight text-[#0B1F3A] dark:text-white">
                                        {scanData.risk_level < 40 ? 'VERIFIED' : 'FAILED'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border shadow-sm bg-card relative overflow-hidden md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Audit Risk Vector</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <span className={`text-4xl font-extrabold tracking-tight ${scanData.risk_level > 60 ? 'text-red-500' : scanData.risk_level > 30 ? 'text-orange-500' : 'text-green-500'}`}>
                                            {scanData.risk_level}%
                                        </span>
                                        <span className="text-sm font-semibold text-muted-foreground">Confidence Delta</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden w-full">
                                        <div className={`h-full transition-all duration-500 ${scanData.risk_level > 60 ? 'bg-red-500' : scanData.risk_level > 30 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${scanData.risk_level}%` }}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-xl shadow-sm border border-border bg-card">
                        <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
                            <CardTitle className="text-base font-bold text-[#0B1F3A] flex items-center gap-2">
                                <Layers className="w-5 h-5 text-[#2563EB]" /> Deterministic Rule Evaluation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50 border-t border-border/50">
                                {Object.entries(scanData.validation_output?.details || {}).map(([rule, data]: [string, any], idx) => (
                                    <div key={idx} className={`p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${data.pass ? 'hover:bg-muted/30' : 'bg-red-50/50 hover:bg-red-50'}`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-[#0B1F3A] capitalize">{rule.replace(/_/g, ' ')}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">{data.reason || (data.pass ? 'Compliance threshold met.' : 'Mandatory regulatory declaration missing.')}</p>
                                        </div>
                                        <Badge variant="outline" className={`shrink-0 font-mono text-xs uppercase px-3 py-1 rounded-sm border ${data.pass ? 'border-green-300 text-green-700 bg-green-50/80 shadow-sm' : 'border-red-300 text-red-700 bg-red-100/80 shadow-sm'}`}>
                                            {data.pass ? 'CONFORMANT' : 'VIOLATION'}
                                        </Badge>
                                    </div>
                                ))}
                                {!scanData.validation_output?.details && (
                                    <div className="p-8 text-center text-muted-foreground font-medium">Telemetry data unavailable or corrupted.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4 justify-end pt-4">
                        <Button variant="outline" className="h-11 px-8 font-semibold shadow-sm" onClick={resetAuditor}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset Auditor
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
