'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServerCrash, RefreshCw, Search, Plus, Globe, MousePointerClick, ShieldCheck, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from '@/i18n'

export default function EcommercePage() {
    const { t } = useTranslation()
    const { toast } = useToast()

    const [monitors, setMonitors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [newUrl, setNewUrl] = useState("")

    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [scanResults, setScanResults] = useState<Record<string, any>>({})

    const fetchMonitors = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/v1/ecommerce', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setMonitors(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: t("error.ecommerce_fetch") })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonitors()
    }, [])

    // Polling logic
    useEffect(() => {
        const scanningMonitors = monitors.filter(m => m.last_scan_result === 'SCANNING...')
        if (scanningMonitors.length === 0) return

        const activePolls = new Set(scanningMonitors.map(m => m.id))

        const interval = setInterval(async () => {
            let updated = false
            const nextMonitors = [...monitors]

            for (const id of activePolls) {
                try {
                    const res = await fetch(`/api/v1/ecommerce/${id}/status`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    })
                    if (res.ok) {
                        const data = await res.json()
                        if (data.status !== "PROCESSING" && data.status !== "IDLE") {
                            // Terminal state reached
                            const mIdx = nextMonitors.findIndex(m => m.id === id)
                            if (mIdx !== -1) {
                                nextMonitors[mIdx] = { ...nextMonitors[mIdx], last_scan_result: data.status === 'SUCCESS' ? (data.result?.compliance || data.status) : data.status }
                                updated = true
                            }
                            if (data.status === 'SUCCESS' && data.result) {
                                setScanResults(prev => ({ ...prev, [id]: data.result }))
                                setExpandedRows(prev => ({ ...prev, [id]: true }))
                            }
                            activePolls.delete(id)
                        }
                    }
                } catch {
                    // Ignore transient errors
                }
            }
            if (updated) {
                setMonitors(nextMonitors)
            }
        }, 1500)

        // Safety timeout (maximum polling duration 120s)
        const timeout = setTimeout(() => {
            clearInterval(interval)
        }, 120000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [monitors])

    const addMonitor = async () => {
        if (!newUrl) {
            toast({ type: "warning", message: t("warning.valid_url") })
            return
        }
        try {
            const res = await fetch(`/api/v1/ecommerce/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_url: newUrl, monitoring_frequency: "DAILY" })
            })
            if (res.ok) {
                const newM = await res.json()
                setMonitors([newM, ...monitors])
                setNewUrl("")
                toast({ type: "success", message: t("success.tracking_started") })
                // Trigger auto-scan
                triggerScan(newM.id)
            } else {
                toast({ type: "error", message: t("error.monitor_failed") })
            }
        } catch (e) {
            toast({ type: "error", message: t("error.network_comm") })
        }
    }

    const triggerScan = async (id: string) => {
        try {
            await fetch(`/api/v1/ecommerce/${id}/scan`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            setMonitors(prev => prev.map(m => m.id === id ? { ...m, last_scan_result: 'SCANNING...' } : m))
            toast({ type: "success", message: t("success.manual_crawl") || "Monitoring started" })
        } catch (e) {
            toast({ type: "error", message: t("error.system_crawl") || "System Crawl Error" })
        }
    }

    const toggleRow = async (id: string) => {
        const isExp = expandedRows[id]
        setExpandedRows(prev => ({ ...prev, [id]: !isExp }))
        if (!isExp && !scanResults[id]) {
            // Lazy load result
            try {
                const res = await fetch(`/api/v1/ecommerce/${id}/status`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.status === 'SUCCESS' && data.result) {
                        setScanResults(prev => ({ ...prev, [id]: data.result }))
                    }
                }
            } catch { }
        }
    }


    const getFieldLabel = (field: string) => {
        if (!field) return "Rule Evaluation";
        const map: Record<string, string> = {
            MANUFACTURER_NAME: "Manufacturer / Packer / Importer Details",
            MANUFACTURER: "Manufacturer / Packer / Importer Details",
            PACKER: "Manufacturer / Packer / Importer Details",
            IMPORTER: "Manufacturer / Packer / Importer Details",
            COUNTRY_OF_ORIGIN: "Country of Origin",
            GENERIC_NAME: "Generic Name",
            PRODUCT_NAME: "Generic Name",
            NET_QUANTITY: "Net Quantity",
            MANUFACTURE_DATE: "Date of Manufacture / Packing",
            DATE: "Date of Manufacture / Packing",
            BATCH: "Batch Number",
            BEST_BEFORE: "Best Before / Use By",
            MRP: "Maximum Retail Price",
            CONSUMER_CARE: "Consumer Care Details",
            UNIT_SALE_PRICE: "Unit Sale Price",
            DIMENSIONS: "Dimensions"
        }
        let translated = t(`ecommerce.fields.${field}`);
        if (translated && translated !== `ecommerce.fields.${field}` && translated.toLowerCase() !== field.toLowerCase() && !translated.includes(" ")) {
            // Only use if it looks like a real translation
            // Because our fallback might just return a spaced version of the string
            // Actually, best to check if it's strictly a translation by seeing if it matches english map first!
        }
        // Safest approach: always use map if present!
        if (map[field]) {
            // we can try fetching translated version of exactly this
            return map[field];
        }
        return field.replace(/_/g, ' ');
    }

    const normalizeEcommerceInspection = (data: any) => {
        const notVerifiedStr = t('ecommerce.notVerified') || 'NOT VERIFIED';

        let productName = data.product;
        if (productName === undefined || productName === null || productName === 'NOT FOUND' || productName === '') {
            productName = notVerifiedStr;
        }

        let offerPrice = data.price;
        if (offerPrice === undefined || offerPrice === null || offerPrice === 'NOT FOUND' || offerPrice === '') {
            offerPrice = notVerifiedStr;
        }

        let mrp = data.mrp;
        if (mrp === undefined || mrp === null || mrp === 'NOT VERIFIED' || mrp === 'NOT FOUND' || mrp === '') {
            mrp = notVerifiedStr;
        }

        return {
            productName: productName,
            sourceUrl: data.source || 'UNKNOWN',
            extractionMethod: data.extraction || 'UNKNOWN',
            offerPrice: offerPrice,
            mrp: mrp,
            complianceStatus: data.compliance || 'NOT VERIFIED',
            rules: (data.rules || []).map((r: any) => {
                const fld = r.field || r.rule || r.name;
                const sts = r.status || r.result || (r.passed !== undefined ? (r.passed ? 'PASS' : 'FAIL') : 'NOT VERIFIED');
                const rsn = r.reason || r.message || null;
                const evd = r.evidence || r.value || null;

                return {
                    name: getFieldLabel(fld),
                    status: sts,
                    reason: rsn,
                    evidence: evd,
                    field: fld
                };
            }),
            inspectionId: data.inspection_id || null,
            technicalStatus: data.status || null
        }
    }

    const getRuleBadgeStatus = (status: string) => {
        if (status === 'FAIL' || status === 'NON_COMPLIANT' || status === 'NON-COMPLIANT') return 'border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10'
        if (status === 'COMPLIANT' || status === 'PASS') return 'border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'
        if (status === 'NOT_APPLICABLE') return 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800'
        return 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10'
    }


    const renderExpandedResult = (rawResult: any, monitor: any) => {
        const result = normalizeEcommerceInspection(rawResult);
        const notVerifiedStr = t('ecommerce.notVerified') || 'NOT VERIFIED';

        let mrpEvidence = notVerifiedStr;
        const mrpRule = result.rules.find((r: any) => r.field === 'MRP');
        if (mrpRule && mrpRule.evidence && mrpRule.evidence !== 'MISSING_FROM_PACKAGE') {
            mrpEvidence = mrpRule.evidence;
        } else if (mrpRule && mrpRule.evidence === 'MISSING_FROM_PACKAGE') {
            mrpEvidence = t('ecommerce.results.evidenceMissing') || 'No verified MRP declaration was extracted.';
        } else if (result.mrp !== notVerifiedStr && result.mrp !== 'NOT FOUND') {
            mrpEvidence = result.mrp;
        } else {
            mrpEvidence = t('ecommerce.results.evidenceMissing') || 'No verified MRP declaration was extracted.';
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-muted/10 rounded-b-lg">
                
                {/* LEFT SIDE: Product & Price Information */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm h-full">
                        
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-2">{t('ecommerce.results.productSummary') || "Product"}</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('ecommerce.results.product') || "Product Name"}</h4>
                                    <p className="text-sm font-medium break-words overflow-wrap-anywhere whitespace-normal leading-relaxed">{result.productName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('ecommerce.results.source') || "Source"}</h4>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm font-mono break-all sm:break-words whitespace-normal text-muted-foreground">{result.sourceUrl}</p>
                                            <Button variant="outline" size="sm" className="h-7 text-xs w-fit" onClick={() => window.open(result.sourceUrl, '_blank')}>
                                                {t('ecommerce.results.openSource') || "Open Source"}
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('ecommerce.results.extraction') || "Extraction"}</h4>
                                        <p className="text-sm font-mono text-muted-foreground">{result.extractionMethod}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-2">{t('ecommerce.results.priceInformation') || "Price Information"}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('ecommerce.results.ecommercePrice') || "E-Commerce Price"}</h4>
                                    <p className="text-sm font-mono font-bold">{result.offerPrice}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('ecommerce.results.mrp') || "MRP"}</h4>
                                    <p className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400">{result.mrp}</p>
                                </div>
                                <div className="col-span-2 pt-2">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('ecommerce.results.mrpEvidence') || "MRP Evidence"}</h4>
                                    <p className="text-sm font-mono break-words whitespace-normal bg-muted/30 p-2 rounded border border-border/50 text-muted-foreground">{mrpEvidence}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Compliance & Rules */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm h-full max-h-[800px] overflow-y-auto custom-scrollbar">
                        
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t('ecommerce.results.complianceSummary') || "Compliance Evaluator"}</h3>
                            <div className="flex items-center space-x-2">
                                {result.complianceStatus === 'PASS' || result.complianceStatus === 'COMPLIANT' 
                                    ? <CheckCircle2 className="w-6 h-6 text-success" /> 
                                    : result.complianceStatus === 'FAIL' 
                                    ? <XCircle className="w-6 h-6 text-destructive" /> 
                                    : <AlertTriangle className="w-6 h-6 text-orange-500" />}
                                <span className={`font-black text-xl tracking-wide ${result.complianceStatus === 'PASS' || result.complianceStatus === 'COMPLIANT' ? 'text-success' : result.complianceStatus === 'FAIL' ? 'text-destructive' : 'text-orange-500'}`}>{result.complianceStatus}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('ecommerce.results.ruleEvaluation') || "Rule Triggers"}</h3>
                            <div className="flex flex-col gap-4">
                                {result.rules.length > 0 ? result.rules.map((rule: any, ri: number) => {
                                    const isMissingBoth = !rule.reason && !rule.evidence;
                                    return (
                                        <div key={ri} className={`rounded-lg overflow-hidden border ${rule.status === 'FAIL' ? 'border-red-200 dark:border-red-900/50' : rule.status === 'PASS' ? 'border-green-200 dark:border-green-900/50' : 'border-border'}`}>
                                            <div className="px-4 py-2.5 flex justify-between items-center border-b border-border/50 bg-muted/10">
                                                <span className="font-semibold text-xs text-foreground uppercase tracking-wider">{rule.name}</span>
                                                <Badge variant="outline" className={`font-bold px-2 py-0 text-[10px] rounded border ${getRuleBadgeStatus(rule.status)}`}>
                                                    {rule.status}
                                                </Badge>
                                            </div>
                                            <div className="p-3.5 bg-card flex flex-col gap-3">
                                                {rule.reason && (
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">{t('ecommerce.results.reason') || "Reason"}</span>
                                                        <p className="text-sm text-foreground break-words whitespace-normal leading-relaxed">{rule.reason}</p>
                                                    </div>
                                                )}
                                                {rule.evidence && (
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">{t('ecommerce.results.evidence') || "Evidence"}</span>
                                                        <div className="font-mono text-xs break-words whitespace-normal bg-muted/30 p-2.5 rounded border border-border/50 text-foreground/80 leading-relaxed max-w-full">
                                                            {rule.evidence}
                                                        </div>
                                                    </div>
                                                )}
                                                {isMissingBoth && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground italic">{t('ecommerce.results.noEvidence') || "No evidence available"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-6 text-muted-foreground text-sm italic border border-dashed border-border rounded-lg">
                                        No rule triggers found in evaluated payload.
                                    </div>
                                )}
                            </div>
                        </div>
                        
                    </div>
                </div>

            </div>
        )
    }
    const getBadgeStatus = (status: string) => {
        if (status === 'FAIL' || status === 'NON_COMPLIANT') return 'border-red-200 text-destructive dark:text-red-400 font-bold bg-destructive/10 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10'
        if (status === 'COMPLIANT' || status === 'PASS') return 'border-green-200 text-green-700 dark:text-green-400 font-bold bg-success/10 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/10'
        if (status === 'SCANNING...') return 'border-blue-200 text-primary bg-primary/10 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/10 animate-pulse'
        if (['CRAWL_ERROR', 'NOT_PRODUCT_PAGE', 'CRAWL_TIMEOUT', 'FAIL_PROCESSING', 'SECURITY_BLOCKED', 'ENVIRONMENT_ERROR', 'INVALID_IMAGE'].includes(status)) return 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/10'
        return 'border-muted text-muted-foreground bg-transparent'
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">{t('error.apiConnectionDisrupted') || "API Connection Disrupted"}</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">E-commerce subsystem is temporarily unreachable.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchMonitors}>
                    <RefreshCw className="w-4 h-4 mr-2" />Retry Connection</Button>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <Globe className="w-8 h-8 mr-3 text-primary opacity-80" />
                        {t('ecommerce.title') || "E-Commerce Monitor"}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('ecommerce.digitalMarketSurveillance') || "Digital Market Surveillance"}</p>
                </div>
                <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center shadow-sm">
                    <span className="relative flex h-3 w-3 mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-sm font-medium">{t('ecommerce.activeCrawlerSentinels') || "Active Crawler Sentinels"}</span>
                </div>
            </div>

            <Card className="border-border shadow-sm border-t-4 border-t-primary overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border pb-6">
                    <CardTitle className="text-lg font-semibold flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-primary" />
                        {t('ecommerce.addMonitor') || "Add Monitor"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('ecommerce.registerDomain') || "Register digital marketplace domain for monitoring (e.g. https://flipkart.com/product/123)"}
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('ecommerce.productUrl') || "Product URL"}
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="pl-9 bg-background focus-visible:ring-primary shadow-sm"
                            />
                        </div>
                        <Button onClick={addMonitor} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0">
                            {t('ecommerce.activateTracker') || "Activate Tracker"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border">
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('ecommerce.networkTargetUrl') || "Target URL"}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">{t('ecommerce.intervalCycle') || "Interval Cycle"}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">{t('ecommerce.telemetryStatus') || "Telemetry Status"}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">{t('ecommerce.taskOverride') || "Task Override"}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                            <span className="text-sm">Retrieving digital sentinels...</span>
                                        </TableCell>
                                    </TableRow>
                                ) : monitors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <ShieldCheck className="w-8 h-8 mb-3 mx-auto opacity-20 text-primary" />
                                            <p className="text-sm font-medium">No digital market surveillance trackers deployed.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    monitors.map((m, i) => (
                                        <React.Fragment key={i}>
                                            <TableRow className={`border-border hover:bg-muted/40 transition-colors ${expandedRows[m.id] ? 'bg-muted/20' : ''}`}>
                                                <TableCell className="w-10 pl-4 py-4 cursor-pointer" onClick={() => toggleRow(m.id)}>
                                                    {expandedRows[m.id] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                                </TableCell>
                                                <TableCell className="text-sm py-4 max-w-[400px] truncate">
                                                    <a href={m.target_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono font-medium flex items-center">
                                                        <MousePointerClick className="w-3.5 h-3.5 mr-2 opacity-50" />
                                                        {m.target_url}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground py-4 uppercase">
                                                    {m.monitoring_frequency}
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border ${getBadgeStatus(m.last_scan_result)}`}>
                                                        {m.last_scan_result || "PENDING"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-4 pr-4">
                                                    <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs" onClick={() => triggerScan(m.id)} disabled={m.last_scan_result === 'SCANNING...'}>
                                                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${m.last_scan_result === 'SCANNING...' ? 'animate-spin' : ''}`} />{t('ecommerce.forceCrawl') || "Force Crawl"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            {expandedRows[m.id] && (
                                                <TableRow className="bg-muted/5 border-border">
                                                    <TableCell colSpan={5} className="p-0 border-b">
                                                        <div className="p-0">
                                                            {scanResults[m.id] ? (
                                                                renderExpandedResult(scanResults[m.id], m)
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center p-8 m-6 text-muted-foreground bg-card border border-border border-dashed rounded-lg">
                                                                    {m.last_scan_result === 'SCANNING...' ? (
                                                                        <>
                                                                            <RefreshCw className="w-6 h-6 animate-spin mb-3 text-primary" />
                                                                            <p className="text-sm">Evaluating web telemetry and legal metrology declarations...</p>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <AlertTriangle className="w-8 h-8 mb-3 text-destructive opacity-80" />
                                                                            <h3 className="font-semibold text-destructive uppercase tracking-wider mb-2">{t('ecommerce.technicalError') || "TECHNICAL ERROR"}</h3>
                                                                            <p className="text-sm">Status: {m.last_scan_result}</p>
                                                                            <p className="text-sm mt-1">Technical failure occurred before legal evaluation.</p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
