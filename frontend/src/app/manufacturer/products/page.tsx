"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const { t } = useTranslation()
    const [errorKey, setErrorKey] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/v1/manufacturer/products', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(async r => {
                if (!r.ok) {
                    const errPayload = await r.json().catch(()=>({}));
                    setErrorKey(mapManufacturerError(r.status, errPayload.detail || errPayload.message));
                    return null;
                }
                return r.json();
            }).then(d => {
                if (d) setProducts(d.detail ? [] : (Array.isArray(d) ? d : (d.data || d)))
            }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [])

    if (errorKey) return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                {t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}
            </div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        {t('manufacturer.products.myProducts')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Register, self-audit, and submit pre-packaged commodity labels for statutory review.
                    </p>
                </div>
                <Link href="/manufacturer/products/new">
                    <Button className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white font-medium h-9 px-4 text-sm">
                        {t('manufacturer.products.addNewProduct')}
                    </Button>
                </Link>
            </div>

            <Card className="rounded-lg shadow-xs border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-muted/20">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.products.productName')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9">{t('manufacturer.products.category')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-center">{t('manufacturer.products.currentStatus')}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground h-9 text-right">{t('manufacturer.products.actions') || t('manufacturer.actions.actions') || 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!products || !Array.isArray(products) || products.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                                        <p className="text-sm font-medium">{t('manufacturer.products.noProducts')}</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (Array.isArray(products) ? products : []).map(p => (
                                    <TableRow key={p.id} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-medium text-sm text-foreground py-3">
                                            {p.name}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-3">
                                            {p.category || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-center py-3">
                                            <Badge variant={p.status === 'APPROVED' ? 'success' : (p.status === 'CHANGES_REQUIRED' ? 'destructive' : (p.status === 'UNDER_REVIEW' ? 'warning' : 'neutral'))} className="font-mono text-xs uppercase">
                                                {t(`manufacturer.status.${p.status}`) || p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-3">
                                            <Link href={`/manufacturer/products/${p.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                                                    {t('manufacturer.actions.view')}
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
