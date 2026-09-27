"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Scale, ServerCrash, RefreshCw, Trash2 } from 'lucide-react'
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
    const [ruleField, setRuleField] = useState('MRP')
    const [ruleRequired, setRuleRequired] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)

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
            toast({ type: 'error', message: t("error.rules_api") || "Failed to fetch rules" })
        } finally {
            setLoading(false)
        }
    }

    const deleteRule = async (ruleId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/rules/${ruleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                toast({ type: 'success', message: t('success.rule_deleted') || 'Rule successfully deleted.' })
                loadRules()
            } else {
                toast({ type: 'error', message: t('error.rule_delete_failed') || 'Failed to delete rule.' })
            }
        } catch (e) {
            toast({ type: 'error', message: t("error.network_save") || 'Network error deleting rule.' })
        } finally {
            setRuleToDelete(null)
        }
    }

    useEffect(() => {
        loadRules()
    }, [])

    const createRule = async () => {
        if (!newId || !newName || !newCategory || !ruleField) {
            toast({ type: 'error', message: t("error.rule_required") || "Please complete all required regulation fields." })
            return
        }

        const parsedLogic = { field: ruleField, required: ruleRequired }

        setCreateLoading(true)
        const payload = {
            id: newId,
            name: newName,
            category: newCategory,
            initial_logic: parsedLogic
        }
        try {
            const res = await fetch('http://localhost:8000/api/v1/rules', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                toast({ type: 'success', message: t("success.rule_created") || "Rule created successfully." })
                setOpen(false)
                setNewId('')
                setNewName('')
                setNewCategory('FOOD_PACKAGING')
                setRuleField('MRP')
                setRuleRequired(true)
                loadRules()
            } else if (res.status === 422) {
                const errData = await res.json()
                if (errData.detail && Array.isArray(errData.detail) && errData.detail.length > 0) {
                    const firstErr = errData.detail[0]
                    const field = firstErr.loc[firstErr.loc.length - 1]
                    const translatedField = t(`admin.${field}`) || field
                    toast({ type: 'error', message: `${translatedField}: ${t('error.fieldRequired') || 'This field is required.'}` })
                } else {
                    toast({ type: 'error', message: t("error.invalidPayload") || "Please complete all required regulation fields." })
                }
            } else {
                const text = await res.text()
                toast({ type: 'error', message: `Creation failed: ${text}` })
            }
        } catch (e) {
            console.error(e)
            toast({ type: 'error', message: t("error.network_save") || "Network error." })
        } finally {
            setCreateLoading(false)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('error.rulesEngineApiOffline')}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Unable to fetch statutory compliance configurations.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={loadRules}>
                    <RefreshCw className="w-4 h-4 mr-2" />{t('error.retryConnection')}</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-3">
                        <Scale className="w-8 h-8 text-[#2563EB]" />{t('adminUI.metrologyRulesEngine')}</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Manage and version compliance regulations that power the AI scanner.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger className={buttonVariants({ className: "bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold h-11 px-6 shadow-sm" })}>
                        <PlusCircle className="mr-2 w-4 h-4" />{t('adminUI.defineNewRegulation')}</DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-[#0B1F3A] dark:text-white">{t('adminUI.defineRegulation')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {t("admin.ruleId") || "Rule ID"} <span className="text-destructive">*</span>
                                </Label>
                                <Input placeholder={t('adminUI.egRuleIdentifier') || "e.g. RULE-01"} value={newId} onChange={e => setNewId(e.target.value)} className="h-11" required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {t("admin.ruleName") || "Requirement Name"} <span className="text-destructive">*</span>
                                </Label>
                                <Input placeholder={t('adminUI.egMandatoryNetQuantity') || "e.g. Mandatory Net Quantity"} value={newName} onChange={e => setNewName(e.target.value)} className="h-11" required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {t("admin.categoryDomain") || "Category Domain"} <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    required
                                >
                                    <option value="FOOD_PACKAGING">Food Packaging</option>
                                    <option value="PACKAGING">Packaging</option>
                                    <option value="DISPLAY">Display / General</option>
                                </select>
                            </div>
                            <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                    {t("admin.initialLogic") || "Rule Specifications"}
                                </Label>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-foreground">
                                        {t("admin.ruleField") || "Target Field Name"} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input placeholder={t('adminUI.egField') || "e.g. MRP, NET_QUANTITY, MANUFACTURER"} value={ruleField} onChange={e => setRuleField(e.target.value)} className="h-11 bg-background" required />
                                </div>
                                <div className="flex items-center space-x-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="ruleRequired"
                                        checked={ruleRequired}
                                        onChange={e => setRuleRequired(e.target.checked)}
                                        className="w-5 h-5 rounded border-input text-primary focus:ring-primary bg-background"
                                    />
                                    <Label htmlFor="ruleRequired" className="text-sm font-semibold select-none cursor-pointer">
                                        {t("admin.isMandatory") || "Is this field mandatory for compliance?"}
                                    </Label>
                                </div>
                            </div>
                            <Button className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 h-11 text-sm font-semibold mt-4" onClick={createRule} disabled={createLoading}>
                                {createLoading ? (t('adminUI.executing') || 'Executing...') : (t('adminUI.commitRegulation') || 'Commit Regulation')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Rules Table */}
            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">{t('adminUI.activeStatutes')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('adminUI.ruleIdentifier')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('adminUI.legalRequirement')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('adminUI.categoryDomain')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('adminUI.version')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('adminUI.systemStatus')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right">{t('adminUI.actions') || 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : rules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
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
                                        <TableCell className="text-right py-4">
                                            <Button variant="ghost" size="sm" onClick={() => setRuleToDelete(r.id)} className="text-destructive hover:text-white hover:bg-destructive" title={t('adminUI.deleteRule') || 'Delete Rule'}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0B1F3A] dark:text-white">
                            {t('adminUI.confirmDeleteRuleTitle') || 'Delete Regulation'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground">
                            {t('adminUI.confirmDeleteRule') || 'Are you sure you want to delete this rule?'} {t('adminUI.cannotUndo') || 'This action cannot be undone.'}
                        </p>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                        <Button variant="outline" onClick={() => setRuleToDelete(null)}>
                            {t('adminUI.cancel') || 'Cancel'}
                        </Button>
                        <Button variant="destructive" onClick={() => { if (ruleToDelete) { deleteRule(ruleToDelete); } }}>
                            {t('adminUI.delete') || 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
