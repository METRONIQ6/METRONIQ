"use client"
import { useTranslation } from '@/i18n'

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { t } = useTranslation();

    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-16 h-8 rounded-md bg-muted animate-pulse"></div>
        )
    }

    return (
        <div className="relative inline-flex items-center rounded-md border border-border bg-card p-0.5 shadow-xs h-8">
            <button
                onClick={() => setTheme("light")}
                className={`rounded px-1.5 py-1 transition-colors flex items-center justify-center ${theme === 'light' ? 'bg-[#0B1F3A] dark:bg-[#2563EB] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                title="Light Mode"
                aria-label="Light Mode"
            >
                <Sun className="h-3.5 w-3.5" />
                <span className="sr-only">{t('common.lightTheme')}</span>
            </button>

            <button
                onClick={() => setTheme("dark")}
                className={`rounded px-1.5 py-1 transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                title="Dark Mode"
                aria-label="Dark Mode"
            >
                <Moon className="h-3.5 w-3.5" />
                <span className="sr-only">{t('common.darkTheme')}</span>
            </button>
        </div>
    )
}
