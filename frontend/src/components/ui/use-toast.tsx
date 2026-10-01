"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'platform'

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    description?: React.ReactNode;
}

interface ToastContextType {
    toast: (props: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const toast = useCallback(({ type, message, description }: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message, description }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
            case 'platform':
                return <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />;
        }
    };

    const getTypeStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'border-l-4 border-l-emerald-600 bg-card border-border text-foreground dark:bg-card';
            case 'error':
                return 'border-l-4 border-l-red-600 bg-card border-border text-foreground dark:bg-card';
            case 'warning':
                return 'border-l-4 border-l-amber-500 bg-card border-border text-foreground dark:bg-card';
            case 'platform':
                return 'border-l-4 border-l-[#2563EB] bg-[#0B1F3A] text-white border-[#132F54] dark:bg-[#0C182B]';
            case 'info':
            default:
                return 'border-l-4 border-l-blue-600 bg-card border-border text-foreground dark:bg-card';
        }
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div 
                aria-live="polite"
                role="status"
                className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-[420px] w-full px-4 sm:px-0 sm:right-6 sm:bottom-6"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm transition-all duration-300 animate-in slide-in-from-bottom-3 ${getTypeStyles(t.type)}`}
                    >
                        {getIcon(t.type)}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight">{t.message}</h4>
                            {t.description && (
                                <div className="mt-1 text-xs opacity-90 leading-relaxed font-normal">
                                    {t.description}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
