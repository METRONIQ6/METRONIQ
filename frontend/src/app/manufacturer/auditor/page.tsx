"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadCloud, CheckCircle, ShieldAlert, FileSearch, RefreshCw, Box, Layers, PlayCircle } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'
import { translateField, translateComplianceStatus, translateEvaluationMessage } from '@/lib/complianceI18n'

export default function LabelAuditor() {
    const { t, language } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
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

            const uploadResp = await fetch('/api/v1/scanner/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            })
            if (!uploadResp.ok) {
                let errDetail = "Server transmission failed"
                try {
                    const errStr = await uploadResp.json()
                    if (errStr.detail) errDetail = errStr.detail
                } catch (e) { }
                throw new Error(`Upload rejection: ${errDetail}`)
            }
            const uploadResult = await uploadResp.json()
            const sid = uploadResult.id

            setProgressStatus('Sequence initiated: Target inference engine...')
            await fetch(`/api/v1/scanner/process?scan_id=${sid}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            setProgressStatus('Executing primary rule processing matrix...')
            let status = "PROCESSING"
            let pollCount = 0
            let consecutiveErrors = 0
            while (status === "PROCESSING" || status === "UPLOADED") {
                if (pollCount >= 180) throw new Error("Processing timed out. Please retry.")
                pollCount++
                await new Promise(r => setTimeout(r, 1000))
                try {
                    const statusResp = await fetch(`/api/v1/scanner/${sid}/status`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    })
                    if (!statusResp.ok) {
                        consecutiveErrors++
                        if (consecutiveErrors >= 10) throw new Error("Failed to check status.")
                        continue
                    }
                    consecutiveErrors = 0
                    const statusData = await statusResp.json()
                    status = statusData.status
                    if (status === "FAILED") throw new Error("Pipeline aborted: Processing failure")
                } catch (netErr: any) {
                    consecutiveErrors++
                    if (consecutiveErrors >= 10) throw netErr
                }
            }

            setProgressStatus('Finalizing validation matrix...')
            let resultData = null
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    const resultResp = await fetch(`/api/v1/scanner/${sid}/result`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    })
                    if (resultResp.ok) {
                        resultData = await resultResp.json()
                        break
                    }
                } catch (fetchErr) {
                    // brief pause before retry
                }
                await new Promise(r => setTimeout(r, 1000))
            }
            if (!resultData) throw new Error("Failed to retrieve metrics")

            setScanData(resultData)
            setFlowState('RESULT')

        } catch (e: any) {
            toast({ type: 'error', message: e.message || 'Audit execution anomaly established.' })
            setFlowState('IDLE')
        }
    }

    if (errorKey) return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                {t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}
            </div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <FileSearch className="w-6 h-6 text-[#2563EB]" />
                    {t('manufacturer.preMarketAuditor')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('manufacturerUI.auditorSubtitle') || 'Verify pre-packaged commodity packaging artwork against statutory Legal Metrology rules prior to commercial batch printing.'}
                </p>
            </div>

            {flowState === 'IDLE' && (
                <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        {!preview ? (
                            <>
                                <div className="p-4 rounded-full bg-muted/60 mb-4">
                                    <UploadCloud className="w-10 h-10 text-[#2563EB]" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">{t('scanner.uploadLabelMatrix')}</h3>
                                <p className="text-xs text-muted-foreground mb-6 max-w-sm">
                                    Upload digital artwork packaging assets (PNG, JPG) to initiate autonomous compliance verification.
                                </p>
                                <label className="cursor-pointer">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-xs h-9 px-5 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white cursor-pointer">
                                        {t('scanner.selectTargetMedia')}
                                    </div>
                                </label>
                            </>
                        ) : (
                            <div className="flex flex-col items-center w-full max-w-2xl">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('scanner.targetVisualization')}</h3>
                                <div className="p-2 border border-border rounded-lg bg-muted/20 mb-6 w-full max-h-[360px] flex items-center justify-center overflow-hidden">
                                    <img src={preview} alt="Target Layer" className="max-h-[340px] object-contain rounded" />
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium" onClick={resetAuditor}>
                                        {t('scanner.discardTarget')}
                                    </Button>
                                    <Button className="h-9 px-5 text-xs font-medium bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white" onClick={runComplianceAudit}>
                                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                                        {t('scanner.executeProtocol')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {flowState === 'PROCESSING' && (
                <Card className="rounded-lg shadow-xs border border-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <RefreshCw className="w-10 h-10 text-[#2563EB] animate-spin mb-4" />
                        <h3 className="text-base font-bold text-foreground mb-1">{t('scanner.activeNeuralProcessing')}</h3>
                        <p className="text-xs text-muted-foreground max-w-md">{progressStatus}</p>
                    </CardContent>
                </Card>
            )}

            {flowState === 'RESULT' && scanData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="rounded-lg border border-border shadow-xs bg-card p-4">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('common.complianceStatus')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pt-2">
                                <div className="flex items-center gap-2.5">
                                    {scanData.compliance === 'PASS' ? <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> :
                                        (scanData.compliance === 'FAIL' ? <ShieldAlert className="w-6 h-6 text-destructive" /> :
                                            <ShieldAlert className="w-6 h-6 text-amber-500" />)}
                                    <div className={`text-xl font-bold tracking-tight ${scanData.compliance === 'PASS' || scanData.compliance === 'COMPLIANT' ? 'text-emerald-600 dark:text-emerald-400' : (scanData.compliance === 'FAIL' || scanData.compliance === 'NON_COMPLIANT' ? 'text-destructive' : 'text-amber-600')}`}>
                                        {translateComplianceStatus(scanData.compliance, language)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg border border-border shadow-xs bg-card p-4 md:col-span-2">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('scanner.auditRiskVector')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pt-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className={`text-2xl font-bold font-mono tracking-tight ${(scanData.validation_details?.numerical_risk ?? 0) > 60 ? 'text-destructive' : (scanData.validation_details?.numerical_risk ?? 0) > 30 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {typeof scanData.validation_details?.numerical_risk === 'number' ? `${scanData.validation_details.numerical_risk}%` : (t('scanner.state_risk_not_available') || 'RISK NOT AVAILABLE')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{t('scanner.confidenceDelta')}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
                                        <div className={`h-full transition-all duration-500 ${(scanData.validation_details?.numerical_risk ?? 0) > 60 ? 'bg-destructive' : (scanData.validation_details?.numerical_risk ?? 0) > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: typeof scanData.validation_details?.numerical_risk === 'number' ? `${scanData.validation_details.numerical_risk}%` : '0%' }}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                        <CardHeader className="border-b border-border py-3 px-4 bg-muted/20">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#2563EB]" />
                                {t('scanner.deterministicRuleEvaluation')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {(scanData.validation_details?.evaluations && scanData.validation_details.evaluations.length > 0) ? (
                                    scanData.validation_details.evaluations.map((data: any, idx: number) => (
                                        <div key={idx} className={`p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${(data.status === 'PASS' || data.status === 'NOT_APPLICABLE') ? 'hover:bg-muted/30' : 'bg-destructive/5 hover:bg-destructive/10'}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-semibold text-sm text-foreground">{translateField(data.field, language)}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{translateEvaluationMessage(data.message, data.field, language)}</p>
                                            </div>
                                            <Badge variant={(data.status === 'PASS' || data.status === 'NOT_APPLICABLE' || data.status === 'COMPLIANT') ? 'success' : 'destructive'} className="shrink-0 font-mono text-xs uppercase">
                                                {translateComplianceStatus(data.status, language)}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-xs text-muted-foreground">{t('scanner.state_audit_unverified') || 'Audit could not be verified because required telemetry is unavailable.'}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium" onClick={resetAuditor}>
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            {t('scanner.resetAuditor')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
