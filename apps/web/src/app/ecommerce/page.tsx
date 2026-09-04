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