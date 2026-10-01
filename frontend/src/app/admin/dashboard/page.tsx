"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ShieldAlert, Users, CheckCircle, Activity, Map, Building2, UserCheck,
    FileText, Scale, LayoutDashboard, Settings, ListChecks, ServerCrash,
    BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { useTranslation } from "@/i18n"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [userName, setUserName] = useState("Administrator")

    const [userCounts, setUserCounts] = useState<any>(null)

    useEffect(() => {
        try {
            const token = getToken()
            if (token) {
                const payloadBase64 = token.split('.')[1]
                if (payloadBase64) {
                    const payload = JSON.parse(atob(payloadBase64))
                    if (payload.sub) {
                        setUserName(payload.sub.split('@')[0])
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        const fetchData = async () => {
            setLoading(true)
            setError(false)
            try {
                const head = { 'Authorization': `Bearer ${getToken()}` }
                const res = await fetch('/api/v1/analytics/overview', { headers: head })
                const userRes = await fetch('/api/v1/users/counts', { headers: head })

                if (res.ok) {
                    setStats(await res.json())
                } else {
                    throw new Error("API response not ok")
                }

                if (userRes.ok) {
                    setUserCounts(await userRes.json())
                }
            } catch (err) {
                console.error(err)
                setError(true)
                toast({ type: "error", message: t("error.failed_analytics") })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [toast, t])

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-10 w-64 bg-muted rounded-md mb-2"></div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-28 bg-card border border-border rounded-xl"></div>)}
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('adminUI.system_control_conso') || 'System Control Console'}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Unable to reach the root analytics service.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={() => window.location.reload()}>{t("common.retry") || 'Retry'}</Button>
            </div>
        )
    }

    const SystemKpiCard = ({ icon, title, value, subtitle, iconColorClass }: any) => (
        <Card className="rounded-lg shadow-xs border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full gap-2.5">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className={iconColorClass}>{icon}</div>
                </div>
                <div>
                    <div className="text-2xl font-bold tracking-tight text-foreground font-mono">{value}</div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6 max-w-7xl w-full mx-auto">
            {/* Console Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2.5">
                        <LayoutDashboard className="w-6 h-6 text-[#2563EB]" />
                        {t('adminUI.systemControlConsole') || 'System Control Console'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        National statutory compliance architecture, user directory oversight, and infrastructure monitoring.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link href="/admin/geo">
                        <Button variant="outline" size="sm" className="h-9 px-3 border-border shadow-xs text-xs font-medium flex items-center gap-1.5">
                            <Map className="w-3.5 h-3.5" />
                            {t('adminUI.geoHeatmap') || 'Geo Heatmap'}
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button size="sm" className="h-9 px-4 font-semibold bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white shadow-xs text-xs flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5" />
                            {t('adminUI.controlPanel') || 'Control Panel'}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <SystemKpiCard
                    title={t("adminUI.totalUsers") || "Total Users"}
                    value={(userCounts?.manufacturers || 0) + (userCounts?.officers_total || 0)}
                    subtitle="System Wide"
                    icon={<Users className="w-4 h-4" />}
                    iconColorClass="text-[#0B1F3A] dark:text-white"
                />
                <SystemKpiCard
                    title={t("adminUI.totalManufacturers") || "Manufacturers"}
                    value={userCounts?.manufacturers || 0}
                    subtitle="Registered Entities"
                    icon={<Building2 className="w-4 h-4" />}
                    iconColorClass="text-[#2563EB]"
                />
                <SystemKpiCard
                    title={t("adminUI.totalOfficers") || "Government Officers"}
                    value={userCounts?.officers_total || 0}
                    subtitle="System Operators"
                    icon={<UserCheck className="w-4 h-4" />}
                    iconColorClass="text-[#2563EB]"
                />
                <SystemKpiCard
                    title={t("adminUI.pendingApprovals") || "Pending Approvals"}
                    value={userCounts?.officers_pending || 0}
                    subtitle="Awaiting Review"
                    icon={<UserCheck className="w-4 h-4" />}
                    iconColorClass="text-amber-600 dark:text-amber-400"
                />

                <SystemKpiCard
                    title={t("dashboard.totalInspections") || "Total Inspections"}
                    value={stats.total_inspections || 0}
                    subtitle="Global registry"
                    icon={<FileText className="w-4 h-4" />}
                    iconColorClass="text-[#0B1F3A] dark:text-white"
                />
                <SystemKpiCard
                    title={t("dashboard.complianceRate") || "Compliance Rate"}
                    value={stats.compliance_rate || "0%"}
                    subtitle="National Average"
                    icon={<CheckCircle className="w-4 h-4" />}
                    iconColorClass="text-green-600 dark:text-green-400"
                />
                <SystemKpiCard
                    title={t("dashboard.openNotices") || "Open Notices"}
                    value={stats.total_violations || 0}
                    subtitle="Needs Rectification"
                    icon={<ShieldAlert className="w-4 h-4" />}
                    iconColorClass="text-amber-600 dark:text-amber-400"
                />
                <SystemKpiCard
                    title={t("dashboard.activeEnforcement") || "Active Enforcement"}
                    value={stats.high_risk_cases || 0}
                    subtitle="Escalated Actions"
                    icon={<Scale className="w-4 h-4" />}
                    iconColorClass="text-destructive dark:text-red-400"
                />
            </div>

            {/* Layout Splitting */}
            <div className="pt-1">
                <Card className="rounded-lg shadow-xs border border-border bg-card flex flex-col">
                    <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/30">
                        <CardTitle className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                            {t('adminUI.global_inspection_tr')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center text-muted-foreground">
                        <BarChart3 className="w-10 h-10 mb-3 text-muted-foreground/30" />
                        <h4 className="text-sm font-semibold text-foreground mb-1">{t('adminUI.insufficient_histori')}</h4>
                        <p className="text-xs text-muted-foreground max-w-md">
                            The platform requires at least one full reporting cycle (30 days) to aggregate and render national structural trends securely.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
