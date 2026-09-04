'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScanSearch, ClipboardCheck, AlertTriangle, Box, Fingerprint, Activity
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [overviewData, trendsData, aiData] = await Promise.all([
          fetchAPI('/analytics/overview'),
          fetchAPI('/analytics/trends?days=7'),
          fetchAPI('/analytics/ai-observations')
        ]);

        const overview = overviewData || { total_inspections: 0, total_ai_scans: 0, pending_rule_evaluations: 0, failed_inspections: 0 };
        const trends = Array.isArray(trendsData) ? trendsData : [];
        const ai = aiData || { frequency: [], confidence: [] };

        setData({ overview, trends, ai });
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Activity className="w-12 h-12 text-slate-300 animate-spin mb-4" />
        <h3 className="text-slate-500 font-medium">Loading Real-Time Intelligence</h3>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-lg shadow-sm border border-slate-200 mt-10">
        ERROR CONNECTING TO ANALYTICS ENGINE
      </div>
    );
  }

  const { overview, trends, ai } = data;

  return (
    <div className="flex flex-col space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Intelligence Command Center</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Real-time pipeline metrics and AI evaluation limits.</p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 whitespace-nowrap md:whitespace-normal overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x">
        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0 border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Total Inspections</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{overview.total_inspections}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Processed natively through CV router</p>
          </CardContent>
        </Card>

        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0 border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">AI Detections (Completed)</CardTitle>
            <ScanSearch className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{overview.total_ai_scans}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Evidence physically written to store</p>
          </CardContent>
        </Card>

        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Rules Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{overview.pending_rule_evaluations}</div>
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">WAITING FOR STAGE 7</p>
          </CardContent>
        </Card>

        <Card className="min-w-[70vw] md:min-w-0 snap-center shrink-0 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Failed Operations</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{overview.failed_inspections}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Exception traps triggered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">

        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Inspection Volumetric Trend (7 Days)
          </h2>
          <Card>
            <CardContent className="h-[250px] md:h-[350px] pt-4 lg:pt-6">
              {trends.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 font-bold bg-slate-50 border border-dashed rounded-lg">
                  INSUFFICIENT DATA / NO RECORDS IN PERIOD
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 'bold' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="inspections" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorInspections)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-500" />
            AI Observation Frequencies
          </h2>
          <Card>
            <CardContent className="h-[250px] md:h-[350px] pt-6 flex flex-col justify-between">
              {ai.frequency?.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 font-bold bg-slate-50 border border-dashed rounded-lg text-center p-4">
                  NO AI OBSERVATIONS AVAILABLE. <br /> (Are YOLO weights mapped?)
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ai.frequency} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="field" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={120} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">Structural Overview</h2>
          <Card className="h-full">
            <CardContent className="p-4 md:p-6 h-full flex flex-col justify-center gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">STAGE 4 PIPELINE BOUNDARY</h4>
                <p className="text-sm font-medium text-slate-700">Currently executing aggregate metrics bounding solely onto <span className="font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">inspections</span> payload derivations. No legal derivations exist prior to Stage 7 activation.</p>
              </div>
              <Link href="/scanner" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <ScanSearch className="w-5 h-5" /> START NEW AI EVALUATION Pipeline
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 hidden md:block">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">OCR Confidence Analytics</h2>
          <Card>
            <CardContent className="p-0">
              <div className="w-full flex-col flex overflow-hidden rounded-lg border-x border-b border-white">
                {ai.confidence?.length === 0 && (
                  <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 border-t border-slate-100">
                    NO CONFIDENCE DATA GENERATED.
                  </div>
                )}
                {ai.confidence?.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-slate-700 uppercase">{c.field.replace("_", " ")}</span>
                    <Badge className={`${c.average_confidence > 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} border-none`}>
                      {c.average_confidence}% AVG
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}