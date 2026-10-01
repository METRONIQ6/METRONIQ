"use client";
import { useTranslation } from '@/i18n'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, ServerCrash, RefreshCw, Archive, Search, ArrowRight } from 'lucide-react'
import { getToken } from '@/lib/auth'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import { translateComplianceStatus } from '@/lib/complianceI18n'

export default function InspectionsPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast()
    const [inspections, setInspections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchInspections = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/v1/inspections', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setInspections(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.inspection_fetch") })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInspections()
    }, [])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('error.apiConnectionDisrupted')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">{t('officerUI.inspectionUnreachable')}</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchInspections}>
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
                        <Archive className="w-6 h-6 text-[#2563EB]" />
                        {t('inspection.inspectionDirectory')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Historical statutory audit log for legal metrology compliance enforcement.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-9 px-3 border-border shadow-xs text-xs font-medium" onClick={fetchInspections} disabled={loading}>
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t('common.refreshFeed') || 'Refresh'}
                    </Button>
                    <Link href="/officer/scanner">
                        <Button size="sm" className="h-9 px-4 font-semibold bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white shadow-xs text-xs">
                            <Search className="w-3.5 h-3.5 mr-1.5" />
                            {t('inspection.newScan')}
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                        {t('inspection.systemRecords')}
                        {inspections.length > 0 && (
                            <span className="text-xs font-mono font-normal text-muted-foreground">({inspections.length})</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 pl-5">{t('inspection.auditIdentifier')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('common.status')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('scanner.complianceResult')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('inspection.riskLevel')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-5">{t('common.oversightAction')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2563EB]" />
                                            <span className="text-xs font-medium">{t('officerUI.retrievingRecords')}</span>
                                        </TableCell>
                                    </TableRow>
                                ) : inspections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                                            <Archive className="w-8 h-8 mb-2.5 mx-auto text-muted-foreground/40" />
                                            <p className="text-sm font-semibold text-foreground">{t('officerUI.noInspectionsRecorded')}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">{t('officerUI.noInspectionsNode')}</p>
                                            <Link href="/officer/scanner" className="inline-block mt-4">
                                                <Button size="sm" variant="outline" className="h-8 text-xs font-medium">
                                                    <Search className="w-3.5 h-3.5 mr-1.5" />
                                                    {t('inspection.newScan')}
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inspections.map((ins, i) => (
                                        <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                            <TableCell className="font-mono text-xs font-semibold text-[#0B1F3A] dark:text-blue-400 py-3.5 pl-5">
                                                {ins.id.substring(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                <Badge variant="outline" className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold border ${
                                                    ins.status === 'COMPLETED' ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10' :
                                                    'border-border text-muted-foreground'
                                                }`}>
                                                    {translateComplianceStatus(ins.status || 'PENDING', language)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                {ins.result === 'PASS' || ins.result === 'COMPLIANT' ? (
                                                    <Badge variant="success" className="text-xs font-semibold">
                                                        {translateComplianceStatus(ins.result, language)}
                                                    </Badge>
                                                ) : ins.result === 'FAIL' || ins.result === 'NON_COMPLIANT' ? (
                                                    <Badge variant="destructive" className="text-xs font-semibold">
                                                        {translateComplianceStatus(ins.result, language)}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="neutral" className="text-xs font-semibold">
                                                        {translateComplianceStatus(ins.result || 'PENDING', language)}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center py-3.5">
                                                <span className={`font-mono text-xs font-bold ${
                                                    ins.risk_level > 70 ? 'text-destructive' : ins.risk_level > 30 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                    {ins.risk_level !== undefined ? `${ins.risk_level}%` : '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right py-3.5 pr-5">
                                                <Link href={`/officer/reports/${ins.id}`} target="_blank">
                                                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium border-border hover:bg-muted">
                                                        <FileText className="w-3.5 h-3.5 mr-1" />
                                                        {t('inspection.fullAudit')}
                                                        <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </Link>
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
