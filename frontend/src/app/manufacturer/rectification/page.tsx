
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function RectificationCenter() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/manufacturer/rectifications', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(async r => {
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
        await fetch(`http://localhost:8000/api/v1/manufacturer/rectifications/${id}/submit`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${getToken()}` } })
        window.location.reload()
    }

    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t('manufacturer.rectification.title') || 'Rectification Center'}</h2>
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task ID</TableHead>
                                <TableHead>{t('manufacturer.rectification.issue') || 'Issue'}</TableHead>
                                <TableHead>{t('manufacturer.rectification.requiredAction') || 'Action Required'}</TableHead>
                                <TableHead>{t('manufacturer.submissions.status') || 'Status'}</TableHead>
                                <TableHead>{t('manufacturer.actions.actions') || 'Action'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!tasks || !Array.isArray(tasks) || tasks.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="bg-muted/50 p-6 rounded-full inline-block">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
                                            </div>
                                            <h3 className="text-xl font-semibold tracking-tight text-foreground">{t('manufacturer.rectification.emptyTitle') || 'No Rectification Items'}</h3>
                                            <p className="text-sm text-muted-foreground font-medium max-w-md">{t('manufacturer.rectification.emptyDesc') || 'No products or submissions currently require rectification.'}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (Array.isArray(tasks) ? tasks : []).map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.id.slice(0, 8)}</TableCell>
                                        <TableCell>{task.issue}</TableCell>
                                        <TableCell>{task.required_action}</TableCell>
                                        <TableCell><Badge>{t(`manufacturer.status.${task.status}`) || task.status}</Badge></TableCell>
                                        <TableCell>
                                            {task.status === 'PENDING' && (
                                                <div className="flex gap-2 items-center">
                                                    <input type="file" id={`file-${task.id}`} className="text-xs" />
                                                    <Button size="sm" onClick={() => submitTask(task.id, (document.getElementById(`file-${task.id}`) as HTMLInputElement)?.files?.[0] || null)}>
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
