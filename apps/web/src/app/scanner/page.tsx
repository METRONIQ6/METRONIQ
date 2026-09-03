"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Circle, UploadCloud, FileImage, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScannerPage() {
   const [step, setStep] = useState(0);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [scanId, setScanId] = useState<string | null>(null);
   const [errorMsg, setErrorMsg] = useState("");

   const fileInputRef = useRef<HTMLInputElement>(null);
   const router = useRouter();

   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrorMsg("");
      const file = e.target.files?.[0];
      if (!file) return;

      // 1. Preview the Image
      setPreviewUrl(URL.createObjectURL(file));
      setStep(1); // UPLOADING

      const formData = new FormData();
      formData.append("file", file);

      try {
         // 2. Upload to FastAPI
         const uploadRes = await fetch("http://localhost:8000/api/v1/scanner/upload", {
            method: "POST",
            body: formData, // the browser automatically sets multipart content-type mapping!
         });

         if (!uploadRes.ok) throw new Error("Upload Failed");
         const uploadData = await uploadRes.json();
         const id = uploadData.id;
         setScanId(id);

         // 3. Trigger Async Processing Pipeline
         setStep(2); // AI PROCESSING
         await fetch(`http://localhost:8000/api/v1/scanner/process?scan_id=${id}`, { method: "POST" });

      } catch (err: any) {
         setErrorMsg("Connection to Backend AI failed. Ensure FastAPI is running on port 8000.");
         setStep(0);
      }
   };

   // 4. Polling Mechanism for Background Tasks
   useEffect(() => {
      if (step === 2 && scanId) {
         const interval = setInterval(async () => {
            try {
               const statusRes = await fetch(`http://localhost:8000/api/v1/scanner/${scanId}/status`);
               if (statusRes.ok) {
                  const data = await statusRes.json();
                  if (data.status === "COMPLETED") {
                     setStep(4);
                     clearInterval(interval);
                  } else if (data.status === "FAILED") {
                     setErrorMsg("AI Model crashed during inference: " + data.error);
                     clearInterval(interval);
                     setStep(0);
                  }
               }
            } catch (err) {
               console.error("Polling error", err);
            }
         }, 1500); // Poll every 1.5s
         return () => clearInterval(interval);
      }
   }, [step, scanId]);

   return (
      <div className="flex flex-col space-y-6 md:space-y-8 max-w-5xl mx-auto h-full">
         <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">AI Product Scanner</h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">
               Securely uploads packaging frames to the local YOLO & PaddleOCR bounds for absolute extraction.
            </p>
         </div>

         {errorMsg && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm font-medium border border-red-200">
               {errorMsg}
            </div>
         )}

         {step === 0 && (
            <Card
               className="border-dashed border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors mx-auto w-full md:min-h-[400px] flex items-center justify-center cursor-pointer"
               onClick={() => fileInputRef.current?.click()}
            >
               <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
               />
               <CardContent className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-400">
                     <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">Capture or Upload Package</h3>
                  <p className="text-xs md:text-sm text-slate-500 mb-6 max-w-sm">
                     The system isolates structural images locally. Compatible with JPG, PNG formats up to 5MB.
                  </p>
                  <Button variant="default" className="bg-[#0A192F] h-12 px-8 text-white flex gap-2">
                     <UploadCloud className="w-5 h-5" /> Initialize CV Extraction
                  </Button>
               </CardContent>
            </Card>
         )}

         {step > 0 && (
            <Card className="flex-1 shadow-md border-slate-200">
               <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12 h-full">
                  <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 rounded-lg h-[350px] md:h-[450px] border border-slate-300 relative overflow-hidden group">
                     {previewUrl ? (
                        <img src={previewUrl} alt="Scan Target" className="object-contain w-full h-full p-4" />
                     ) : (
                        <FileImage className="w-12 h-12 text-slate-300" />
                     )}

                     {/* Dynamic Visual Scanner Beam aligned with processing state */}
                     {step === 2 && (
                        <>
                           <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 shadow-[0_0_15px_6px_#3b82f6] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                           <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-md flex items-center gap-2 backdrop-blur-sm">
                              <Loader2 className="w-3 h-3 animate-spin" /> Neural Pipeline Active
                           </div>
                        </>
                     )}
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col justify-center space-y-8">
                     <div className="border-b border-slate-200 pb-4">
                        <h3 className="text-xl font-bold text-slate-900">Inference Progress</h3>
                        <p className="text-sm text-slate-500 mt-1">Monitoring backend asynchronous jobs ({scanId || 'INITIALIZING'})</p>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                           {step >= 1 ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6 text-slate-200" />}
                           <div className="flex flex-col">
                              <span className={step >= 1 ? "text-slate-900 font-semibold" : "text-slate-400 font-medium"}>1. Upload & Preprocessing</span>
                              <span className="text-xs text-slate-500">FastAPI File Validation & Contrast Limiting (CLAHE)</span>
                           </div>
                        </div>

                        <div className="flex items-center space-x-4">
                           {step >= 2 ? (
                              step === 2 ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> : <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                           ) : <Circle className="h-6 w-6 text-slate-200" />}
                           <div className="flex flex-col">
                              <span className={step >= 2 ? "text-slate-900 font-semibold" : "text-slate-400 font-medium"}>2. YOLO Region Detection</span>
                              <span className="text-xs text-slate-500">Extracts Net Quantity, MRP, Manufacturer blocks</span>
                           </div>
                        </div>

                        <div className="flex items-center space-x-4">
                           {step >= 4 ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6 text-slate-200" />}
                           <div className="flex flex-col">
                              <span className={step >= 4 ? "text-slate-900 font-semibold" : "text-slate-400 font-medium"}>3. PaddleOCR Sequence</span>
                              <span className="text-xs text-slate-500">Transforms regional arrays into mathematical text blocks</span>
                           </div>
                        </div>

                        <div className="flex items-center space-x-4">
                           {step >= 4 ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6 text-slate-200" />}
                           <div className="flex flex-col">
                              <span className={step >= 4 ? "text-slate-900 font-semibold" : "text-slate-400 font-medium"}>4. Legal Metrology Logic Edge</span>
                              <span className="text-xs text-slate-500">Writes SQL boundaries & formats Evidence viewer JSON</span>
                           </div>
                        </div>
                     </div>

                     {step >= 4 && (
                        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                           <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide" onClick={() => router.push(`/inspections/${scanId}`)}>
                              VIEW COMPLIANCE EVIDENCE
                           </Button>
                           <Button variant="outline" className="w-full h-12 font-medium" onClick={() => { setStep(0); setPreviewUrl(null); setScanId(null); }}>
                              Scan Another Package
                           </Button>
                        </div>
                     )}
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   )
}