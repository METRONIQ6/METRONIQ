"use client"
import React, { useEffect, useState } from 'react'
import { use } from 'react'
import { Card } from "@/components/ui/card"
import { Printer, Download, ServerCrash } from "lucide-react"
import { getToken } from '@/lib/auth'
import { useTranslation } from '@/i18n'

export default function AuditReportPrint({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { t, language } = useTranslation()
    const [report, setReport] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        const fetchReport = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/v1/reports/${id}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
                if (res.ok) {
                    setReport(await res.json())
                } else {
                    let detail = `HTTP ${res.status}`
                    try { detail = (await res.json()).detail } catch (_) { }
                    setErrorMsg(`Unable to load audit trail. ${detail}`)
                }
            } catch (e: any) {
                setErrorMsg("Network transmission failure")
            }
        }
        fetchReport()
    }, [id])

    if (errorMsg) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-12 bg-gray-50/50">
            <ServerCrash className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-[#0B1F3A]">Access Denied</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-sm">{errorMsg}</p>
        </div>
    )
    if (!report) return (
        <div className="flex items-center justify-center min-h-screen p-12">
            <div className="text-center font-medium text-muted-foreground animate-pulse text-sm">
                Generating Document...
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white text-black p-8 md:p-12 print:p-0 font-sans max-w-[900px] mx-auto border-x border-border/50 shadow-sm print:border-none print:shadow-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; background-color: white; }
                    .no-print { display: none !important; }
                }
            `}} />

            <div className="flex justify-between items-start mb-10 border-b-2 border-[#0B1F3A] pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#0B1F3A] mb-1">{t("reports.title") || "Official Audit Docket"}</h1>
                    <p className="text-sm text-gray-500 font-mono">{t("reports.subtitle") || "LEGAL METROLOGY COMPLIANCE RECORD"}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="no-print flex items-center px-4 py-2 bg-gray-100 text-[#0B1F3A] font-semibold rounded-md text-sm hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        {t("reports.printView") || "Print Document"}
                    </button>
                    <button
                        onClick={() => {
                            window.location.href = `http://localhost:8000/api/v1/reports/${id}/pdf?lang=${language}`;
                        }}
                        className="no-print flex items-center px-4 py-2 bg-[#2563EB] text-white font-semibold rounded-md text-sm hover:bg-[#2563EB]/90 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t("reports.downloadPdf") || "Export PDF"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
                <Card className="p-5 bg-gray-50 border-gray-200 shadow-none rounded-sm">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Reference Identifiers</h3>
                    <div className="space-y-2">
                        <p className="text-sm flex justify-between"><span className="text-gray-500 font-medium">Docket ID:</span> <span className="font-mono font-bold text-[#0B1F3A] block ml-auto">{report.case_id?.substring(0, 8).toUpperCase()}</span></p>
                        <p className="text-sm flex justify-between"><span className="text-gray-500 font-medium">Original Inspection:</span> <span className="font-mono block ml-auto">{report.inspection?.id?.substring(0, 8).toUpperCase() || 'N/A'}</span></p>
                        <p className="text-sm flex justify-between"><span className="text-gray-500 font-medium">Notice Reference:</span> <span className="font-mono block ml-auto">{report.notice?.id?.substring(0, 8).toUpperCase() || 'N/A'}</span></p>
                    </div>
                </Card>
                <Card className="p-5 bg-gray-50 border-gray-200 shadow-none rounded-sm">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Final Case Decision</h3>
                    <div className="space-y-2">
                        <p className="text-sm flex justify-between"><span className="text-gray-500 font-medium">Case Status:</span> <span className="font-bold uppercase text-[#0B1F3A] block ml-auto">{report.case_status}</span></p>
                        <p className="text-sm flex justify-between"><span className="text-gray-500 font-medium">Final Reinspection:</span> <span className="font-mono uppercase block ml-auto">{report.reinspection?.result || 'NA'}</span></p>
                        <p className="text-sm flex justify-between"><span className="text-gray-500 font-medium">Penalty Assessed:</span> <span className="font-mono font-bold block ml-auto">{report.penalty_amount ? `₹${report.penalty_amount.toLocaleString()}` : 'None'}</span></p>
                    </div>
                </Card>
            </div>

            <div>
                <h3 className="text-sm font-bold border-b-2 border-gray-200 pb-2 mb-6 uppercase text-[#0B1F3A] tracking-wider">Chronological Event Timeline</h3>
                <div className="relative border-l-2 border-gray-200 ml-3 pl-8 space-y-8">
                    {report.timeline?.map((event: any, index: number) => (
                        <div key={index} className="relative group">
                            <div className="absolute -left-[39px] bg-white border-4 border-[#2563EB] rounded-full w-4 h-4 mt-1"></div>
                            <div className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">{event.event.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-gray-600 mt-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-100">Result: {event.status || event.result}</div>
                            <div className="text-xs text-gray-400 font-mono mt-1.5 flex items-center">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Timestamp unavailable'}
                            </div>
                        </div>
                    ))}
                    {(!report.timeline || report.timeline.length === 0) && (
                        <div className="text-sm text-gray-400 italic block">No formal events logged.</div>
                    )}
                </div>
            </div>

            <div className="mt-20 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                    <span>Generated by MetronIQ System</span>
                    <span>Classified Record</span>
                    <span>END OF DOSSIER</span>
                </div>
            </div>
        </div>
    )
}
