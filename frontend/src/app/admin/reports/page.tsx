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

export default function ReportsPage() {
    const { t } = useTranslation();
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
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">{t('reports.auditReportsHub')}</h2>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('enforcement.caseId') || 'Report ID'}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead>Risk</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>{t('common.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6 animate-pulse">Loading reports...</TableCell>
                                </TableRow>
                            )}
                            {!loading && reports.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No system-wide audit reports available.</TableCell>
                                </TableRow>
                            )}
                            {reports.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(r.result)}>
                                            {r.result || 'PENDING'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-semibold uppercase ${r.risk_level === 'HIGH' ? 'text-destructive' : r.risk_level === 'MEDIUM' ? 'text-orange-500' : 'text-green-600'}`}>
                                            {r.risk_level || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/reports/${r.id}`} target="_blank">
                                            <Button size="sm" variant="secondary">{t('reports.viewFullReport')}</Button>
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
