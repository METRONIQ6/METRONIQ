
"use client"
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function NoticesCenter() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [notices, setNotices] = useState<any[]>([])
    useEffect(() => {
        fetch('/api/v1/manufacturer/notices', { headers: { 'Authorization': `Bearer ${getToken()}` }}).then(async r => {
                if (!r.ok) {
                    const errPayload = await r.json().catch(()=>({}));
                    setErrorKey(mapManufacturerError(r.status, errPayload.detail || errPayload.message));
                    return null;
                }
                return r.json();
            }).then(d => {
                if (d) setNotices(d.detail ? [] : (Array.isArray(d) ? d : (d.data || d)))
            }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [])
    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Government Notices</h2>
            <Card>
                <div className="overflow-x-auto">
<Table>
                    <TableHeader><TableRow><TableHead>Notice ID</TableHead><TableHead>Violations</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {(!notices || !Array.isArray(notices) || notices.length === 0) && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No regulatory notices</TableCell></TableRow>}
                        {(Array.isArray(notices) ? notices : []).map(n => (
                            <TableRow key={n.id}>
                                <TableCell>{n.id.slice(0,8)}</TableCell>
                                <TableCell>{n.violations}</TableCell>
                                <TableCell><Badge>{n.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
</div>
            </Card>
        </div>
    )
}
