'use client';
import React from 'react';
import { Package, UploadCloud, Microscope } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuditorPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-3 mt-12 w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-6"><div className="bg-indigo-100 p-4 rounded-full"><Package className="w-12 h-12 text-indigo-600"/></div></div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Static Label Auditor</h1>
        <p className="text-lg text-slate-500">Pre-market compliance verifications. Upload digital proofs of packaging artwork before production to identify rules violations instantaneously.</p>
      </div>

      <Card className="max-w-2xl mx-auto w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center space-y-4">
          <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <div>
            <h3 className="font-bold text-slate-700 text-lg">Drag & Drop Artwork or PDF</h3>
            <p className="text-sm text-slate-500 mt-1">Supports PNG, JPG, PDF up to 25MB.</p>
          </div>
          <Button className="font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 mt-4"><Microscope className="w-4 h-4 mr-2"/> Browse Local Files</Button>
        </CardContent>
      </Card>
    </div>
  )
}