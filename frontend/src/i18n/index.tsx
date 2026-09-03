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
        if (stored && ['en', 'ta', 'hi'].includes(stored)) {
            setLanguageState(stored)
        }
        setMounted(true)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('i18n_lang', lang)
    }

    const t = (key: string): string => {
        const keys = key.split('.')
        let value = dictionaries[language]
        for (const k of keys) {
            if (value === undefined) break;
            value = value[k]
        }
        if (value === undefined || typeof value !== 'string') {
            // Fallback to English
            let fallbackValue = dictionaries['en']
            for (const k of keys) {
                if (fallbackValue === undefined) break;
                fallbackValue = fallbackValue[k]
            }
            if (fallbackValue !== undefined && typeof fallbackValue === 'string') {
                return fallbackValue
            }
            return key; // return the path exactly if missing in EN too
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
