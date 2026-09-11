"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServerCrash, RefreshCw, ListChecks, ArrowUpRight, Search, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from '@/i18n'

export default function ReinspectionsPage() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [reinspections, setReinspections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchReinspections = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/reinspections', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setReinspections(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.reinspection_queue") })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchReinspections()
    }, [])

    const escalateReinspection = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`http://localhost:8000/api/v1/enforcement/escalate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reinspection_id: id })
            })
            if (res.ok || res.status === 409) {
                setReinspections(prev => prev.map(r => r.id === id ? { ...r, status: 'ESCALATED' } : r))
                toast({ type: 'success', message: t("success.reinspection_escalated") })
            } else {
                const err = await res.json()
                toast({ type: "error", message: "Escalation failed: " + err.detail })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.escalation_comm") })
        } finally {
            setActionLoading(null)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">API Connection Disrupted</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Reinspection subsystem is temporarily unreachable.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchReinspections}>
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
                        <ListChecks className="w-8 h-8 text-[#2563EB]" /> Reinspection Queue
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Verify rectifications and escalate persistent non-compliance.</p>
                </div>
                <Button variant="outline" className="border-border shadow-sm h-11 px-6 font-semibold" onClick={fetchReinspections}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                </Button>
            </div>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">Active Verifications</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Task Identifier</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Original Audit Ref</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('common.status')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Assignee</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Execution Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                        <span className="text-sm">Loading task queues...</span>
                                    </TableCell>
                                </TableRow>
                            ) : reinspections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <ClipboardList className="w-8 h-8 mb-3 mx-auto opacity-20 text-blue-600" />
                                        <p className="text-sm font-medium">Your reinspection queue is currently empty.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reinspections.map((r, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-sm font-bold text-[#0B1F3A] dark:text-blue-400 py-4">
                                            {r.id.substring(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground py-4">
                                            {r.original_inspection_id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${r.status === 'SCHEDULED' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10' :
                                                    r.status === 'ESCALATED' ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10' :
                                                        'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'}`}>
                                                {r.status || "UNKNOWN"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm py-4 text-foreground font-medium">
                                            Self Assigned
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-4">
                                            <div className="flex gap-2 justify-end">
                                                {r.status === 'SCHEDULED' ? (
                                                    <Link href={`/officer/scanner?reinspection=${r.id}`}>
                                                        <Button size="sm" className="h-8 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs shadow-sm">
                                                            <Search className="w-3.5 h-3.5 mr-1.5" /> Scan Protocol
                                                        </Button>
                                                    </Link>
                                                ) : r.status === 'COMPLETED' ? (
                                                    <>
                                                        <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs">View Result</Button>
                                                        <Button size="sm" className="h-8 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold text-xs shadow-sm"
                                                            disabled={actionLoading === r.id} onClick={() => escalateReinspection(r.id)}>
                                                            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> Escalate
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button size="sm" variant="ghost" disabled className="h-8 text-xs font-semibold px-4 opacity-50">Archived</Button>
                                                )}
                                            </div>
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
