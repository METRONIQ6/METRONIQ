"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
        }, 5000); // 5 second auto-dismiss
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex flex-col p-4 w-[350px] shadow-lg rounded-md border text-sm transition-all animate-in slide-in-from-right-full ${t.type === 'success' ? 'bg-green-700 border-green-800 text-white dark:bg-green-900 dark:border-green-800' :
                            t.type === 'error' ? 'bg-red-700 border-red-800 text-white dark:bg-red-900 dark:border-red-800' :
                                t.type === 'warning' ? 'bg-amber-600 border-amber-700 text-white dark:bg-amber-900 dark:border-amber-800' :
                                    t.type === 'platform' ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white shadow-xl shadow-[#0B1F3A]/20 ring-1 ring-[#2563EB]/50' :
                                        'bg-blue-700 border-blue-800 text-white dark:bg-blue-900 dark:border-blue-800'
                            }`}>
                        <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold">{t.message}</span>
                            <button onClick={() => removeToast(t.id)} className="text-white/70 hover:text-white opacity-80 hover:opacity-100 transition-opacity">×</button>
                        </div>
                        {t.description && <div className="mt-1 opacity-90">{t.description}</div>}
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
