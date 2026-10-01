
"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { mapManufacturerError } from '@/lib/errorUtils'
import { useRouter } from 'next/navigation'

import { Label } from "@/components/ui/label"
import { ArrowLeft, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewProduct() {
    const { t } = useTranslation()
    const [form, setForm] = useState({ name: '', category: '', net_quantity: '', mrp: '', generic_name: '', manufacturer_name: '', country_of_origin: '' })
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    const submit = async () => {
        setSubmitting(true)
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
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <Link href="/manufacturer/products">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('manufacturer.create_product.registerNew') || 'Register New Product'}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Create a product declaration draft prior to pre-market Legal Metrology self-audit.
                    </p>
                </div>
            </div>

            {errorKey && (
                <div className="p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                    {t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}
                </div>
            )}

            <Card className="rounded-lg border border-border bg-card shadow-xs">
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Product Name <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                            placeholder="e.g. Pure Desi Ghee 1L" 
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                            className="h-9"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Category
                            </Label>
                            <Input 
                                placeholder="e.g. Dairy / Food Packaging" 
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })} 
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Generic Name
                            </Label>
                            <Input 
                                placeholder="e.g. Clarified Butter" 
                                value={form.generic_name}
                                onChange={e => setForm({ ...form, generic_name: e.target.value })} 
                                className="h-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Net Quantity
                            </Label>
                            <Input 
                                placeholder="e.g. 1 L or 905 g" 
                                value={form.net_quantity}
                                onChange={e => setForm({ ...form, net_quantity: e.target.value })} 
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                MRP (₹)
                            </Label>
                            <Input 
                                placeholder="e.g. ₹650.00 (incl. of all taxes)" 
                                value={form.mrp}
                                onChange={e => setForm({ ...form, mrp: e.target.value })} 
                                className="h-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Manufacturer Name & Address
                        </Label>
                        <Input 
                            placeholder="e.g. Metron Foods Pvt Ltd, Plot 42, Industrial Area, Chennai" 
                            value={form.manufacturer_name}
                            onChange={e => setForm({ ...form, manufacturer_name: e.target.value })} 
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Country of Origin
                        </Label>
                        <Input 
                            placeholder="e.g. India" 
                            value={form.country_of_origin}
                            onChange={e => setForm({ ...form, country_of_origin: e.target.value })} 
                            className="h-9"
                        />
                    </div>

                    <div className="pt-3">
                        <Button 
                            onClick={submit} 
                            disabled={submitting || !form.name} 
                            className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white font-medium h-9 text-sm"
                        >
                            {submitting ? 'Saving...' : 'Save Draft'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
