"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Scale, ServerCrash, RefreshCw } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useTranslation } from "@/i18n"
import { useToast } from "@/components/ui/use-toast"

export default function RuleManagement() {
    const { t } = useTranslation()
    const { toast } = useToast()
    const [rules, setRules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // Form state
    const [open, setOpen] = useState(false)
    const [newId, setNewId] = useState('')
    const [newName, setNewName] = useState('')
    const [newCategory, setNewCategory] = useState('FOOD_PACKAGING')
    const [createLoading, setCreateLoading] = useState(false)

    const loadRules = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/rules', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setRules(await res.json())
            } else {
                throw new Error("Failed to load rules")
            }
        } catch (e) {
            console.error(e)
            setError(true)
            toast({ type: 'error', message: 'Unable to connect to Rules Engine API' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRules()
    }, [])

    const createRule = async () => {
        if (!newId || !newName) {
            toast({ type: 'error', message: 'Rule ID and Name are required.' })
            return
        }

        setCreateLoading(true)
        const payload = {
            id: newId,
            name: newName,
            category: newCategory,
            logic_payload: { required: true }
        }
        try {
            const res = await fetch('http://localhost:8000/api/v1/rules', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                toast({ type: 'success', message: 'Rule configuration created successfully' })
                setOpen(false)
                setNewId('')
                setNewName('')
                loadRules()
            } else {
                const text = await res.text()
                toast({ type: 'error', message: `Creation failed: ${text}` })
            }
        } catch (e) {
            console.error(e)
            toast({ type: 'error', message: 'Network error occurred while saving' })
        } finally {
            setCreateLoading(false)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">Rules Engine API Offline</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Unable to fetch statutory compliance configurations.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={loadRules}>
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
                        <Scale className="w-8 h-8 text-[#2563EB]" /> Metrology Rules Engine
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Manage and version compliance regulations that power the AI scanner.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>
                        <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold h-11 px-6 shadow-sm">
                            <PlusCircle className="mr-2 w-4 h-4" /> Define New Regulation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-[#0B1F3A] dark:text-white">Define Regulation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("admin.ruleId")}</Label>
                                <Input placeholder="e.g. LM-PKG-NETQTY-01" value={newId} onChange={e => setNewId(e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("admin.ruleName")}</Label>
                                <Input placeholder="e.g. Mandatory Net Quantity" value={newName} onChange={e => setNewName(e.target.value)} className="h-11" />
                            </div>
                            <Button className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 h-11 text-sm font-semibold mt-4" onClick={createRule} disabled={createLoading}>
                                {createLoading ? 'Executing...' : 'Commit Regulation'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Rules Table */}
            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">Active Statutes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Rule Identifier</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Legal Requirement</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Category Domain</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">Version</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">System Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : rules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <Scale className="w-8 h-8 mb-3 mx-auto opacity-20" />
                                        <p className="text-sm font-medium">No active regulations populated.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rules.map((r, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-sm font-bold text-[#0B1F3A] dark:text-blue-400 py-4">
                                            {r.id.toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground py-4 font-medium">
                                            {r.requirement || r.name || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground py-4">
                                            {r.category || "GENERAL"}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">v{r.version || '1.0'}</span>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${r.status === 'ACTIVE'
                                                    ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'
                                                    : 'border-muted text-muted-foreground bg-muted/20'}`}>
                                                {r.status || 'ACTIVE'}
                                            </Badge>
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
