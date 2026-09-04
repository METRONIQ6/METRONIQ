import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src\app"

pages = {}

pages["ecommerce/page.tsx"] = """
'use client';
import React from 'react';
import { ShoppingCart, ExternalLink, ShieldAlert, CheckCircle2, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockListings = [
  { id: 'AZ-001', product: 'Premium Almonds 500g', platform: 'Amazon', status: 'NON_COMPLIANT', issue: 'Missing MRP', price: '₹450' },
  { id: 'FK-892', product: 'Organic Honey 1L', platform: 'Flipkart', status: 'COMPLIANT', issue: 'None', price: '₹320' },
  { id: 'AZ-014', product: 'Packaged Water 12-Pack', platform: 'Amazon', status: 'NON_COMPLIANT', issue: 'Net Qty Mismatch', price: '₹120' },
];

export default function EcommercePage() {
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><ShoppingCart className="text-fuchsia-600"/> E-Commerce Monitoring</h1>
          <p className="text-slate-500">Automated scraping and variance tracking across digital marketplaces.</p>
        </div>
        <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">Start New Scan</Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-fuchsia-500"><CardContent className="pt-6"><div className="text-3xl font-black">12,402</div><p className="text-slate-500 text-sm">Active Listings Monitored</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-6"><div className="text-3xl font-black text-red-600">841</div><p className="text-slate-500 text-sm">Critical Violations</p></CardContent></Card>
        <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-6"><div className="text-3xl font-black text-emerald-600">8.2%</div><p className="text-slate-500 text-sm flex items-center gap-1"><TrendingDown className="w-4 h-4"/> Variance Rate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Flagged digital listings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockListings.map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{l.product}</span>
                  <span className="text-xs text-slate-500">{l.platform} | ID: {l.id}</span>
                </div>
                <div><span className="font-semibold text-slate-700">{l.price}</span></div>
                <div>
                  {l.status === 'COMPLIANT' ? <Badge className="bg-emerald-100 text-emerald-800">Compliant</Badge> : <Badge className="bg-red-100 text-red-800"><ShieldAlert className="w-3 h-3 mr-1"/> {l.issue}</Badge>}
                </div>
                <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4 text-slate-400"/></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"""

pages["analytics/page.tsx"] = """
'use client';
import React from 'react';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><BarChart3 className="text-blue-600"/> Intelligence Analytics</h1>
        <Button variant="outline"><Filter className="w-4 h-4 mr-2"/> Filter Range</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <Card className="h-80 shadow-md border-t-4 border-t-indigo-500 flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50">
           <BarChart3 className="w-16 h-16 text-indigo-200 mb-4" />
           <h3 className="text-lg font-bold text-slate-700">Detailed AI Breakdown</h3>
           <p className="text-sm text-slate-500 max-w-xs text-center">Chart payload dynamic ingestion initializing...</p>
         </Card>
         <Card className="h-80 shadow-md border-t-4 border-t-blue-500 flex flex-col items-center justify-center bg-gradient-to-bl from-white to-slate-50">
           <TrendingUp className="w-16 h-16 text-blue-200 mb-4" />
           <h3 className="text-lg font-bold text-slate-700">Geographic Compliance Matrix</h3>
           <p className="text-sm text-slate-500 max-w-xs text-center">Map rendering pipeline caching geographical boundaries...</p>
         </Card>
      </div>
    </div>
  );
}
"""

