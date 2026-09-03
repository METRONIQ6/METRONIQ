import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"
files = {}

files["components/ui/evidence-viewer.tsx"] = """
import { Badge } from "@/components/ui/badge";

export function EvidenceViewer() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-slate-100 border-b border-slate-200 p-3 text-xs font-semibold text-slate-500 uppercase flex justify-between items-center">
        <span>Evidence Trace Pipeline</span>
        <Badge variant="outline" className="bg-slate-200">DEMO TRACE</Badge>
      </div>
      <div className="p-6 space-y-6">
        
        {/* Step 1: Image & Highlight */}
        <div className="flex gap-6">
           <div className="w-1/3 bg-slate-100 rounded-md h-32 flex items-center justify-center border border-slate-200 relative overflow-hidden text-slate-400">
              <span className="text-sm">[ Package Image ]</span>
              {/* Fake highlight box */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-8 border-2 border-amber-500 bg-amber-500/20"></div>
           </div>
           <div className="w-2/3 flex flex-col justify-center space-y-2">
              <h3 className="font-semibold text-slate-900 border-b pb-2">1. AI Visual Extraction</h3>
              <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                 <span className="text-slate-500">Detected Field:</span>
                 <span className="font-medium text-slate-900">Net Quantity</span>
                 <span className="text-slate-500">OCR Source Text:</span>
                 <span className="font-medium text-slate-900">"Net Qty 100g"</span>
                 <span className="text-slate-500">Detected Value:</span>
                 <span className="font-medium text-slate-900">100g</span>
                 <span className="text-slate-500">AI Confidence:</span>
                 <span className="flex items-center text-emerald-600 font-bold">96% <span className="text-xs font-normal ml-1 text-slate-400">(Bounding Box ID: b-481)</span></span>
              </div>
           </div>
        </div>

        {/* Arrow connector */}
        <div className="flex justify-center text-slate-300">
           ↓
        </div>

        {/* Step 2: Rule Trace */}
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex flex-col space-y-2">
           <h3 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 flex justify-between">
              <span>2. Deterministic Rule Matching</span>
              <a href="#" className="text-xs text-blue-600 underline hover:text-blue-800">View in Simulator</a>
           </h3>
           <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                 <span className="text-blue-700">Applicable Rule:</span>
                 <span className="font-medium text-blue-900">RULE-002 (Packaged Com.)</span>
                 <span className="text-blue-700">Rule Version:</span>
                 <span><Badge className="bg-blue-600">v2.1</Badge></span>
                 <span className="text-blue-700">Requirement:</span>
                 <span className="font-medium text-blue-900">Min 2mm text height for 100g</span>
                 <span className="text-blue-700">Validation:</span>
                 <span className="font-medium text-red-600 font-bold">Observed height 1.5mm <span className="font-normal text-red-400 ml-1">{"(< 2mm)"}</span></span>
              </div>
        </div>

        {/* Arrow connector */}
        <div className="flex justify-center text-slate-300">
           ↓
        </div>

        {/* Step 3: Decision */}
        <div className="border border-red-200 bg-red-50 rounded-md p-4 flex justify-between items-center">
            <h3 className="font-bold text-red-900">3. Compliance Decision</h3>
            <Badge className="bg-red-600 text-sm px-4 py-1 h-auto text-white leading-tight">FAIL</Badge>
        </div>

        {/* AI Explainer */}
        <div className="mt-4 pt-4 border-t border-slate-200">
           <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-100">
             <strong className="text-slate-900 flex items-center mb-1">
               <span className="mr-2">✨</span> AI Explanation Layer
             </strong>
             The label failed compliance because the registered Net Quantity font height is 1.5mm. Under Rule RULE-002 v2.1, the minimum acceptable height for this package category is 2mm.
           </p>
        </div>
      </div>
    </div>
  );
}
"""

files["app/inspections/[id]/page.tsx"] = """
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceViewer } from "@/components/ui/evidence-viewer";

export default function InspectionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center border-b pb-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inspection {params.id}</h1>
            <p className="text-slate-500 mt-1">Product: Lays Classic 50g • 2026-08-29</p>
         </div>
         <div className="flex space-x-3 items-center">
            <Badge className="bg-red-600 text-white hover:bg-red-600 px-3 py-1">NON-COMPLIANT</Badge>
            <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">HIGH RISK</Badge>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <EvidenceViewer />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
         <Button variant="outline">Escalate</Button>
         <Button className="bg-blue-600 hover:bg-blue-700">Issue Corrective Notice</Button>
      </div>
    </div>
  )
}
"""

files["app/scanner/page.tsx"] = """
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, UploadCloud, CheckCircle2, Circle } from "lucide-react";

export default function ScannerPage() {
  const [step, setStep] = useState(0);

  const simulateScan = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => setStep(4), 5000);
  };

  return (
    <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Product Scanner</h1>
        <p className="text-slate-500 mt-2">Upload or capture an image to run the deterministic AI payload.</p>
      </div>

      {step === 0 && (
        <Card className="border-dashed border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors mx-auto w-full">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center cursor-pointer" onClick={simulateScan}>
            <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-400">
               <Camera className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Capture or drop package image</h3>
            <p className="text-sm text-slate-500 mb-6">High resolution images yield better OCR confidence.</p>
            <Button variant="default" className="bg-[#0A192F]">
               <UploadCloud className="mr-2 h-4 w-4" /> Start Demo Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {step > 0 && (
         <Card>
            <CardContent className="p-8 flex flex-col md:flex-row gap-12">
               <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 rounded-md min-h-[300px] border border-slate-200 object-cover overflow-hidden">
                 <span className="text-slate-400">Demo Image Preview</span>
               </div>
               <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                 <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Scanner Pipeline Progress</h3>
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                       {step >= 1 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                       <span className={step >= 1 ? "text-slate-900 font-medium" : "text-slate-500"}>Image Quality Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       {step >= 2 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                       <span className={step >= 2 ? "text-slate-900 font-medium" : "text-slate-500"}>Text Detection & OCR</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       {step >= 3 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300 text-slate-300 animate-pulse" />}
                       <span className={step >= 3 ? "text-slate-900 font-medium" : "text-slate-500"}>Declaration Extraction</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       {step >= 4 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                       <span className={step >= 4 ? "text-slate-900 font-medium" : "text-slate-500"}>Rule Evaluation</span>
                    </div>
                 </div>
                 {step >= 4 && (
                    <div className="pt-4 border-t border-slate-100">
                       <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href='/inspections/INSP-001'}>View Compliance Result</Button>
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

for file_path, content in files.items():
    full_path = os.path.join(base, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
