"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileSearch, ShieldCheck, ListChecks, FileText, Settings, ShieldAlert, LogOut, Map, BarChart3, Ruler, MessageSquare, X, Menu, Send, Loader2, UserCog } from 'lucide-react'
import { getToken, removeToken } from '@/lib/auth'
import LanguageSelector from '@/components/LanguageSelector'
import { ModeToggle } from '@/components/mode-toggle'
import ReactMarkdown from 'react-markdown'
import { useToast } from '@/components/ui/use-toast'

const getOfficerNav = (t: any) => [
    { name: t('navigation.dashboard'), href: '/officer/dashboard', icon: LayoutDashboard },
    { name: t('navigation.aiScanner'), href: '/officer/scanner', icon: ShieldCheck },
    { name: t('navigation.inspections'), href: '/officer/inspection', icon: FileText },
    { name: t('navigation.notices'), href: '/officer/notices', icon: ShieldAlert },
    { name: t('navigation.reinspections'), href: '/officer/reinspections', icon: ListChecks },
    { name: t('navigation.enforcement'), href: '/officer/enforcement', icon: ShieldAlert },
    { name: t('navigation.ecommerce'), href: '/officer/ecommerce', icon: FileSearch },
    { name: t('navigation.reports'), href: '/officer/reports', icon: BarChart3 },
]

