
"use client"
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

import { FolderOpen, FileText } from 'lucide-react'

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
                    <FolderOpen className="w-6 h-6 text-[#2563EB]" />
                    Document Center
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Statutory certificates, test reports, and compliance records archived for regulatory inspection.
                </p>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-muted/20">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">Title</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.documents.category')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!docs || !Array.isArray(docs) || docs.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-16 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
                                                <FileText className="w-5 h-5 opacity-60" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">No Documents Found</p>
                                            <p className="text-xs text-muted-foreground">Uploaded dossiers, declarations, and certificates will appear here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (Array.isArray(docs) ? docs : []).map(d => (
                                    <TableRow key={d.id} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="text-sm font-medium text-foreground py-3">{d.title}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-3">{d.category}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-3 font-mono text-right">{new Date(d.created_at).toLocaleDateString()}</TableCell>
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
