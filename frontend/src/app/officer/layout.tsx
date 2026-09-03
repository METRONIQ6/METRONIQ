import DashboardLayout from '@/components/layout/DashboardLayout'

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout role="officer">{children}</DashboardLayout>
}
