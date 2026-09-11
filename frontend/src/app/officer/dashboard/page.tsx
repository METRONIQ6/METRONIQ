"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ClipboardList, Clock, AlertTriangle, CheckCircle2, CalendarCheck, Scale,
    FileText, ListChecks, FileSearch, ShieldAlert, CheckCircle, HelpCircle, Activity,
    ScanLine, RefreshCw, BarChart3, ChevronRight, Eye
} from 'lucide-react'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { useTranslation } from "@/i18n"
import { useToast } from "@/components/ui/use-toast"

export default function OfficerDashboard() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [summary, setSummary] = useState<any>(null)
    const [activities, setActivities] = useState<any[]>([])
    const [recentInspections, setRecentInspections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [userName, setUserName] = useState("Officer")
    const [userAuthData, setUserAuthData] = useState<any>(null)

    useEffect(() => {
        // Safe check for user name from localStorage token payload
        try {
            const token = getToken()
            if (token) {
                const payloadBase64 = token.split('.')[1]
                if (payloadBase64) {
                    const payload = JSON.parse(atob(payloadBase64))
                    setUserAuthData(payload)
                }
            }
        } catch (e) {
            console.error("Token parse error", e)
        }

        const fetchDashboardData = async () => {
            setLoading(true)
            setError(false)
            try {
                const head = { 'Authorization': `Bearer ${getToken()}` }

                const [sumRes, actRes, inspRes] = await Promise.all([
                    fetch('http://localhost:8000/api/v1/dashboard/summary', { headers: head }),
                    fetch('http://localhost:8000/api/v1/dashboard/activity', { headers: head }),
                    fetch('http://localhost:8000/api/v1/inspections', { headers: head })
                ])

                if (sumRes.ok) setSummary(await sumRes.json())
                if (actRes.ok) setActivities(await actRes.json())
                if (inspRes.ok) {
                    const data = await inspRes.json()
                    setRecentInspections(data.reverse().slice(0, 5))
                }
            } catch (err) {
                console.error(err)
                setError(true)
                toast({ type: "error", message: t('error.fetchFailed') })
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [toast, t])

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-10 w-64 bg-muted rounded-md mb-2"></div>
                <div className="h-5 w-48 bg-muted rounded-md mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-card border border-border rounded-xl"></div>)}
                </div>
            </div>
        )
    }

    if (error || !summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('error.failedLoad')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Please check your network connection and try again.</p>
                <Button className="mt-6 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white" onClick={() => window.location.reload()}>{t("common.retry")}</Button>
            </div>
        )
    }

    const KpiCard = ({ icon, title, value, status, statusColor, bgColor, iconColor }: any) => (
        <Card className="rounded-xl shadow-sm border border-border overflow-hidden bg-card transition-all hover:shadow-md">
            <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-full ${bgColor} ${iconColor}`}>
                        {icon}
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <p className={`text-xs mt-1 font-medium ${statusColor}`}>{status}</p>
                </div>
            </CardContent>
        </Card>
    )

    const EmptyChartState = ({ title }: { title: string }) => (
        <Card className="rounded-xl shadow-sm border border-border bg-card h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-border/40">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
                    <span className="text-xs text-muted-foreground border border-border/50 rounded px-2 py-1">This Week</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Data visualization unavailable.</p>
                <p className="text-xs mt-1">Sufficient historical records required.</p>
            </CardContent>
        </Card>
    )

    const getDisplayUser = () => {
        if (!userAuthData) return t('roles.officer')
        const actualName = userAuthData.name || userAuthData.full_name || userAuthData.first_name
        if (actualName) return actualName

        if (userAuthData.role) {
            const roleKey = `roles.${userAuthData.role.toLowerCase()}`
            const translatedRole = t(roleKey)
            if (translatedRole !== roleKey) return translatedRole
        }
        return t('roles.officer')
    }

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">

            {/* Header Greeting */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2">
                        {t('dashboard.greeting') || 'Good morning,'} {getDisplayUser()} <span className="text-2xl animate-wave">👋</span>
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Here's what's happening with inspections today.</p>
                </div>
            </div>

            {/* KPI Header Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard
                    icon={<ClipboardList className="w-5 h-5" />} title="Total Inspections" value={summary.totalInspections}
                    status={`↑ ${summary.inspectionsToday} today`} statusColor="text-green-600 dark:text-green-400"
                    bgColor="bg-[#0B1F3A]" iconColor="text-white"
                />
                <KpiCard
                    icon={<Clock className="w-5 h-5" />} title="Pending Reviews" value={summary.pendingRectifications}
                    status="High Priority" statusColor="text-orange-600 dark:text-orange-400"
                    bgColor="bg-[#0B1F3A]" iconColor="text-white"
                />
                <KpiCard
                    icon={<AlertTriangle className="w-5 h-5" />} title="Failed Inspections" value={summary.failedInspections}
                    status="Action Required" statusColor="text-orange-600 dark:text-orange-400"
                    bgColor="bg-[#0B1F3A]" iconColor="text-white" // Modified base styling instead of multi-colored branded buckets
                />
                <KpiCard
                    icon={<CheckCircle2 className="w-5 h-5" />} title="Passed Inspections" value={summary.passedInspections}
                    status="Sustained" statusColor="text-muted-foreground"
                    bgColor="bg-[#0B1F3A]" iconColor="text-white"
                />
                <KpiCard
                    icon={<CalendarCheck className="w-5 h-5" />} title="Reinspections Due" value={summary.reinspectionsDue}
                    status="Due this week" statusColor="text-blue-600 dark:text-blue-400"
                    bgColor="bg-[#0B1F3A]" iconColor="text-white"
                />
                <KpiCard
                    icon={<Scale className="w-5 h-5" />} title="Enforcement Cases" value={summary.activeEnforcement}
                    status="Under Review" statusColor="text-orange-600 dark:text-orange-400"
                    bgColor="bg-[#0B1F3A]" iconColor="text-white"
                />
            </div>

            {/* Layout Split */}
            <div className="grid lg:grid-cols-3 gap-6 pt-2">

                {/* Main Table Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-xl shadow-sm border border-border overflow-hidden bg-card h-full flex flex-col">
                        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between bg-card">
                            <CardTitle className="text-base font-semibold text-foreground tracking-tight">Inspection Overview</CardTitle>
                            <Link href="/officer/inspections">
                                <Button variant="secondary" size="sm" className="h-8 rounded-md bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border">
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto">Case ID</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto">Product / Entity</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto">Inspection Date</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto text-center">Risk</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto text-center">Compliance</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto text-center">{t('common.status')}</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 h-auto text-right pr-4">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentInspections.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileText className="w-10 h-10 mb-3 opacity-20" />
                                                    <p>No recent inspections found.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentInspections.map((insp: any) => (
                                            <TableRow key={insp.id} className="border-border hover:bg-muted/40 transition-colors">
                                                <TableCell className="font-medium text-xs text-foreground py-3">{insp.id}</TableCell>
                                                <TableCell className="py-3">
                                                    <span className="font-medium text-sm text-foreground block">{insp.product_name || "Unknown Product"}</span>
                                                    {insp.entity_name && <span className="text-xs text-muted-foreground">{insp.entity_name}</span>}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground py-3">
                                                    {new Date(insp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                        ${insp.risk_level === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                        ${insp.risk_level === 'MEDIUM' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                                        ${insp.risk_level === 'LOW' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                        ${!insp.risk_level && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        {insp.risk_level || 'UNKNOWN'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                        ${insp.result === 'PASS' ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10' : ''}
                                                        ${insp.result === 'FAIL' ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10' : ''}`}>
                                                        {insp.result || 'PENDING'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{insp.status || "Completed"}</span>
                                                </TableCell>
                                                <TableCell className="text-right py-3 pr-4">
                                                    <Link href={`/officer/reports/${insp.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md border border-border/50 hover:bg-muted hover:text-foreground text-muted-foreground">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Area: Action Required */}
                <div className="space-y-6">
                    <Card className="rounded-xl shadow-sm border border-border bg-card">
                        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-foreground tracking-tight">Action Required</CardTitle>
                            <Link href="/">
                                <Button variant="secondary" size="sm" className="h-8 rounded-md bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/40">

                                <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                            <ClipboardList className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Inspections Awaiting Review</p>
                                            <p className="text-xs text-muted-foreground">{summary.failedInspections || 0} inspections need review</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{summary.failedInspections || 0}</span>
                                </div>

                                <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Notices Awaiting Action</p>
                                            <p className="text-xs text-muted-foreground">{summary.openNotices || 0} notices require action</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{summary.openNotices || 0}</span>
                                </div>

                                <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-foreground">
                                            <RefreshCw className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Rectifications Pending</p>
                                            <p className="text-xs text-muted-foreground">{summary.pendingRectifications || 0} rectifications pending round</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{summary.pendingRectifications || 0}</span>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm border border-border bg-card">
                        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold text-foreground tracking-tight">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-5">
                            <div className="space-y-5">
                                {activities.length === 0 ? (
                                    <div className="text-center text-sm text-muted-foreground py-4">No recent activity found.</div>
                                ) : (
                                    activities.slice(0, 4).map((act) => (
                                        <div key={act.id} className="flex gap-4 relative">
                                            <div className="absolute w-[1px] h-full bg-border left-[7px] top-6 -z-10" />
                                            <div className="w-4 h-4 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center shrink-0 mt-0.5 z-10">
                                                <CheckCircle className="w-2.5 h-2.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground leading-tight">{act.action}</p>
                                                <div className="flex gap-1.5 text-[11px] text-muted-foreground mt-1">
                                                    <span className="font-medium text-[#2563EB]">{act.entity}</span>
                                                    <span>•</span>
                                                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Bottom Row Charts */}
            <div className="grid lg:grid-cols-2 gap-6 pt-2 h-[280px]">
                <EmptyChartState title="Risk Distribution" />
                <EmptyChartState title="Compliance Trend" />
            </div>

            {/* Quick Actions Panel */}
            <div className="pt-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                    <Link href="/officer/scanner" className="block">
                        <Card className="rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-[#0B1F3A] text-white shrink-0">
                                    <ScanLine className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">Start Verification</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Scan new product</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/officer/reinspections" className="block">
                        <Card className="rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-[#0B1F3A] text-white shrink-0">
                                    <CalendarCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">Reinspections</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">See scheduled</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/officer/notices" className="block">
                        <Card className="rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-[#0B1F3A] text-white shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">View Notices</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Manage issued notices</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/officer/enforcement" className="block">
                        <Card className="rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-[#0B1F3A] text-white shrink-0">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">Enforcement</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Review cases</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/officer/reports" className="block">
                        <Card className="rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-[#0B1F3A] text-white shrink-0">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">Audit Reports</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">View log trails</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                </div>
            </div>

        </div>
    )
}