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

// Map raw backend field names to i18n keys
const FIELD_LABEL_MAP: Record<string, string> = {
    CONSUMER_CARE: 'fields.CONSUMER_CARE',
    NET_QUANTITY: 'fields.NET_QUANTITY',
    PRODUCT_NAME: 'fields.PRODUCT_NAME',
    MRP: 'fields.MRP',
    MANUFACTURER_NAME: 'fields.MANUFACTURER_NAME',
    MANUFACTURER_ADDRESS: 'fields.MANUFACTURER_ADDRESS',
    COUNTRY_OF_ORIGIN: 'fields.COUNTRY_OF_ORIGIN',
    BATCH_NUMBER: 'fields.BATCH_NUMBER',
    DATE_OF_MANUFACTURE: 'fields.DATE_OF_MANUFACTURE',
    BEST_BEFORE: 'fields.BEST_BEFORE',
    ISI_MARK: 'fields.ISI_MARK',
    FSSAI: 'fields.FSSAI',
    WEIGHT: 'fields.WEIGHT',
    DIMENSIONS: 'fields.DIMENSIONS',
}

function formatViolations(raw: string, t: (key: string) => string): string {
    if (!raw) return ''
    return raw
        .split(',')
        .map(v => {
            const key = FIELD_LABEL_MAP[v.trim()]
            return key ? t(key) : v.trim()
        })
        .join(', ')
}

export default function NoticesPage() {
    const { t } = useTranslation()
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
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#2563EB]" />{t('notices.title')}</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">{t('notices.subtitle')}</p>
                </div>
                <Button variant="outline" className="border-border shadow-sm h-11 px-6 font-semibold" onClick={fetchNotices}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />{t('common.refreshFeed')}</Button>
            </div>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">{t("notices.dashboardTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border">
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('notices.noticeIdentifier')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('notices.inspectionOrigin')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('notices.violationDetails')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">{t('common.oversightAction')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                            <span className="text-sm">{t('notices.loadingRecords')}</span>
                                        </TableCell>
                                    </TableRow>
                                ) : notices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <ShieldCheck className="w-8 h-8 mb-3 mx-auto opacity-20 text-success" />
                                            <p className="text-sm font-medium">{t('notices.noNotices')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notices.map((n, i) => (
                                        <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                            <TableCell className="font-mono text-sm font-bold text-[#0B1F3A] dark:text-blue-400 py-4">
                                                {n.id.substring(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground py-4">
                                                {n.inspection_id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}
                                            </TableCell>
                                            <TableCell className="text-sm py-4 max-w-[200px] truncate text-foreground font-medium">
                                                {formatViolations(n.violations, t)}
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${n.status === 'ISSUED' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10' :
                                                        n.status === 'RECTIFICATION_SUBMITTED' ? 'border-blue-200 text-primary bg-primary/10 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10' :
                                                            'border-green-200 text-success-foreground bg-success/10 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'}`}>
                                                    {t('status.' + (n.status || 'UNKNOWN'))}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs" onClick={() => setSelectedNotice(n)}>
                                                        <Eye className="w-3.5 h-3.5 mr-1.5" />{t('common.view')}</Button>
                                                    {n.status === 'RECTIFICATION_SUBMITTED' ? (
                                                        <>
                                                            <Button size="sm" className="h-8 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs" onClick={() => reviewNotice(n.id, 'RESOLVED')} disabled={actionLoading}>{t('common.approve')}</Button>
                                                            <Button size="sm" className="h-8 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold text-xs" onClick={() => scheduleReinspection(n.inspection_id, n.id)} disabled={actionLoading}>
                                                                <CalendarClock className="w-3 h-3 mr-1.5" />{t('notices.scheduleRecheck')}</Button>
                                                        </>
                                                    ) : n.status === 'RESOLVED' ? (
                                                        <Button size="sm" variant="ghost" disabled className="h-8 text-xs font-semibold px-4 opacity-50">{t("status.CLOSED")}</Button>
                                                    ) : n.status === 'REINSPECTION_PENDING' ? (
                                                        <Button size="sm" variant="ghost" disabled className="h-8 text-xs font-semibold px-4 opacity-50 text-primary">{t("notices.pendingSetup")}</Button>
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
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#2563EB]" />{t('notices.officialNoticeDossier')}</DialogTitle>
                        <DialogDescription>{t('notices.dossierDesc')}</DialogDescription>
                    </DialogHeader>
                    {selectedNotice && (
                        <div className="space-y-4 pt-4 text-sm mt-2">

                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">{t("notices.systemId")}</span>
                                <span className="col-span-2 font-mono text-[#0B1F3A] dark:text-blue-300 font-bold">{selectedNotice.id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">{t("notices.inspectionRef")}</span>
                                <span className="col-span-2 font-mono">{selectedNotice.inspection_id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">{t("notices.currentStatus")}</span>
                                <span className="col-span-2 font-semibold">
                                    <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${selectedNotice.status === 'ISSUED' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                            selectedNotice.status === 'RECTIFICATION_SUBMITTED' ? 'border-blue-200 text-primary bg-primary/10' :
                                                'border-green-200 text-success-foreground bg-success/10'}`}>
                                        {t('status.' + (selectedNotice.status || 'UNKNOWN'))}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">{t("notices.violationLog")}</span>
                                <span className="col-span-2 text-destructive font-medium leading-relaxed">{formatViolations(selectedNotice.violations, t) || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">{t("notices.requiredFix")}</span>
                                <span className="col-span-2 font-medium">{selectedNotice.corrective_action || t('notices.manufacturerVerificationNeeded')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">{t("notices.complianceBy")}</span>
                                <span className="col-span-2 font-mono font-bold text-orange-700">
                                    {selectedNotice.due_date ? new Date(selectedNotice.due_date).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-6 border-t border-border pt-4">
                        <Button variant="outline" onClick={() => setSelectedNotice(null)}>{t("notices.dismissDossier")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
