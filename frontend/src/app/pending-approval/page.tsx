"use client"
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from "@/i18n"
import LanguageSelector from '@/components/LanguageSelector'

export default function PendingApprovalPage() {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-12 bg-background border border-border shadow-sm relative">
            <div className="absolute top-6 right-6">
                <LanguageSelector />
            </div>
            <Card className="rounded-xl shadow-lg border border-border bg-card max-w-md w-full">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-orange-100 text-orange-600 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                        <ShieldAlert className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('pendingApproval.title')}</h2>
                    <h3 className="text-lg font-medium text-orange-600 dark:text-orange-400">{t('pendingApproval.subtitle')}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {t('pendingApproval.desc1')}
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {t('pendingApproval.desc2')}
                    </p>
                    <div className="pt-6 w-full flex flex-col gap-3">
                        <Link href="/login" className="w-full">
                            <Button className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white rounded-md">
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
