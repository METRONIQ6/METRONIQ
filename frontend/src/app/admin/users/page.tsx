"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

    const fetchCounts = async () => {
        setCountsError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/users/counts', {
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
            const res = await fetch(`http://localhost:8000/api/v1/users/?role=${roleFilter}`, {
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

    const handleAction = async (userId: string, action: 'approve' | 'reject' | 'suspend', actionType: 'approve' | 'reject' | 'suspend' | 'reactivate' = action) => {
        let confirmText = action === 'approve' ? t('adminUI.approveConfirm') : t('adminUI.rejectConfirm');
        if (actionType === 'suspend') confirmText = t('adminUI.suspendConfirm') || 'Are you sure you want to suspend this user?';
        if (actionType === 'reactivate') confirmText = t('adminUI.reactivateConfirm') || 'Are you sure you want to reactivate this user?';

        if (!window.confirm(confirmText)) return

        try {
            const res = await fetch(`http://localhost:8000/api/v1/users/${userId}/${action}`, {
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
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-2">
                    <UserCog className="w-8 h-8 text-[#2563EB]" />
                    {t('adminUI.userManagement')}
                </h1>
                <p className="text-muted-foreground mt-1.5 font-medium">{t('adminUI.userManagementDesc')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {countsError ? (
                    <div className="col-span-5 py-6 text-center border rounded-xl bg-card border-border border-dashed text-red-500">
                        <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t('error.failedLoad') || 'Failed to load user counts'}</p>
                    </div>
                ) : (
                    <>
                        <Card className="rounded-xl shadow-sm border border-border bg-card">
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('adminUI.totalManufacturers')}</p>
                                    <Building2 className="w-5 h-5 text-[#2563EB]" />
                                </div>
                                <div className="text-2xl font-bold">{counts?.manufacturers ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border border-border bg-card">
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('adminUI.totalOfficers')}</p>
                                    <ShieldCheck className="w-5 h-5 text-[#0B1F3A] dark:text-white" />
                                </div>
                                <div className="text-2xl font-bold">{counts?.officers_total ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border border-border bg-card">
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">{t('adminUI.pendingApprovals')}</p>
                                    <UserMinus className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="text-2xl font-bold">{counts?.officers_pending ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border border-border bg-card">
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">{t('adminUI.approved')}</p>
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold">{counts?.officers_approved ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border border-border bg-card">
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">{t('adminUI.rejected')}</p>
                                    <UserX className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-2xl font-bold">{counts?.officers_rejected ?? '-'}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Card className="rounded-xl shadow-sm border border-border bg-card">
                <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-6 grid w-full grid-cols-2">
                            <TabsTrigger value="manufacturers">{t('adminUI.manufacturers')}</TabsTrigger>
                            <TabsTrigger value="officers">{t('adminUI.governmentOfficers')}</TabsTrigger>
                        </TabsList>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('adminUI.email')}</TableHead>
                                        <TableHead>{t('adminUI.registrationDate')}</TableHead>
                                        <TableHead>{t('adminUI.status')}</TableHead>
                                        <TableHead className="text-right">{t('adminUI.actions') || 'Actions'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">{t('common.loading') || 'Loading...'}</TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-red-500">{t('error.failedLoad') || 'Failed to load users'}</TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('adminUI.noUsers')}</TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.status === 'APPROVED' ? 'default' : (user.status === 'REJECTED' ? 'destructive' : (user.status === 'SUSPENDED' ? 'secondary' : 'secondary'))} className={user.status === 'SUSPENDED' ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent" : ""}>
                                                        {user.status === 'PENDING_APPROVAL' ? t('adminUI.pendingApprovals') : (user.status === 'APPROVED' ? t('adminUI.approved') : (user.status === 'SUSPENDED' ? t('adminUI.suspended') || 'Suspended' : t('adminUI.rejected')))}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                                    {user.status === 'PENDING_APPROVAL' && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" onClick={() => handleAction(user.id, 'approve')}>{t('adminUI.approve')}</Button>
                                                            <Button size="sm" variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800" onClick={() => handleAction(user.id, 'reject')}>{t('adminUI.reject')}</Button>
                                                        </>
                                                    )}
                                                    {user.status === 'APPROVED' && (
                                                        <Button size="sm" variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800" onClick={() => handleAction(user.id, 'suspend', 'suspend')}>{t('adminUI.suspend') || 'Suspend'}</Button>
                                                    )}
                                                    {(user.status === 'REJECTED' || user.status === 'SUSPENDED') && (
                                                        <Button size="sm" variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800" onClick={() => handleAction(user.id, 'approve', 'reactivate')}>{t('adminUI.reactivate') || 'Reactivate'}</Button>
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
        </div>
    )
}
