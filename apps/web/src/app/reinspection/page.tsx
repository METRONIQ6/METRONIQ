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