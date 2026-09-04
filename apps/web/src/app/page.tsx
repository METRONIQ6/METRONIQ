'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ScanSearch, ChevronRight, Activity, Cpu, Command, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-50 relative selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-blue-400 p-2 rounded-xl group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all">
              <Command className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">MetronIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#compliance" className="hover:text-white transition-colors">Legal Intelligence</a>
            <a href="#manufacturers" className="hover:text-white transition-colors">Packagers</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/dashboard">
              <Button className="bg-white hover:bg-slate-200 text-[#0A0F1C] font-bold rounded-full px-6 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Access Gateway
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            SIH 2026 Ready Framework
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Deterministic Compliance,<br />AI-Driven Precision.
          </h1>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Automate Legal Metrology enforcement using distributed Computer Vision and immutable rule evaluations. Eliminating human variance in packaging compliance.
          </p>
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/scanner">
              <Button className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-full font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1">
                Launch Inspection Node <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="w-full lg:w-1/2 relative lg:h-[600px] flex items-center justify-center animate-in zoom-in-95 duration-1000">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-3xl"></div>
          {/* Dashboard Mockup */}
          <div className="relative w-full max-w-lg aspect-square bg-[#0D1527] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-700">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-emerald-400"></div></div>
              <div className="text-xs font-mono text-slate-500">Pipeline Status: ACTIVE</div>
            </div>

            {/* Visual AI Scan Lines */}
            <div className="relative flex-1 bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center group cursor-crosshair">
              <ScanSearch className="w-16 h-16 text-indigo-500/50 group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)] animate-[scan_3s_ease-in-out_infinite]"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 h-32">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-center">
                <div className="text-2xl font-black text-emerald-400">99.8%</div>
                <div className="text-xs font-bold text-emerald-500/70 uppercase">OCR Confidence</div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col justify-center">
                <div className="text-2xl font-black text-indigo-400">0.42s</div>
                <div className="text-xs font-bold text-indigo-500/70 uppercase">Rule Evaluation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6 relative border-t border-white/5 bg-[#0D1322]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white">Advanced Telemetry Stack</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Not just data ingestion. We validate computer vision payloads natively against Legal Metrology frameworks with zero hallucination.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: "Edge-Ready AI", desc: "PaddleOCR pipelines compiled for high-speed localized inference, completely isolating PII from external APIs." },
              { icon: ShieldCheck, title: "Deterministic Rules", desc: "Hard-coded compliance statutes ensure 100% auditable infraction determinations against the Packaged Commodities rules." },
              { icon: Activity, title: "Predictive Targeting", desc: "Aggregated risk models direct field officers directly towards entities with historical probabilities of variance." }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all cursor-crosshair">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2"><Command className="w-5 h-5 text-indigo-500" /> <span className="font-bold text-slate-300">MetronIQ</span></div>
          <p>© 2026 MetronIQ Core Initiative. Secure Government-Grade Endpoints.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 1; }
        }
      `}} />
    </div>
  );
}