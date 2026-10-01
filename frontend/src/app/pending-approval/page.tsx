"use client"
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from "@/i18n"
import { ModeToggle } from '@/components/mode-toggle'
import LanguageSelector from '@/components/LanguageSelector'

export default function PendingApprovalPage() {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-muted/30 relative font-sans">
            <div className="absolute top-6 right-6 flex items-center gap-3">
                <LanguageSelector />
                <ModeToggle />
            </div>
            <Card className="max-w-md w-full shadow-sm border border-border bg-card">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-3.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">{t('pendingApproval.title')}</h2>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                            {t('pendingApproval.subtitle')}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
                        {t('pendingApproval.desc1')}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
                        {t('pendingApproval.desc2')}
                    </p>
                    <div className="pt-4 w-full">
                        <Link href="/login" className="w-full">
                            <Button className="w-full bg-[#0B1F3A] hover:bg-[#132F54] text-white">
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('pendingApproval.return')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
