"use client"
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { Scale, FileText, ServerCrash, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { useToast } from "@/components/ui/use-toast"
import { translateComplianceStatus } from '@/lib/complianceI18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const STATE_TRANSITIONS: Record<string, string> = {
    OPEN: 'UNDER_REVIEW',
    UNDER_REVIEW: 'PENALTY_PENDING',
    PENALTY_PENDING: 'PENALTY_ISSUED',
    PENALTY_ISSUED: 'RESOLVED',
}

const STATE_LABEL: Record<string, string> = {
    OPEN: 'enforcement.actionBeginReview',
    UNDER_REVIEW: 'enforcement.actionAssessPenalty',
    PENALTY_PENDING: 'enforcement.actionConfirmIssued',
    PENALTY_ISSUED: 'enforcement.actionMarkResolved',
}

const STATUS_COLOR: Record<string, string> = {
    OPEN: 'border-red-200 text-destructive dark:text-red-400 font-bold bg-destructive/10 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10',
    UNDER_REVIEW: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10',
    PENALTY_PENDING: 'border-blue-200 text-primary bg-primary/10 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10',
    PENALTY_ISSUED: 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:bg-indigo-900/10',
    RESOLVED: 'border-green-200 text-green-700 dark:text-green-400 font-bold bg-success/10 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10',
}

