"use client"
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldAlert, CheckCircle, FileText, Activity } from 'lucide-react'
import Link from 'next/link'

import { getToken } from '@/lib/auth'

export default function OfficerDashboard() {
    const [priorityCases, setPriorityCases] = React.useState<any[]>([])
    const [stats, setStats] = React.useState<any>({ total: 0, compliant: 0, failed: 0 })
    const [notices, setNotices] = React.useState<any[]>([])
    const [reinspections, setReinspections] = React.useState<any[]>([])
    const [cases, setCases] = React.useState<any[]>([])
    const [monitors, setMonitors] = React.useState<any[]>([])
    const [newUrl, setNewUrl] = React.useState("")

    React.useEffect(() => {
        const fetchInspections = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/inspections', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    // Transform to match table
                    const transformed = data.map((d: any) => ({
                        id: d.id,
                        product: 'Scanned Product', // We don't have product tables tightly linked inside UI yet 
                        manufacturer: 'Unknown',
                        district: 'Local',
                        risk: d.risk_level === 'HIGH' ? 85 : d.risk_level === 'MEDIUM' ? 50 : 20,
                        issue: d.result === 'FAIL' ? 'Compliance Violation' : 'None',
                        action: 'View',
                        status: d.status
                    }))
                    setPriorityCases(transformed)
                    setStats({
                        total: data.length,
                        compliant: data.filter((d: any) => d.result === 'PASS').length,
                        failed: data.filter((d: any) => d.result === 'FAIL').length
                    })
                }
            } catch (e) { }
        }
        const fetchNotices = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/notices', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    setNotices(await res.json())
                }
            } catch (e) { }
        }
        const fetchReinspections = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/reinspections', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) setReinspections(await res.json())
            } catch (e) { }
        }
        const fetchCases = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/enforcement', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) setCases(await res.json())
            } catch (e) { }
        }
        const fetchMonitors = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/ecommerce', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) setMonitors(await res.json())
            } catch (e) { }
        }
        fetchInspections()
        fetchNotices()
        fetchReinspections()
        fetchCases()
        fetchMonitors()
    }, [])

    const addMonitor = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/ecommerce/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_url: newUrl, monitoring_frequency: "DAILY" })
            })
            if (res.ok) {
                setMonitors([...monitors, await res.json()])
                setNewUrl("")
            } else {
                alert("Failed to add monitor")
            }
        } catch (e) { }
    }

    const triggerScan = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/api/v1/ecommerce/${id}/scan`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            alert("Scan Triggered! Inference pipeline resolving screenshot async.")
        } catch (e) { }
    }

    const escalateReinspection = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/enforcement/escalate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reinspection_id: id })
            })
            if (res.ok) {
                alert("Escalated to Legal Docket")
                const nr = await res.json()
                setCases([...cases, nr])
            } else {
                const err = await res.json()
                alert(err.detail || "Failed to escalate")
            }
        } catch (e) { }
    }

    const reviewNotice = async (id: string, action: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/notices/${id}/review?status=${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.ok) {
                alert(`Notice marked as ${action}`)
                setNotices(notices.map(n => n.id === id ? { ...n, status: action } : n))
            }
        } catch (e) { }
    }

    const scheduleReinspection = async (orig_id: string, notice_id: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/reinspections/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ original_inspection_id: orig_id, notice_id: notice_id })
            })
            if (res.ok) {
                alert("Reinspection Scheduled")
                const nr = await res.json()
                setReinspections([...reinspections, nr])
                reviewNotice(notice_id, 'REINSPECTION_PENDING')
            }
        } catch (e) { }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Good morning, Officer</h2>
                <p className="text-muted-foreground">Here’s your compliance overview.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total records</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.failed}</div>
                        <p className="text-xs text-muted-foreground">Violations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{priorityCases.filter(c => c.risk > 70).length}</div>
                        <p className="text-xs text-muted-foreground">Requires immediate review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reinspection Due</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Tomorrow</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center mt-8">
                <h3 className="text-lg font-medium">INSPECTION PRIORITY</h3>
                <Link href="/officer/scanner">
                    <Button className="bg-blue-600 hover:bg-blue-700">Start New Inspection</Button>
                </Link>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Priority</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Manufacturer</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Risk Score</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {priorityCases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-6">No historical inspections found in database.</TableCell>
                            </TableRow>
                        )}
                        {priorityCases.map((c, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Badge variant={c.risk > 70 ? 'destructive' : c.risk > 40 ? 'default' : 'secondary'} className={c.risk > 40 && c.risk <= 70 ? "bg-orange-500 hover:bg-orange-600" : ""}>
                                        {c.risk > 70 ? 'HIGH' : c.risk > 40 ? 'MEDIUM' : 'LOW'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{c.product}</TableCell>
                                <TableCell>{c.manufacturer}</TableCell>
                                <TableCell>{c.district}</TableCell>
                                <TableCell>{c.risk}</TableCell>
                                <TableCell>{c.issue}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">{c.action}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">IMPROVEMENT NOTICES</h3>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Notice ID</TableHead>
                                <TableHead>Inspection ID</TableHead>
                                <TableHead>Violations</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">No active improvement notices.</TableCell>
                                </TableRow>
                            )}
                            {notices.map((n, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs">{n.id.substring(0, 8)}...</TableCell>
                                    <TableCell className="font-mono text-xs">{n.inspection_id}</TableCell>
                                    <TableCell>{n.violations}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={n.status === 'ISSUED' ? 'border-red-500 text-red-700 bg-red-50' : n.status === 'RECTIFICATION_SUBMITTED' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-green-500 text-green-700 bg-green-50'}>
                                            {n.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {n.status === 'RECTIFICATION_SUBMITTED' ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => reviewNotice(n.id, 'RESOLVED')}>Approve</Button>
                                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => scheduleReinspection(n.inspection_id, n.id)}>Schedule Reinspection</Button>
                                            </div>
                                        ) : n.status === 'RESOLVED' ? (
                                            <Button size="sm" variant="outline" disabled>Closed</Button>
                                        ) : n.status === 'REINSPECTION_PENDING' ? (
                                            <Button size="sm" variant="outline" disabled>Reinspection Setup</Button>
                                        ) : (
                                            <Button size="sm" variant="ghost">View</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">REINSPECTION QUEUE</h3>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reinspection ID</TableHead>
                                <TableHead>Original Inspection</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reinspections.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">No scheduled reinspections.</TableCell>
                                </TableRow>
                            )}
                            {reinspections.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs">{r.id.substring(0, 8)}...</TableCell>
                                    <TableCell className="font-mono text-xs">{r.original_inspection_id}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={r.status === 'SCHEDULED' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-green-500 text-green-700 bg-green-50'}>
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>Me</TableCell>
                                    <TableCell>
                                        {r.status === 'SCHEDULED' ? (
                                            <Link href={`/officer/scanner?reinspection=${r.id}`}>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Scan Now</Button>
                                            </Link>
                                        ) : r.status === 'COMPLETED' ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost">View Result</Button>
                                                <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => escalateReinspection(r.id)}>Escalate</Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost">View Result</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">LEGAL DOCKET / ENFORCEMENT</h3>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Case ID</TableHead>
                                <TableHead>Reinspection ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Penalty</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">No enforcement cases.</TableCell>
                                </TableRow>
                            )}
                            {cases.map((c, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs">{c.id.substring(0, 8)}...</TableCell>
                                    <TableCell className="font-mono text-xs">{c.reinspection_id.substring(0, 8)}...</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                                            {c.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{c.penalty_amount ? `$${c.penalty_amount}` : 'Pending'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">Manage</Button>
                                            <Link href={`/officer/reports/${c.id}`} target="_blank">
                                                <Button size="sm" variant="secondary">View Audit</Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">E-COMMERCE AUTOMATED MONITORS</h3>
                <Card className="p-4 mb-4 flex gap-4">
                    <Input
                        placeholder="https://example.com/product/123"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={addMonitor} className="bg-indigo-600 hover:bg-indigo-700">Add Tracker URL</Button>
                </Card>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Target URL</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Last Result</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monitors.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">No web monitors configured.</TableCell>
                                </TableRow>
                            )}
                            {monitors.map((m, i) => (
                                <TableRow key={i}>
                                    <TableCell className="text-xs truncate max-w-[300px]" title={m.target_url}>
                                        <a href={m.target_url} target="_blank" className="text-blue-600 hover:underline">{m.target_url}</a>
                                    </TableCell>
                                    <TableCell>{m.monitoring_frequency}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={m.last_scan_result === 'FAIL' ? 'border-red-500 text-red-700 bg-red-50' : m.last_scan_result === 'COMPLIANT' || m.last_scan_result === 'PASS' ? 'border-green-500 text-green-700 bg-green-50' : ''}>
                                            {m.last_scan_result || 'PENDING'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => triggerScan(m.id)}>Scan Now</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
