"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    ShieldCheck, ChevronRight, ScanLine, Scale, Globe, Activity, FileText,
    Users, Briefcase, Gavel, Languages, Shield, AlertTriangle, ScrollText, GitCommit, FileCheck, Award
} from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col transition-colors duration-500 ease-in-out">


            {/* Navbar */}
            <nav className="sticky w-full z-40 top-0 border-b border-border/40 bg-background/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-md text-primary-foreground shadow-sm">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">METRONIQ</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground mr-6">
                            <a href="#workflows" className="hover:text-primary transition-colors">Workflows</a>
                            <a href="#capabilities" className="hover:text-primary transition-colors">Core Modules</a>
                            <a href="#architecture" className="hover:text-primary transition-colors">Security Security</a>
                        </div>
                        <Button onClick={() => router.push('/login')} className="rounded-full bg-[#0056b3] hover:bg-[#004494] text-white px-6 font-semibold shadow-sm hover:shadow-md transition-all">
                            Department Login
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col font-sans">
                <section className="relative px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
                    {/* Govt Background decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            Legal Metrology Compliance. <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0056b3] to-[#00a65a]">
                                Automated by AI.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                            The official centralized intelligence platform for state enforcement directorates. From instant field AI scanning and e-commerce oversight to dynamic rule mapping, reinspections, and financial penalties—one unified platform governing consumer protection.
                        </p>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" onClick={() => router.push('/login')} className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg bg-[#0056b3] hover:bg-[#004494] text-white hover:shadow-xl hover:shadow-blue-900/20 transition-all group">
                                Access Govt Portal
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Vertical Lifecycle Section */}
                <section id="workflows" className="py-24 px-6 bg-slate-100 dark:bg-slate-900/50 border-y border-border/40">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-px w-8 bg-[#0056b3]"></span>
                                <span className="text-sm font-bold uppercase tracking-widest text-[#0056b3]">Standard Operating Procedure</span>
                                <span className="h-px w-8 bg-[#0056b3]"></span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">The Complete Enforcement Lifecycle</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">MetronIQ eliminates siloed physical paperwork. A completely closed-loop environment where every action is intelligently tracked across the regulatory continuum.</p>
                        </div>

                        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 relative">
                            {/* Connective Line */}
                            <div className="hidden lg:block absolute top-[40px] left-[12%] w-[76%] h-[2px] bg-gradient-to-r from-[#0056b3]/20 via-[#0056b3]/40 to-[#0056b3]/20 z-0"></div>

                            {[
                                {
                                    step: "01", icon: <ScanLine className="w-6 h-6" />, title: "AI Package Scanner",
                                    desc: "Officers upload packaging imagery; AI extracts OCR tokens and instantly validates them against active Legal Metrology (LMPC) Rules."
                                },
                                {
                                    step: "02", icon: <FileText className="w-6 h-6" />, title: "Improvement Notices",
                                    desc: "Automated digital notice generation demanding rectification from Manufacturers. All corporate responses tracked officially."
                                },
                                {
                                    step: "03", icon: <GitCommit className="w-6 h-6" />, title: "Reinspections",
                                    desc: "After notices expire, dynamic scheduling triggers follow-up compliance checks. Unresolved issues escalate automatically."
                                },
                                {
                                    step: "04", icon: <Gavel className="w-6 h-6" />, title: "Penalty Enforcement",
                                    desc: "Escalated violations shift to legal dockets, allowing transparent issuance of financial penalties & compound mandates to offenders."
                                }
                            ].map((s, i) => (
                                <div key={i} className="relative z-10 bg-white dark:bg-card p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                    <div className="flex items-center justify-between w-full mb-6 relative">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-white dark:border-card shadow-md flex items-center justify-center text-[#0056b3] dark:text-blue-400 group-hover:scale-110 group-hover:bg-[#0056b3] group-hover:text-white transition-all">
                                            {s.icon}
                                        </div>
                                        <span className="text-4xl font-extrabold text-slate-100 dark:text-slate-800 transition-colors">{s.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">{s.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Modules Grid */}
                <section id="capabilities" className="py-24 px-6 relative bg-white dark:bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto">
                        <div className="border-l-4 border-[#0056b3] pl-6 mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-gray-100 uppercase mb-3">Enterprise Modules & Capabilities</h2>
                            <p className="text-muted-foreground text-lg max-w-3xl font-medium">A vast operational framework designed for government scale—bridging administrators, field officers, and enterprise manufacturers seamlessly across India under a unified regulatory umbrella.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Globe className="w-6 h-6" />,
                                    title: "AI Inference & OCR",
                                    subtitle: "Field Object Detection",
                                    desc: "Custom AI models extract text and specifications from physical packaged commodities in real-time to highlight unregistered configurations."
                                },
                                {
                                    icon: <Scale className="w-6 h-6" />,
                                    title: "Dynamic Rules Engine",
                                    subtitle: "Statutory Law Mapping",
                                    desc: "Administer and rigidly version Legal Metrology specifications. Update legal limits natively within the portal to dynamically calibrate AI field inspections."
                                },
                                {
                                    icon: <FileCheck className="w-6 h-6" />,
                                    title: "Manufacturer Rectification",
                                    subtitle: "Corporate Compliance",
                                    desc: "Secured Manufacturer portals allowing verified businesses to view flagged product notices, submit appeals, and provide proof-of-compliance independently."
                                },
                                {
                                    icon: <Activity className="w-6 h-6" />,
                                    title: "Geospatial Analytics",
                                    subtitle: "Risk-Based Heatmaps",
                                    desc: "Map interfaces rendering real-time heatmaps of systemic violations across regional territories, assisting state officers in prioritizing physical deployment."
                                },
                                {
                                    icon: <Languages className="w-6 h-6" />,
                                    title: "Multilingual Intelligence",
                                    subtitle: "Vernacular Support",
                                    desc: "Context-aware operational localization. Switch effortlessly between English, Tamil, and Hindi without reloading, ensuring absolute usability across field agents."
                                },
                                {
                                    icon: <ScrollText className="w-6 h-6" />,
                                    title: "Automated PDF Ledger",
                                    subtitle: "Official Audit Trail",
                                    desc: "One-click audit ledger extraction. Generate verified, government-standard banded timeline reports, securely authorized and exportable via JWT credentials."
                                }
                            ].map((ft, i) => (
                                <div key={i} className="relative group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#0056b3]/50 transition-all duration-300">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0056b3] to-[#00a65a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="p-8">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[#0056b3] dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm">
                                            {ft.icon}
                                        </div>
                                        <h4 className="text-xs font-bold text-[#00a65a] uppercase tracking-wider mb-2">{ft.subtitle}</h4>
                                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">{ft.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{ft.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Visual Data / Architecture Banner */}
                <section id="architecture" className="py-24 px-6 relative overflow-hidden bg-[#0056b3]/5 border-t border-[#0056b3]/10">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 flex-1 pr-6">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Legal Metrology & Food Safety Operations</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Engineered exclusively for government enforcement directorates, ensuring statutory compliance, packaged commodity governance, and rigorous consumer protection across the supply chain.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-y-4 pt-4">
                                {[
                                    { icon: <Users />, text: "Role-Based Access Control" },
                                    { icon: <Shield />, text: "Immutable Audit Trails" },
                                    { icon: <Briefcase />, text: "Session State Management" },
                                    { icon: <AlertTriangle />, text: "Deterministic Validation" },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center text-foreground font-medium text-sm">
                                        <div className="bg-[#0056b3]/10 p-1.5 rounded-md mr-3 text-[#0056b3]">
                                            {item.icon}
                                        </div>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6">
                                <Button onClick={() => router.push('/login')} className="rounded-full shadow-md bg-[#0056b3] hover:bg-[#004494] text-white h-12 px-8">
                                    Authenticate Module
                                </Button>
                            </div>
                        </div>
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="bg-card w-full max-w-md aspect-video rounded-3xl border border-border/60 shadow-2xl overflow-hidden flex flex-col p-6 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056b3]/10 blur-3xl rounded-full"></div>
                                <div className="border-b border-border pb-4 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="text-green-600 w-5 h-5" />
                                        <div className="font-semibold text-sm">Official Regulatory Audit Stream</div>
                                    </div>
                                    <span className="text-xs font-semibold text-[#00a65a]">Secure Govt Node</span>
                                </div>
                                <div className="space-y-4 flex flex-1 flex-col justify-center">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-2 h-2 rounded-full bg-[#0056b3]/40 animate-pulse"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-3/4 bg-muted animate-pulse rounded"></div>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono">2ms</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-background border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                        <ShieldCheck className="w-6 h-6 text-[#0056b3]" />
                        METRONIQ
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center border border-border px-3 py-1 rounded-full text-xs font-medium">Ministry of Consumer Affairs</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} METRONIQ. All operations securely logged.
                    </p>
                </div>
            </footer>
        </div>
    );
}
