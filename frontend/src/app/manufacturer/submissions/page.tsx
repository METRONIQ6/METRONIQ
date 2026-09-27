
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function SubmissionsPage() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [subs, setSubs] = useState<any[]>([])

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/manufacturer/submissions', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(async r => {
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

    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t('manufacturer.submissions.title') || 'Government Submissions'}</h2>
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('manufacturer.submissions.id') || 'Submission ID'}</TableHead>
                                <TableHead>{t('manufacturer.submissions.product') || 'Product'}</TableHead>
                                <TableHead>{t('manufacturer.submissions.date') || 'Date'}</TableHead>
                                <TableHead>{t('manufacturer.submissions.status') || 'Status'}</TableHead>
                                <TableHead>{t('manufacturer.submissions.comments') || 'Comments'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!subs || !Array.isArray(subs) || subs.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-10 h-10 mb-3 opacity-20" />
                                            <p className="font-semibold text-foreground">{t('manufacturer.submissions.noSubmissions') || 'No submissions yet'}</p>
                                            <p className="text-sm">Submit your products for compliance review to see them here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {(Array.isArray(subs) ? subs : []).map(s => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.id.slice(0, 8)}</TableCell>
                                    <TableCell>{s.product_name}</TableCell>
                                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge>{t(`manufacturer.status.${s.status}`) || s.status}</Badge></TableCell>
                                    <TableCell>{s.comments || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
