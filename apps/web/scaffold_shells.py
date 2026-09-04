import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src\app"

pages = {
    "reports/page.tsx": {
        "title": "Intelligence Reports",
        "icon": "FileText",
        "desc": "Generate, schedule and download comprehensive compliance audit reports.",
        "mock_data": "[{id: 'RPT-829', name: 'Monthly Compliance Audit - August', type: 'PDF', date: 'Aug 31, 2026', size: '2.4 MB'}, {id: 'RPT-830', name: 'Risk Escalation Matrix', type: 'CSV', date: 'Sep 02, 2026', size: '156 KB'}]"
    },
    "violations/page.tsx": {
        "title": "Violation Registry",
        "icon": "AlertOctagon",
        "desc": "Centralized ledger of all identified statutory deviations mapped to legal rules.",
        "mock_data": "[{id: 'V-10492', rule: 'LM-PKG-001', entity: 'NutriPack Foods', severity: 'HIGH', status: 'PENDING_NOTICE', date: '2 hours ago'}]"
    },
    "risk/page.tsx": {
        "title": "Risk Priority Matrix",
        "icon": "ShieldAlert",
        "desc": "AI-driven entity monitoring and predictive recidivism flag analysis.",
        "mock_data": "[]"
    }
}

template = """'use client';
import React from 'react';
import { {icon}, FileDown, Search, Filter, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <{icon} className="w-8 h-8 text-indigo-600" />
            {title}
          </h1>
          <p className="text-slate-500 mt-1">{desc}</p>
        </div>
        <div className="flex gap-2">
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
             Generate New
           </Button>
        </div>
      </div>

      <Card className="border shadow-sm border-t-4 border-t-indigo-500">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center justify-between">
             <CardTitle className="text-lg">Recent Records</CardTitle>
             <div className="relative w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
               <Input placeholder="Search..." className="pl-9 bg-white" />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <{icon} className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="text-lg font-bold text-slate-700">Database synchronization in progress</h3>
           <p className="text-slate-500 max-w-sm">
             The {title} module is currently being wired to the live intelligence feed. Check back shortly.
           </p>
           <Button variant="outline" className="mt-4">
              Return to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
"""

for file_path, data in pages.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    content = template.replace("{title}", data["title"]).replace("{icon}", data["icon"]).replace("{desc}", data["desc"])
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Scaffolded other structural shell pages successfully.")
