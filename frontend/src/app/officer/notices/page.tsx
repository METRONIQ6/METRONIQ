"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { FileText, ServerCrash, RefreshCw, AlertTriangle, Eye, CalendarClock, ShieldCheck } from 'lucide-react'
import { getToken } from '@/lib/auth'

import { useTranslation } from '@/i18n'
import { useToast } from "@/components/ui/use-toast"
import { translateField, translateComplianceStatus } from '@/lib/complianceI18n'

function formatViolations(raw: string, lang: string = 'en'): string {
    if (!raw) return ''
    return raw
        .split(',')
        .map(v => translateField(v.trim(), lang as any))
        .join(', ')
}

export default function NoticesPage() {
    const { t, language } = useTranslation()
    const { toast } = useToast()

    const [notices, setNotices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedNotice, setSelectedNotice] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchNotices = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/v1/notices', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setNotices(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.notices_fetch") })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchNotices()
    }, [])

    const reviewNotice = async (id: string, action: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/v1/notices/${id}/review?status=${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setNotices(prev => prev.map(n => n.id === id ? { ...n, status: action } : n))
                toast({ type: 'success', message: `Notice status updated to ${action}.` })
            } else {
                toast({ type: "error", message: t("error.notice_decline") })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.system_transmission") })
        } finally {
            setActionLoading(false)
            setSelectedNotice(null)
        }
    }

    const scheduleReinspection = async (orig_id: string, notice_id: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/v1/reinspections/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ original_inspection_id: orig_id, notice_id: notice_id })
            })
            if (res.ok) {
                toast({ type: 'success', message: t("success.reinspection") })
                await reviewNotice(notice_id, 'REINSPECTION_PENDING')
            } else {
                toast({ type: "error", message: t("error.reinspection_docket") })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.system_engine") })
        } finally {
            setActionLoading(false)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t("error.failedLoad")}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">{t("error.unresponsive")}</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchNotices}>
                    <RefreshCw className="w-4 h-4 mr-2" />{t('error.retryConnection')}</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2.5">
                        <FileText className="w-6 h-6 text-[#2563EB]" />
                        {t('notices.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{t('notices.subtitle')}</p>
                </div>
                <Button variant="outline" size="sm" className="h-9 px-3 border-border shadow-xs text-xs font-medium" onClick={fetchNotices} disabled={loading}>
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                    {t('common.refreshFeed')}
                </Button>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                        {t("notices.dashboardTitle")}
                        {notices.length > 0 && (
                            <span className="text-xs font-mono font-normal text-muted-foreground">({notices.length})</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 pl-5">{t('notices.noticeIdentifier')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('notices.inspectionOrigin')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('notices.violationDetails')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-5">{t('common.oversightAction')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2563EB]" />
                                            <span className="text-xs font-medium">{t('notices.loadingRecords')}</span>
                                        </TableCell>
                                    </TableRow>
                                ) : notices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                                            <ShieldCheck className="w-8 h-8 mb-2.5 mx-auto text-green-600/40" />
                                            <p className="text-sm font-semibold text-foreground">{t('notices.noNotices')}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">No pending regulatory non-compliance notices on record.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notices.map((n, i) => (
                                        <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                            <TableCell className="font-mono text-xs font-semibold text-[#0B1F3A] dark:text-blue-400 py-3.5 pl-5">
                                                {n.id.substring(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground py-3.5">
                                                {n.inspection_id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}
                                            </TableCell>
                                            <TableCell className="text-xs py-3.5 max-w-[280px] truncate text-foreground font-medium">
                                                {formatViolations(n.violations, language)}
                                            </TableCell>
                                            <TableCell className="text-center py-3.5">
                                                <Badge variant="outline" className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold border ${
                                                    n.status === 'ISSUED' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/10' :
                                                    n.status === 'RECTIFICATION_SUBMITTED' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10' :
                                                    'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'
                                                }`}>
                                                    {translateComplianceStatus(n.status || 'UNKNOWN', language)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-3.5 pr-5">
                                                <div className="flex gap-2 justify-end items-center">
                                                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium border-border hover:bg-muted" onClick={() => setSelectedNotice(n)}>
                                                        <Eye className="w-3.5 h-3.5 mr-1" />{t('common.view')}
                                                    </Button>
                                                    {n.status === 'RECTIFICATION_SUBMITTED' ? (
                                                        <>
                                                            <Button size="sm" className="h-7 px-3 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs" onClick={() => reviewNotice(n.id, 'RESOLVED')} disabled={actionLoading}>
                                                                {t('common.approve')}
                                                            </Button>
                                                            <Button size="sm" className="h-7 px-3 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold text-xs" onClick={() => scheduleReinspection(n.inspection_id, n.id)} disabled={actionLoading}>
                                                                <CalendarClock className="w-3 h-3 mr-1" />{t('notices.scheduleRecheck')}
                                                            </Button>
                                                        </>
                                                    ) : n.status === 'RESOLVED' ? (
                                                        <span className="text-xs font-semibold px-2 py-1 text-muted-foreground opacity-60">{t("status.CLOSED")}</span>
                                                    ) : n.status === 'REINSPECTION_PENDING' ? (
                                                        <span className="text-xs font-semibold px-2 py-1 text-[#2563EB]">{t("notices.pendingSetup")}</span>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
                <DialogContent className="sm:max-w-[560px] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#2563EB]" />
                            {t('notices.officialNoticeDossier')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">{t('notices.dossierDesc')}</DialogDescription>
                    </DialogHeader>
                    {selectedNotice && (
                        <div className="space-y-3 pt-3 text-xs mt-2 border-t border-border/60">
                            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider">{t("notices.systemId")}</span>
                                <span className="col-span-2 font-mono text-[#0B1F3A] dark:text-blue-300 font-bold">{selectedNotice.id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider">{t("notices.inspectionRef")}</span>
                                <span className="col-span-2 font-mono">{selectedNotice.inspection_id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider">{t("notices.currentStatus")}</span>
                                <span className="col-span-2 font-semibold">
                                    <Badge variant="outline" className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold border ${
                                        selectedNotice.status === 'ISSUED' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/10' :
                                        selectedNotice.status === 'RECTIFICATION_SUBMITTED' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10' :
                                        'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'
                                    }`}>
                                        {translateComplianceStatus(selectedNotice.status || 'UNKNOWN', language)}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider">{t("notices.violationLog")}</span>
                                <span className="col-span-2 text-destructive font-medium leading-relaxed">{formatViolations(selectedNotice.violations, language) || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider">{t("notices.requiredFix")}</span>
                                <span className="col-span-2 font-medium">{selectedNotice.corrective_action || t('notices.manufacturerVerificationNeeded')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-2">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider">{t("notices.complianceBy")}</span>
                                <span className="col-span-2 font-mono font-bold text-amber-700 dark:text-amber-400">
                                    {selectedNotice.due_date ? new Date(selectedNotice.due_date).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-4 border-t border-border/60 pt-3">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setSelectedNotice(null)}>{t("notices.dismissDossier")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
