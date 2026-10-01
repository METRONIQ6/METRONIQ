
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

import { FileCheck } from 'lucide-react'

export default function SubmissionsPage() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [subs, setSubs] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/v1/manufacturer/submissions', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(async r => {
            if (!r.ok) {
                const errPayload = await r.json().catch(() => ({}));
                setErrorKey(mapManufacturerError(r.status, errPayload.detail || errPayload.message));
                return null;
            }
            return r.json();
        }).then(d => {
            if (d) setSubs(d.detail ? [] : (Array.isArray(d) ? d : (d.data || d)))
        }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [])

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
                    <FileCheck className="w-6 h-6 text-[#2563EB]" />
                    {t('manufacturer.submissions.title') || 'Government Submissions'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Formal statutory submissions filed with the Legal Metrology Department for pre-market regulatory approval.
                </p>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-muted/20">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.submissions.id') || 'Submission ID'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.submissions.product') || 'Product'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.submissions.date') || 'Date'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">{t('manufacturer.submissions.status') || 'Status'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.submissions.comments') || 'Comments'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!subs || !Array.isArray(subs) || subs.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-8 h-8 mb-2 opacity-30 text-muted-foreground" />
                                            <p className="text-sm font-medium text-foreground">{t('manufacturer.submissions.noSubmissions') || 'No submissions yet'}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Submit your products for compliance review to track them here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {(Array.isArray(subs) ? subs : []).map(s => (
                                <TableRow key={s.id} className="border-border hover:bg-muted/40 transition-colors">
                                    <TableCell className="font-mono text-xs font-semibold text-foreground py-3">{s.id.slice(0, 8).toUpperCase()}</TableCell>
                                    <TableCell className="text-sm font-medium text-foreground py-3">{s.product_name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground py-3 font-mono">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-center py-3">
                                        <Badge variant={s.status === 'APPROVED' ? 'success' : (s.status === 'CHANGES_REQUIRED' ? 'destructive' : (s.status === 'UNDER_REVIEW' ? 'warning' : 'neutral'))} className="font-mono text-xs uppercase">
                                            {t(`manufacturer.status.${s.status}`) || s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground py-3 max-w-xs truncate">{s.comments || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
