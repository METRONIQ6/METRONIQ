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