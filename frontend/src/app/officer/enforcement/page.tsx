"use client"
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { Scale, FileText, ServerCrash, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const STATE_TRANSITIONS: Record<string, string> = {
    OPEN: 'UNDER_REVIEW',
    UNDER_REVIEW: 'PENALTY_PENDING',
    PENALTY_PENDING: 'PENALTY_ISSUED',
    PENALTY_ISSUED: 'RESOLVED',
}

const STATE_LABEL: Record<string, string> = {
    OPEN: 'Begin Review',
    UNDER_REVIEW: 'Assess Penalty',
    PENALTY_PENDING: 'Confirm Issued',
    PENALTY_ISSUED: 'Mark Resolved',
}

const STATUS_COLOR: Record<string, string> = {
    OPEN: 'border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10',
    UNDER_REVIEW: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10',
    PENALTY_PENDING: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10',
    PENALTY_ISSUED: 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:bg-indigo-900/10',
    RESOLVED: 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10',
}

export default function EnforcementPage() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [cases, setCases] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(false)

    const [penaltyModal, setPenaltyModal] = React.useState<{ caseId: string; nextStatus: string } | null>(null)
    const [penaltyInput, setPenaltyInput] = React.useState<string>('')
    const [actionLoading, setActionLoading] = React.useState(false)

    const fetchCases = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/enforcement', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setCases(await res.json())
            } else {
                throw new Error('Failed to load enforcement cases.')
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: "Network error loading enforcement cases." })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchCases()
    }, [])

    const handleAdvanceState = async (caseId: string, currentStatus: string) => {
        const nextStatus = STATE_TRANSITIONS[currentStatus]
        if (!nextStatus) return

        // For UNDER_REVIEW → PENALTY_PENDING, require penalty amount input
        if (currentStatus === 'UNDER_REVIEW') {
            setPenaltyModal({ caseId, nextStatus })
            setPenaltyInput('')
            return
        }
        await submitStatusUpdate(caseId, nextStatus, null)
    }

    const submitStatusUpdate = async (caseId: string, nextStatus: string, penaltyAmount: number | null) => {
        setActionLoading(true)
        try {
            const body: any = { status: nextStatus }
            if (penaltyAmount !== null) body.penalty_amount = penaltyAmount

            const res = await fetch(`http://localhost:8000/api/v1/enforcement/${caseId}/status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                const updated = await res.json()
                setCases(prev => prev.map(c => c.id === caseId ? updated : c))
                toast({ type: 'success', message: `Case formally moved to ${nextStatus}` })
            } else {
                const err = await res.json()
                toast({ type: "error", message: "Failed to update case: " + (err.detail || 'Server error') })
            }
        } catch (e) {
            toast({ type: "error", message: "Network error updating enforcement case." })
        } finally {
            setActionLoading(false)
            setPenaltyModal(null)
        }
    }

    const handlePenaltySubmit = () => {
        if (!penaltyModal) return
        const amount = parseFloat(penaltyInput)
        if (isNaN(amount) || amount <= 0) {
            toast({ type: "error", message: "Please enter a valid penalty amount greater than 0." })
            return
        }
        submitStatusUpdate(penaltyModal.caseId, penaltyModal.nextStatus, amount)
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">Escalation API Offline</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Unable to connect to dynamic enforcement service.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchCases}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Engine Connection
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
                        <Scale className="w-8 h-8 text-[#2563EB]" /> Enforcement Docket
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Manage legal escalations, penalty assessments, and resolution statuses.</p>
                </div>
                <Button variant="outline" className="border-border shadow-sm h-11 px-6 font-semibold" onClick={fetchCases}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Database
                </Button>
            </div>

            {/* Penalty Amount Dialog */}
            <Dialog open={penaltyModal !== null} onOpenChange={(v) => { if (!v) setPenaltyModal(null) }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" /> Issue Penalty Assessment
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Enter the penalty amount (₹) to be assessed for this enforcement case. This will permanently move the case to <strong className="text-foreground">PENALTY_PENDING</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Penalty Amount (₹)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="100"
                                value={penaltyInput}
                                onChange={e => setPenaltyInput(e.target.value)}
                                className="h-11 font-mono text-lg"
                                placeholder="e.g. 25000"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setPenaltyModal(null)} disabled={actionLoading}>Cancel</Button>
                        <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold" onClick={handlePenaltySubmit} disabled={actionLoading}>
                            {actionLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {t("enforcement.issuePenalty") || "Confirm Issue"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">Active Case Directory</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Case ID</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Reference (Reinspection)</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">Status</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right">Penalty Assessed</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && cases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                        <span className="text-sm">Loading enforcement records...</span>
                                    </TableCell>
                                </TableRow>
                            ) : cases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <CheckCircle className="w-8 h-8 mb-3 mx-auto opacity-20 text-green-600" />
                                        <p className="text-sm font-medium">No legal escalations found in the system.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cases.map((c, i) => {
                                    const nextStatus = STATE_TRANSITIONS[c.status]
                                    const actionLabel = STATE_LABEL[c.status]
                                    return (
                                        <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                            <TableCell className="font-mono text-sm font-bold text-[#0B1F3A] dark:text-blue-400 py-4">
                                                {c.id.substring(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground py-4">
                                                {c.reinspection_id?.substring(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border ${STATUS_COLOR[c.status] || 'border-border text-foreground'}`}>
                                                    {c.status || "UNKNOWN"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-4 font-mono font-medium text-foreground">
                                                {c.penalty_amount ? `₹${c.penalty_amount.toLocaleString()}` : <span className="opacity-50">—</span>}
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/officer/reports/${c.id}`} target="_blank">
                                                        <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs">
                                                            <FileText className="w-3.5 h-3.5 mr-1.5" /> Audit History
                                                        </Button>
                                                    </Link>
                                                    {nextStatus ? (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold text-xs"
                                                            disabled={actionLoading}
                                                            onClick={() => handleAdvanceState(c.id, c.status)}
                                                        >
                                                            {actionLabel} <ArrowRight className="w-3 h-3 ml-1.5" />
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" disabled className="h-8 text-xs font-semibold px-4 opacity-50">
                                                            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-600" /> Concluded
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
