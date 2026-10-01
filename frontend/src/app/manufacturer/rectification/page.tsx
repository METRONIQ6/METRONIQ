
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

import { AlertTriangle, CheckCircle2, FileUp } from 'lucide-react'

export default function RectificationCenter() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/v1/manufacturer/rectifications', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(async r => {
            if (!r.ok) {
                const errPayload = await r.json().catch(() => ({}));
                setErrorKey(mapManufacturerError(r.status, errPayload.detail || errPayload.message));
                return null;
            }
            return r.json();
        }).then(d => {
            if (d) setTasks(d.detail ? [] : (Array.isArray(d) ? d : (d.data || d)))
        }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [])

    const submitTask = async (id: string, file: File | null) => {
        const fd = new FormData();
        if (file) fd.append('file', file)
        await fetch(`/api/v1/manufacturer/rectifications/${id}/submit`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${getToken()}` } })
        window.location.reload()
    }

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
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    {t('manufacturer.rectification.title') || 'Rectification Center'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Correct non-compliant labeling declarations and submit proof of rectification for officer clearance.
                </p>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-muted/20">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('rectification.taskId')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.rectification.issue') || 'Issue'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.rectification.requiredAction') || 'Action Required'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">{t('manufacturer.submissions.status') || 'Status'}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-right">{t('manufacturer.actions.actions') || 'Action'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!tasks || !Array.isArray(tasks) || tasks.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-sm font-semibold tracking-tight text-foreground">{t('manufacturer.rectification.emptyTitle') || 'No Rectification Items'}</h3>
                                            <p className="text-xs text-muted-foreground max-w-sm">{t('manufacturer.rectification.emptyDesc') || 'No products or submissions currently require rectification.'}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (Array.isArray(tasks) ? tasks : []).map(task => (
                                    <TableRow key={task.id} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-xs font-semibold text-foreground py-3">{task.id.slice(0, 8).toUpperCase()}</TableCell>
                                        <TableCell className="text-sm font-medium text-foreground py-3">{task.issue}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-3">{task.required_action}</TableCell>
                                        <TableCell className="text-center py-3">
                                            <Badge variant={task.status === 'RESOLVED' ? 'success' : (task.status === 'PENDING' ? 'warning' : 'neutral')} className="font-mono text-xs uppercase">
                                                {t(`manufacturer.status.${task.status}`) || task.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-3">
                                            {task.status === 'PENDING' && (
                                                <div className="flex gap-2 items-center justify-end">
                                                    <input type="file" id={`file-${task.id}`} className="text-xs max-w-[160px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted file:text-foreground" />
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => submitTask(task.id, (document.getElementById(`file-${task.id}`) as HTMLInputElement)?.files?.[0] || null)}
                                                        className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white h-8 text-xs font-medium"
                                                    >
                                                        <FileUp className="w-3.5 h-3.5 mr-1" />
                                                        {t('manufacturer.rectification.submitProof') || 'Submit Rectification'}
                                                    </Button>
                                                </div>
                                            )}
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
