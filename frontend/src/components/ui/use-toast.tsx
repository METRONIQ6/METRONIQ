"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
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
                        className={`pointer-events-auto flex flex-col p-4 w-[350px] shadow-lg rounded-md border text-sm transition-all animate-in slide-in-from-right-full ${t.type === 'success' ? 'bg-success/10 border-green-200 text-green-900' :
                                t.type === 'error' ? 'bg-destructive/10 border-red-200 text-red-900' :
                                    t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                                        'bg-primary/10 border-blue-200 text-blue-900'
                            }`}>
                        <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold">{t.message}</span>
                            <button onClick={() => removeToast(t.id)} className="text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100">×</button>
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
