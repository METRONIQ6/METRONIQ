"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileBottomNav } from "@/components/layout/mobile_nav";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname === "/") {
        return (
            <main className="min-h-screen w-full bg-slate-950 font-sans antialiased text-slate-50 overflow-auto">
                {children}
            </main>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 antialiased overflow-hidden w-full relative">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden w-full relative">
                <Topbar />
                {/* Add padding-bottom on mobile to prevent content from hiding behind bottom nav */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 w-full">
                    {children}
                </main>
                <MobileBottomNav />
            </div>
        </div>
    );
}
