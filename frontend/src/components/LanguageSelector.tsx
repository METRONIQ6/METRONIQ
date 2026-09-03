"use client"
import React from 'react'
import { useTranslation } from '@/i18n'
import { Globe } from 'lucide-react'

export default function LanguageSelector() {
    const { language, setLanguage } = useTranslation()

    return (
        <div className="relative inline-flex items-center">
            <Globe className="absolute left-2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="pl-8 pr-8 py-1.5 bg-card text-foreground border border-border text-sm rounded-full shadow-sm hover:border-primary focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none transition-colors appearance-none"
            >
                <option value="en">English (EN)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="hi">हिंदी (HI)</option>
            </select>
            <div className="absolute right-2 pointer-events-none text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    )
}
