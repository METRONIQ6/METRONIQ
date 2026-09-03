import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"
files = {}

files["components/layout/sidebar.tsx"] = """
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, FileText, CheckSquare, AlertTriangle, ShoppingCart, BarChart3, Settings, Users, ShieldAlert, Package, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

export const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "INSPECTION",
    items: [
      { name: "Inspections", href: "/inspections", icon: CheckSquare },
      { name: "New Inspection", href: "/inspections/new", icon: FileText },
      { name: "AI Scanner", href: "/scanner", icon: Search },
      { name: "Reinspection", href: "/reinspection", icon: RefreshCw },
    ]
  },
  {
    title: "COMPLIANCE",
    items: [
      { name: "Label Auditor", href: "/label-auditor", icon: Package },
      { name: "Violations", href: "/violations", icon: AlertTriangle },
      { name: "Risk Priority", href: "/risk", icon: ShieldAlert },
      { name: "E-Commerce", href: "/ecommerce", icon: ShoppingCart },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileText },
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { name: "Rule Control", href: "/rules", icon: ShieldAlert },
      { name: "Manufacturers", href: "/manufacturers", icon: Users },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-[#0A192F] text-white flex-shrink-0">
      <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight text-white border-b border-slate-700">
        MetronIQ
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6 px-4">
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </h2>
            <div className="flex flex-col space-y-1">
              {group.items.map((item) => {
                const isActive = pathname?.startsWith(item.href) && (item.href !== '/' || pathname === '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-[#1E3A8A] text-white" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 p-1 flex justify-center items-center font-bold">O</div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Demo Officer</span>
            <span className="text-xs text-slate-400">System: Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

files["components/layout/mobile_nav.tsx"] = """
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, ShieldAlert, History, Menu } from "lucide-react";
import { clsx } from "clsx";

const mobileNav = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inspect", href: "/inspections/new", icon: Camera },
  { name: "Priority", href: "/risk", icon: ShieldAlert },
  { name: "History", href: "/inspections", icon: History },
  { name: "More", href: "/settings", icon: Menu }, // 'Settings' routes acts as MORE for demo
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-2 pb-safe">
      {mobileNav.map((item) => {
        const isActive = pathname?.startsWith(item.href) && (item.href !== '/' || pathname === '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center space-y-1 w-16 h-full",
              isActive ? "text-[#1E3A8A]" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <item.icon className={clsx("h-5 w-5", isActive ? "fill-blue-50/50" : "")} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
"""

files["components/layout/topbar.tsx"] = """
"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navGroups } from "./sidebar";
import Link from "next/link";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shrink-0 relative z-40">
      
      {/* Mobile Branding */}
      <div className="md:hidden flex items-center font-bold text-lg tracking-tight text-[#0A192F]">
        MetronIQ
      </div>

      <div className="hidden md:flex items-center text-sm text-slate-500 font-medium">
        <span>MetronIQ &raquo; Command Center</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex relative w-64 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search rules, inspections..." 
            className="w-full bg-slate-50 pl-9 border-slate-200 h-9"
          />
        </div>
        
        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
           <Search className="h-5 w-5" />
        </button>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>

        {/* Mobile Only: Top Right Menu Sheet for "More" */}
        <Sheet>
          <SheetTrigger className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[80vw] sm:w-[350px] overflow-y-auto">
             <SheetHeader>
               <SheetTitle className="text-left font-bold text-[#0A192F]">Menu</SheetTitle>
             </SheetHeader>
             <div className="mt-6 flex flex-col space-y-6">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {group.title}
                    </h2>
                    <div className="flex flex-col space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                              "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive 
                                ? "bg-blue-50 text-blue-700" 
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
             </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
"""

files["app/layout.tsx"] = """
import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileBottomNav } from "@/components/layout/mobile_nav";

export const metadata: Metadata = {
  title: "MetronIQ | Compliance Platform",
  description: "AI-assisted Legal Metrology Compliance",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-slate-50 antialiased overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden w-full relative">
          <Topbar />
          {/* Add padding-bottom on mobile to prevent content from hiding behind bottom nav */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 w-full">{children}</main>
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
