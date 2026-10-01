"use client"
import { useTranslation } from '@/i18n'
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Map, MapPinOff } from 'lucide-react'

export default function GeoHeatmap() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Map className="w-6 h-6 text-[#2563EB]" />
                    {t('navigation.geoAnalytics')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Geographic distribution and regional density of statutory compliance enforcement activities.
                </p>
            </div>

            <Card className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-border bg-card/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MapPinOff className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No Geographic Records Available</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Insufficient jurisdiction coordinate data from recent field inspections to generate spatial density heatmaps.
                </p>
            </Card>
        </div>
    )
}
