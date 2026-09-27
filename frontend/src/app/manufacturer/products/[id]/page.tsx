
"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mapManufacturerError } from '@/lib/errorUtils'

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = React.use(params)
    const { id } = unwrappedParams
    const { t } = useTranslation()
    const [prod, setProd] = useState<any>(null)
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetch(`http://localhost:8000/api/v1/manufacturer/products/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
            .then(async r => {
                if (!r.ok) {
                    setErrorKey(mapManufacturerError(r.status))
                    return null
                }
                return r.json()
            })
            .then(d => {
                if (d) setProd(d.detail ? null : d)
            }).catch(e => setErrorKey(mapManufacturerError(undefined, e.message)))
    }, [id])

    const submitGov = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/manufacturer/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ product_id: id })
            })
            if (!res.ok) {
                setErrorKey(mapManufacturerError(res.status))
                return
            }
            window.location.reload()
        } catch (e: any) {
            setErrorKey(mapManufacturerError(undefined, e.message))
        }
    }

    if (errorKey) return <div className="p-4 text-red-500">{t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}</div>
    if (!prod) return <div>{t('common.loading') || 'Loading...'}</div>

    return (
        <div className="space-y-6 max-w-4xl">
            <h2 className="text-2xl font-bold">{prod.name}</h2>
            <Card><CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><b>Status:</b> <Badge>{prod.status}</Badge></div>
                    <div><b>Category:</b> {prod.category}</div>
                    <div><b>MRP:</b> {prod.mrp}</div>
                    <div><b>Net Quantity:</b> {prod.net_quantity}</div>
                    <div><b>Origin:</b> {prod.country_of_origin}</div>
                </div>

                <div className="flex gap-4 pt-4">
                    {prod.status === 'DRAFT' && (
                        <>
                            <Link href={`/manufacturer/compliance-audit?product_id=${prod.id}`}><Button variant="secondary">Run Compliance Audit</Button></Link>
                            <Button onClick={submitGov}>Submit for Government Review</Button>
                        </>
                    )}
                    {(prod.status === 'CHANGES_REQUIRED') && (
                        <>
                            <Link href={`/manufacturer/compliance-audit?product_id=${prod.id}`}><Button variant="secondary">Correct & Re-Audit</Button></Link>
                            <Button onClick={submitGov}>Resubmit</Button>
                        </>
                    )}
                </div>
            </CardContent></Card>
        </div>
    )
}