export default function EnforcementPage() {
    const { t, language } = useTranslation()
    const { toast } = useToast()

    const [cases, setCases] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(false)

    const [penaltyModal, setPenaltyModal] = React.useState<{ caseId: string; nextStatus: string } | null>(null)
    const [penaltyInput, setPenaltyInput] = React.useState<string>('')
    const [actionLoading, setActionLoading] = React.useState(false)

    const fetchCases = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/v1/enforcement', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setCases(await res.json())
            } else {
                throw new Error('Failed to load enforcement cases.')
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.enforcement_load") })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchCases()
    }, [])

    const handleAdvanceState = async (caseId: string, currentStatus: string) => {
        const nextStatus = STATE_TRANSITIONS[currentStatus]
        if (!nextStatus) return

        // For UNDER_REVIEW → PENALTY_PENDING, require penalty amount input
        if (currentStatus === 'UNDER_REVIEW') {
            setPenaltyModal({ caseId, nextStatus })
            setPenaltyInput('')
            return
        }
        await submitStatusUpdate(caseId, nextStatus, null)
    }

    const submitStatusUpdate = async (caseId: string, nextStatus: string, penaltyAmount: number | null) => {
        setActionLoading(true)
        try {
            const body: any = { status: nextStatus }
            if (penaltyAmount !== null) body.penalty_amount = penaltyAmount

            const res = await fetch(`/api/v1/enforcement/${caseId}/status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                const updated = await res.json()
                setCases(prev => prev.map(c => c.id === caseId ? updated : c))
                toast({ type: 'success', message: `Case formally moved to ${nextStatus}` })
            } else {
                const err = await res.json()
                toast({ type: "error", message: "Failed to update case: " + (err.detail || 'Server error') })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.enforcement_update") })
        } finally {
            setActionLoading(false)
            setPenaltyModal(null)
        }
    }

    const handlePenaltySubmit = () => {
        if (!penaltyModal) return
        const amount = parseFloat(penaltyInput)
        if (isNaN(amount) || amount <= 0) {
            toast({ type: "error", message: t("warning.penalty_amount") })
            return
        }
        submitStatusUpdate(penaltyModal.caseId, penaltyModal.nextStatus, amount)
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('error.escalationApiOffline')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Unable to connect to dynamic enforcement service.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchCases}>
                    <RefreshCw className="w-4 h-4 mr-2" />{t('error.retryEngineConnection')}</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2.5">
                        <Scale className="w-6 h-6 text-[#2563EB]" />
                        {t('enforcement.enforcementDocket')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{t('enforcement.subtitle')}</p>
                </div>
                <Button variant="outline" size="sm" className="h-9 px-3 border-border shadow-xs text-xs font-medium" onClick={fetchCases} disabled={loading}>
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                    {t('enforcement.syncDatabase')}
                </Button>
            </div>

            {/* Penalty Amount Dialog */}
            <Dialog open={penaltyModal !== null} onOpenChange={(v) => { if (!v) setPenaltyModal(null) }}>
                <DialogContent className="sm:max-w-[440px] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            {t('enforcement.issuePenaltyAssessment')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground pt-1">
                            {t('enforcement.enterPenaltyAmount')}<strong className="text-foreground ml-1">PENALTY_PENDING</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('enforcement.penaltyAmountLabel')}</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={penaltyInput}
                                    onChange={e => setPenaltyInput(e.target.value)}
                                    className="h-10 pl-7 font-mono text-base font-semibold"
                                    placeholder={t('enforcement.egPenaltyAmount')}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4 border-t border-border/60 pt-3">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setPenaltyModal(null)} disabled={actionLoading}>{t('common.cancel')}</Button>
                        <Button size="sm" className="h-8 px-4 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs" onClick={handlePenaltySubmit} disabled={actionLoading}>
                            {actionLoading ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                            {t("enforcement.issuePenalty")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                        {t('enforcement.activeCaseDirectory')}
                        {cases.length > 0 && (
                            <span className="text-xs font-mono font-normal text-muted-foreground">({cases.length})</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 pl-5">{t('enforcement.caseId')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('enforcement.referenceReinspection')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right">{t('enforcement.penaltyAssessed')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-5">{t('common.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && cases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2563EB]" />
                                            <span className="text-xs font-medium">{t('enforcement.loadingRecords')}</span>
                                        </TableCell>
                                    </TableRow>
                                ) : cases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                                            <CheckCircle className="w-8 h-8 mb-2.5 mx-auto text-green-600/40" />
                                            <p className="text-sm font-semibold text-foreground">{t('enforcement.noCases')}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">No formal statutory penalty actions or escalations currently active.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cases.map((c, i) => {
                                        const nextStatus = STATE_TRANSITIONS[c.status]
                                        const actionLabel = STATE_LABEL[c.status]
                                        return (
                                            <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                                <TableCell className="font-mono text-xs font-semibold text-[#0B1F3A] dark:text-blue-400 py-3.5 pl-5">
                                                    {c.id.substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground py-3.5">
                                                    {c.reinspection_id?.substring(0, 8).toUpperCase() || '—'}
                                                </TableCell>
                                                <TableCell className="text-center py-3.5">
                                                    <Badge variant="outline" className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold border ${STATUS_COLOR[c.status] || 'border-border text-foreground'}`}>
                                                        {translateComplianceStatus(c.status, language)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-3.5 font-mono text-xs font-bold text-foreground">
                                                    {c.penalty_amount ? `₹${c.penalty_amount.toLocaleString()}` : <span className="text-muted-foreground font-normal opacity-50">—</span>}
                                                </TableCell>
                                                <TableCell className="text-right py-3.5 pr-5">
                                                    <div className="flex gap-2 justify-end items-center">
                                                        <Link href={`/officer/reports/${c.id}`} target="_blank">
                                                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium border-border hover:bg-muted">
                                                                <FileText className="w-3.5 h-3.5 mr-1" />{t('enforcement.auditHistory')}
                                                            </Button>
                                                        </Link>
                                                        {nextStatus ? (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-3 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs shadow-xs"
                                                                disabled={actionLoading}
                                                                onClick={() => handleAdvanceState(c.id, c.status)}
                                                            >
                                                                {t(actionLabel)} <ArrowRight className="w-3 h-3 ml-1" />
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs font-semibold px-2 py-1 text-green-700 dark:text-green-400 flex items-center">
                                                                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />{t('enforcement.concluded')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
