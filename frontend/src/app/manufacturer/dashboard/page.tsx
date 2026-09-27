"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, PackageCheck, AlertTriangle, FileText, UploadCloud, Clock } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null)
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const { t } = useTranslation()

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/manufacturer/dashboard-stats', { headers: { 'Authorization': `Bearer ${getToken()}` } })
            .then(async r => {
                if (!r.ok) {
                    setErrorKey(mapManufacturerError(r.status))
                    return null
                }
                return r.json()
            })
            .then(d => {
                if (d) setStats(d)
            })
            .catch(() => { setErrorKey(mapManufacturerError(undefined, 'Network Error')) })
    }, [])

    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>
    if (!stats) return (
        <div className="space-y-6 animate-pulse p-4">
            <div className="h-10 w-64 bg-muted rounded-md mb-2"></div>
            <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-card border border-border rounded-xl"></div>)}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="text-primary" /> {t('manufacturer.dashboard.title')}</h1>

            <div className="grid grid-cols-5 gap-4">
                <Card><CardContent className="p-4 text-center"><h3 className="text-sm font-semibold uppercase">{t('manufacturer.dashboard.totalProducts')}</h3><p className="text-2xl font-bold">{stats.total_products}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><h3 className="text-sm font-semibold uppercase">{t('manufacturer.dashboard.draft')}</h3><p className="text-2xl font-bold">{stats.draft_products}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><h3 className="text-sm font-semibold uppercase">{t('manufacturer.dashboard.underReview')}</h3><p className="text-2xl font-bold">{stats.under_review}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><h3 className="text-sm font-semibold uppercase text-destructive">{t('manufacturer.dashboard.changesRequired')}</h3><p className="text-2xl font-bold text-destructive">{stats.changes_required}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><h3 className="text-sm font-semibold uppercase text-success">{t('manufacturer.dashboard.approved')}</h3><p className="text-2xl font-bold text-success">{stats.approved_products}</p></CardContent></Card>
            </div>

            <h3 className="text-xl font-bold mt-8">{t('manufacturer.dashboard.recentActivity')}</h3>
            {!stats.recent_activity || stats.recent_activity.length === 0 ? <p className="text-muted-foreground italic">{t('manufacturer.dashboard.noActivity')}</p> : (
                <div className="space-y-2">
                    {stats.recent_activity.map((a: any) => (
                        <Card key={a.id}><CardContent className="p-4 flex gap-4 items-center">
                            <Clock className="text-blue-500 w-5 h-5" />
                            <div>
                                <p className="font-semibold">{a.action}</p>
                                <p className="text-sm text-muted-foreground">{a.details}</p>
                            </div>
                        </CardContent></Card>
                    ))}
                </div>
            )}
        </div>
    )
}
