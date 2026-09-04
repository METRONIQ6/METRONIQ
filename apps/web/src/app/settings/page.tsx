'use client';
import React from 'react';
import { Settings, Shield, User, Bell } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex space-x-8 animate-in slide-in-from-left-4">
      <div className="w-1/4 space-y-2">
        <h2 className="font-black text-xl mb-4 text-slate-800">Configuration</h2>
        <div className="bg-white rounded-lg border p-2 shadow-sm space-y-1">
          <div className="bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-md flex items-center cursor-pointer"><User className="w-4 h-4 mr-2"/> Profile</div>
          <div className="text-slate-500 font-bold px-4 py-2 rounded-md flex items-center hover:bg-slate-50 cursor-pointer"><Shield className="w-4 h-4 mr-2"/> Security</div>
          <div className="text-slate-500 font-bold px-4 py-2 rounded-md flex items-center hover:bg-slate-50 cursor-pointer"><Bell className="w-4 h-4 mr-2"/> Notifications</div>
        </div>
      </div>
      <div className="w-3/4 space-y-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2"><Settings className="w-7 h-7 text-slate-400"/> Developer Profile</h1>
        <Card>
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Official Email</p>
              <div className="font-mono text-slate-900 text-lg bg-slate-50 inline-block px-3 py-1 rounded border">admin@metroniq.local</div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Role Hierarchy</p>
              <div className="font-bold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded border border-emerald-200">SUPER_ADMIN</div>
            </div>
            <div className="pt-4 border-t"><Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Revoke Active Sessions</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}