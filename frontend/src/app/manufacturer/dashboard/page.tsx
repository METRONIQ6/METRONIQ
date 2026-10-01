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
        fetch('/api/v1/manufacturer/dashboard-stats', { headers: { 'Authorization': `Bearer ${getToken()}` } })
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

    if (errorKey) return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</span>
            </div>
        </div>
    )

    if (!stats) return (
        <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
            <div className="h-8 w-64 bg-muted rounded-md mb-2"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-card border border-border rounded-lg"></div>)}
            </div>
            <div className="h-40 bg-card border border-border rounded-lg"></div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Building2 className="w-6 h-6 text-[#2563EB]" />
                    {t('manufacturer.dashboard.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('manufacturerUI.dashboardSubtitle') || 'Pre-market statutory Legal Metrology compliance overview, product declarations, and regulatory actions.'}
                </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <Card className="rounded-lg border border-border bg-card shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('manufacturer.dashboard.totalProducts')}</span>
                            <PackageCheck className="w-4 h-4 text-[#2563EB]" />
                        </div>
                        <p className="text-2xl font-bold text-foreground font-mono">{stats.total_products}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border border-border bg-card shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('manufacturer.dashboard.draft')}</span>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold text-foreground font-mono">{stats.draft_products}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border border-border bg-card shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('manufacturer.dashboard.underReview')}</span>
                            <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-foreground font-mono">{stats.under_review}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border border-destructive/20 bg-destructive/5 shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-destructive mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('manufacturer.dashboard.changesRequired')}</span>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-destructive font-mono">{stats.changes_required}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('manufacturer.dashboard.approved')}</span>
                            <PackageCheck className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.approved_products}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground tracking-tight">
                        {t('manufacturer.dashboard.recentActivity')}
                    </h3>
                </div>
                {!stats.recent_activity || stats.recent_activity.length === 0 ? (
                    <Card className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
                        <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-muted-foreground italic">{t('manufacturer.dashboard.noActivity')}</p>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {stats.recent_activity.map((a: any) => (
                            <Card key={a.id} className="rounded-lg border border-border bg-card shadow-xs">
                                <CardContent className="p-3.5 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Clock className="text-[#2563EB] w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground leading-snug">{a.action}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{a.details}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
