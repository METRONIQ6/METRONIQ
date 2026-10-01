"use client"
import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useTranslation } from '@/i18n'
import { getToken } from '@/lib/auth'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge, getStatusBadgeVariant } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Map, MapPin, MapPinOff, AlertTriangle, CheckCircle2,
    ShieldAlert, Search, RefreshCw, Layers, Filter, Building2,
    Calendar, ArrowUpRight, Compass, Shield
} from 'lucide-react'

// Dynamic import of Leaflet map to prevent SSR issues
const LeafletGeoMap = dynamic(() => import('./LeafletGeoMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[460px] rounded-lg bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center animate-pulse">
            <Compass className="w-8 h-8 text-muted-foreground/60 animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading interactive map visualization...</p>
        </div>
    )
})

interface JurisdictionSummary {
    jurisdiction: string
    city: string
    state: string
    district: string
    latitude: number
    longitude: number
    total_inspections: number
    high_risk: number
    medium_risk: number
    low_risk: number
    non_compliant: number
    compliant: number
    pass_rate: number
    density_score: number
    last_inspection: string | null
}

interface InspectionPoint {
    id: string
    product_name: string
    category: string
    manufacturer_name: string
    jurisdiction: string
    city: string
    state: string
    district: string
    latitude: number
    longitude: number
    risk_level: string
    result: string
    status: string
    is_reinspection: boolean
    created_at: string | null
}

interface GeoAnalyticsData {
    total_records: number
    jurisdictions_count: number
    summary: {
        total_inspections: number
        high_risk: number
        medium_risk: number
        low_risk: number
        non_compliant: number
        compliant: number
        compliance_rate: number
    }
    jurisdictions: JurisdictionSummary[]
    points: InspectionPoint[]
    role_scope: string
}