const getAdminNav = (t: any) => [
    { name: t('navigation.dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('adminUI.userManagement'), href: '/admin/users', icon: UserCog },
    { name: t('navigation.geoAnalytics'), href: '/admin/geo', icon: Map },
    { name: t('navigation.rules'), href: '/admin/rules', icon: Ruler },
]

const getManufacturerNav = (t: any) => [
    { name: t('navigation.dashboard'), href: '/manufacturer/dashboard', icon: LayoutDashboard },
    { name: t('navigation.labelAuditor'), href: '/manufacturer/auditor', icon: FileSearch },
]

export default function DashboardLayout({ children, role }: { children: React.ReactNode, role: 'officer' | 'admin' | 'manufacturer' }) {
    const pathname = usePathname()
    const router = useRouter()
    const { t } = useTranslation()
    const [copilotOpen, setCopilotOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [copilotInput, setCopilotInput] = useState('')
    const [copilotLoading, setCopilotLoading] = useState(false)
    const [copilotError, setCopilotError] = useState('')
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const { toast } = useToast()
    const lastPendingCount = React.useRef<number>(0)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    React.useEffect(() => {
        if (copilotOpen) scrollToBottom()
    }, [messages, copilotOpen])

    const handleCopilotSubmit = async () => {
        if (!copilotInput.trim() || copilotLoading) return

        const text = copilotInput.trim()
        setCopilotInput('')
        setCopilotError('')
        setMessages(prev => [...prev, { role: 'user', content: text }])
        setCopilotLoading(true)

        try {
            const token = getToken()
            const res = await fetch('http://localhost:8000/api/v1/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: text, history: messages })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.detail || 'Failed to reach AI service.')
            }
            const data = await res.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        } catch (err: any) {
            setCopilotError(err.message || 'An error occurred connecting to the backend.')
        } finally {
            setCopilotLoading(false)
        }
    }

    const handleCopilotKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleCopilotSubmit()
        }
    }

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

    // Admin Notification Poller for Pending Officers
    React.useEffect(() => {
        if (role !== 'admin') return;

        let interval: NodeJS.Timeout;
        const checkPendingOfficers = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const res = await fetch('http://localhost:8000/api/v1/users/counts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const pending = data.officers_pending || 0;

                    // Only notify if the number of pending officers increased
                    if (pending > lastPendingCount.current) {
                        toast({
                            type: 'platform',
                            message: t('adminUI.newOfficerRegistration') || 'New Registration Awaiting Approval',
                            description: (
                                <div className="mt-1 opacity-90">
                                    A Government Officer registration is waiting.
                                    <br />
                                    <Link href="/admin/users" className="text-blue-300 hover:text-white hover:underline mt-2 inline-block font-semibold">
                                        Review now &rarr;
                                    </Link>
                                </div>
                            )
                        });
                    }
                    lastPendingCount.current = pending;
                }
            } catch (e) {
                // Silently ignore network failures during polling
            }
        };

        // Initial check, then poll every 10 seconds
        checkPendingOfficers();
        interval = setInterval(checkPendingOfficers, 10000);

        return () => clearInterval(interval);
    }, [role, toast, t]);

    // Close mobile menu on route change
    React.useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    let navItems = getOfficerNav(t)
    if (role === 'admin') navItems = getAdminNav(t)
    if (role === 'manufacturer') navItems = getManufacturerNav(t)

    return (
        <div className="flex h-screen bg-muted/30 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-card border-r border-border flex-col flex-shrink-0">
                <div className="flex items-center h-16 px-6 border-b border-border">
                    <ShieldCheck className="w-6 h-6 text-primary mr-2" />
                    <span className="font-bold text-xl tracking-tight text-foreground">{t('common.metroniq')}</span>
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
                        {t('common.logout')}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="relative flex w-64 flex-col bg-card border-r border-border h-full z-50">
                        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                            <div className="flex items-center">
                                <ShieldCheck className="w-6 h-6 text-primary mr-2" />
                                <span className="font-bold text-xl tracking-tight text-foreground">{t('common.metroniq')}</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
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
                                {t('common.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 flex-shrink-0">
                    <div className="flex items-center">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 text-muted-foreground hover:text-foreground">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg sm:text-xl font-semibold text-foreground capitalize truncate">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setCopilotOpen(!copilotOpen)}
                            className="flex items-center justify-center sm:justify-start text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-full transition-colors"
                            title="AI Copilot"
                        >
                            <MessageSquare className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">{t('layout.copilot')}</span>
                        </button>
                        <LanguageSelector />
                        <ModeToggle />
                        <div className="h-6 w-px bg-border hidden sm:block"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-blue-200 flex items-center justify-center text-primary font-bold uppercase">
                                {role[0]}
                            </div>
                            <span className="ml-2 text-sm font-medium text-foreground/80 hidden sm:block">{role.toUpperCase()}</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 w-full overflow-y-auto bg-muted/30 p-4 sm:p-6 z-0">
                    {children}
                </main>

                {/* Copilot Sidebar */}
                {copilotOpen && (
                    <div className="absolute right-0 top-16 bottom-0 w-full sm:w-80 bg-card border-l border-border shadow-xl flex flex-col z-20">
                        <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/30">
                            <span className="font-semibold text-foreground flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-primary" />{t('navigation.aiCopilot')}</span>
                            <button onClick={() => setCopilotOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-muted/30/50 space-y-4 text-sm flex flex-col">
                            <div className="bg-card border rounded-lg p-3 shadow-sm text-foreground">
                                {t('layout.copilotGreeting')}
                            </div>

                            {messages.map((m, idx) => (
                                <div key={idx} className={`p-3 rounded-lg shadow-sm border max-w-[90%] break-words ${m.role === 'user' ? 'bg-[#0B1F3A] text-white self-end border-transparent whitespace-pre-wrap' : 'bg-card text-foreground self-start'}`}>
                                    {m.role === 'assistant' ? (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-3" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2 mt-2" {...props} />
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            ))}

                            {copilotError && (
                                <div className="p-3 rounded-lg border border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 self-center text-center text-xs">
                                    {copilotError}
                                </div>
                            )}

                            {copilotLoading && (
                                <div className="self-start p-3 bg-card border rounded-lg text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </div>
                            )}

                            {messages.length === 0 && !copilotLoading && (
                                <div className="flex flex-col gap-2 mt-4 text-left">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('layout.suggestions')}</span>
                                    <button onClick={() => { setCopilotInput("What were the main violations today?"); }} className="text-left px-3 py-2 bg-card border rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-blue-200 transition-colors text-xs">What were the main violations today?</button>
                                    <button onClick={() => { setCopilotInput("Which districts have the highest risk?"); }} className="text-left px-3 py-2 bg-card border rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-blue-200 transition-colors text-xs">Which districts have the highest risk?</button>
                                    <button onClick={() => { setCopilotInput(t('layout.explainRulePlaceholder')); }} className="text-left px-3 py-2 bg-card border rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-blue-200 transition-colors text-xs">{t('layout.explainRulePlaceholder')}</button>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                        <div className="p-3 bg-card border-t flex flex-col gap-2">
                            <div className="relative flex shadow-sm rounded-md border focus-within:ring-1 focus-within:ring-[#2563EB]">
                                <textarea
                                    rows={1}
                                    onKeyDown={handleCopilotKeyDown}
                                    value={copilotInput}
                                    onChange={(e) => setCopilotInput(e.target.value)}
                                    placeholder={t('layout.askCopilot')}
                                    className="w-full text-sm rounded-l-md bg-muted/30 px-3 py-3 outline-none resize-none min-h-[48px] max-h-32"
                                />
                                <button
                                    onClick={handleCopilotSubmit}
                                    disabled={copilotLoading || !copilotInput.trim()}
                                    className="px-3 bg-muted/30 flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB]/10 transition-colors rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80 text-center">{t('layout.aiWarning')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
