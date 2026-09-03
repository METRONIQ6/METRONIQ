import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"
files = {}

files["app/page.tsx"] = """
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
"""

files["app/dashboard/page.tsx"] = """
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { demoStats, demoInspections, complianceTrendData, violationDistributionData } from "@/lib/demo-data";
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good morning, Officer</h1>
        <p className="text-slate-500 mt-2">Compliance and inspection intelligence at a glance.</p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Inspections</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStats.inspectionsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStats.highRiskCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStats.openViolations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reinspections</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStats.pendingReinspections}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* PRIORITY INSPECTIONS */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Priority Inspections (Action Required)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoInspections.slice(0,4).map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <Badge variant={i.risk === 'HIGH' ? 'destructive' : i.risk === 'MEDIUM' ? 'default' : 'secondary'}
                             className={i.risk === 'MEDIUM' ? 'bg-amber-500' : ''}>
                        {i.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{i.product}</TableCell>
                    <TableCell>{i.manufacturer}</TableCell>
                    <TableCell>
                      {i.status === 'FAIL' && <span className="text-red-500 font-bold">{i.status}</span>}
                      {i.status === 'REVIEW' && <span className="text-amber-500 font-bold">{i.status}</span>}
                      {i.status === 'PASS' && <span className="text-emerald-500 font-bold">{i.status}</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inspections/${i.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {/* COMPLIANCE TRENDS */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}}/>
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="pass" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fail" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="review" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Risk and Violation Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex border-l-2 border-slate-200 pl-4 py-1">
                <div>
                   <p className="text-sm font-medium">Reinspection PASSED</p>
                   <p className="text-xs text-slate-500">INSP-003 • 2 hours ago</p>
                </div>
              </div>
              <div className="flex border-l-2 border-red-200 pl-4 py-1">
                <div>
                   <p className="text-sm font-medium">Notice Issued for Packaged Water (MRP)</p>
                   <p className="text-xs text-slate-500">Notice N-829 • 5 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Violation Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationDistributionData} layout="vertical" margin={{ left: 40}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} width={120} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
"""

files["app/rules/page.tsx"] = """
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { demoRules } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RulesDashboard() {
  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rule Control Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage versioned legal rules for the deterministic compliance engine.</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Admin Only • DEMO DATA</Badge>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full max-w-md">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
           <Input placeholder="Search rule ID, name or category..." className="pl-9" />
        </div>
        <Button>Create Rule</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Draft Rules</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule ID</TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoRules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>
                       <Badge variant="outline">{r.version}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'} className={r.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-200'}>
                        {r.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/rules/${r.id}`}>Simulator</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
"""

files["app/rules/[id]/page.tsx"] = """
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RuleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto">
      <div className="border-b pb-4">
        <div className="flex justify-between items-start">
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">{params.id}</h1>
             <p className="text-lg text-slate-700 mt-1">MRP Declaration Required</p>
           </div>
           <Badge variant="default" className="bg-emerald-500">ACTIVE</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Rule Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold block">Current Version</span>
                    <span>v4.0</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold block">Category</span>
                    <span>Global Default</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold block">Validation Logic Block</span>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-md text-xs mt-1 overflow-x-auto">
{`{
  "target_field": "mrp",
  "operator": "EXISTS",
  "AND": {
    "target_field": "mrp",
    "matches_format": "^(Rs|₹)\\s*\\d+(\\.\\d{1,2})?"
  }
}`}
                    </pre>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="border-blue-200 shadow-blue-50">
               <CardHeader className="bg-blue-50/50">
                  <CardTitle className="text-blue-900">Rule Simulator</CardTitle>
                  <CardDescription>Test this exact rule logic against mock extracted data.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mock CV Output for `mrp`:</label>
                    <Input defaultValue="₹ 50.00" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Execute Simulation</Button>
                  
                  <div className="mt-4 p-4 border rounded-md border-emerald-200 bg-emerald-50 flex items-center justify-between">
                     <div>
                       <span className="text-xs text-emerald-800 uppercase block font-bold">Simulation Result</span>
                       <span className="font-medium text-emerald-900">Validation Passed</span>
                     </div>
                     <Badge className="bg-emerald-600">PASS</Badge>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