export default function GeoAnalyticsView({ role }: { role: 'admin' | 'officer' }) {
    const { t } = useTranslation()
    const [data, setData] = useState<GeoAnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null)
    const [riskFilter, setRiskFilter] = useState<string>('ALL')
    const [resultFilter, setResultFilter] = useState<string>('ALL')
    const [searchQuery, setSearchQuery] = useState<string>('')

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/v1/analytics/geo', { headers })
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Not authorized to access Geo Analytics')
                }
                throw new Error('Failed to fetch geographic data')
            }
            const json: GeoAnalyticsData = await res.json()
            setData(json)
        } catch (err: any) {
            setError(err.message || 'Error loading geo analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [role])

    // Filter points
    const filteredPoints = useMemo(() => {
        if (!data) return []
        return data.points.filter((pt) => {
            if (selectedJurisdiction && pt.jurisdiction !== selectedJurisdiction) {
                return false
            }
            if (riskFilter !== 'ALL' && pt.risk_level.toUpperCase() !== riskFilter) {
                return false
            }
            if (resultFilter !== 'ALL' && pt.result.toUpperCase() !== resultFilter) {
                return false
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchCity = pt.city.toLowerCase().includes(q)
                const matchState = pt.state.toLowerCase().includes(q)
                const matchProd = pt.product_name.toLowerCase().includes(q)
                const matchMfg = pt.manufacturer_name.toLowerCase().includes(q)
                const matchId = pt.id.toLowerCase().includes(q)
                if (!matchCity && !matchState && !matchProd && !matchMfg && !matchId) {
                    return false
                }
            }
            return true
        })
    }, [data, selectedJurisdiction, riskFilter, resultFilter, searchQuery])

    // Filtered jurisdictions list for table/map
    const filteredJurisdictions = useMemo(() => {
        if (!data) return []
        if (selectedJurisdiction) {
            return data.jurisdictions.filter(j => j.jurisdiction === selectedJurisdiction)
        }
        return data.jurisdictions
    }, [data, selectedJurisdiction])

    const clearAllFilters = () => {
        setSelectedJurisdiction(null)
        setRiskFilter('ALL')
        setResultFilter('ALL')
        setSearchQuery('')
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        try {
            const d = new Date(dateStr)
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <Map className="w-6 h-6 text-[#2563EB]" />
                        {t('geoUI.title') || 'Geo Analytics'}
                        <Badge variant="outline" className="ml-2 text-xs font-semibold uppercase tracking-wider">
                            {role === 'admin' ? (t('adminUI.systemWide') || 'National Scope') : (t('common.jurisdiction') || 'Officer Scope')}
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {role === 'admin'
                            ? (t('geoUI.adminSubtitle') || 'National geographic distribution and regional density of statutory compliance enforcement activities.')
                            : (t('geoUI.officerSubtitle') || 'Geospatial enforcement distribution and regional inspection activity within assigned jurisdiction.')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        disabled={loading}
                        className="gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {t('geoUI.retry') || 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="p-6 border-destructive/50 bg-destructive/5 text-center">
                    <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground">{t('geoUI.errorTitle') || 'Unable to Load Geo Analytics'}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchData} className="mt-4">
                        {t('geoUI.retry') || 'Retry'}
                    </Button>
                </Card>
            )}

            {/* Loading State */}
            {loading && !data && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Compass className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">{t('geoUI.loading') || 'Loading geospatial intelligence data...'}</p>
                </div>
            )}

            {/* Content when loaded */}
            {!loading && data && (
                <>
                    {/* Empty State when 0 records exist */}
                    {data.total_records === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-border bg-card/50 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <MapPinOff className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">
                                {t('geoUI.noRecordsTitle') || 'No Geographic Records Available'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {t('geoUI.noRecordsDesc') || 'Insufficient jurisdiction coordinate data from recent field inspections to generate spatial density heatmaps.'}
                            </p>
                        </Card>
                    ) : (
                        <>
                            {/* Summary KPI Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="p-4 border border-border shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {t('geoUI.totalJurisdictions') || 'Active Jurisdictions'}
                                            </p>
                                            <h3 className="text-2xl font-bold text-foreground mt-1">{data.jurisdictions_count}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{data.total_records} {t('geoUI.recordsFound') || 'mapped inspections'}</span>
                                    </p>
                                </Card>

                                <Card className="p-4 border border-border shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {t('geoUI.totalInspections') || 'Total Inspections'}
                                            </p>
                                            <h3 className="text-2xl font-bold text-foreground mt-1">{data.summary.total_inspections}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <span className="font-semibold text-emerald-600">{data.summary.compliant} pass</span>
                                        <span>•</span>
                                        <span className="font-semibold text-rose-600">{data.summary.non_compliant} non-compliant</span>
                                    </p>
                                </Card>

                                <Card className="p-4 border border-border shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {t('geoUI.highRiskHotspots') || 'High Risk Hotspots'}
                                            </p>
                                            <h3 className="text-2xl font-bold text-rose-600 mt-1">{data.summary.high_risk}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{data.summary.medium_risk} {t('geoUI.mediumRisk') || 'medium risk'}</span>
                                    </p>
                                </Card>

                                <Card className="p-4 border border-border shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {t('geoUI.complianceRate') || 'Compliance Rate'}
                                            </p>
                                            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{data.summary.compliance_rate}%</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, data.summary.compliance_rate)}%` }}
                                        />
                                    </div>
                                </Card>
                            </div>

                            {/* Filter and Search Bar */}
                            <Card className="p-4 border border-border">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                        <Input
                                            type="text"
                                            placeholder={t('geoUI.searchPlaceholder') || 'Search by city, state, or product...'}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9 text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Risk Filter */}
                                        <div className="flex items-center gap-1">
                                            <select
                                                aria-label={t('geoUI.filterByRisk') || 'Filter by Risk'}
                                                value={riskFilter}
                                                onChange={(e) => setRiskFilter(e.target.value)}
                                                className="h-9 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                <option value="ALL">{t('geoUI.allRisks') || 'All Risk Levels'}</option>
                                                <option value="HIGH">{t('geoUI.highRisk') || 'High Risk'}</option>
                                                <option value="MEDIUM">{t('geoUI.mediumRisk') || 'Medium Risk'}</option>
                                                <option value="LOW">{t('geoUI.lowRisk') || 'Low Risk'}</option>
                                            </select>
                                        </div>

                                        {/* Result Filter */}
                                        <div className="flex items-center gap-1">
                                            <select
                                                aria-label={t('geoUI.filterByResult') || 'Filter by Result'}
                                                value={resultFilter}
                                                onChange={(e) => setResultFilter(e.target.value)}
                                                className="h-9 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                <option value="ALL">{t('geoUI.allResults') || 'All Results'}</option>
                                                <option value="PASS">{t('geoUI.compliant') || 'Compliant (PASS)'}</option>
                                                <option value="FAIL">{t('geoUI.nonCompliant') || 'Non-Compliant (FAIL)'}</option>
                                            </select>
                                        </div>

                                        {/* Jurisdiction Filter */}
                                        <div className="flex items-center gap-1">
                                            <select
                                                aria-label={t('geoUI.filterByJurisdiction') || 'Filter by Jurisdiction'}
                                                value={selectedJurisdiction || 'ALL'}
                                                onChange={(e) => setSelectedJurisdiction(e.target.value === 'ALL' ? null : e.target.value)}
                                                className="h-9 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[200px]"
                                            >
                                                <option value="ALL">{t('geoUI.allJurisdictions') || 'All Jurisdictions'}</option>
                                                {data.jurisdictions.map((j) => (
                                                    <option key={j.jurisdiction} value={j.jurisdiction}>
                                                        {j.jurisdiction} ({j.total_inspections})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {(selectedJurisdiction || riskFilter !== 'ALL' || resultFilter !== 'ALL' || searchQuery) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="h-9 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                {t('geoUI.clearFilters') || 'Clear'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Map Section */}
                            <Card className="border border-border overflow-hidden shadow-xs">
                                <CardHeader className="p-4 border-b border-border bg-card/50 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Compass className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            {t('geoUI.mapView') || 'Spatial Heatmap View'}
                                        </CardTitle>
                                        {selectedJurisdiction && (
                                            <Badge variant="secondary" className="text-xs">
                                                {selectedJurisdiction}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{filteredJurisdictions.length} {t('geoUI.totalJurisdictions') || 'Jurisdictions'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <LeafletGeoMap
                                        jurisdictions={filteredJurisdictions}
                                        selectedJurisdiction={selectedJurisdiction}
                                        onSelectJurisdiction={setSelectedJurisdiction}
                                        t={t}
                                    />

                                    {/* Map Legend */}
                                    <div className="p-3 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                            {t('geoUI.legend') || 'Map Legend'}:
                                        </span>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-full bg-red-500 border border-red-600 inline-block" />
                                                <span className="text-muted-foreground">{t('geoUI.legendHigh') || 'High Risk (Violations detected)'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 inline-block" />
                                                <span className="text-muted-foreground">{t('geoUI.legendMedium') || 'Medium Risk (Advisories)'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 inline-block" />
                                                <span className="text-muted-foreground">{t('geoUI.legendLow') || 'Low Risk / Compliant Zone'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Regional Breakdown Grid */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-[#2563EB]" />
                                        {t('geoUI.jurisdictionList') || 'Regional Jurisdiction Breakdown'}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {filteredJurisdictions.length} {t('geoUI.totalJurisdictions') || 'regions'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredJurisdictions.map((j) => {
                                        const isSelected = selectedJurisdiction === j.jurisdiction
                                        return (
                                            <Card
                                                key={j.jurisdiction}
                                                onClick={() => setSelectedJurisdiction(isSelected ? null : j.jurisdiction)}
                                                className={`p-4 border transition-all cursor-pointer hover:border-primary/50 ${
                                                    isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                            {j.jurisdiction}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {j.district}, {j.state}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={j.high_risk > 0 ? "destructive" : j.medium_risk > 0 ? "warning" : "success"}
                                                        className="text-[11px]"
                                                    >
                                                        {j.pass_rate}% {t('geoUI.compliant') || 'Pass'}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-b border-border/60 py-2.5 text-xs">
                                                    <div>
                                                        <span className="text-muted-foreground block text-[10px] uppercase">
                                                            {t('geoUI.inspectionsCount') || 'Inspections'}
                                                        </span>
                                                        <span className="font-bold text-foreground text-sm">{j.total_inspections}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[10px] uppercase">
                                                            {t('geoUI.highRisk') || 'High Risk'}
                                                        </span>
                                                        <span className="font-bold text-rose-600 text-sm">{j.high_risk}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[10px] uppercase">
                                                            {t('geoUI.densityScore') || 'Density'}
                                                        </span>
                                                        <span className="font-bold text-primary text-sm">{j.density_score}/100</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 text-[11px]">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(j.last_inspection)}
                                                    </span>
                                                    <span className="text-primary text-[11px] font-medium flex items-center gap-0.5">
                                                        {isSelected ? 'Selected' : 'View on Map'}
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Detailed Inspection Records Table */}
                            <Card className="border border-border shadow-xs overflow-hidden">
                                <CardHeader className="p-4 border-b border-border bg-card/50 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-[#2563EB]" />
                                        <CardTitle className="text-base font-semibold">
                                            {t('geoUI.inspectionsList') || 'Field Inspection Records'}
                                        </CardTitle>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {filteredPoints.length} {t('geoUI.recordsFound') || 'records'}
                                    </span>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium uppercase text-[11px]">
                                            <tr>
                                                <th className="py-2.5 px-4">Inspection ID</th>
                                                <th className="py-2.5 px-4">{t('geoUI.productName') || 'Product'}</th>
                                                <th className="py-2.5 px-4">{t('geoUI.manufacturer') || 'Manufacturer / Entity'}</th>
                                                <th className="py-2.5 px-4">{t('geoUI.jurisdiction') || 'Jurisdiction'}</th>
                                                <th className="py-2.5 px-4">{t('geoUI.riskBreakdown') || 'Risk'}</th>
                                                <th className="py-2.5 px-4">{t('geoUI.result') || 'Result'}</th>
                                                <th className="py-2.5 px-4">{t('geoUI.date') || 'Date'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {filteredPoints.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                        No matching field inspection records found for current filters.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredPoints.map((pt) => (
                                                    <tr key={pt.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                                                            {pt.id}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-semibold text-foreground">{pt.product_name}</div>
                                                            <div className="text-[11px] text-muted-foreground">{pt.category}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground">
                                                            {pt.manufacturer_name}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-medium text-foreground">{pt.jurisdiction}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                                {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                variant={pt.risk_level === 'HIGH' ? 'destructive' : pt.risk_level === 'MEDIUM' ? 'warning' : 'success'}
                                                                className="text-[10px]"
                                                            >
                                                                {pt.risk_level}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                variant={pt.result === 'PASS' ? 'success' : pt.result === 'FAIL' ? 'destructive' : 'info'}
                                                                className="text-[10px]"
                                                            >
                                                                {pt.result}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                                            {formatDate(pt.created_at)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
