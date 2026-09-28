"use client"
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ServerCrash, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'

interface ReportDetailProps {
    id: string;
    basePath: string; // e.g. '/officer/reports', '/manufacturer/reports', '/admin/reports'
}

export default function ReportDetail({ id, basePath }: ReportDetailProps) {
    const { t, language } = useTranslation()
    const [report, setReport] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/v1/reports/${id}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    setReport(await res.json())
                } else {
                    let detail = `HTTP ${res.status}`
                    try { detail = (await res.json()).detail } catch (_) { }
                    setErrorMsg(`Unable to load report. ${detail}`)
                }
            } catch (e: any) {
                setErrorMsg("Network transmission failure")
            }
        }
        fetchReport()
    }, [id])

    if (errorMsg) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
            <ServerCrash className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-[#0B1F3A]">{t('error.accessDenied')}</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-sm">{errorMsg}</p>
        </div>
    )
    if (!report) return (
        <div className="flex items-center justify-center min-h-[60vh] p-12">
            <div className="text-center font-medium text-muted-foreground animate-pulse text-sm">
                Loading Report...
            </div>
        </div>
    )

    const isStandalone = !report.case_id && report.inspection?.id?.startsWith("INSP-")
    const hasValidation = report.validation && (report.validation.evaluations?.length > 0 || report.validation.compliance)

    return (
        <div className="min-h-screen bg-card text-black p-8 md:p-12 print:p-0 font-sans max-w-[900px] mx-auto border-x border-border/50 shadow-sm print:border-none print:shadow-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; background-color: white; }
                    .no-print { display: none !important; }
                }
            `}} />

            {/* Header */}
            <div className="flex justify-between items-start mb-10 border-b-2 border-[#0B1F3A] pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#0B1F3A] mb-1">{t("reports.title")}</h1>
                    <p className="text-sm text-muted-foreground font-mono">{t("reports.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch(`/api/v1/reports/${id}/pdf?lang=${language}`, {
                                    headers: { 'Authorization': `Bearer ${getToken()}` }
                                });
                                if (!res.ok) throw new Error("Download failed");
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `MetronIQ_Report_${id}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            } catch (e) {
                                console.error("PDF Export error:", e);
                                alert("Failed to generate PDF.");
                            }
                        }}
                        className="no-print flex items-center px-4 py-2 bg-[#2563EB] text-white font-semibold rounded-md text-sm hover:bg-[#2563EB]/90 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t("reports.downloadPdf")}
                    </button>
                </div>
            </div>

            {/* Reference Identifiers */}
            <div className="grid grid-cols-2 gap-6 mb-12">
                <Card className="p-5 bg-muted/30 border-border shadow-none rounded-sm">
                    <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-3 border-b border-border pb-2">{t('reports.referenceIdentifiers')}</h3>
                    <div className="space-y-2">
                        <p className="text-sm flex justify-between"><span className="text-muted-foreground font-medium">Inspection ID:</span> <span className="font-mono font-bold text-[#0B1F3A] block ml-auto">{report.inspection?.id || 'N/A'}</span></p>
                        {report.case_id && (
                            <p className="text-sm flex justify-between"><span className="text-muted-foreground font-medium">Docket ID:</span> <span className="font-mono block ml-auto">{report.case_id?.substring(0, 8).toUpperCase()}</span></p>
                        )}
                        {report.notice?.id && (
                            <p className="text-sm flex justify-between"><span className="text-muted-foreground font-medium">Notice Ref:</span> <span className="font-mono block ml-auto">{report.notice.id.substring(0, 8).toUpperCase()}</span></p>
                        )}
                    </div>
                </Card>
                <Card className="p-5 bg-muted/30 border-border shadow-none rounded-sm">
                    <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-3 border-b border-border pb-2">
                        {isStandalone ? 'Compliance Result' : t('reports.finalCaseDecision')}
                    </h3>
                    <div className="space-y-2">
                        {isStandalone ? (
                            <>
                                <p className="text-sm flex justify-between">
                                    <span className="text-muted-foreground font-medium">Result:</span>
                                    <span className={`font-bold uppercase block ml-auto ${report.inspection?.result === 'PASS' || report.inspection?.result === 'COMPLIANT' ? 'text-green-600' : report.inspection?.result === 'FAIL' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {report.inspection?.result || 'PENDING'}
                                    </span>
                                </p>
                                <p className="text-sm flex justify-between">
                                    <span className="text-muted-foreground font-medium">Risk Level:</span>
                                    <span className={`font-mono font-bold uppercase block ml-auto ${report.inspection?.risk_level === 'HIGH' ? 'text-red-600' : report.inspection?.risk_level === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'}`}>
                                        {report.inspection?.risk_level || 'N/A'}
                                    </span>
                                </p>
                                <p className="text-sm flex justify-between">
                                    <span className="text-muted-foreground font-medium">Status:</span>
                                    <span className="font-mono uppercase block ml-auto">{report.inspection?.status || 'N/A'}</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm flex justify-between"><span className="text-muted-foreground font-medium">Case Status:</span> <span className="font-bold uppercase text-[#0B1F3A] block ml-auto">{report.case_status}</span></p>
                                <p className="text-sm flex justify-between"><span className="text-muted-foreground font-medium">Final Reinspection:</span> <span className="font-mono uppercase block ml-auto">{report.reinspection?.result || 'NA'}</span></p>
                                <p className="text-sm flex justify-between"><span className="text-muted-foreground font-medium">Penalty Assessed:</span> <span className="font-mono font-bold block ml-auto">{report.penalty_amount ? `₹${report.penalty_amount.toLocaleString()}` : 'None'}</span></p>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Validation Details — shown for standalone scan reports */}
            {isStandalone && hasValidation && (
                <div className="mb-12">
                    <h3 className="text-sm font-bold border-b-2 border-border pb-2 mb-6 uppercase text-[#0B1F3A] tracking-wider">Compliance Evaluation Details</h3>
                    <div className="space-y-3">
                        {(report.validation?.evaluations || []).map((ev: any, idx: number) => {
                            let borderClass = 'border-l-border';
                            let icon = <AlertTriangle className="w-4 h-4 text-orange-500" />;
                            if (ev.status === 'PASS' || ev.status === 'NOT_APPLICABLE') {
                                borderClass = 'border-l-green-500';
                                icon = <ShieldCheck className="w-4 h-4 text-green-600" />;
                            } else if (ev.status === 'FAIL') {
                                borderClass = 'border-l-red-500';
                                icon = <ShieldAlert className="w-4 h-4 text-red-600" />;
                            } else if (ev.status === 'NOT_VERIFIED' || ev.status === 'OCR_UNCERTAIN' || ev.status === 'PENDING_RULE_DEF') {
                                borderClass = 'border-l-amber-500';
                            }

                            return (
                                <Card key={idx} className={`border-l-4 ${borderClass} p-4`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            {icon}
                                            <span className="font-semibold text-[#0B1F3A] capitalize">{ev.field?.replace(/_/g, ' ')}</span>
                                        </div>
                                        <Badge variant="outline" className={`text-xs font-mono uppercase ${ev.status === 'PASS' ? 'border-green-300 text-green-700' : ev.status === 'FAIL' ? 'border-red-300 text-red-600' : 'border-amber-300 text-amber-700'}`}>
                                            {ev.status}
                                        </Badge>
                                    </div>
                                    {ev.evidence && ev.evidence !== "MISSING_FROM_PACKAGE" && ev.evidence !== "Field not present" && (
                                        <div className="text-sm text-foreground/80 bg-muted px-3 py-1.5 rounded mt-2 font-medium break-all">
                                            Evidence: {ev.evidence}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">{ev.message}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Extracted Declarations — shown for standalone scan reports */}
            {isStandalone && report.declarations && Object.keys(report.declarations).length > 0 && (
                <div className="mb-12">
                    <h3 className="text-sm font-bold border-b-2 border-border pb-2 mb-6 uppercase text-[#0B1F3A] tracking-wider">Extracted Declarations</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(report.declarations).map(([key, val]: [string, any]) => (
                            <Card key={key} className="p-4 bg-muted/20">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                                <p className="text-sm font-medium text-[#0B1F3A] break-all">{val?.value || 'N/A'}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Confidence: {val?.confidence ? `${(val.confidence * 100).toFixed(0)}%` : 'N/A'}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div>
                <h3 className="text-sm font-bold border-b-2 border-border pb-2 mb-6 uppercase text-[#0B1F3A] tracking-wider">{t('reports.chronologicalEventTimeline')}</h3>
                <div className="relative border-l-2 border-border ml-3 pl-8 space-y-8">
                    {report.timeline?.map((event: any, index: number) => (
                        <div key={index} className="relative group">
                            <div className="absolute -left-[39px] bg-card border-4 border-[#2563EB] rounded-full w-4 h-4 mt-1"></div>
                            <div className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">{event.event.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-muted-foreground mt-1 font-medium bg-muted/30 inline-block px-2 py-0.5 rounded border border-gray-100">Result: {event.status || event.result}</div>
                            <div className="text-xs text-muted-foreground/80 font-mono mt-1.5 flex items-center">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Timestamp unavailable'}
                            </div>
                        </div>
                    ))}
                    {(!report.timeline || report.timeline.length === 0) && (
                        <div className="text-sm text-muted-foreground/80 italic block">No formal events logged.</div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-border">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground/80 font-mono uppercase tracking-widest">
                    <span>{t('reports.generatedByMetroniq')}</span>
                    <span>{t('reports.classifiedRecord')}</span>
                    <span>{t('reports.endOfDossier')}</span>
                </div>
            </div>
        </div>
    )
}
