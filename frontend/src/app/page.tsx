"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useTranslation } from '@/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { ModeToggle } from '@/components/mode-toggle';
import Footer from '@/components/layout/Footer';

import { Button } from "@/components/ui/button";
import {
    ShieldCheck, ChevronRight, ScanLine, Scale, Globe, Activity, FileText,
    Users, Briefcase, Gavel, Languages, Shield, AlertTriangle, ScrollText, GitCommit, FileCheck,
    CheckCircle2, Cpu, Database, Binary, ArrowRight, CornerDownRight
} from 'lucide-react';

export default function LandingPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeStage, setActiveStage] = useState(3);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);


    const pipelineStages = [
        { id: 0, label: t('landing.stage1'), sub: t('landing.stage1Sub'), status: "STANDBY" },
        { id: 1, label: t('landing.stage2'), sub: t('landing.stage2Sub'), status: "PROCESSING" },
        { id: 2, label: t('landing.stage3'), sub: t('landing.stage3Sub'), status: "EXTRACTING" },
        { id: 3, label: t('landing.stage4'), sub: t('landing.stage4Sub'), status: "VERIFIED" }
    ];

    const sopSteps = [
        {
            step: "01",
            code: "SOP-INTAKE",
            icon: <ScanLine className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.aiScanner'),
            desc: t('landing.aiScannerDesc')
        },
        {
            step: "02",
            code: "SOP-NOTICE",
            icon: <FileText className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.improvementNotices'),
            desc: t('landing.improvementNoticesDesc')
        },
        {
            step: "03",
            code: "SOP-AUDIT",
            icon: <GitCommit className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.reinspections'),
            desc: t('landing.reinspectionsDesc')
        },
        {
            step: "04",
            code: "SOP-ENFORCE",
            icon: <Gavel className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.penaltyEnforcement'),
            desc: t('landing.penaltyEnforcementDesc')
        }
    ];

    const enterpriseModules = [
        {
            icon: <Globe className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.aiInference'),
            subtitle: t('landing.aiInferenceSub'),
            desc: t('landing.aiInferenceDesc'),
            tag: "VISION_CORE"
        },
        {
            icon: <Scale className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.dynamicRules'),
            subtitle: t('landing.dynamicRulesSub'),
            desc: t('landing.dynamicRulesDesc'),
            tag: "RULE_ENGINE"
        },
        {
            icon: <FileCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.mfgRectification'),
            subtitle: t('landing.mfgRectificationSub'),
            desc: t('landing.mfgRectificationDesc'),
            tag: "ENTERPRISE_PORTAL"
        },
        {
            icon: <Activity className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.geoAnalytics'),
            subtitle: t('landing.geoAnalyticsSub'),
            desc: t('landing.geoAnalyticsDesc'),
            tag: "SPATIAL_INTEL"
        },
        {
            icon: <Languages className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.multilingual'),
            subtitle: t('landing.multilingualSub'),
            desc: t('landing.multilingualDesc'),
            tag: "I18N_KERNEL"
        },
        {
            icon: <ScrollText className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />,
            title: t('landing.pdfLedger'),
            subtitle: t('landing.pdfLedgerSub'),
            desc: t('landing.pdfLedgerDesc'),
            tag: "AUDIT_DOCKET"
        }
    ];

    const integrityItems = [
        { icon: <Users className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />, text: t('landing.rbac') },
        { icon: <Shield className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />, text: t('landing.immutableAudit') },
        { icon: <Briefcase className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />, text: t('landing.sessionState') },
        { icon: <AlertTriangle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />, text: t('landing.deterministicVal') },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-[#2563EB]/20 flex flex-col transition-colors duration-300 ease-in-out">
            {/* Header / Navbar */}
            <header className="sticky w-full z-40 top-0 border-b border-border bg-card/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#0B1F3A] dark:bg-[#132238] text-white p-2 rounded-md shadow-xs border border-border/40">
                            <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-foreground block leading-tight">{t('common.metroniq')}</span>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">{t('landing.complianceHeader')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <nav aria-label="Main Navigation" className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground mr-2">
                            <a href="#workflows" className="hover:text-foreground transition-colors">{t('navbar.workflows')}</a>
                            <a href="#capabilities" className="hover:text-foreground transition-colors">{t('navbar.capabilities')}</a>
                            <a href="#architecture" className="hover:text-foreground transition-colors">{t('navbar.architecture')}</a>
                        </nav>
                        <ModeToggle />
                        <LanguageSelector />
                        <Button 
                            onClick={() => router.push('/login')} 
                            className="bg-[#0B1F3A] hover:bg-[#132F54] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white px-5 font-semibold shadow-xs transition-all duration-200"
                        >
                            {t('landing.departmentLogin')}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col font-sans">
                {/* Hero Section */}
                <section className="relative px-6 py-16 md:py-24 bg-tech-grid border-b border-border overflow-hidden">
                    {/* Subtle Radial Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background pointer-events-none" />

                    <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Left Content */}
                        <div className="lg:col-span-6 space-y-6 text-left">
                            {/* Scientific Classification Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-muted/80 border border-border text-foreground">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-muted-foreground uppercase tracking-wider">{t('landing.statutoryArchitectureBadge')}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#0B1F3A] dark:text-white">
                                {t('landing.title1')}{' '}
                                <span className="text-[#2563EB] dark:text-blue-400 block mt-1">
                                    {t('landing.title2')}
                                </span>
                            </h1>

                            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
                                {t('landing.subtitle')}
                            </p>

                            {/* CTAs and Technical Indicators */}
                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Button 
                                    size="lg" 
                                    onClick={() => router.push('/login')} 
                                    className="h-12 px-7 text-sm font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs group transition-all duration-200"
                                >
                                    {t('landing.accessGovtPortal')}
                                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <a 
                                    href="#workflows" 
                                    className="inline-flex items-center justify-center h-12 px-5 text-sm font-semibold text-foreground bg-card hover:bg-muted border border-border rounded-md shadow-xs transition-colors"
                                >
                                    <CornerDownRight className="w-4 h-4 mr-2 text-muted-foreground" />
                                    {t('landing.sop')}
                                </a>
                            </div>

                            {/* Technical Capabilities Matrix Strip */}
                            <div className="pt-4 grid grid-cols-3 gap-2 border-t border-border/80">
                                <div className="space-y-1">
                                    <div className="text-[11px] font-mono font-bold text-muted-foreground uppercase">{t('landing.visionEngine')}</div>
                                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                                        {t('landing.yoloOcrTag')}
                                    </div>
                                </div>
                                <div className="space-y-1 border-l border-border pl-3">
                                    <div className="text-[11px] font-mono font-bold text-muted-foreground uppercase">{t('landing.ruleEngine')}</div>
                                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Scale className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                                        {t('landing.deterministicTag')}
                                    </div>
                                </div>
                                <div className="space-y-1 border-l border-border pl-3">
                                    <div className="text-[11px] font-mono font-bold text-muted-foreground uppercase">{t('landing.integrity')}</div>
                                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        {t('landing.signedAuditTag')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Right Technical Visual: Interactive Verification Pipeline Simulation */}
                        <div className="lg:col-span-6 relative">
                            {/* Outer Frame with Technical Crosshairs */}
                            <div className="relative bg-card rounded-lg border border-border shadow-md overflow-hidden">
                                {/* Top Telemetry Header */}
                                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between font-mono text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-bold text-foreground tracking-wider">{t('landing.pipelineTelemetryStream')}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                                        {t('landing.statusActive')}
                                    </span>
                                </div>

                                {/* Simulated Scanning Viewport */}
                                <div className="p-5 space-y-4">
                                    {/* Mock Packaging Bounding Box Viewport */}
                                    <div className="relative rounded-md border border-border bg-muted/20 p-4 font-mono text-xs overflow-hidden">
                                        {/* Animated Scan Line */}
                                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent animate-scanline pointer-events-none z-20 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />

                                        {/* Technical Reticle Ticks */}
                                        <div className="absolute top-1.5 left-1.5 text-[10px] text-muted-foreground/40 select-none">┌</div>
                                        <div className="absolute top-1.5 right-1.5 text-[10px] text-muted-foreground/40 select-none">┐</div>
                                        <div className="absolute bottom-1.5 left-1.5 text-[10px] text-muted-foreground/40 select-none">└</div>
                                        <div className="absolute bottom-1.5 right-1.5 text-[10px] text-muted-foreground/40 select-none">┘</div>

                                        <div className="flex items-center justify-between mb-3 text-[11px] text-muted-foreground border-b border-border/50 pb-2">
                                            <span className="font-semibold text-foreground">{t('landing.commodityDeclarationDetection')}</span>
                                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                {t('landing.verifiedRule6')}
                                            </span>
                                        </div>

                                        {/* Verified Attribute Rows */}
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-muted-foreground font-sans">{t('landing.mrpUspLabel')}</span>
                                                    <span className="font-semibold text-foreground">₹ 120.00 (₹ 1.20 / g)</span>
                                                </div>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t('landing.pass')}</span>
                                            </div>

                                            <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-muted-foreground font-sans">{t('landing.netQtyLabel')}</span>
                                                    <span className="font-semibold text-foreground">100 g</span>
                                                </div>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t('landing.pass')}</span>
                                            </div>

                                            <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-muted-foreground font-sans">{t('landing.mfgDateLabel')}</span>
                                                    <span className="font-semibold text-foreground">08/2026</span>
                                                </div>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t('landing.pass')}</span>
                                            </div>

                                            <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-muted-foreground font-sans">{t('landing.consumerCareLabel')}</span>
                                                    <span className="font-semibold text-foreground">{t('landing.verified')}</span>
                                                </div>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t('landing.pass')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4-Stage Pipeline Progress Sequence */}
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-mono font-bold text-muted-foreground uppercase flex items-center justify-between">
                                            <span>{t('landing.statutoryExecutionStages')}</span>
                                            <span className="text-foreground">04 / 04</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {pipelineStages.map((stage) => {
                                                const isActive = activeStage === stage.id;
                                                return (
                                                    <div 
                                                        key={stage.id}
                                                        className={`p-2 rounded border text-left transition-all duration-300 ${
                                                            isActive 
                                                                ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#2563EB] shadow-xs' 
                                                                : 'bg-muted/30 border-border opacity-85'
                                                        }`}
                                                    >
                                                        <div className="text-[10px] font-mono font-bold text-[#2563EB] dark:text-blue-400">{stage.label}</div>
                                                        <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{stage.sub}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Verification Status Bar */}
                                <div className="px-4 py-2.5 border-t border-border bg-muted/40 flex items-center justify-between font-mono text-[11px]">
                                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{t('landing.statutoryCompliant')}</span>
                                    </div>
                                    <span className="text-muted-foreground">{t('landing.hashVerified')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOP Lifecycle Workflow Section */}
                <section id="workflows" className="py-20 px-6 bg-card border-b border-border">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="h-px w-6 bg-[#2563EB]"></span>
                                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-blue-400">{t('landing.sop')}</span>
                                <span className="h-px w-6 bg-[#2563EB]"></span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">{t('landing.sopTitle')}</h2>
                            <p className="text-muted-foreground text-base leading-relaxed">{t('landing.sopDesc')}</p>
                        </div>

                        {/* SOP Step Cards Grid with Connecting Flow Motifs */}
                        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 relative">
                            {sopSteps.map((s, i) => (
                                <div 
                                    key={i} 
                                    className="group relative z-10 bg-background p-6 rounded-lg border border-border shadow-xs hover:border-[#2563EB]/60 dark:hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                >
                                    {/* Corner Reticle Indicator */}
                                    <div className="absolute top-2 right-2 text-[9px] font-mono text-muted-foreground/30 select-none">
                                        {s.code}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between w-full mb-4">
                                            <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                                {s.icon}
                                            </div>
                                            <span className="text-2xl font-bold font-mono text-muted-foreground/40 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                                                {s.step}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold mb-2 text-foreground tracking-tight">{s.title}</h3>
                                        <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                                        <span>{t('landing.statusActive')}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Functional Architecture / Capabilities Section */}
                <section id="capabilities" className="py-20 px-6 bg-muted/30 border-b border-border bg-tech-dots">
                    <div className="max-w-7xl mx-auto">
                        <div className="border-l-4 border-[#2563EB] pl-4 mb-14">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 block mb-1">
                                {t('landing.functionalArchitectureBadge')}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground uppercase mb-2">
                                {t('landing.enterpriseModules')}
                            </h2>
                            <p className="text-muted-foreground text-sm max-w-2xl font-normal">
                                {t('landing.enterpriseModulesDesc')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enterpriseModules.map((ft, i) => (
                                <div 
                                    key={i} 
                                    className="group bg-card border border-border rounded-lg p-6 shadow-xs hover:border-[#2563EB]/50 dark:hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-colors">
                                                {ft.icon}
                                            </div>
                                            <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                                {ft.tag}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider block mb-1.5">
                                            {ft.subtitle}
                                        </span>
                                        <h3 className="text-base font-bold mb-2 text-foreground">{ft.title}</h3>
                                        <p className="text-muted-foreground text-xs leading-relaxed">{ft.desc}</p>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {t('landing.systemReady')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Architecture & Integrity Section */}
                <section id="architecture" className="py-20 px-6 bg-card">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Details */}
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                <Binary className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                                {t('landing.complianceEngineArch')}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{t('landing.legalOps')}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {t('landing.legalOpsDesc')}
                            </p>
                            
                            <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                {integrityItems.map((item, index) => (
                                    <div key={index} className="flex items-center text-foreground font-medium text-xs p-3 rounded-md border border-border bg-muted/20 hover:border-[#2563EB]/40 transition-colors">
                                        <div className="p-1.5 rounded mr-2.5 bg-card border border-border">
                                            {item.icon}
                                        </div>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex flex-wrap items-center gap-3">
                                <Button 
                                    onClick={() => router.push('/login')} 
                                    className="bg-[#0B1F3A] hover:bg-[#132F54] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white h-11 px-6 text-sm font-semibold shadow-xs transition-all duration-200"
                                >
                                    {t('landing.authenticateModule')}
                                </Button>
                            </div>
                        </div>

                        {/* Right Real-time Regulatory Audit Node Card */}
                        <div className="relative">
                            <div className="bg-card rounded-lg border border-border shadow-md p-6 relative">
                                <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="text-emerald-600 dark:text-emerald-400 w-4 h-4" />
                                        <span className="font-semibold text-xs tracking-wider uppercase text-foreground">{t('landing.auditStream')}</span>
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {t('landing.secureGovtNode')}
                                    </span>
                                </div>

                                <div className="space-y-3 font-mono text-xs">
                                    <div className="p-3 rounded bg-muted/40 border border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Scale className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                                            <span className="text-foreground">RULE_ENGINE_PCR2011</span>
                                        </div>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                            {t('landing.statusOnline')}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded bg-muted/40 border border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                                            <span className="text-foreground">YOLO_DECLARATION_DETECTOR</span>
                                        </div>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                            {t('landing.statusReady')}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded bg-muted/40 border border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                                            <span className="text-foreground">PADDLE_OCR_PPOCR4</span>
                                        </div>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                            {t('landing.statusVerified')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                                    <span>PROTOCOL: TLS_1.3 // SHA256</span>
                                    <span>NODE: IN_CENTRAL_01</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
