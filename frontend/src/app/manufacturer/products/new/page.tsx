
"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'
import { useRouter } from 'next/navigation'

export default function NewProduct() {
    const { t } = useTranslation()
    const [form, setForm] = useState({ name: '', category: '', net_quantity: '', mrp: '', generic_name: '', manufacturer_name: '', country_of_origin: '' })
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const router = useRouter()

    const submit = async () => {
        try {
            const res = await fetch('/api/v1/manufacturer/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(form)
            })
            if (res.ok) router.push('/manufacturer/products')
            else setErrorKey(mapManufacturerError(res.status))
        } catch (e: any) {
            setErrorKey(mapManufacturerError(undefined, e.message))
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">{t('manufacturer.create_product.registerNew') || 'Add Product'}</h2>
            {errorKey && <div className="p-4 bg-red-100 text-destructive-foreground rounded">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>}
            <Card><CardContent className="space-y-4 pt-4">
                <Input placeholder="Product Name" onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Category" onChange={e => setForm({ ...form, category: e.target.value })} />
                <Input placeholder="Net Quantity" onChange={e => setForm({ ...form, net_quantity: e.target.value })} />
                <Input placeholder="MRP" onChange={e => setForm({ ...form, mrp: e.target.value })} />
                <Input placeholder="Generic Name" onChange={e => setForm({ ...form, generic_name: e.target.value })} />
                <Input placeholder="Manufacturer Name/Address" onChange={e => setForm({ ...form, manufacturer_name: e.target.value })} />
                <Input placeholder="Country of Origin" onChange={e => setForm({ ...form, country_of_origin: e.target.value })} />
                <Button onClick={submit} className="w-full">Save Draft</Button>
            </CardContent></Card>
        </div>
    )
}