pages["inspections/page.tsx"] = """
'use client';
import React from 'react';
import { CheckSquare, Search, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mock = [
  {id: 'INSP-4029', prod: 'Apple Juice 1L', mfg: 'Tropicana', status: 'COMPLIANT', date: 'Oct 12'},
  {id: 'INSP-4030', prod: 'Almonds 500g', mfg: 'NutriChoice', status: 'FAILED', date: 'Oct 12'},
  {id: 'INSP-4031', prod: 'Detergent 2kg', mfg: 'CleanCo', status: 'PENDING_RULES', date: 'Oct 11'},
];

export default function InspectionsPage() {
  return (
    <div className="flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3"><CheckSquare className="text-emerald-600"/> Inspections Ledger</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search inspection ID or product..." className="pl-9 bg-white shadow-sm" />
        </div>
      </div>

      <Card className="shadow-lg border-0 ring-1 ring-slate-100">
        <CardContent className="p-0">
           <div className="bg-slate-50 grid grid-cols-5 p-4 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b">
             <div>ID</div>
             <div className="col-span-2">Product & Mfg</div>
             <div>Status</div>
             <div>Date</div>
           </div>
           <div className="divide-y">
             {mock.map(m => (
               <div key={m.id} className="grid grid-cols-5 p-4 items-center hover:bg-slate-50 transition-colors">
                 <div className="font-mono text-sm text-slate-600 font-bold">{m.id}</div>
                 <div className="col-span-2 flex flex-col">
                   <span className="font-bold text-slate-900">{m.prod}</span>
                   <span className="text-xs text-slate-500">{m.mfg}</span>
                 </div>
                 <div>
                    {m.status === 'COMPLIANT' && <Badge className="bg-emerald-100 text-emerald-800">Passed</Badge>}
                    {m.status === 'FAILED' && <Badge className="bg-red-100 text-red-800">Violated</Badge>}
                    {m.status === 'PENDING_RULES' && <Badge className="bg-amber-100 text-amber-800">Rules Pending</Badge>}
                 </div>
                 <div className="text-sm text-slate-500 font-medium">{m.date}</div>
               </div>
             ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
"""

pages["reinspection/page.tsx"] = """
'use client';
import React from 'react';
import { RefreshCw, Play, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReinspectionPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-3"><RefreshCw className="text-indigo-600"/> Reinspection Queue</h1>
        <p className="text-slate-500 mt-2">Entities requiring follow-up validation based on prior infractions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50/20">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700"><ShieldAlert className="w-5 h-5 mr-2" /> Critical Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center p-4 bg-white border border-red-100 rounded-lg shadow-sm">
              <div>
                <h4 className="font-bold text-slate-800">AquaCorp India / 1L Water</h4>
                <p className="text-xs text-slate-500">Previous Violation: Missing MRP (INSP-081)</p>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">Dispatch <Play className="w-4 h-4 ml-2"/></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"""

pages["violations/page.tsx"] = """
'use client';
import React from 'react';
import { AlertOctagon, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViolationsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
        <AlertOctagon className="w-8 h-8 text-rose-600" />
        Violation Registry
      </h1>
      
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-rose-200 bg-rose-50/50"><CardContent className="p-6">
          <div className="text-sm font-bold text-rose-600 uppercase mb-2">Total Open Violations</div>
          <div className="text-4xl font-black text-slate-900">142</div>
        </CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-6">
          <div className="text-sm font-bold text-slate-500 uppercase mb-2">Pending Notices</div>
          <div className="text-4xl font-black text-amber-600">38</div>
        </CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-6">
          <div className="text-sm font-bold text-slate-500 uppercase mb-2">Resolved (Last 30d)</div>
          <div className="text-4xl font-black text-emerald-600">89</div>
        </CardContent></Card>
      </div>

      <Card className="shadow-lg border-0 ring-1 ring-slate-100">
        <CardContent className="p-0">
          <div className="divide-y">
            {[1,2,3].map(i => (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="bg-rose-100 p-3 rounded-full text-rose-600 group-hover:scale-110 transition-transform"><ShieldAlert className="w-5 h-5"/></div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">LM-PKG-00{i}: Missing Standard Mark</div>
                    <div className="text-sm text-slate-500">Entity: NutriPack Foods • INSP-002{i}</div>
                  </div>
                </div>
                <div><Badge variant="outline" className="text-rose-600 border-rose-200">Severity: HIGH</Badge></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"""

pages["risk/page.tsx"] = """
'use client';
import React from 'react';
import { ShieldAlert, Activity, Target } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RiskPage() {
  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2"><Target className="text-amber-500 w-8 h-8"/> Predictive Risk Heatmap</h1>
      <p className="text-slate-500 max-w-2xl">AI-driven matrix targeting entities with highest probabilities of recurrent non-compliance based on historical evasion tactics.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Global Beverage Co", risk: 94, reason: "Repeated Net Qty Variance", loc: "Target Zone: South Hub" },
          { name: "SnackFoods Ltd", risk: 88, reason: "Missing MRP Declarations", loc: "Target Zone: North Hub" },
          { name: "NutriPack Foods", risk: 81, reason: "Non-standard Pack Sizes", loc: "Target Zone: West Hub" }
        ].map(r => (
           <Card key={r.name} className="overflow-hidden border-t-4 border-t-red-600 hover:shadow-xl transition-all shadow-md group cursor-pointer">
             <CardContent className="p-6">
               <div className="flex justify-between items-start mb-4">
                 <h3 className="font-black text-lg text-slate-800 w-2/3 leading-tight">{r.name}</h3>
                 <div className="bg-red-50 text-red-700 font-black text-2xl px-3 py-1 rounded-lg border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">{r.risk}</div>
               </div>
               <Badge className="bg-amber-100 text-amber-800 mb-2">{r.reason}</Badge>
               <p className="text-xs font-bold text-slate-500 flex items-center mt-4 uppercase tracking-widest"><Activity className="w-4 h-4 mr-1 text-slate-400"/> {r.loc}</p>
             </CardContent>
           </Card>
        ))}
      </div>
    </div>
  )
}
"""

