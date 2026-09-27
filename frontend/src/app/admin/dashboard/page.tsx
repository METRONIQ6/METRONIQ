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
                const res = await fetch('http://localhost:8000/api/v1/analytics/overview', { headers: head })
                const userRes = await fetch('http://localhost:8000/api/v1/users/counts', { headers: head })

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
        <Card className="rounded-xl shadow-sm border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className={iconColorClass}>{icon}</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wide">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">

            {/* Console Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2">{t('adminUI.systemControlConsole') || 'Control Console'}</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">National compliance and infrastructure overview.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/geo">
                        <Button variant="outline" className="flex gap-2 rounded-md border-border bg-card">
                            <Map className="w-4 h-4" />{t('adminUI.geoHeatmap') || 'Geo Heatmap'}</Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button className="flex gap-2 rounded-md bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90">
                            <Settings className="w-4 h-4" />{t('adminUI.controlPanel') || 'Control Panel'}</Button>
                    </Link>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <SystemKpiCard
                    title={t("adminUI.totalUsers") || "Total Users"} value={(userCounts?.manufacturers || 0) + (userCounts?.officers_total || 0)} subtitle="System Wide"
                    icon={<Users className="w-5 h-5" />} iconColorClass="text-[#0B1F3A] dark:text-white"
                />
                <SystemKpiCard
                    title={t("adminUI.totalManufacturers") || "Manufacturers"} value={userCounts?.manufacturers || 0} subtitle="Registered Entities"
                    icon={<Building2 className="w-5 h-5" />} iconColorClass="text-[#2563EB]"
                />
                <SystemKpiCard
                    title={t("adminUI.totalOfficers") || "Government Officers"} value={userCounts?.officers_total || 0} subtitle="System Operators"
                    icon={<UserCheck className="w-5 h-5" />} iconColorClass="text-[#2563EB]"
                />
                <SystemKpiCard
                    title={t("adminUI.pendingApprovals") || "Pending Approvals"} value={userCounts?.officers_pending || 0} subtitle="Awaiting Review"
                    icon={<UserCheck className="w-5 h-5" />} iconColorClass="text-orange-600 dark:text-orange-400"
                />

                <SystemKpiCard
                    title={t("dashboard.totalInspections") || "Total Inspections"} value={stats.total_inspections || 0} subtitle="Global registry"
                    icon={<FileText className="w-5 h-5" />} iconColorClass="text-[#0B1F3A] dark:text-white"
                />
                <SystemKpiCard
                    title={t("dashboard.complianceRate") || "Compliance Rate"} value={stats.compliance_rate || "0%"} subtitle="National Average"
                    icon={<CheckCircle className="w-5 h-5" />} iconColorClass="text-success dark:text-green-400"
                />
                <SystemKpiCard
                    title={t("dashboard.openNotices") || "Open Notices"} value={stats.total_violations || 0} subtitle="Needs Rectification"
                    icon={<ShieldAlert className="w-5 h-5" />} iconColorClass="text-orange-600 dark:text-orange-400"
                />
                <SystemKpiCard
                    title={t("dashboard.activeEnforcement") || "Active Enforcement Cases"} value={stats.high_risk_cases || 0} subtitle="Escalated Actions"
                    icon={<Scale className="w-5 h-5" />} iconColorClass="text-destructive dark:text-red-400"
                />
            </div>

            {/* Layout Splitting */}
            <div className="grid lg:grid-cols-1 gap-6 pt-2">

                {/* Left Area: Analytics & Trends (Requires historic data from API, using professional empty state for now) */}
                <Card className="rounded-xl shadow-sm border border-border bg-card h-[400px] flex flex-col">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold text-foreground tracking-tight">{t('adminUI.global_inspection_tr')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                        <h4 className="text-sm font-semibold text-foreground mb-1">{t('adminUI.insufficient_histori')}</h4>
                        <p className="text-sm max-w-sm">The platform requires at least one full reporting cycle (30 days) to aggregate and render structural trends securely.</p>
                    </CardContent>
                </Card>



            </div>

        </div>
    )
}
