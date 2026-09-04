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