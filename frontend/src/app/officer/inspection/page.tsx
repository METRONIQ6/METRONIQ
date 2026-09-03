"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, ServerCrash, RefreshCw, Archive, Search, ArrowRight } from 'lucide-react'
import { getToken } from '@/lib/auth'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"

export default function InspectionsPage() {
    const { toast } = useToast()
    const [inspections, setInspections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchInspections = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('http://localhost:8000/api/v1/inspections/', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                setInspections(await res.json())
            } else {
                throw new Error("Failed to load")
            }
        } catch (e) {
            setError(true)
            toast({ type: "error", message: "Network connection lost fetching inspection directory." })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInspections()
    }, [])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-card border border-border rounded-xl shadow-sm">
                <ServerCrash className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground">API Connection Disrupted</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">Inspection subsystem is temporarily unreachable.</p>
                <Button className="mt-6 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90" onClick={fetchInspections}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] w-full mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white flex items-center gap-3">
                        <Archive className="w-8 h-8 text-[#2563EB]" /> Inspection Directory
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Historical audit log for all formal compliance interventions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/officer/scanner">
                        <Button className="h-11 px-6 font-semibold bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white shadow-sm">
                            <Search className="w-4 h-4 mr-2" /> New Scan
                        </Button>
                    </Link>
                    <Button variant="outline" className="border-border shadow-sm h-11 px-4" onClick={fetchInspections}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <Card className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground tracking-tight">System Records</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Audit Identifier</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Status</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3">Compliance Result</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-center">Risk Level</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground py-3 text-right pr-4">Oversight Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                        <span className="text-sm">Retrieving network records...</span>
                                    </TableCell>
                                </TableRow>
                            ) : inspections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <Archive className="w-8 h-8 mb-3 mx-auto opacity-20 text-gray-400" />
                                        <p className="text-sm font-medium">No formal inspections have been executed on this node.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inspections.map((ins, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-sm font-bold text-[#0B1F3A] dark:text-blue-400 py-4">
                                            {ins.id.substring(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border
                                                ${ins.status === 'COMPLETED' ? 'border-green-200 text-green-700 bg-green-50' :
                                                    'border-muted text-muted-foreground'}`}>
                                                {ins.status || 'PENDING'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {ins.result === 'PASS' ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-semibold">COMPLIANT</Badge>
                                            ) : ins.result === 'FAIL' ? (
                                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none font-semibold">NON-COMPLIANT</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="border-none font-semibold">{ins.result}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className={`font-bold font-mono text-sm
                                                ${ins.risk_level > 70 ? 'text-red-600' : ins.risk_level > 30 ? 'text-orange-500' : 'text-green-600'}`}>
                                                {ins.risk_level}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-4">
                                            <Link href={`/officer/reports/${ins.id}`} target="_blank">
                                                <Button size="sm" variant="outline" className="h-8 border-border hover:bg-muted font-semibold text-xs">
                                                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Full Audit <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
