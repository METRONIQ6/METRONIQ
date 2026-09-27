
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

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
    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>

    return (
        <div className="space-y-6 max-w-3xl">
            <h2 className="text-xl font-bold">Compliance History</h2>
            {(!hist || !Array.isArray(hist) || hist.length === 0) && <p className="text-muted-foreground">No compliance history available</p>}
            <div className="space-y-4 relative border-l-2 border-border ml-4 pl-4">
                {(Array.isArray(hist) ? hist : []).map(h => (
                    <div key={h.id} className="relative">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary/100 border-2 border-white"></div>
                        <h4 className="font-bold">{h.action}</h4>
                        <p className="text-sm text-muted-foreground">{h.details}</p>
                        <p className="text-xs text-muted-foreground/80">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
