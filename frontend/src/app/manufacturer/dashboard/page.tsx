"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    FileSearch, CheckCircle, Clock, AlertTriangle, Building2, PackageCheck,
    ServerCrash, Eye, UploadCloud, RefreshCw, FileText, Scale
} from 'lucide-react'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { useTranslation } from "@/i18n"
import { useToast } from "@/components/ui/use-toast"

export default function ManufacturerDashboard() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [stats, setStats] = useState({ total: 0, compliant: 0, pending: 0 })
    const [notices, setNotices] = useState<any[]>([])
    const [cases, setCases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [userName, setUserName] = useState("Manufacturer")

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

        const fetchAll = async () => {
            setLoading(true)
            setError(false)
            try {
                const head = { 'Authorization': `Bearer ${getToken()}` }

                const [noticesRes, casesRes, inspRes] = await Promise.all([
                    fetch('http://localhost:8000/api/v1/notices/', { headers: head }),
                    fetch('http://localhost:8000/api/v1/enforcement/', { headers: head }),
                    fetch('http://localhost:8000/api/v1/inspections', { headers: head })
                ])

                if (!noticesRes.ok || !casesRes.ok || !inspRes.ok) {
                    throw new Error("One or more API endpoints failed")
                }

                const nData = await noticesRes.json()
                const cData = await casesRes.json()
                const iData = await inspRes.json()

                setNotices(nData)
                setCases(cData)

                setStats({
                    total: iData.length,
                    compliant: iData.filter((d: any) => d.result === 'PASS').length,
                    pending: iData.filter((d: any) => d.result === 'FAIL').length
                })

            } catch (err) {
                console.error(err)
                setError(true)
                toast({ type: "error", message: t("error.mfg_dashboard_load") })
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [toast])

    const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set())

    const handleRectify = async (id: string) => {
        if (submittingIds.has(id)) return
        setSubmittingIds(prev => new Set(prev).add(id))
        try {
            const token = getToken()
            if (!token) {
                toast({ type: 'error', message: t("error.unauthorized") })
                return
            }
            const res = await fetch(`http://localhost:8000/api/v1/notices/${id}/rectify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ remarks: "Formal rectification submitted via portal" })
            })

            if (res.ok) {
                toast({ type: 'success', message: t("success.rectification") })
                setNotices(prev => prev.map(n => n.id === id ? { ...n, status: 'RECTIFICATION_SUBMITTED' } : n))
            } else if (res.status === 401 || res.status === 403) {
                toast({ type: 'error', message: t("error.not_authorized") })
            } else if (res.status === 400 || res.status === 422) {
                toast({ type: 'error', message: t("error.invalid_params") })
            } else {
                toast({ type: 'error', message: `Server Error: ${res.statusText}` })
            }
        } catch (e) {
            toast({ type: 'error', message: t("error.network_submit") })
        } finally {
            setSubmittingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-10 w-64 bg-muted rounded-md mb-2"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-card border border-border rounded-xl"></div>)}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('common.error')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">{t('common.retry')}</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={() => window.location.reload()}>{t('common.retry')}</Button>
            </div>
        )
    }

    const ManufKpiCard = ({ icon, title, value, subtitle, iconColorClass }: any) => (
        <Card className="rounded-xl shadow-sm border border-border bg-card transition-all hover:shadow-md">
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

            {/* Header Greeting */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-[#2563EB]" /> Product Compliance Portal
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Manage your product label lifecycle and regulatory audits.</p>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ManufKpiCard
                    title="Audits Conducted" value={stats.total} subtitle="Lifetime"
                    icon={<FileSearch className="w-5 h-5" />} iconColorClass="text-[#0B1F3A] dark:text-white"
                />
                <ManufKpiCard
                    title="Fully Compliant" value={stats.compliant} subtitle="Passed Status"
                    icon={<PackageCheck className="w-5 h-5" />} iconColorClass="text-green-600 dark:text-green-400"
                />
                <ManufKpiCard
                    title="Improvement Notices" value={notices.length} subtitle="Active Workflow"
                    icon={<FileText className="w-5 h-5" />} iconColorClass="text-[#2563EB]"
                />
                <ManufKpiCard
                    title="Enforcement Cases" value={cases.length} subtitle="Escalations"
                    icon={<Scale className="w-5 h-5" />} iconColorClass="text-orange-600 dark:text-orange-400"
                />
            </div>

            {/* Main Workspace Split */}
            <div className="grid lg:grid-cols-3 gap-6 pt-2">

                {/* Left Action & Status Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Auditor Call to Action */}
                    <Card className="rounded-xl shadow-sm border border-border bg-[#0B1F3A] text-white">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <UploadCloud className="w-12 h-12 text-[#2563EB] mb-4" />
                            <h3 className="text-lg font-bold mb-2">Pre-Market Label Auditor</h3>
                            <p className="text-white/70 text-sm mb-6 max-w-[250px]">
                                Upload packaging artwork before printing to verify Legal Metrology compliance automatically.
                            </p>
                            <Link href="/manufacturer/auditor" className="w-full">
                                <Button className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold">New Audit</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Notifications / Rectifications pending */}
                    <Card className="rounded-xl shadow-sm border border-border bg-card">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-semibold text-foreground tracking-tight">Compliance Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {(notices.filter(n => n.status === 'ISSUED').length === 0 && cases.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <CheckCircle className="w-10 h-10 text-green-500 mb-3 opacity-80" />
                                    <p className="text-sm font-semibold text-foreground">All Clear</p>
                                    <p className="text-xs text-muted-foreground mt-1">Your registered products meet current regulatory requirements.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notices.filter(n => n.status === 'ISSUED').length > 0 && (
                                        <div className="flex items-center gap-3 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                                            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Action Required</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-400/80">You have pending improvement notices to address.</p>
                                            </div>
                                        </div>
                                    )}
                                    {cases.length > 0 && (
                                        <div className="flex items-center gap-3 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
                                            <Scale className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-red-900 dark:text-red-300">Escalation Active</p>
                                                <p className="text-xs text-red-700 dark:text-red-400/80">Legal enforcement cases are active against your entity.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Area Tables */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Notices Table */}
                    <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/40 bg-card">
                            <CardTitle className="text-base font-semibold text-foreground tracking-tight">Improvement Notices</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border">
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Notice ID</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Violation</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
                                                    <p className="text-sm">No pending improvement notices.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        notices.map((n, i) => (
                                            <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                                <TableCell className="font-mono text-xs text-foreground py-3">
                                                    {n.id.substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="text-sm text-foreground py-3">
                                                    {n.violations || "General Non-Compliance"}
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                        ${n.status === 'ISSUED' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10' : 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10'}`}>
                                                        {t('status.' + (n.status || 'UNKNOWN'))}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-3 pr-4">
                                                    {n.status === 'ISSUED' ? (
                                                        <Button size="sm" className="h-7 text-xs bg-[#2563EB] hover:bg-[#2563EB]/90 text-white" disabled={submittingIds.has(n.id)} onClick={() => handleRectify(n.id)}>
                                                            <RefreshCw className={`w-3 h-3 mr-1.5 ${submittingIds.has(n.id) ? 'animate-spin' : ''}`} />
                                                            {submittingIds.has(n.id) ? 'Submitting...' : 'Rectify'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground font-medium italic">Under Review</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Escalations Table */}
                    <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/40 bg-card">
                            <CardTitle className="text-base font-semibold text-destructive tracking-tight flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Legal Escalations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border">
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Case ID</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Penalty Asset</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cases.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                <p className="text-sm italic">No escalated enforcement cases.</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cases.map((c, i) => (
                                            <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                                <TableCell className="font-mono text-xs text-foreground py-3">
                                                    {c.id.substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10 font-mono text-xs uppercase px-2 py-0.5 rounded-sm">
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-3 pr-4 font-mono font-bold text-foreground">
                                                    {c.penalty_amount ? `₹${c.penalty_amount.toLocaleString()}` : "ASSESSING"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>

        </div>
    )
}
