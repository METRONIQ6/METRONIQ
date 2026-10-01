
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

import { History, Clock, FileCheck } from 'lucide-react'

export default function HistoryCenter() {
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [hist, setHist] = useState<any[]>([])
    useEffect(() => {
        fetch('/api/v1/manufacturer/compliance-history', { headers: { 'Authorization': `Bearer ${getToken()}` }}).then(async r => {
                if (!r.ok) {
                    const errPayload = await r.json().catch(()=>({}));
                    setErrorKey(mapManufacturerError(r.status, errPayload.detail || errPayload.message));
                    return null;
                }
                return r.json();
            }).then(d => {
                if (d) setHist(d.detail ? [] : (Array.isArray(d) ? d : (d.data || d)))
            }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [])
    if (errorKey) return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                {t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}
            </div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <History className="w-6 h-6 text-[#2563EB]" />
                    Compliance History
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Chronological audit trail of self-compliance audits, government submissions, and regulatory status changes.
                </p>
            </div>

            {(!hist || !Array.isArray(hist) || hist.length === 0) ? (
                <Card className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-foreground">No compliance history available</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Historical verification events will be logged here as you audit products.</p>
                </Card>
            ) : (
                <div className="space-y-4 relative border-l-2 border-border/80 ml-3 pl-6 my-4">
                    {(Array.isArray(hist) ? hist : []).map(h => (
                        <div key={h.id} className="relative group">
                            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#2563EB] ring-4 ring-background"></div>
                            <Card className="rounded-lg border border-border bg-card shadow-xs p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                    <h4 className="font-semibold text-sm text-foreground">{h.action}</h4>
                                    <p className="text-xs text-muted-foreground font-mono">{new Date(h.created_at).toLocaleString()}</p>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{h.details}</p>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
