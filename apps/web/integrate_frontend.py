import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"
files = {}

files["lib/api.ts"] = """
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (!response.ok) {
        // Suppress errors during development if backend is offline
        console.warn(`API Error: ${response.status} on ${endpoint}`);
        return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Network Error on ${endpoint}:`, error);
    return null; 
  }
}

export const DashboardService = {
  getSummary: () => fetchAPI('/dashboard/summary'),
};

export const RuleService = {
  getRules: () => fetchAPI('/rules/'),
  simulateRule: (payload: any) => fetchAPI('/rules/simulate', { method: 'POST', body: JSON.stringify(payload) }),
};

export const InspectionService = {
  getInspections: () => fetchAPI('/inspections/'),
};
"""

files["app/dashboard/page.tsx"] = """
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { demoInspections, complianceTrendData, violationDistributionData } from "@/lib/demo-data";
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DashboardService } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    inspectionsToday: 0,
    highRiskCases: 0,
    openViolations: 0,
    pendingReinspections: 0
  });

  useEffect(() => {
    // Attempt real API fetch, fallback to 0s if backend is offline
    DashboardService.getSummary().then(data => {
      if (data) setStats(data);
    });
  }, []);

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Good morning, Officer</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">Compliance and inspection intelligence at a glance.</p>
      </div>

      <div className="md:hidden">
         <Link href="/inspections/new" className="flex items-center justify-center w-full h-12 bg-[#0A192F] text-white font-medium rounded-md shadow-sm">
           <FileText className="mr-2 h-5 w-5" /> NEW INSPECTION
         </Link>
      </div>

      <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Today's Inspections</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inspectionsToday || '12-Mock'}</div>
          </CardContent>
        </Card>
        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskCases || '2'}</div>
          </CardContent>
        </Card>
        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Open Violations</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openViolations || '5'}</div>
          </CardContent>
        </Card>
        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Pending Reinspections</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReinspections || '3'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
           <h2 className="text-lg font-semibold tracking-tight text-slate-900">Priority Cases</h2>
           
           <div className="md:hidden flex flex-col space-y-3">
             {demoInspections.slice(0,4).map((i) => (
                <div key={i.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-900">{i.product}</div>
                      <Badge variant={i.risk === 'HIGH' ? 'destructive' : i.risk === 'MEDIUM' ? 'default' : 'secondary'}
                             className={i.risk === 'MEDIUM' ? 'bg-amber-500' : ''}>
                        {i.risk}
                      </Badge>
                   </div>
                   <div className="text-sm text-slate-500 mb-3">{i.manufacturer} • {i.location}</div>
                   <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
                      <div className="text-xs font-semibold">
                        {i.status === 'FAIL' && <span className="text-red-500">FAILED</span>}
                        {i.status === 'REVIEW' && <span className="text-amber-500">NEEDS REVIEW</span>}
                      </div>
                      <Link href={`/inspections/${i.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                         View Case &rarr;
                      </Link>
                   </div>
                </div>
             ))}
           </div>

           <Card className="hidden md:block">
             <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-[80px]">Risk</TableHead>
                     <TableHead>Product</TableHead>
                     <TableHead className="hidden lg:table-cell">Manufacturer</TableHead>
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
                       <TableCell className="font-medium">
                         {i.product}
                         <div className="text-xs text-slate-500 lg:hidden mt-0.5">{i.manufacturer}</div>
                       </TableCell>
                       <TableCell className="hidden lg:table-cell text-slate-600">{i.manufacturer}</TableCell>
                       <TableCell>
                         {i.status === 'FAIL' && <span className="text-red-500 font-bold">{i.status}</span>}
                         {i.status === 'REVIEW' && <span className="text-amber-500 font-bold">{i.status}</span>}
                         {i.status === 'PASS' && <span className="text-emerald-500 font-bold">{i.status}</span>}
                       </TableCell>
                       <TableCell className="text-right">
                         <Link href={`/inspections/${i.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 h-8 px-3">
                           View
                         </Link>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 hidden lg:block">Compliance Trend</h2>
          <Card>
            <CardHeader className="lg:hidden pb-2">
              <CardTitle className="text-base">Compliance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[300px] pt-4 lg:pt-6">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}}/>
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="pass" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="fail" stroke="#EF4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div className="space-y-4">
           <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recent Activity</h2>
           <Card>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex border-l-2 border-emerald-400 pl-4 py-1">
                  <div>
                     <p className="text-sm font-medium text-slate-900">Reinspection PASSED</p>
                     <p className="text-xs text-slate-500 mt-0.5">INSP-003 • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex border-l-2 border-red-400 pl-4 py-1">
                  <div>
                     <p className="text-sm font-medium text-slate-900">Notice Issued (Net Qty)</p>
                     <p className="text-xs text-slate-500 mt-0.5">Notice N-829 • 5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
         </div>

         <div className="space-y-4 hidden md:block">
           <h2 className="text-lg font-semibold tracking-tight text-slate-900">Violation Distribution</h2>
           <Card>
            <CardContent className="h-[200px] pt-6">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={violationDistributionData} layout="vertical" margin={{ left: 40}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} width={120} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#1E3A8A" radius={[0, 4, 4, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
         </div>
      </div>
    </div>
  );
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
