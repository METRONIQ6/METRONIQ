
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

import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Send, RefreshCw } from 'lucide-react'

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = React.use(params)
    const { id } = unwrappedParams
    const { t } = useTranslation()
    const [prod, setProd] = useState<any>(null)
    const [errorKey, setErrorKey] = useState<string | null>(null)
    const [submittingGov, setSubmittingGov] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetch(`/api/v1/manufacturer/products/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
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
        setSubmittingGov(true)
        try {
            const res = await fetch('/api/v1/manufacturer/submissions', {
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
        } finally {
            setSubmittingGov(false)
        }
    }

    if (errorKey) return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                {t('common.error') || 'Error'}: {t(`manufacturer.errors.${errorKey}`)}
            </div>
        </div>
    )
    if (!prod) return (
        <div className="p-8 max-w-4xl mx-auto text-center text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">{t('common.loading') || 'Loading product dossier...'}</span>
        </div>
    )

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/manufacturer/products">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{prod.name}</h1>
                            <Badge variant={prod.status === 'APPROVED' ? 'success' : (prod.status === 'CHANGES_REQUIRED' ? 'destructive' : (prod.status === 'UNDER_REVIEW' ? 'warning' : 'neutral'))} className="font-mono text-xs uppercase">
                                {prod.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Product ID: <span className="font-mono">{prod.id}</span></p>
                    </div>
                </div>
            </div>

            <Card className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
                <div className="bg-muted/30 px-5 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground tracking-tight">Statutory Declarations Specification</h2>
                </div>
                <CardContent className="p-5 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
                            <p className="text-sm font-medium text-foreground">{prod.category || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MRP</span>
                            <p className="text-sm font-mono font-medium text-foreground">{prod.mrp || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Quantity</span>
                            <p className="text-sm font-mono font-medium text-foreground">{prod.net_quantity || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country of Origin</span>
                            <p className="text-sm font-medium text-foreground">{prod.country_of_origin || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manufacturer / Packer</span>
                            <p className="text-sm font-medium text-foreground">{prod.manufacturer_name || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 flex flex-wrap items-center gap-3">
                        {prod.status === 'DRAFT' && (
                            <>
                                <Link href={`/manufacturer/compliance-audit?product_id=${prod.id}`}>
                                    <Button variant="outline" className="h-9 text-xs font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
                                        Run Compliance Audit
                                    </Button>
                                </Link>
                                <Button 
                                    onClick={submitGov} 
                                    disabled={submittingGov}
                                    className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white h-9 text-xs font-medium"
                                >
                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                    {submittingGov ? 'Submitting...' : 'Submit for Government Review'}
                                </Button>
                            </>
                        )}
                        {(prod.status === 'CHANGES_REQUIRED') && (
                            <>
                                <Link href={`/manufacturer/compliance-audit?product_id=${prod.id}`}>
                                    <Button variant="outline" className="h-9 text-xs font-medium border-destructive/30 text-destructive hover:bg-destructive/10">
                                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                        Correct & Re-Audit
                                    </Button>
                                </Link>
                                <Button 
                                    onClick={submitGov} 
                                    disabled={submittingGov}
                                    className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/90 text-white h-9 text-xs font-medium"
                                >
                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                    {submittingGov ? 'Submitting...' : 'Resubmit'}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
