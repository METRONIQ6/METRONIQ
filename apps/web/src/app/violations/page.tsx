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