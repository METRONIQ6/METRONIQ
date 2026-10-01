"use client"
import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/i18n'

export default function Footer({ className = "" }: { className?: string }) {
    const { t } = useTranslation();
    return (
        <footer className={`bg-muted/40 border-t border-border mt-auto ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                    <span>{t('common.metroniq')}</span>
                    <span className="text-muted-foreground font-normal text-xs hidden sm:inline">| {t('layout.compliancePlatform') || 'Legal Metrology Compliance Platform'}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center sm:text-right">
                    {t('layout.footerCopyright') || '© 2026 METRONIQ. All operations logged and audited under Legal Metrology Act, 2011.'}
                </p>
            </div>
        </footer>
    )
}
