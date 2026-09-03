import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanSearch, Fingerprint } from "lucide-react";

export interface EvidenceData {
   status: string;
   metadata: {
      filename: string;
      processed_width: number;
      processed_height: number;
      ocr_status?: string;
      ocr_error?: string;
   };
   yolo_objects: Array<{
      class_name: string;
      confidence: number;
      bounding_box: [number, number, number, number];
   }>;
   raw_ocr: Array<{
      text: string;
      confidence: number;
      bounding_box: [number, number, number, number];
      yolo_region: string;
   }>;
   legal_declarations: Record<string, {
      text: string;
      confidence: number;
      bounding_box: [number, number, number, number];
      yolo_region: string;
   }>;
}

interface EvidenceViewerProps {
   imageUrl?: string;
   evidenceData?: EvidenceData | null;
}

export function EvidenceViewer({ imageUrl = "/demo-package.jpg", evidenceData = null }: EvidenceViewerProps) {
   if (!evidenceData) {
      return (
         <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-[400px] items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
            <ScanSearch className="w-12 h-12 text-slate-300 mb-2" />
            <h3 className="text-slate-500 font-medium">AWAITING REAL AI RESULT</h3>
            <p className="text-sm text-slate-400">Processing must complete before evidence can be viewed.</p>
         </div>
      );
   }

   const activeData = evidenceData;
   const imgW = activeData.metadata?.processed_width || 800;
   const imgH = activeData.metadata?.processed_height || 800;

   // Check if we are running on generic YOLO weights instead of trained Domain weights
   const hasGenericWarnings = activeData.yolo_objects?.some(obj => obj.class_name.startsWith("GENERIC_"));

   // Fallback map for when OCR fails but YOLO worked! We want to at least show the YOLO bounds.
   const displayBoxes = activeData.raw_ocr?.length > 0
      ? activeData.raw_ocr
      : activeData.yolo_objects?.map(obj => ({
         text: "TEXT PENDING",
         confidence: obj.confidence,
         bounding_box: obj.bounding_box,
         yolo_region: obj.class_name
      })) || [];

   return (
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

         <Card className="shadow-md border-slate-200 overflow-hidden relative">
            <CardHeader className="bg-slate-900 border-b p-4 flex flex-row items-center justify-between space-y-0">
               <CardTitle className="text-white text-base md:text-lg tracking-wide flex items-center gap-2">
                  <ScanSearch className="w-5 h-5 text-blue-400" />
                  REAL AI INFERENCE
               </CardTitle>
               <div className="flex items-center gap-2">
                  <div className="hidden md:flex flex-col text-right mr-4 leading-tight">
                     <span className="text-xs text-slate-400 font-mono">MODEL: {activeData.metadata?.model_name || "UNKNOWN"} [v{activeData.metadata?.model_version || "N/A"}]</span>
                     <span className={`text-[10px] font-bold tracking-wider ${activeData.metadata?.model_type === "DOMAIN" ? "text-emerald-400" : "text-amber-400"}`}>
                        TYPE: {activeData.metadata?.model_type === "DOMAIN" ? "DOMAIN MODEL ACTIVE" : "DOMAIN MODEL NOT CONFIGURED"}
                     </span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-medium tracking-widest border border-blue-400/50">
                     EVIDENCE VIEW
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="p-0 bg-slate-50 flex flex-col items-center justify-center relative">

               {hasGenericWarnings && (
                  <div className="w-full bg-amber-100/80 border-b border-amber-200 text-amber-800 p-3 text-sm font-medium flex items-center justify-center gap-2 text-center">
                     <span className="font-bold">WARNING: DOMAIN MODEL NOT CONFIGURED.</span>
                     Showing GENERIC YOLO bounding limits.
                  </div>
               )}

               {activeData.metadata?.ocr_status === "FAILED" && (
                  <div className="w-full bg-red-100/90 border-b border-red-200 text-red-800 p-3 text-sm font-medium flex items-center justify-center gap-2 text-center">
                     <span className="font-bold">OCR ENGINE FAILURE.</span>
                     Local C++ processor limit reached. Displaying detected YOLO Structural bounds only.
                  </div>
               )}

               {/* Package Image Area */}
               <div className="relative w-full h-full max-w-3xl mx-auto flex items-center justify-center p-8">
                  <div className="relative w-full aspect-square md:aspect-video bg-slate-200 border-2 border-slate-300 rounded-lg overflow-hidden shadow-inner flex flex-col items-center justify-center"
                     style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                     }}>

                     {/* Dynamic Bounding Boxes Overlay - strictly mathematical */}
                     {displayBoxes.map((box, idx) => {
                        const [x1, y1, x2, y2] = box.bounding_box || [0, 0, 0, 0];
                        const left = (x1 / imgW) * 100;
                        const top = (y1 / imgH) * 100;
                        const width = ((x2 - x1) / imgW) * 100;
                        const height = ((y2 - y1) / imgH) * 100;

                        return (
                           <div key={idx}
                              className="absolute border-[3px] border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group hover:z-50"
                              style={{
                                 left: `${left}%`,
                                 top: `${top}%`,
                                 width: `${width}%`,
                                 height: `${height}%`
                              }}>
                              <div className="absolute -top-10 -right-4 bg-slate-900 border border-emerald-500 shadow-xl rounded-md px-3 py-1.5 flex items-center gap-3 w-max opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                 <span className="text-white font-bold text-sm tracking-wide">{box.text}</span>
                                 <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                                    ← {Math.round(box.confidence * 100)}%
                                 </span>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>

            </CardContent>
         </Card>

         {/* Hardened Extraction Table */}
         <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50 border-b p-4">
               <CardTitle className="text-slate-900 text-base md:text-lg flex items-center gap-2 uppercase tracking-wide">
                  <Fingerprint className="w-5 h-5 text-indigo-500" />
                  REAL DETECTED DECLARATIONS
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                  <TableHeader className="bg-slate-100/50">
                     <TableRow>
                        <TableHead className="font-bold text-slate-700 w-1/3">Target Region</TableHead>
                        <TableHead className="font-bold text-slate-700">Source Text</TableHead>
                        <TableHead className="font-bold text-slate-700 text-right">Model Confidence</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {(!activeData.raw_ocr || activeData.raw_ocr.length === 0) && (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center p-8 text-slate-500 font-medium bg-slate-50">
                              OCR PENDING / UNAVAILABLE. YOLO STRUCTURAL DETECTION ONLY.
                           </TableCell>
                        </TableRow>
                     )}
                     {activeData.raw_ocr?.map((dec, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50">
                           <TableCell className="font-medium text-indigo-700 capitalize">
                              {dec.yolo_region ? dec.yolo_region.replace("GENERIC_", "").replace("_", " ") : "GLOBAL_FALLBACK"}
                           </TableCell>
                           <TableCell className="text-slate-900 font-mono bg-slate-100/50 break-all max-w-[200px]">
                              {dec.text}
                           </TableCell>
                           <TableCell className="text-right">
                              <Badge variant={dec.confidence > 0.90 ? "default" : "destructive"}
                                 className={dec.confidence > 0.90 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : ""}>
                                 {Math.round(dec.confidence * 100)}%
                              </Badge>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

      </div>
   );
}