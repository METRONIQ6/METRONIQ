"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
        )
    }

    return (
        <div className="relative inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
            <button
                onClick={() => setTheme("light")}
                className={`rounded-full p-1.5 transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`rounded-full p-1.5 transition-colors ${theme === 'system' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="System"
            >
                <Monitor className="h-4 w-4" />
                <span className="sr-only">System</span>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`rounded-full p-1.5 transition-colors ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
            </button>
        </div>
    )
}
