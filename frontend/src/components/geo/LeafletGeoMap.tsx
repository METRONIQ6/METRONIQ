"use client"
import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface JurisdictionData {
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

interface LeafletGeoMapProps {
    jurisdictions: JurisdictionData[]
    selectedJurisdiction: string | null
    onSelectJurisdiction: (jurisdiction: string | null) => void
    t: any
}

export default function LeafletGeoMap({
    jurisdictions,
    selectedJurisdiction,
    onSelectJurisdiction,
    t
}: LeafletGeoMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markersLayerRef = useRef<any>(null)

    // Initialize Map instance once
    useEffect(() => {
        if (!mapContainerRef.current) return
        if (mapInstanceRef.current) return

        const map = L.map(mapContainerRef.current, {
            center: [22.5937, 78.9629],
            zoom: 5,
            scrollWheelZoom: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)

        const markersLayer = L.layerGroup().addTo(map)
        markersLayerRef.current = markersLayer
        mapInstanceRef.current = map

        return () => {
            map.remove()
            mapInstanceRef.current = null
            markersLayerRef.current = null
        }
    }, [])

    // Update markers and pan
    useEffect(() => {
        const map = mapInstanceRef.current
        const layer = markersLayerRef.current
        if (!map || !layer) return

        layer.clearLayers()

        jurisdictions.forEach((j) => {
            if (!j.latitude || !j.longitude) return

            const isHigh = j.high_risk > 0 || j.non_compliant > 0
            const isMedium = !isHigh && j.medium_risk > 0
            const fillColor = isHigh ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981'
            const strokeColor = isHigh ? '#DC2626' : isMedium ? '#D97706' : '#059669'

            const isSelected = selectedJurisdiction === j.jurisdiction
            const radius = Math.min(28, Math.max(14, j.total_inspections * 5)) + (isSelected ? 6 : 0)

            const circle = L.circleMarker([j.latitude, j.longitude], {
                radius,
                fillColor,
                fillOpacity: isSelected ? 0.9 : 0.7,
                color: isSelected ? '#0F172A' : strokeColor,
                weight: isSelected ? 3 : 2,
            })

            circle.bindTooltip(`
                <div style="font-weight:600; font-size:12px; color:#0f172a;">${j.jurisdiction}</div>
                <div style="font-size:11px; color:#475569;">${j.total_inspections} ${t('geoUI.inspectionsCount') || 'Inspections'} | ${t('geoUI.complianceRate') || 'Compliance'}: ${j.pass_rate}%</div>
            `, { direction: 'top', offset: [0, -10], opacity: 0.95 })

            const popupContent = `
                <div style="font-family:system-ui,-apple-system,sans-serif; min-width:190px; color:#0f172a; padding:4px;">
                    <div style="font-weight:700; font-size:13px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">
                        ${j.jurisdiction}
                    </div>
                    <div style="font-size:11px; line-height:1.6; color:#334155;">
                        <div style="display:flex; justify-content:space-between;"><span>${t('geoUI.state') || 'State'}:</span><strong style="color:#0f172a;">${j.state}</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>${t('geoUI.district') || 'District'}:</span><strong style="color:#0f172a;">${j.district}</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>${t('geoUI.totalInspections') || 'Total Inspections'}:</span><strong style="color:#0f172a;">${j.total_inspections}</strong></div>
                        <div style="display:flex; justify-content:space-between; color:#dc2626;"><span>${t('geoUI.highRisk') || 'High Risk'}:</span><strong>${j.high_risk}</strong></div>
                        <div style="display:flex; justify-content:space-between; color:#d97706;"><span>${t('geoUI.mediumRisk') || 'Medium Risk'}:</span><strong>${j.medium_risk}</strong></div>
                        <div style="display:flex; justify-content:space-between; color:#16a34a;"><span>${t('geoUI.lowRisk') || 'Low Risk'}:</span><strong>${j.low_risk}</strong></div>
                        <div style="display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:4px; margin-top:4px;">
                            <span>${t('geoUI.complianceRate') || 'Pass Rate'}:</span><strong style="color:#2563eb;">${j.pass_rate}%</strong>
                        </div>
                    </div>
                </div>
            `
            circle.bindPopup(popupContent)

            circle.on('click', () => {
                if (selectedJurisdiction === j.jurisdiction) {
                    onSelectJurisdiction(null)
                } else {
                    onSelectJurisdiction(j.jurisdiction)
                }
            })

            circle.addTo(layer)
        })

        if (selectedJurisdiction) {
            const found = jurisdictions.find(j => j.jurisdiction === selectedJurisdiction)
            if (found && found.latitude && found.longitude) {
                map.flyTo([found.latitude, found.longitude], 8, { duration: 1.2 })
            }
        }
    }, [jurisdictions, selectedJurisdiction, onSelectJurisdiction, t])

    return (
        <div className="relative w-full h-[460px] rounded-lg overflow-hidden border border-border shadow-xs">
            <div ref={mapContainerRef} className="w-full h-full z-0" style={{ background: '#F8FAFC' }} />
        </div>
    )
}
