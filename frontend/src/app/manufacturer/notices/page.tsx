
"use client"
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

import { FileWarning, ShieldCheck } from 'lucide-react'

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
                    <FileWarning className="w-6 h-6 text-[#2563EB]" />
                    Government Notices
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Statutory show-cause notices and advisory communications issued by Legal Metrology regulatory authorities.
                </p>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-muted/20">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">Notice ID</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">Violations</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!notices || !Array.isArray(notices) || notices.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-16 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">No Regulatory Notices</p>
                                            <p className="text-xs text-muted-foreground">Your manufacturing unit is currently in full statutory standing.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (Array.isArray(notices) ? notices : []).map(n => (
                                    <TableRow key={n.id} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-xs font-semibold text-foreground py-3">{n.id.slice(0,8).toUpperCase()}</TableCell>
                                        <TableCell className="text-sm font-medium text-foreground py-3">{n.violations}</TableCell>
                                        <TableCell className="text-center py-3">
                                            <Badge variant={n.status === 'RESOLVED' ? 'success' : (n.status === 'PENDING' ? 'warning' : 'destructive')} className="font-mono text-xs uppercase">
                                                {n.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
