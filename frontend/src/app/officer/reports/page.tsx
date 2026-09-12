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

export default function ReportsPage() {
    const { t } = useTranslation();
    const { toast } = useToast()
    const [cases, setCases] = React.useState<any[]>([])

    React.useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/enforcement', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) setCases(await res.json())
            } catch (e) { toast({ type: "error", message: t("error.network_server") }) }
        }
        fetchCases()
    }, [])

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">{t('reports.auditReportsHub')}</h2>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('enforcement.caseId')}</TableHead>
                            <TableHead>{t('common.status')}</TableHead>
                            <TableHead>{t('common.action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No enforcement audit reports available.</TableCell>
                            </TableRow>
                        )}
                        {cases.map((c, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-mono text-xs">{c.id.substring(0, 8)}...</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {c.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Link href={`/officer/reports/${c.id}`} target="_blank">
                                        <Button size="sm" variant="secondary">{t('reports.viewFullReport')}</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
