import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"
files = {}

files["app/rules/page.tsx"] = """
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { demoRules } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RulesDashboard() {
  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Rule Control Dashboard</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage versioned legal rules for the deterministic compliance engine.</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 w-fit">Admin Only • DEMO DATA</Badge>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full sm:max-w-md">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
           <Input placeholder="Search rule ID, name or category..." className="pl-9 h-10" />
        </div>
        <Button className="w-full sm:w-auto h-10">Create Rule</Button>
      </div>

      {/* Mobile Rules View - Stacked Cards */}
      <div className="md:hidden space-y-4">
         {demoRules.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-xs font-mono text-slate-500 mb-0.5">{r.id}</div>
                       <div className="font-bold text-slate-900 border-b pb-1 mb-1">{r.name}</div>
                       <div className="text-xs text-slate-600">{r.category}</div>
                    </div>
                    <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'} className={r.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : ''}>
                      {r.status}
                    </Badge>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <Badge variant="outline" className="text-xs py-0">v{r.version}</Badge>
                    <Link href={`/rules/${r.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-900 h-8 px-4">
                      Simulator
                    </Link>
                 </div>
              </CardContent>
            </Card>
         ))}
      </div>

      {/* Desktop Rules View - Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Active & Draft Rules</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule ID</TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoRules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{r.name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.category}</TableCell>
                    <TableCell>
                       <Badge variant="outline">v{r.version}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'} className={r.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-200 text-slate-700'}>
                        {r.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/rules/${r.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 h-8 px-3">
                        Simulator
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
"""

files["app/scanner/page.tsx"] = """
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Circle } from "lucide-react";

export default function ScannerPage() {
  const [step, setStep] = useState(0);

  const simulateScan = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => setStep(4), 5000);
  };

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-4xl mx-auto h-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">AI Product Scanner</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">Upload or capture an image to run the deterministic payload.</p>
      </div>

      {step === 0 && (
        <Card className="border-dashed border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors mx-auto w-full md:min-h-[400px] flex items-center justify-center cursor-pointer" onClick={simulateScan}>
          <CardContent className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-400">
               <Camera className="h-8 w-8" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">Capture or drop package image</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6">Mobile camera supported where available.</p>
            <Button variant="default" className="bg-[#0A192F] h-12 w-full max-w-[200px] text-white">
               Test OCR Pipeline
            </Button>
          </CardContent>
        </Card>
      )}

      {step > 0 && (
         <Card className="flex-1">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12 h-full">
               <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-200 rounded-lg h-[250px] md:h-auto border border-slate-300 relative overflow-hidden">
                 <span className="text-slate-500 text-sm font-medium">Demo Image Processing</span>
                 {/* Fake scanning beam */}
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#3b82f6]"></div>
               </div>
               
               <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                 <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Pipeline Progress</h3>
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                       {step >= 1 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                       <span className={step >= 1 ? "text-slate-900 font-medium text-sm md:text-base" : "text-slate-500 text-sm md:text-base"}>Image Quality Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       {step >= 2 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                       <span className={step >= 2 ? "text-slate-900 font-medium text-sm md:text-base" : "text-slate-500 text-sm md:text-base"}>Text Detection & OCR</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       {step >= 3 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300 animate-pulse text-slate-300" />}
                       <span className={step >= 3 ? "text-slate-900 font-medium text-sm md:text-base" : "text-slate-500 text-sm md:text-base"}>Declaration Extraction</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       {step >= 4 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                       <span className={step >= 4 ? "text-slate-900 font-medium text-sm md:text-base" : "text-slate-500 text-sm md:text-base"}>Rule Evaluation</span>
                    </div>
                 </div>
                 {step >= 4 && (
                    <div className="pt-6 border-t border-slate-100">
                       <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => window.location.href='/inspections/INSP-001'}>VIEW COMPLIANCE RESULT</Button>
                    </div>
                 )}
               </div>
            </CardContent>
         </Card>
      )}
    </div>
  )
}
"""

