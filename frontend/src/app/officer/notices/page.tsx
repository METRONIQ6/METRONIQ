"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { FileText, ServerCrash, RefreshCw, AlertTriangle, Eye, CalendarClock, ShieldCheck } from 'lucide-react'
import { getToken } from '@/lib/auth'

import { useTranslation } from '@/i18n'
import { useToast } from "@/components/ui/use-toast"

export default function NoticesPage() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [notices, setNotices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedNotice, setSelectedNotice] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchNotices = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/notices', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setNotices(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: "Network anomaly retrieving compliance notices." })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchNotices()
    }, [])

    const reviewNotice = async (id: string, action: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`http://localhost:8000/api/v1/notices/${id}/review?status=${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setNotices(prev => prev.map(n => n.id === id ? { ...n, status: action } : n))
                toast({ type: 'success', message: `Notice status updated to ${action}.` })
            } else {
                toast({ type: "error", message: "Declined: Unable to update notice state." })
            }
        } catch (e) {
            toast({ type: "error", message: "System transmission error." })
        } finally {
            setActionLoading(false)
            setSelectedNotice(null)
        }
    }

    const scheduleReinspection = async (orig_id: string, notice_id: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`http://localhost:8000/api/v1/reinspections/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ original_inspection_id: orig_id, notice_id: notice_id })
            })
            if (res.ok) {
                toast({ type: 'success', message: 'Reinspection scheduled successfully.' })
                await reviewNotice(notice_id, 'REINSPECTION_PENDING')
            } else {
                toast({ type: "error", message: "Failed to generate reinspection docket." })
            }
        } catch (e) {
            toast({ type: "error", message: "System error communicating with engine." })
        } finally {
            setActionLoading(false)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">Service Unavailable</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Notices subsystem is unresponsive.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchNotices}>
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
                        <FileText className="w-8 h-8 text-[#2563EB]" /> Improvement Notices
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Monitor manufacturer rectification workflows and schedule reinspections.</p>
                </div>
                <Button variant="outline" className="border-border shadow-sm h-11 px-6 font-semibold" onClick={fetchNotices}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                </Button>
            </div>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">Active Notices Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Notice Identifier</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Inspection Origin</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Violation Details</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">Status</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Oversight Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                        <span className="text-sm">Loading enforcement records...</span>
                                    </TableCell>
                                </TableRow>
                            ) : notices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <ShieldCheck className="w-8 h-8 mb-3 mx-auto opacity-20 text-green-600" />
                                        <p className="text-sm font-medium">No pending improvement notices tracked.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notices.map((n, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-sm font-bold text-[#0B1F3A] dark:text-blue-400 py-4">
                                            {n.id.substring(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground py-4">
                                            {n.inspection_id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}
                                        </TableCell>
                                        <TableCell className="text-sm py-4 max-w-[200px] truncate text-foreground font-medium">
                                            {n.violations}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${n.status === 'ISSUED' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10' :
                                                    n.status === 'RECTIFICATION_SUBMITTED' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10' :
                                                        'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'}`}>
                                                {n.status || "UNKNOWN"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-4">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs" onClick={() => setSelectedNotice(n)}>
                                                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                                                </Button>
                                                {n.status === 'RECTIFICATION_SUBMITTED' ? (
                                                    <>
                                                        <Button size="sm" className="h-8 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs" onClick={() => reviewNotice(n.id, 'RESOLVED')} disabled={actionLoading}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" className="h-8 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold text-xs" onClick={() => scheduleReinspection(n.inspection_id, n.id)} disabled={actionLoading}>
                                                            <CalendarClock className="w-3 h-3 mr-1.5" /> Schedule Recheck
                                                        </Button>
                                                    </>
                                                ) : n.status === 'RESOLVED' ? (
                                                    <Button size="sm" variant="ghost" disabled className="h-8 text-xs font-semibold px-4 opacity-50">Closed</Button>
                                                ) : n.status === 'REINSPECTION_PENDING' ? (
                                                    <Button size="sm" variant="ghost" disabled className="h-8 text-xs font-semibold px-4 opacity-50 text-blue-600">Pending Setup</Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#2563EB]" /> Official Notice Dossier
                        </DialogTitle>
                        <DialogDescription>
                            Comprehensive metadata and compliance logs regarding this specific notice block.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedNotice && (
                        <div className="space-y-4 pt-4 text-sm mt-2">

                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">System ID</span>
                                <span className="col-span-2 font-mono text-[#0B1F3A] dark:text-blue-300 font-bold">{selectedNotice.id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">Inspection Ref</span>
                                <span className="col-span-2 font-mono">{selectedNotice.inspection_id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">Current Status</span>
                                <span className="col-span-2 font-semibold">
                                    <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${selectedNotice.status === 'ISSUED' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                            selectedNotice.status === 'RECTIFICATION_SUBMITTED' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                                'border-green-200 text-green-700 bg-green-50'}`}>
                                        {selectedNotice.status}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">Violation Log</span>
                                <span className="col-span-2 text-destructive font-medium leading-relaxed">{selectedNotice.violations || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/40">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">Required Fix</span>
                                <span className="col-span-2 font-medium">{selectedNotice.corrective_action || 'Manufacturer verification needed'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-3">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex items-center">Compliance By</span>
                                <span className="col-span-2 font-mono font-bold text-orange-700">
                                    {selectedNotice.due_date ? new Date(selectedNotice.due_date).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-6 border-t border-border pt-4">
                        <Button variant="outline" onClick={() => setSelectedNotice(null)}>Dismiss Dossier</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
