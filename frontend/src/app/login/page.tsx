"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { setToken, formatLoginName } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2,
    Shield, Scale, Cpu, Lock, ArrowRight, FileCheck, Check
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { ModeToggle } from '@/components/mode-toggle';

export default function Login() {
    const { t } = useTranslation();
    const router = useRouter();

    type ViewState = 'signIn' | 'signUp' | 'forgotPassword' | 'resetPassword';
    const [view, setView] = useState<ViewState>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [isOfficer, setIsOfficer] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        if (view === 'forgotPassword') {
            try {
                const res = await fetch('/api/v1/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.detail || t('common.error'));
                }
                
                if (data.dev_token) {
                    setResetToken(data.dev_token);
                    setSuccessMsg("Reset verification token generated.");
                    setView('resetPassword');
                } else {
                    setSuccessMsg(data.message);
                }
            } catch (err: any) {
                setError(err.message || t('common.error'));
            } finally {
                setLoading(false);
            }
            return;
        }
        
        if (view === 'resetPassword') {
            if (password !== confirmPassword) {
                setError(t('loginUI.passwordsDoNotMatch') || 'Passwords do not match.');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/v1/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: resetToken, new_password: password })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.detail || t('common.error'));
                }
                setSuccessMsg("Password reset successfully. Please sign in.");
                setView('signIn');
                setPassword('');
                setConfirmPassword('');
                setResetToken('');
            } catch (err: any) {
                setError(err.message || t('common.error'));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (view === 'signUp') {
            if (password !== confirmPassword) {
                setError(t('loginUI.passwordsDoNotMatch'));
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role: isOfficer ? 'OFFICER' : 'MANUFACTURER' })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || t('loginUI.registrationFailed'));
                }

                if (typeof window !== 'undefined' && name.trim()) {
                    const normEmail = email.toLowerCase().trim();
                    localStorage.setItem(`user_name_${normEmail}`, name.trim());
                    localStorage.setItem('user_name', name.trim());
                }

                if (isOfficer) {
                    router.push('/pending-approval');
                } else {
                    setView('signIn');
                    setSuccessMsg(t('loginUI.accountCreated'));
                    setPassword('');
                    setConfirmPassword('');
                }
            } catch (err: any) {
                if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
                    setError(t('loginUI.unableToConnectRegistration'));
                } else {
                    setError(err.message || t('loginUI.unexpectedRegistrationError'));
                }
            } finally {
                setLoading(false);
            }
            return;
        }

        // Sign In View
        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Invalid email or password.');
                } else if (res.status === 404) {
                    throw new Error(t('loginUI.unableToConnectRegistration'));
                } else {
                    throw new Error('Unable to connect to the authentication service.');
                }
            }

            const data = await res.json();
            setToken(data.access_token);
            if (typeof window !== 'undefined') {
                const normEmail = email.toLowerCase().trim();
                const registeredName = localStorage.getItem(`user_name_${normEmail}`);
                const displayName = registeredName || (data.name && data.name.trim()) || formatLoginName(email);
                localStorage.setItem('user_email', email);
                localStorage.setItem('user_name', displayName);
                localStorage.setItem('user_role', data.role || '');
            }

            if (data.role === 'ADMIN') router.push('/admin/dashboard');
            else if (data.role === 'OFFICER') router.push('/officer/dashboard');
            else if (data.role === 'MANUFACTURER') router.push('/manufacturer/dashboard');
            else router.push('/');

        } catch (err: any) {
            if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
                setError('Unable to connect to the authentication service. Please ensure the backend server is reachable.');
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#2563EB]/20 transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="w-full border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md p-1 transition-transform duration-200 hover:scale-[1.01]">
                        <div className="bg-[#0B1F3A] dark:bg-[#132238] text-white p-2 rounded-md shadow-xs border border-border/50 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-foreground leading-tight block">{t('common.metroniq')}</span>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">{t('landing.complianceHeader')}</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* Main Dual-Column Authentication Showcase */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Panel: Contextual Statutory Intelligence Hub (Hidden on small mobile, visible lg) */}
                    <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 rounded-2xl bg-gradient-to-br from-[#0B1F3A] via-[#0E274A] to-[#12315E] dark:from-[#081324] dark:via-[#0B1A30] dark:to-[#0F2342] text-white border border-blue-900/40 shadow-xl relative overflow-hidden min-h-[560px]">
                        {/* Subtle Background Pattern */}
                        <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-blue-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{t('loginUI.statutoryDocket')}</span>
                            </div>

                            {/* Headline & Description */}
                            <div className="space-y-3">
                                <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight leading-snug">
                                    {t('loginUI.tagline')}
                                </h2>
                                <p className="text-slate-300 text-sm leading-relaxed font-normal">
                                    {t('loginUI.description')}
                                </p>
                            </div>

                            {/* 3 Interactive Pillar Highlights */}
                            <div className="space-y-3 pt-2">
                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                                        <Cpu className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white tracking-wide">{t('loginUI.pillarVisionTitle')}</div>
                                        <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{t('loginUI.pillarVisionDesc')}</div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                                        <Scale className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white tracking-wide">{t('loginUI.pillarRuleTitle')}</div>
                                        <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{t('loginUI.pillarRuleDesc')}</div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3.5 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white tracking-wide">{t('loginUI.pillarAuditTitle')}</div>
                                        <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{t('loginUI.pillarAuditDesc')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Statutory Footnote */}
                        <div className="relative z-10 pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>{t('loginUI.legalActNotice')}</span>
                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <Lock className="w-3 h-3" /> {t('loginUI.tlsSecure')}
                            </span>
                        </div>
                    </div>

                    {/* Right Panel: Clean, Focused Human-Designed Form Container */}
                    <div className="lg:col-span-6 flex justify-center">
                        <div className="w-full max-w-[440px] space-y-5">
                            
                            {/* Form Header */}
                            <div className="text-left space-y-1.5">
                                <div className="lg:hidden inline-flex p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-[#2563EB] dark:text-blue-400 mb-2">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F3A] dark:text-white">
                                    {view === 'signIn' && t('loginUI.welcome_back')}
                                    {view === 'signUp' && t('loginUI.createAccount')}
                                    {view === 'forgotPassword' && t('loginUI.passwordRecovery')}
                                    {view === 'resetPassword' && (t('loginUI.resetPassword') || "Reset Password")}
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {view === 'signIn' && t('loginUI.sign_in_to_your_metr')}
                                    {view === 'signUp' && t('loginUI.registerDesc')}
                                    {view === 'forgotPassword' && t('loginUI.official_email')}
                                    {view === 'resetPassword' && (t("loginUI.enterNewPassword") || "Enter your new password securely.")}
                                </p>
                            </div>

                            {/* Segmented Tab Switcher (Sign In / Sign Up) */}
                            {(view === 'signIn' || view === 'signUp') && (
                                <div className="flex p-1 bg-muted/80 rounded-lg border border-border" role="tablist" aria-label="Authentication mode">
                                    <button 
                                        type="button" 
                                        role="tab"
                                        aria-selected={view === 'signIn'}
                                        onClick={() => { setView('signIn'); setError(''); setSuccessMsg(''); }} 
                                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                                            view === 'signIn' 
                                                ? 'bg-card text-foreground shadow-xs border border-border font-bold' 
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {t('loginUI.signIn')}
                                    </button>
                                    <button 
                                        type="button" 
                                        role="tab"
                                        aria-selected={view === 'signUp'}
                                        onClick={() => { setView('signUp'); setError(''); setSuccessMsg(''); }} 
                                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                                            view === 'signUp' 
                                                ? 'bg-card text-foreground shadow-xs border border-border font-bold' 
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {t('loginUI.signUp')}
                                    </button>
                                </div>
                            )}

                            {/* Authentication Card */}
                            <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-7 transition-all duration-300">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Error Alert Box */}
                                    {error && (
                                        <div className="flex items-start gap-3 p-3.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in-50 duration-200" role="alert">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed font-medium">{error}</span>
                                        </div>
                                    )}

                                    {/* Success Alert Box */}
                                    {successMsg && (
                                        <div className="flex items-start gap-3 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg animate-in fade-in-50 duration-200" role="status">
                                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="leading-relaxed font-medium">{successMsg}</span>
                                        </div>
                                    )}

                                    {/* Full Name (Sign Up only) */}
                                    {view === 'signUp' && (
                                        <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                                            <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                                                {t('loginUI.fullName')}
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder={t('loginUI.officerNamePlaceholder')}
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required={view === 'signUp'}
                                                className="h-11 text-sm bg-background border-input focus-visible:ring-[#2563EB] transition-colors"
                                            />
                                        </div>
                                    )}

                                    {/* Official Email */}
                                    {(view !== 'resetPassword') && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                                                {t('loginUI.official_email')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder={t('loginUI.nameDomainGov')}
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                className="h-11 text-sm bg-background border-input focus-visible:ring-[#2563EB] transition-colors"
                                            />
                                        </div>
                                    )}

                                    {/* Password Field */}
                                    {(view === 'signIn' || view === 'signUp' || view === 'resetPassword') && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                                                    {view === 'resetPassword' ? (t("loginUI.newPassword") || "New Password") : t('loginUI.password')}
                                                </Label>
                                                {view === 'signIn' && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setView('forgotPassword'); setError(''); setSuccessMsg(''); }} 
                                                        className="text-xs text-[#2563EB] hover:text-[#1D4ED8] dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
                                                    >
                                                        {t('loginUI.forgotPassword')}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    className="h-11 pr-11 text-sm bg-background border-input focus-visible:ring-[#2563EB] transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                    aria-label="Toggle password visibility"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm Password (Sign Up and Reset Password) */}
                                    {(view === 'signUp' || view === 'resetPassword') && (
                                        <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                                            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                                                {view === 'resetPassword' ? (t("loginUI.confirmNewPassword") || "Confirm New Password") : t('loginUI.confirmPassword')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    required={(view === 'signUp' || view === 'resetPassword')}
                                                    className="h-11 pr-11 text-sm bg-background border-input focus-visible:ring-[#2563EB] transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Role Selection (Sign Up only) */}
                                    {view === 'signUp' && (
                                        <div className="space-y-2 pt-1 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                                            <Label htmlFor="roleSelect" className="text-xs font-semibold text-foreground">
                                                {t('loginUI.roleLabel')}
                                            </Label>
                                            <select
                                                id="roleSelect"
                                                value={isOfficer ? "OFFICER" : "MANUFACTURER"}
                                                onChange={(e) => setIsOfficer(e.target.value === "OFFICER")}
                                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                            >
                                                <option value="MANUFACTURER">{t('loginUI.manufacturerRole')}</option>
                                                <option value="OFFICER">{t('loginUI.officerRole')}</option>
                                            </select>
                                            {isOfficer && (
                                                <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900 leading-relaxed font-medium">
                                                    {t('loginUI.officerApprovalWarning')}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Submit Action Button */}
                                    <Button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="w-full h-11 text-sm font-semibold rounded-lg bg-[#0B1F3A] hover:bg-[#132F54] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white shadow-xs transition-all duration-200 cursor-pointer mt-2 hover:shadow-md"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {view === 'signIn' ? t('loginUI.authenticating') : 
                                                 view === 'signUp' ? t('loginUI.registering') : 
                                                 view === 'resetPassword' ? (t("loginUI.resettingPassword") || "Resetting Password...") : t('loginUI.submit')}
                                            </span>
                                        ) : (
                                            view === 'signIn' ? t('loginUI.signIn') : 
                                            view === 'signUp' ? t('loginUI.signUp') : 
                                            view === 'resetPassword' ? (t("loginUI.updatePassword") || "Update Password") : t('loginUI.submit')
                                        )}
                                    </Button>

                                    {/* Back to Sign In button for recovery views */}
                                    {(view === 'forgotPassword' || view === 'resetPassword') && (
                                        <div className="text-center pt-2">
                                            <button 
                                                type="button" 
                                                onClick={() => { setView('signIn'); setError(''); setSuccessMsg(''); setPassword(''); setConfirmPassword(''); }} 
                                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                {t('loginUI.backToSignIn')}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-border py-5 px-6 bg-card/60">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                    <p>{t('loginUI.footer')}</p>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="hover:text-foreground transition-colors font-medium">
                            {t('common.metroniq')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
