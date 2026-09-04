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