"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { Globe, Check, ChevronDown } from 'lucide-react'

interface LanguageOption {
    key: 'en' | 'ta' | 'hi'
    label: string
    native: string
}

const LANGUAGES: readonly LanguageOption[] = [
    { key: 'en', label: 'English', native: 'English' },
    { key: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { key: 'hi', label: 'Hindi', native: 'हिंदी' },
]

export default function LanguageSelector() {
    const { language, setLanguage } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsOpen(true)
                const currentIndex = LANGUAGES.findIndex(l => l.key === language)
                setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0)
            }
            return
        }

        switch (e.key) {
            case 'Escape':
                e.preventDefault()
                setIsOpen(false)
                buttonRef.current?.focus()
                break
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex((prev) => {
                    const next = (prev + 1) % LANGUAGES.length
                    optionRefs.current[next]?.focus()
                    return next
                })
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex((prev) => {
                    const next = (prev - 1 + LANGUAGES.length) % LANGUAGES.length
                    optionRefs.current[next]?.focus()
                    return next
                })
                break
            case 'Tab':
                setIsOpen(false)
                break
        }
    }

    const currentOption = LANGUAGES.find(l => l.key === language) || LANGUAGES[0]

    return (
        <div ref={containerRef} className="relative inline-block text-left font-sans" onKeyDown={handleKeyDown}>
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select language"
                className="h-8 px-2.5 bg-card text-foreground border border-border text-xs font-medium rounded-md shadow-xs hover:border-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer flex items-center gap-1.5 transition-colors"
            >
                <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-semibold">{currentOption.label}</span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Vertical Separated Dropdown Menu */}
            {isOpen && (
                <div
                    role="listbox"
                    aria-label="Language selection"
                    className="absolute right-0 top-full mt-1.5 z-50 w-44 sm:w-48 bg-card text-card-foreground border border-border rounded-lg shadow-lg py-1 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-100"
                >
                    {LANGUAGES.map((lang, index) => {
                        const isSelected = language === lang.key
                        return (
                            <React.Fragment key={lang.key}>
                                {index > 0 && (
                                    <div className="border-b border-border my-0.5 mx-2" role="separator" />
                                )}
                                <button
                                    ref={(el) => { optionRefs.current[index] = el }}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    tabIndex={isOpen ? 0 : -1}
                                    onClick={() => {
                                        setLanguage(lang.key)
                                        setIsOpen(false)
                                        buttonRef.current?.focus()
                                    }}
                                    className={`w-[calc(100%-8px)] mx-auto text-left px-3 py-2.5 flex items-center justify-between text-xs sm:text-sm rounded-md transition-colors ${
                                        isSelected
                                            ? 'bg-[#0B1F3A]/10 text-[#0B1F3A] dark:bg-[#2563EB]/25 dark:text-[#93C5FD] font-semibold'
                                            : 'text-foreground hover:bg-muted/70 hover:text-foreground font-medium'
                                    } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-foreground">{lang.label}</span>
                                        {lang.native !== lang.label && (
                                            <span className="text-[11px] text-muted-foreground font-normal">
                                                ({lang.native})
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                                    )}
                                </button>
                            </React.Fragment>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
