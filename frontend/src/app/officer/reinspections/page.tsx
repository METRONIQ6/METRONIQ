"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServerCrash, RefreshCw, ListChecks, ArrowUpRight, Search, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from '@/i18n'
import { translateComplianceStatus } from '@/lib/complianceI18n'

export default function ReinspectionsPage() {
    const { t, language } = useTranslation()
    const { toast } = useToast()

    const [reinspections, setReinspections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchReinspections = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/v1/reinspections', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setReinspections(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.reinspection_queue") })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchReinspections()
    }, [])

    const escalateReinspection = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`/api/v1/enforcement/escalate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reinspection_id: id })
            })
            if (res.ok || res.status === 409) {
                setReinspections(prev => prev.map(r => r.id === id ? { ...r, status: 'ESCALATED' } : r))
                toast({ type: 'success', message: t("success.reinspection_escalated") })
            } else {
                const err = await res.json()
                toast({ type: "error", message: "Escalation failed: " + err.detail })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.escalation_comm") })
        } finally {
            setActionLoading(null)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('error.apiConnectionDisrupted')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">{t('officerUI.reinspectionUnreachable')}</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchReinspections}>
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
                        <ListChecks className="w-6 h-6 text-[#2563EB]" />
                        {t('navigation.reinspections')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Verify corrective rectifications and escalate persistent non-compliance to enforcement dockets.
                    </p>
                </div>
                <Button variant="outline" size="sm" className="h-9 px-3 border-border shadow-xs text-xs font-medium" onClick={fetchReinspections} disabled={loading}>
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                    {t('common.refreshFeed')}
                </Button>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                        {t('reinspections.activeVerifications')}
                        {reinspections.length > 0 && (
                            <span className="text-xs font-mono font-normal text-muted-foreground">({reinspections.length})</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 pl-5">{t('reinspections.taskIdentifier')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('reinspections.originalAuditRef')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('reinspections.assignee')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-5">{t('reinspections.executionAction')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2563EB]" />
                                            <span className="text-xs font-medium">{t('officerUI.loadingQueues')}</span>
                                        </TableCell>
                                    </TableRow>
                                ) : reinspections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                                            <ClipboardList className="w-8 h-8 mb-2.5 mx-auto text-muted-foreground/40" />
                                            <p className="text-sm font-semibold text-foreground">{t('officerUI.reinspectionQueueEmpty')}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{t('officerUI.reinspectionQueueClear')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reinspections.map((r, i) => (
                                        <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                            <TableCell className="font-mono text-xs font-semibold text-[#0B1F3A] dark:text-blue-400 py-3.5 pl-5">
                                                {r.id.substring(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground py-3.5">
                                                {r.original_inspection_id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}
                                            </TableCell>
                                            <TableCell className="text-center py-3.5">
                                                <Badge variant="outline" className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold border ${
                                                    r.status === 'SCHEDULED' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/10' :
                                                    r.status === 'ESCALATED' ? 'border-red-200 text-destructive bg-destructive/10 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10' :
                                                    'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'
                                                }`}>
                                                    {translateComplianceStatus(r.status, language)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs py-3.5 text-foreground font-medium">{t('reinspections.selfAssigned')}</TableCell>
                                            <TableCell className="text-right py-3.5 pr-5">
                                                <div className="flex gap-2 justify-end items-center">
                                                    {r.status === 'SCHEDULED' ? (
                                                        <Link href={`/officer/scanner?reinspection=${r.id}`}>
                                                            <Button size="sm" className="h-7 px-3 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs shadow-xs">
                                                                <Search className="w-3 h-3 mr-1" />
                                                                {t('reinspections.scanProtocol')}
                                                            </Button>
                                                        </Link>
                                                    ) : r.status === 'COMPLETED' ? (
                                                        <>
                                                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium border-border hover:bg-muted">
                                                                {t('common.view')}
                                                            </Button>
                                                            <Button size="sm" className="h-7 px-3 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold text-xs shadow-xs"
                                                                disabled={actionLoading === r.id} onClick={() => escalateReinspection(r.id)}>
                                                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                                                {t('reinspections.escalate')}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-semibold px-2 py-1 text-muted-foreground opacity-60">{t('reinspections.archived')}</span>
                                                    )}
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
        </div>
    )
}
