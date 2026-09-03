"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileSearch, ShieldCheck, ListChecks, FileText, Settings, ShieldAlert, LogOut, Map, BarChart3, Ruler, MessageSquare, X } from 'lucide-react'
import { getToken, removeToken } from '@/lib/auth'
import LanguageSelector from '@/components/LanguageSelector'
import { ModeToggle } from '@/components/mode-toggle'

const getOfficerNav = () => [
    { name: 'Dashboard', href: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'AI Scanner', href: '/officer/scanner', icon: ShieldCheck },
    { name: 'Inspections', href: '/officer/inspection', icon: FileText },
    { name: 'Notices', href: '/officer/notices', icon: ShieldAlert },
    { name: 'Reinspections', href: '/officer/reinspections', icon: ListChecks },
    { name: 'Enforcement', href: '/officer/enforcement', icon: ShieldAlert },
    { name: 'E-Commerce', href: '/officer/ecommerce', icon: FileSearch },
    { name: 'Reports', href: '/officer/reports', icon: BarChart3 },
]

const getAdminNav = () => [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Geo Analytics', href: '/admin/geo', icon: Map },
    { name: 'Rule Management', href: '/admin/rules', icon: Ruler },
]

const getManufacturerNav = () => [
    { name: 'Dashboard', href: '/manufacturer/dashboard', icon: LayoutDashboard },
    { name: 'Label Auditor', href: '/manufacturer/auditor', icon: FileSearch },
]

export default function DashboardLayout({ children, role }: { children: React.ReactNode, role: 'officer' | 'admin' | 'manufacturer' }) {
    const pathname = usePathname()
    const router = useRouter()
    const [copilotOpen, setCopilotOpen] = useState(false)

    React.useEffect(() => {
        const token = getToken()
        if (!token) {
            router.push('/login')
            return
        }

        try {
            // Frontend UX boundary logic (backend remains the source of truth)
            const payload = JSON.parse(atob(token.split('.')[1]))
            const tokenRole = payload.role?.toLowerCase()

            if (tokenRole !== role) {
                // Not authorized for this dashboard view
                router.push(tokenRole ? `/${tokenRole}/dashboard` : '/login')
            }
        } catch (e) {
            removeToken()
            router.push('/login')
        }
    }, [router, role])

    let navItems = getOfficerNav()
    if (role === 'admin') navItems = getAdminNav()
    if (role === 'manufacturer') navItems = getManufacturerNav()

    return (
        <div className="flex h-screen bg-muted/30 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
                <div className="flex items-center h-16 px-6 border-b border-border">
                    <ShieldCheck className="w-6 h-6 text-primary mr-2" />
                    <span className="font-bold text-xl tracking-tight text-foreground">METRONIQ</span>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted'}`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/80'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="p-4 border-t border-border">
                    <button onClick={() => { removeToken(); router.push('/login'); }} className="flex w-full items-center px-3 py-2 text-sm font-medium text-foreground/80 rounded-md hover:bg-muted transition-colors">
                        <LogOut className="w-5 h-5 mr-3 text-muted-foreground/80" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-foreground capitalize truncate">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCopilotOpen(!copilotOpen)}
                            className="flex items-center text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors"
                            title="AI Copilot"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Copilot</span>
                        </button>
                        <LanguageSelector />
                        <ModeToggle />
                        <div className="h-6 w-px bg-border"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-blue-200 flex items-center justify-center text-primary font-bold uppercase">
                                {role[0]}
                            </div>
                            <span className="ml-2 text-sm font-medium text-foreground/80 hidden sm:block">{role.toUpperCase()}</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 w-full overflow-y-auto bg-muted/30 p-6 z-0">
                    {children}
                </main>

                {/* Copilot Sidebar */}
                {copilotOpen && (
                    <div className="absolute right-0 top-16 bottom-0 w-80 bg-card border-l border-border shadow-xl flex flex-col z-20">
                        <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/30">
                            <span className="font-semibold text-foreground flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-primary" /> MetronIQ Copilot</span>
                            <button onClick={() => setCopilotOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-muted/30/50 space-y-4 text-sm">
                            <div className="bg-card border rounded-lg p-3 shadow-sm text-foreground">
                                Hello! I am your AI-powered compliance assistant. How can I help you today?
                            </div>
                            <div className="flex flex-col gap-2 mt-4 text-left">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Suggestions</span>
                                <button className="text-left px-3 py-2 bg-card border rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-blue-200 transition-colors text-xs">What were the main violations today?</button>
                                <button className="text-left px-3 py-2 bg-card border rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-blue-200 transition-colors text-xs">Which districts have the highest risk?</button>
                                <button className="text-left px-3 py-2 bg-card border rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-blue-200 transition-colors text-xs">Explain rule LM-PKG-001</button>
                            </div>
                        </div>
                        <div className="p-3 bg-card border-t">
                            <input type="text" placeholder="Ask a question..." className="w-full text-sm border-border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-muted/30 px-3 py-2 border outline-none" />
                            <p className="text-[10px] text-muted-foreground/80 mt-2 text-center">AI-generated assistance. Verify legal decisions.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
