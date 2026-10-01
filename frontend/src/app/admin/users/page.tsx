"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslation } from "@/i18n"
import { useToast } from "@/components/ui/use-toast"
import { getToken } from '@/lib/auth'
import { Building2, ShieldCheck, UserCog, UserCheck, UserX, UserMinus, ShieldAlert } from 'lucide-react'

export default function UserManagementPage() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [counts, setCounts] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [countsError, setCountsError] = useState(false)
    const [activeTab, setActiveTab] = useState("manufacturers")
    const [confirmAction, setConfirmAction] = useState<{ userId: string, action: 'approve' | 'reject' | 'suspend', actionType: 'approve' | 'reject' | 'suspend' | 'reactivate', text: string } | null>(null)

    const fetchCounts = async () => {
        setCountsError(false)
        try {
            const res = await fetch('/api/v1/users/counts', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setCounts(await res.json())
            } else {
                setCountsError(true)
            }
        } catch (e) {
            console.error(e)
            setCountsError(true)
        }
    }

    const fetchUsers = async () => {
        setLoading(true)
        setError(false)
        try {
            let roleFilter = activeTab === "manufacturers" ? "MANUFACTURER" : "OFFICER"
            const res = await fetch(`/api/v1/users?role=${roleFilter}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setUsers(await res.json())
            } else {
                setError(true)
            }
        } catch (e) {
            console.error(e)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCounts()
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [activeTab])

    const handleAction = (userId: string, action: 'approve' | 'reject' | 'suspend', actionType: 'approve' | 'reject' | 'suspend' | 'reactivate' = action) => {
        let confirmText = action === 'approve' ? t('adminUI.approveConfirm') : t('adminUI.rejectConfirm');
        if (actionType === 'suspend') confirmText = t('adminUI.suspendConfirm') || 'Are you sure you want to suspend this user?';
        if (actionType === 'reactivate') confirmText = t('adminUI.reactivateConfirm') || 'Are you sure you want to reactivate this user?';

        setConfirmAction({ userId, action, actionType, text: confirmText });
    }

    const executeAction = async () => {
        if (!confirmAction) return;
        const { userId, action, actionType } = confirmAction;
        setConfirmAction(null);

        try {
            const res = await fetch(`/api/v1/users/${userId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                const actionSuccessText = actionType === 'suspend' ? 'suspended' : actionType === 'reactivate' ? 'reactivated' : `${action}d`;
                toast({ message: `User ${actionSuccessText} successfully.`, type: "success" })
                fetchCounts()
                fetchUsers()
            } else {
                const data = await res.json()
                toast({ message: data.detail || `Failed to ${action} user`, type: "error" })
            }
        } catch (e) {
            toast({ message: "Network error", type: "error" })
        }
    }

    return (
        <div className="space-y-6 max-w-7xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2.5">
                        <UserCog className="w-6 h-6 text-[#2563EB]" />
                        {t('adminUI.userManagement')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{t('adminUI.userManagementDesc')}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                {countsError ? (
                    <div className="col-span-5 py-6 text-center border rounded-lg bg-card border-border border-dashed text-destructive text-xs">
                        <ShieldAlert className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                        <p>{t('error.failedLoad') || 'Failed to load user counts'}</p>
                    </div>
                ) : (
                    <>
                        <Card className="rounded-lg shadow-xs border border-border bg-card">
                            <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('adminUI.totalManufacturers')}</p>
                                    <Building2 className="w-4 h-4 text-[#2563EB]" />
                                </div>
                                <div className="text-2xl font-bold tracking-tight font-mono text-foreground">{counts?.manufacturers ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg shadow-xs border border-border bg-card">
                            <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('adminUI.totalOfficers')}</p>
                                    <ShieldCheck className="w-4 h-4 text-[#0B1F3A] dark:text-white" />
                                </div>
                                <div className="text-2xl font-bold tracking-tight font-mono text-foreground">{counts?.officers_total ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg shadow-xs border border-border bg-card">
                            <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('adminUI.pendingApprovals')}</p>
                                    <UserMinus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="text-2xl font-bold tracking-tight font-mono text-amber-600 dark:text-amber-400">{counts?.officers_pending ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg shadow-xs border border-border bg-card">
                            <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">{t('adminUI.approved')}</p>
                                    <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-2xl font-bold tracking-tight font-mono text-green-600 dark:text-green-400">{counts?.officers_approved ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg shadow-xs border border-border bg-card">
                            <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-destructive uppercase tracking-wider">{t('adminUI.rejected')}</p>
                                    <UserX className="w-4 h-4 text-destructive" />
                                </div>
                                <div className="text-2xl font-bold tracking-tight font-mono text-destructive">{counts?.officers_rejected ?? '-'}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <CardContent className="p-5">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4 grid w-full max-w-md grid-cols-2 h-9 p-1">
                            <TabsTrigger value="manufacturers" className="text-xs font-semibold">{t('adminUI.manufacturers')}</TabsTrigger>
                            <TabsTrigger value="officers" className="text-xs font-semibold">{t('adminUI.governmentOfficers')}</TabsTrigger>
                        </TabsList>

                        <div className="overflow-x-auto rounded-md border border-border/60">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 pl-4">{t('adminUI.email')}</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('adminUI.registrationDate')}</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('adminUI.status')}</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">{t('adminUI.actions') || 'Actions'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                <span className="text-xs font-medium">{t('common.loading') || 'Loading...'}</span>
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-destructive text-xs">{t('error.failedLoad') || 'Failed to load users'}</TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs">{t('adminUI.noUsers')}</TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map(user => (
                                            <TableRow key={user.id} className="border-border hover:bg-muted/40 transition-colors">
                                                <TableCell className="font-mono text-xs font-medium py-3 pl-4 text-foreground">{user.email}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground py-3 font-mono">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold border ${
                                                        user.status === 'APPROVED' ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10' :
                                                        user.status === 'REJECTED' ? 'border-red-200 text-destructive bg-destructive/10 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10' :
                                                        user.status === 'SUSPENDED' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/10' :
                                                        'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10'
                                                    }`}>
                                                        {user.status === 'PENDING_APPROVAL' ? t('adminUI.pendingApprovals') :
                                                         user.status === 'APPROVED' ? t('adminUI.approved') :
                                                         user.status === 'SUSPENDED' ? (t('adminUI.suspended') || 'Suspended') :
                                                         t('adminUI.rejected')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-3 pr-4 space-x-1.5 whitespace-nowrap">
                                                    {user.status === 'PENDING_APPROVAL' && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" onClick={() => handleAction(user.id, 'approve')}>
                                                                {t('adminUI.approve')}
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold bg-red-50 text-destructive border-red-200 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" onClick={() => handleAction(user.id, 'reject')}>
                                                                {t('adminUI.reject')}
                                                            </Button>
                                                        </>
                                                    )}
                                                    {user.status === 'APPROVED' && (
                                                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" onClick={() => handleAction(user.id, 'suspend', 'suspend')}>
                                                            {t('adminUI.suspend') || 'Suspend'}
                                                        </Button>
                                                    )}
                                                    {(user.status === 'REJECTED' || user.status === 'SUSPENDED') && (
                                                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold bg-blue-50 text-[#2563EB] border-blue-200 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" onClick={() => handleAction(user.id, 'approve', 'reactivate')}>
                                                            {t('adminUI.reactivate') || 'Reactivate'}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent className="sm:max-w-[420px] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#0B1F3A] dark:text-white">
                            {t('adminUI.confirmActionTitle') || 'Confirm Action'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-xs text-foreground leading-relaxed">
                            {confirmAction?.text}
                        </p>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-border/60">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setConfirmAction(null)}>
                            {t('adminUI.cancel') || 'Cancel'}
                        </Button>
                        <Button size="sm" className="h-8 text-xs font-semibold" onClick={executeAction} variant={confirmAction?.action === 'reject' || confirmAction?.actionType === 'suspend' ? 'destructive' : 'default'}>
                            {t('adminUI.confirm') || 'Confirm'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
