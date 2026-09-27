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
        fetch('http://localhost:8000/api/v1/manufacturer/products', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(async r => {
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

    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('manufacturer.products.myProducts')}</h2>
                <Link href="/manufacturer/products/new"><Button>{t('manufacturer.products.addNewProduct')}</Button></Link>
            </div>
            <Card>
                <div className="overflow-x-auto">
<Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('manufacturer.products.productName')}</TableHead>
                            <TableHead>{t('manufacturer.products.category')}</TableHead>
                            <TableHead>{t('manufacturer.products.currentStatus')}</TableHead>
                            <TableHead>{t('manufacturer.products.actions') || t('manufacturer.actions.actions') || 'Actions'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!products || !Array.isArray(products) || products.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t('manufacturer.products.noProducts')}</TableCell></TableRow>}
                        {(Array.isArray(products) ? products : []).map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.category || 'N/A'}</TableCell>
                                <TableCell><Badge>{t(`manufacturer.status.${p.status}`) || p.status}</Badge></TableCell>
                                <TableCell>
                                    <Link href={`/manufacturer/products/${p.id}`}><Button variant="secondary" size="sm">{t('manufacturer.actions.view')}</Button></Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
</div>
            </Card>
        </div>
    )
}
