import DashboardLayout from '@/components/layout/DashboardLayout'

export default function ManufacturerLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout role="manufacturer">{children}</DashboardLayout>
}
