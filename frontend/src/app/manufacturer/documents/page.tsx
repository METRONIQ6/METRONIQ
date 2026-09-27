
"use client"
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function DocumentCenter() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [docs, setDocs] = useState<any[]>([])
    useEffect(() => {
        fetch('/api/v1/manufacturer/documents', { headers: { 'Authorization': `Bearer ${getToken()}` }}).then(async r => {
                if (!r.ok) {
                    const errPayload = await r.json().catch(()=>({}));
                    setErrorKey(mapManufacturerError(r.status, errPayload.detail || errPayload.message));
                    return null;
                }
                return r.json();
            }).then(d => {
                if (d) setDocs(d.detail ? [] : (Array.isArray(d) ? d : (d.data || d)))
            }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [])
    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Document Center</h2>
            <Card>
                <div className="overflow-x-auto">
<Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>{t('manufacturer.documents.category')}</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {(!docs || !Array.isArray(docs) || docs.length === 0) && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No documents</TableCell></TableRow>}
                        {(Array.isArray(docs) ? docs : []).map(d => (
                            <TableRow key={d.id}>
                                <TableCell>{d.title}</TableCell>
                                <TableCell>{d.category}</TableCell>
                                <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
</div>
            </Card>
        </div>
    )
}
