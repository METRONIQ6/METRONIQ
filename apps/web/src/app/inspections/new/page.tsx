"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, FileText, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewInspectionMobileFirst() {
   const [step, setStep] = useState(1);
   return (
      <div className="flex flex-col space-y-6 max-w-2xl mx-auto h-full">
         <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">New Inspection</h1>
            <p className="text-sm text-slate-500 mt-1">Field interface for capturing compliance data.</p>
         </div>

         {/* Stepper Header */}
         <div className="flex items-center space-x-2 text-xs md:text-sm font-medium text-slate-400 border-b pb-4">
            <div className={step >= 1 ? "text-blue-700" : ""}>1. Details</div>
            <div>&rsaquo;</div>
            <div className={step >= 2 ? "text-blue-700" : ""}>2. Capture</div>
            <div>&rsaquo;</div>
            <div className={step >= 3 ? "text-blue-700" : ""}>3. Result</div>
         </div>

         {/* STEP 1: Details */}
         {step === 1 && (
            <Card className="flex-1 shadow-sm">
               <CardContent className="p-4 md:p-6 space-y-5">
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700">Product Category</label>
                     <Select defaultValue="packaged_water">
                        <SelectTrigger className="h-12 w-full text-base">
                           <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="packaged_water">Packaged Water</SelectItem>
                           <SelectItem value="biscuits">Biscuits & Snacks</SelectItem>
                           <SelectItem value="baby_food">Baby Food</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700">Manufacturer (Search)</label>
                     <Input placeholder="Type to search..." className="h-12 text-base" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700">Product Name</label>
                     <Input placeholder="e.g. Aquafina 1L" className="h-12 text-base" />
                  </div>
               </CardContent>
               <div className="p-4 bg-slate-50 border-t flex justify-end">
                  <Button className="w-full md:w-auto h-12 bg-blue-700text-white" onClick={() => setStep(2)}>
                     Continue to Capture
                  </Button>
               </div>
            </Card>
         )}

         {/* STEP 2: Capture / Camera */}
         {step === 2 && (
            <Card className="flex-1 shadow-sm overflow-hidden flex flex-col bg-black border-0">
               <div className="flex-1 min-h-[300px] md:min-h-[400px] relative flex items-center justify-center">
                  {/* Viewfinder simulation */}
                  <div className="absolute inset-8 border-2 border-white/40 flex flex-col items-center justify-center space-y-4">
                     <span className="text-white/60 font-medium tracking-wide">ALIGN LABEL WITHIN FRAME</span>
                  </div>
               </div>
               <div className="p-6 bg-black flex justify-between items-center text-white pb-safe">
                  <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setStep(1)}>Back</Button>
                  <div
                     className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_0_4px_rgba(255,255,255,0.3)] cursor-pointer"
                     onClick={() => window.location.assign('/scanner')}
                  >
                     <Camera className="h-7 w-7 text-black" />
                  </div>
                  <Button variant="ghost" className="text-white hover:bg-white/20">Upload</Button>
               </div>
            </Card>
         )}
      </div>
   );
}