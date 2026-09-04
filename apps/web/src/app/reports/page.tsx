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