'use client';

import React, { useState } from 'react';
import {
  Building2, Search, Filter, MoreVertical, ShieldAlert,
  CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
  MapPin, Box, Factory, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockManufacturers = [
  {
    id: "MFG-001", name: "AquaCorp India", location: "Mumbai, Maharashtra",
    products: 142, complianceScore: 92, status: "GOOD_STANDING",
    recentViolations: 2, trend: "up", logo: "💧"
  },
  {
    id: "MFG-002", name: "SnackFoods Ltd", location: "Delhi, NCR",
    products: 38, complianceScore: 68, status: "WATCHLIST",
    recentViolations: 15, trend: "down", logo: "🥨"
  },
  {
    id: "MFG-003", name: "Himalayan Herbs Pvt", location: "Dehradun, UK",
    products: 24, complianceScore: 98, status: "EXCELLENT",
    recentViolations: 0, trend: "up", logo: "🌿"
  },
  {
    id: "MFG-004", name: "Global Beverage Co", location: "Chennai, TN",
    products: 210, complianceScore: 84, status: "AVERAGE",
    recentViolations: 8, trend: "up", logo: "🥤"
  },
  {
    id: "MFG-005", name: "NutriPack Foods", location: "Pune, MH",
    products: 15, complianceScore: 42, status: "CRITICAL",
    recentViolations: 22, trend: "down", logo: "🥜"
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'EXCELLENT': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Excellent</Badge>;
    case 'GOOD_STANDING': return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Good Standing</Badge>;
    case 'AVERAGE': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Average</Badge>;
    case 'WATCHLIST': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Watchlist</Badge>;
    case 'CRITICAL': return <Badge className="bg-red-100 text-red-800 border-red-200">Critical Risk</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

export default function ManufacturersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockManufacturers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.location.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Factory className="w-8 h-8 text-indigo-600" />
            Manufacturer Directory
          </h1>
          <p className="text-slate-500 mt-1">Enterprise registry and compliance telemetry across all registered packaging entities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200">
            + Register Entity
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">Total Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">4,281</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +12 this month</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">Critical Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">18</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Immediate action required</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">64</div>
            <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Escaped standard params</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">Avg Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">87.4%</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Top decile improving</p>
          </CardContent>
        </Card>
      </div>

      {/* Directory Content */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Registered Packagers & Manufacturers</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search entities or locations..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filtered.map(entity => (
              <div key={entity.id} className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">

                <div className="flex items-center gap-4 w-full sm:w-1/3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-shrink-0 items-center justify-center text-xl shadow-sm border border-slate-200">
                    {entity.logo}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{entity.name}</h4>
                    <span className="flex items-center text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" /> {entity.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-8 w-full sm:w-2/3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Products</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1"><Box className="w-3 h-3 text-slate-400" /> {entity.products}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Violations</span>
                    <span className={`font-bold ${entity.recentViolations > 5 ? 'text-red-600' : 'text-slate-700'} flex items-center gap-1`}>
                      <ShieldAlert className={`w-3 h-3 ${entity.recentViolations > 5 ? 'text-red-500' : 'text-slate-400'}`} /> {entity.recentViolations}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Score</span>
                    <span className="font-black text-indigo-700">{entity.complianceScore}/100</span>
                  </div>
                  <div className="hidden md:flex flex-col shrink-0 min-w-[120px]">
                    <span className="text-xs font-semibold text-slate-400 uppercase mb-1">Status</span>
                    {getStatusBadge(entity.status)}
                  </div>
                  <div className="hidden sm:block">
                    <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-medium">
                No entities found matching "{searchTerm}"
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}