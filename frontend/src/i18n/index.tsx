"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

import en from './locales/en.json'
import ta from './locales/ta.json'
import hi from './locales/hi.json'

const dictionaries: Record<string, any> = { en, ta, hi }

type Language = 'en' | 'ta' | 'hi'

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('i18n_lang') as Language
        const initLang = (stored && ['en', 'ta', 'hi'].includes(stored)) ? stored : 'en'
        setLanguageState(initLang)
        document.documentElement.lang = initLang
        setMounted(true)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('i18n_lang', lang)
        document.documentElement.lang = lang
    }

    const t = (key: string): string => {
        const keys = key.split('.')
        let value = dictionaries[language]
        for (const k of keys) {
            if (value === undefined) break;
            value = value[k]
        }
        if (value === undefined || typeof value !== 'string') {
            let enValue = dictionaries['en']
            for (const k of keys) {
                if (enValue === undefined) break;
                enValue = enValue[k]
            }
            if (enValue !== undefined && typeof enValue === 'string') {
                return enValue;
            }

            // Safe human-readable fallback if completely missing
            if (keys.length > 0) {
                const lastPart = keys[keys.length - 1];
                if (lastPart === 'undefined' || !lastPart) return 'Unknown';
                const cleaned = lastPart.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
                return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            }
            return 'Unknown';
        }
        return value;
    }

    if (!mounted) {
        return <>{children}</> // Render without translations briefly
    }

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export const useTranslation = () => {
    const context = useContext(I18nContext)
    if (!context) {
        // Return a dummy if disconnected
        return { language: 'en', setLanguage: () => { }, t: (k: string) => k }
    }
    return context
}
