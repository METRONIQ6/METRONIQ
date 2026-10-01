"use client";
import { useTranslation } from '@/i18n'
import React from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
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
        if (result === 'PASS' || result === 'COMPLIANT') return 'success'
        if (result === 'FAIL' || result === 'NON_COMPLIANT') return 'destructive'
        return 'neutral'
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-[#2563EB]" />
                    {t('reports.auditReportsHub')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Statutory audit certifications and compliance verification dossiers generated from automated label reviews.
                </p>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-muted/20">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('enforcement.caseId') || 'Report ID'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">{t('common.status')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">Result</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">Risk</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">Date</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-right">{t('common.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12 animate-pulse text-sm">
                                        Loading reports...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && reports.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                                        No audit reports available. Run a Compliance Audit to generate a report.
                                    </TableCell>
                                </TableRow>
                            )}
                            {reports.map((r, i) => (
                                <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                    <TableCell className="font-mono text-xs font-bold text-foreground py-3">{r.id.slice(0, 8).toUpperCase()}</TableCell>
                                    <TableCell className="text-center py-3">
                                        <Badge variant="neutral" className="font-mono text-xs uppercase">
                                            {translateComplianceStatus(r.status || 'FINAL', language)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <Badge variant={getBadgeVariant(r.result)} className="font-mono text-xs uppercase">
                                            {translateComplianceStatus(r.result || 'PENDING', language)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <span className={`text-xs font-mono font-semibold uppercase ${r.risk_level === 'HIGH' ? 'text-destructive' : r.risk_level === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {translateRiskScore(r.risk_level, language)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground py-3 font-mono">
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right py-3">
                                        <Link href={`/manufacturer/reports/${r.id}`} target="_blank">
                                            <Button size="sm" variant="outline" className="h-8 text-xs font-medium">
                                                {t('reports.viewFullReport')}
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
