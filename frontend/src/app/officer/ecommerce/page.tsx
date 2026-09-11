"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServerCrash, RefreshCw, Search, Plus, Globe, MousePointerClick, ShieldCheck } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from '@/i18n'

export default function EcommercePage() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [monitors, setMonitors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [newUrl, setNewUrl] = useState("")

    const fetchMonitors = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/ecommerce', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setMonitors(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.ecommerce_fetch") })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchMonitors()
    }, [])

    const addMonitor = async () => {
        if (!newUrl) {
            toast({ type: "warning", message: t("warning.valid_url") })
            return
        }
        try {
            const res = await fetch(`http://localhost:8000/api/v1/ecommerce/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_url: newUrl, monitoring_frequency: "DAILY" })
            })
            if (res.ok) {
                setMonitors([await res.json(), ...monitors])
                setNewUrl("")
                toast({ type: "success", message: t("success.tracking_started") })
            } else {
                toast({ type: "error", message: t("error.monitor_failed") })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.network_comm") })
        }
    }

    const triggerScan = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/api/v1/ecommerce/${id}/scan`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            setMonitors(monitors.map(m => m.id === id ? { ...m, last_scan_result: 'SCANNING...' } : m))
            toast({ type: "success", message: t("success.manual_crawl") })
        } catch (e) {
            toast({ type: "error", message: t("error.system_crawl") })
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">API Connection Disrupted</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">E-commerce subsystem is temporarily unreachable.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchMonitors}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-3">
                        <Globe className="w-8 h-8 text-[#2563EB]" /> Digital Market Surveillance
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Automated crawler metrics and compliance evaluation rules across digital channels.</p>
                </div>
                <Button variant="outline" className="border-border shadow-sm h-11 px-6 font-semibold" onClick={fetchMonitors}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                </Button>
            </div>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden mb-6">
                <CardContent className="p-4 flex gap-4 bg-muted/20">
                    <div className="flex-1 relative">
                        <Globe className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Register digital marketplace domain for monitoring (e.g. https://flipkart.com/product/123)"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="flex-1 border-border pl-10 h-11"
                        />
                    </div>
                    <Button onClick={addMonitor} className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white h-11 px-8">
                        <Plus className="w-4 h-4 mr-2" /> Activate Tracker
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">Active Crawler Sentinels</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Network Target URL</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Interval Cycle</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">Telemetry Status</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Task Override</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                        <span className="text-sm">Retrieving digital sentinels...</span>
                                    </TableCell>
                                </TableRow>
                            ) : monitors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        <ShieldCheck className="w-8 h-8 mb-3 mx-auto opacity-20 text-blue-600" />
                                        <p className="text-sm font-medium">No digital market surveillance trackers deployed.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                monitors.map((m, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="text-sm py-4 max-w-[400px] truncate">
                                            <a href={m.target_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono font-medium flex items-center">
                                                <MousePointerClick className="w-3.5 h-3.5 mr-2 opacity-50" />
                                                {m.target_url}
                                            </a>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground py-4 uppercase">
                                            {m.monitoring_frequency}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${(m.last_scan_result === 'FAIL' || m.last_scan_result === 'NON_COMPLIANT') ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10' :
                                                    (m.last_scan_result === 'COMPLIANT' || m.last_scan_result === 'PASS') ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10' :
                                                        m.last_scan_result === 'SCANNING...' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10 animate-pulse' :
                                                            ['CRAWL_ERROR', 'NOT_PRODUCT_PAGE', 'CRAWL_TIMEOUT', 'FAIL_PROCESSING', 'SECURITY_BLOCKED', 'ENVIRONMENT_ERROR', 'INVALID_IMAGE'].includes(m.last_scan_result) ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10' :
                                                                'border-muted text-muted-foreground bg-transparent'}`}>
                                                {m.last_scan_result || "PENDING"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-4">
                                            <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs" onClick={() => triggerScan(m.id)}>
                                                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${m.last_scan_result === 'SCANNING...' ? 'animate-spin' : ''}`} /> Force Crawl
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
