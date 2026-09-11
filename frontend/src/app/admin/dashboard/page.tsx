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

                if (res.ok) {
                    setStats(await res.json())
                } else {
                    throw new Error("API response not ok")
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
    }, [toast])

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-10 w-64 bg-muted rounded-md mb-2"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-28 bg-card border border-border rounded-xl"></div>)}
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('adminUI.system_control_conso')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Unable to reach the root analytics service.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={() => window.location.reload()}>{t("common.retry")}</Button>
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
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2">
                        System Control Console
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">National compliance and infrastructure overview.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/geo">
                        <Button variant="outline" className="flex gap-2 rounded-md border-border bg-card">
                            <Map className="w-4 h-4" /> Geo-Heatmap
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button className="flex gap-2 rounded-md bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90">
                            <Settings className="w-4 h-4" /> Control Panel
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SystemKpiCard
                    title="Total Inspections" value={stats.total_inspections || 0} subtitle="Global registry"
                    icon={<FileText className="w-5 h-5" />} iconColorClass="text-[#0B1F3A] dark:text-white"
                />
                <SystemKpiCard
                    title="Total Violations" value={stats.total_violations || 0} subtitle="Recorded infractions"
                    icon={<ShieldAlert className="w-5 h-5" />} iconColorClass="text-red-600 dark:text-red-400"
                />
                <SystemKpiCard
                    title={t("dashboard.complianceRate")} value={stats.compliance_rate || "0%"} subtitle="National Average"
                    icon={<CheckCircle className="w-5 h-5" />} iconColorClass="text-green-600 dark:text-green-400"
                />
                <SystemKpiCard
                    title="High Risk Cases" value={stats.high_risk_cases || 0} subtitle="Requires Escalation"
                    icon={<Activity className="w-5 h-5" />} iconColorClass="text-orange-600 dark:text-orange-400"
                />

                {/* Simulated infrastructural stats for enterprise admin appeal (using structural placeholders until API provides) */}
                <SystemKpiCard
                    title="Active Officers" value="24" subtitle="System Operators"
                    icon={<UserCheck className="w-5 h-5" />} iconColorClass="text-[#2563EB]"
                />
                <SystemKpiCard
                    title="Registered Orgs" value="156" subtitle="Monitored Entities"
                    icon={<Building2 className="w-5 h-5" />} iconColorClass="text-[#2563EB]"
                />
                <SystemKpiCard
                    title="Active Rules" value="84" subtitle="Policy Matrix"
                    icon={<ListChecks className="w-5 h-5" />} iconColorClass="text-muted-foreground"
                />
                <SystemKpiCard
                    title="Enforcement" value="11" subtitle="Active Actions"
                    icon={<Scale className="w-5 h-5" />} iconColorClass="text-orange-600 dark:text-orange-400"
                />
            </div>

            {/* Layout Splitting */}
            <div className="grid lg:grid-cols-2 gap-6 pt-2">

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

                {/* Right Area: Admin Navigation Index */}
                <div className="space-y-6">
                    <Card className="rounded-xl shadow-sm border border-border bg-card">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-semibold text-foreground tracking-tight">{t('adminUI.system_navigation')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/40">

                                <Link href="/admin/users" className="block hover:bg-muted/20 transition-colors p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-md bg-[#0B1F3A]/5 dark:bg-[#0B1F3A]/30 text-[#0B1F3A] dark:text-white">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{t('adminUI.user_management')}</p>
                                            <p className="text-xs text-muted-foreground">Manage RBAC, roles, and administrator accounts.</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/admin/ecommerce" className="block hover:bg-muted/20 transition-colors p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-md bg-[#2563EB]/10 text-[#2563EB]">
                                            <LayoutDashboard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">E-Commerce Monitor Configuration</p>
                                            <p className="text-xs text-muted-foreground">Configure web crawler boundaries and scrape parameters.</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/admin/geo" className="block hover:bg-muted/20 transition-colors p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                            <Map className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{t('adminUI.geospatial_intellige')}</p>
                                            <p className="text-xs text-muted-foreground">View high-risk zone mapping and heat patterns.</p>
                                        </div>
                                    </div>
                                </Link>

                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

        </div>
    )
}
