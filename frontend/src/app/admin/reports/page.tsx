"use client";
import { useTranslation } from '@/i18n'
import React from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { FileText } from 'lucide-react'
import { translateComplianceStatus, translateRiskScore } from '@/lib/complianceI18n'

export default function ReportsPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast()
    const [reports, setReports] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/v1/reports', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) setReports(await res.json())
            } catch (e) { toast({ type: "error", message: t("error.network_server") }) }
            finally { setLoading(false) }
        }
        fetchReports()
    }, [])

    const getBadgeVariant = (result: string) => {
        if (result === 'PASS' || result === 'COMPLIANT') return 'default'
        if (result === 'FAIL' || result === 'NON_COMPLIANT') return 'destructive'
        return 'outline'
    }

    return (
        <div className="space-y-6 max-w-7xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2.5">
                        <FileText className="w-6 h-6 text-[#2563EB]" />
                        {t('reports.auditReportsHub')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        National inspection records, statutory audit reports and formal compliance documentation.
                    </p>
                </div>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/30">
                    <CardTitle className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                        {t('reports.auditReportsHub')}
                        {reports.length > 0 && (
                            <span className="text-xs font-mono font-normal text-muted-foreground">({reports.length})</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 pl-5">{t('enforcement.caseId') || 'Report ID'}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('common.status')}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Result</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Risk</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Date</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-5">{t('common.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <span className="text-xs font-medium">Loading reports...</span>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && reports.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-14 text-muted-foreground">
                                            <FileText className="w-8 h-8 mb-2.5 mx-auto text-muted-foreground/40" />
                                            <p className="text-sm font-semibold text-foreground">No system-wide audit reports available</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Statutory inspection reports across all regional jurisdictions will populate here.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {reports.map((r, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-xs font-semibold text-[#0B1F3A] dark:text-blue-400 py-3.5 pl-5">
                                            {r.id.substring(0, 10).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            <Badge variant="outline" className="font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold">
                                                {translateComplianceStatus(r.status || 'FINAL', language)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            {r.result === 'PASS' || r.result === 'COMPLIANT' ? (
                                                <Badge variant="success" className="text-xs font-semibold">
                                                    {translateComplianceStatus(r.result, language)}
                                                </Badge>
                                            ) : r.result === 'FAIL' || r.result === 'NON_COMPLIANT' ? (
                                                <Badge variant="destructive" className="text-xs font-semibold">
                                                    {translateComplianceStatus(r.result, language)}
                                                </Badge>
                                            ) : (
                                                <Badge variant="neutral" className="text-xs font-semibold">
                                                    {translateComplianceStatus(r.result || 'PENDING', language)}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            <span className={`text-xs font-mono font-bold uppercase ${
                                                r.risk_level === 'HIGH' ? 'text-destructive' : r.risk_level === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                                {translateRiskScore(r.risk_level, language)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground py-3.5">
                                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right py-3.5 pr-5">
                                            <Link href={`/admin/reports/${r.id}`} target="_blank">
                                                <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium border-border hover:bg-muted">
                                                    <FileText className="w-3.5 h-3.5 mr-1" />
                                                    {t('reports.viewFullReport')}
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
