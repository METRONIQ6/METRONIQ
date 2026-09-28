"use client"
import { use } from 'react'
import ReportDetail from '@/components/reports/ReportDetail'

export default function AdminReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <ReportDetail id={id} basePath="/admin/reports" />
}
