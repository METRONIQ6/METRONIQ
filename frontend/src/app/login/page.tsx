"use client";
import { useTranslation } from '@/i18n'
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { setToken } from '@/lib/auth'
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'
import { ModeToggle } from '@/components/mode-toggle'

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const params = new URLSearchParams()
            params.append('username', email)
            params.append('password', password)

            const res = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            })

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Invalid email or password.')
                } else if (res.status === 404) {
                    throw new Error('Authentication endpoint is currently unavailable.')
                } else {
                    throw new Error('Unable to connect to the authentication service.')
                }
            }

            const data = await res.json()
            setToken(data.access_token)

            if (data.role === 'ADMIN') router.push('/admin/dashboard')
            else if (data.role === 'OFFICER') router.push('/officer/dashboard')
            else if (data.role === 'MANUFACTURER') router.push('/manufacturer/dashboard')
            else router.push('/')

        } catch (err: any) {
            // Check for raw fetch connection failure (Failed to fetch)
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                setError('Unable to connect to the authentication service. Please ensure the backend is running.')
            } else {
                setError(err.message || 'An unexpected error occurred.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-background">

            {/* Left Side - Dark Navy Brand Panel (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#0B1F3A] flex-col justify-between p-12 text-white relative overflow-hidden">
                <div className="z-10 mt-8">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-10 h-10 text-[#2563EB]" />
                        <span className="text-3xl font-extrabold tracking-tight">METRONIQ</span>
                    </div>
                </div>

                <div className="z-10 max-w-lg mb-20">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">Professional regulatory intelligence.</h1>
                    <div className="w-16 h-1 bg-[#2563EB] mb-6 rounded-full"></div>
                    <p className="text-white/80 text-lg leading-relaxed font-medium">
                        Legal Metrology Platform for AI-assisted inspection, intelligent compliance verification, and proactive enforcement scaling.
                    </p>
                </div>

                <div className="z-10 flex text-sm text-white/50 font-medium">
                    &copy; {new Date().getFullYear()} Government Enterprise Systems
                </div>

                {/* Abstract geometric background elements (Subtle) */}
                <div className="absolute -bottom-48 -left-20 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-[80px]"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2563EB]/5 rounded-bl-[100px] blur-[50px]"></div>
            </div>

            {/* Right Side - Clean White Login Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative bg-white dark:bg-card">

                {/* Top Controls */}
                <div className="absolute top-6 right-6 flex items-center gap-4">
                    <LanguageSelector />
                    <ModeToggle />
                </div>

                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">

                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="bg-[#0B1F3A] p-4 rounded-xl shadow-lg">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white">{t('loginUI.welcome_back')}</h2>
                        <p className="text-sm font-medium text-muted-foreground mt-2">{t('loginUI.sign_in_to_your_metr')}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border-l-4 border-red-500 rounded-r-md dark:bg-red-900/20 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('loginUI.official_email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@domain.gov"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="h-12 border-border/80 focus-visible:ring-[#2563EB]"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('loginUI.password')}</Label>
                                <a href="#" className="text-xs text-[#2563EB] hover:underline font-semibold tab-index--1">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="h-12 pr-10 border-border/80 focus-visible:ring-[#2563EB]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 text-sm font-bold tracking-wide rounded-md bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow hover:shadow-md transition-all mt-4">
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...</> : 'Sign In'}
                        </Button>
                    </form>

                    {/* Developer Note (Hidden from main styling flow, purely functional for evaluation) */}
                    <div className="pt-6 mt-8 border-t border-border/50">
                        <div className="text-xs text-muted-foreground text-center space-y-3">
                            <p className="font-semibold uppercase tracking-wider text-[10px]">Development Fast-Login</p>
                            <div className="flex flex-col gap-2 opacity-70">
                                <span className="bg-muted px-3 py-1.5 rounded font-mono">admin@metroniq.local</span>
                                <span className="bg-muted px-3 py-1.5 rounded font-mono">officer@metroniq.local</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