pages["reports/page.tsx"] = """
'use client';
import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-indigo-900 rounded-xl p-8 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2"><FileText className="text-indigo-400"/> Generated Intelligence Reports</h1>
          <p className="text-indigo-200">Export compliance audits globally securely.</p>
        </div>
        <Button className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 shadow-lg font-bold">Generate Custom Export</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: "August 2026 Compliance Baseline", format: "PDF", size: "4.2 MB", date: "Aug 31" },
          { name: "E-Commerce Variance Quarterly", format: "CSV", size: "125 KB", date: "Aug 15" }
        ].map(r => (
           <Card key={r.name} className="flex items-center justify-between p-6 hover:border-indigo-300 transition-colors cursor-pointer group">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><FileText className="w-6 h-6"/></div>
               <div><h4 className="font-bold text-slate-800">{r.name}</h4><div className="flex items-center text-xs text-slate-400 font-semibold gap-2 mt-1"><span>{r.format}</span><span>{r.size}</span><span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {r.date}</span></div></div>
             </div>
             <Button variant="ghost" size="icon" className="text-indigo-600 opacity-0 group-hover:opacity-100"><Download className="w-5 h-5"/></Button>
           </Card>
        ))}
      </div>
    </div>
  )
}
"""

pages["settings/page.tsx"] = """
'use client';
import React from 'react';
import { Settings, Shield, User, Bell } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex space-x-8 animate-in slide-in-from-left-4">
      <div className="w-1/4 space-y-2">
        <h2 className="font-black text-xl mb-4 text-slate-800">Configuration</h2>
        <div className="bg-white rounded-lg border p-2 shadow-sm space-y-1">
          <div className="bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-md flex items-center cursor-pointer"><User className="w-4 h-4 mr-2"/> Profile</div>
          <div className="text-slate-500 font-bold px-4 py-2 rounded-md flex items-center hover:bg-slate-50 cursor-pointer"><Shield className="w-4 h-4 mr-2"/> Security</div>
          <div className="text-slate-500 font-bold px-4 py-2 rounded-md flex items-center hover:bg-slate-50 cursor-pointer"><Bell className="w-4 h-4 mr-2"/> Notifications</div>
        </div>
      </div>
      <div className="w-3/4 space-y-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2"><Settings className="w-7 h-7 text-slate-400"/> Developer Profile</h1>
        <Card>
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Official Email</p>
              <div className="font-mono text-slate-900 text-lg bg-slate-50 inline-block px-3 py-1 rounded border">admin@metroniq.local</div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Role Hierarchy</p>
              <div className="font-bold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded border border-emerald-200">SUPER_ADMIN</div>
            </div>
            <div className="pt-4 border-t"><Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Revoke Active Sessions</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"""

pages["label-auditor/page.tsx"] = """
'use client';
import React from 'react';
import { Package, UploadCloud, Microscope } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuditorPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-3 mt-12 w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-6"><div className="bg-indigo-100 p-4 rounded-full"><Package className="w-12 h-12 text-indigo-600"/></div></div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Static Label Auditor</h1>
        <p className="text-lg text-slate-500">Pre-market compliance verifications. Upload digital proofs of packaging artwork before production to identify rules violations instantaneously.</p>
      </div>

      <Card className="max-w-2xl mx-auto w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center space-y-4">
          <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <div>
            <h3 className="font-bold text-slate-700 text-lg">Drag & Drop Artwork or PDF</h3>
            <p className="text-sm text-slate-500 mt-1">Supports PNG, JPG, PDF up to 25MB.</p>
          </div>
          <Button className="font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 mt-4"><Microscope className="w-4 h-4 mr-2"/> Browse Local Files</Button>
        </CardContent>
      </Card>
    </div>
  )
}
"""

for file_path, content in pages.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())

print("Mass scaffold successful.")