files["components/ui/evidence-viewer.tsx"] = """
import { Badge } from "@/components/ui/badge";

export function EvidenceViewer() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full">
      <div className="bg-slate-100 border-b border-slate-200 p-3 text-[10px] md:text-xs font-semibold text-slate-500 uppercase flex justify-between items-center">
        <span>Evidence Trace Pipeline</span>
        <Badge variant="outline" className="bg-slate-200 py-0">DEMO TRACE</Badge>
      </div>
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        
        {/* Step 1: Image & Highlight */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
           <div className="w-full md:w-1/3 bg-slate-100 rounded-md h-40 md:h-32 flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden text-slate-400">
              <span className="text-xs">[ Package Image ]</span>
              {/* Fake highlight box */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 md:w-16 h-12 md:h-8 border-2 border-amber-500 bg-amber-500/20"></div>
           </div>
           
           <div className="w-full md:w-2/3 flex flex-col justify-center space-y-2">
              <h3 className="font-bold text-slate-900 border-b pb-2 text-sm md:text-base">1. AI Visual Extraction</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs md:text-sm pt-1">
                 <span className="text-slate-500 font-medium">Detected Field:</span>
                 <span className="font-bold text-slate-900">Net Quantity</span>
                 <span className="text-slate-500 font-medium">OCR Source:</span>
                 <span className="font-bold text-slate-900">"Net Qty 100g"</span>
                 <span className="text-slate-500 font-medium">Extracted Value:</span>
                 <span className="font-bold text-slate-900 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-sm self-start">100g</span>
              </div>
           </div>
        </div>

        {/* Arrow connector */}
        <div className="flex justify-center text-slate-300">
           <span className="block h-6 w-[2px] bg-slate-200"></span>
        </div>

        {/* Step 2: Rule Trace */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex flex-col space-y-2 shadow-sm">
           <h3 className="font-bold text-blue-900 border-b border-blue-200/60 pb-2 flex justify-between items-center text-sm md:text-base">
              <span>2. Rule Matching</span>
              <a href="#" className="hidden md:inline-block text-xs font-medium text-blue-600 border border-blue-200 bg-white px-2 py-1 rounded hover:bg-blue-100">Simulator</a>
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-2 text-xs md:text-sm pt-1">
                 <div className="flex flex-col"><span className="text-blue-700 text-[10px] uppercase font-bold">Applicable Rule</span><span className="font-medium text-blue-900">RULE-002 (Packaged Com.)</span></div>
                 <div className="flex flex-col"><span className="text-blue-700 text-[10px] uppercase font-bold">Version</span><span><span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold w-fit">v2.1</span></span></div>
                 <div className="flex flex-col sm:col-span-2 pt-2"><span className="text-blue-700 text-[10px] uppercase font-bold">Condition</span><span className="font-medium text-blue-900">Min 2mm text height required for 100g package size</span></div>
                 <div className="flex flex-col sm:col-span-2 pt-1 border-t border-blue-200 mt-2"><span className="text-red-700 text-[10px] uppercase font-bold">Execution Result</span><span className="font-bold text-red-600 text-sm mt-1 bg-red-50 p-2 rounded border border-red-100">Observed height 1.5mm <span className="font-normal text-red-400 ml-1">{"(< 2mm required)"}</span></span></div>
              </div>
        </div>

        {/* Arrow connector */}
        <div className="flex justify-center text-slate-300">
           <span className="block h-6 w-[2px] bg-slate-200"></span>
        </div>

        {/* Step 3: Decision */}
        <div className="border-2 border-red-500 bg-red-50 rounded-md p-4 flex justify-between items-center shadow-sm">
            <h3 className="font-bold text-red-900 uppercase tracking-wide text-sm md:text-base">3. Decision Engine</h3>
            <span className="bg-red-600 text-white font-black text-sm md:text-lg px-4 py-1 rounded-sm shadow-sm">FAIL</span>
        </div>
      </div>
    </div>
  );
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
