"use client"
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Map, MapPinOff } from 'lucide-react'

export default function GeoHeatmap() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Geo Analytics</h2>
                <p className="text-muted-foreground pb-2">Geographic distribution of compliance activities.</p>
            </div>

            <Card className="flex flex-col items-center justify-center p-24 text-center border border-dashed border-border bg-card">
                <MapPinOff className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No records available.</h3>
                <p className="text-muted-foreground max-w-md">
                    Insufficient geographic data from recent inspections to generate meaningful analytics maps.
                </p>
            </Card>
        </div>
    )
}
