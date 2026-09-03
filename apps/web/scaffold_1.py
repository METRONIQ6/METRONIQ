import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"

files = {}

files["lib/demo-data.ts"] = """
export const demoStats = {
  inspectionsToday: 142,
  highRiskCases: 12,
  openViolations: 45,
  pendingReinspections: 8,
};

export const demoInspections = [
  { id: "INSP-001", priority: 1, product: "Aquafina 1L", category: "Packaged Water", manufacturer: "PepsiCo India", location: "Mumbai Hub", risk: "HIGH", riskScore: 85, status: "FAIL", date: "2026-08-29" },
  { id: "INSP-002", priority: 2, product: "Lays Classic 50g", category: "Snacks", manufacturer: "PepsiCo India", location: "Delhi Hub", risk: "MEDIUM", riskScore: 60, status: "REVIEW", date: "2026-08-29" },
  { id: "INSP-003", priority: 3, product: "Nestle Cerelac", category: "Baby Food", manufacturer: "Nestle India", location: "Pune Hub", risk: "LOW", riskScore: 20, status: "PASS", date: "2026-08-28" },
  { id: "INSP-004", priority: 1, product: "Parle-G 250g", category: "Biscuits", manufacturer: "Parle Products", location: "Chennai Hub", risk: "HIGH", riskScore: 78, status: "FAIL", date: "2026-08-28" },
];

export const complianceTrendData = [
  { name: 'Mon', pass: 120, fail: 15, review: 5 },
  { name: 'Tue', pass: 140, fail: 12, review: 8 },
  { name: 'Wed', pass: 135, fail: 18, review: 10 },
  { name: 'Thu', pass: 150, fail: 10, review: 4 },
  { name: 'Fri', pass: 110, fail: 22, review: 15 },
  { name: 'Sat', pass: 80, fail: 5, review: 2 },
  { name: 'Sun', pass: 90, fail: 8, review: 3 },
];

export const violationDistributionData = [
  { name: 'Missing MRP', value: 400 },
  { name: 'Net Qty Font Size', value: 300 },
  { name: 'Missing Date', value: 300 },
  { name: 'Contact Info', value: 200 },
];

export const demoRules = [
  { id: "RULE-DEMO-001", name: "MRP Declaration Required", category: "Global", version: "v4.0", effectiveDate: "2024-01-01", status: "ACTIVE", updated: "2026-05-12" },
  { id: "RULE-DEMO-002", name: "Net Quantity Minimum Font Height", category: "Global", version: "v2.1", effectiveDate: "2025-06-15", status: "ACTIVE", updated: "2026-01-10" },
  { id: "RULE-DEMO-003", name: "Baby Food Warning Label", category: "Baby Food", version: "v1.2", effectiveDate: "2026-01-01", status: "DRAFT", updated: "2026-08-20" }
];
"""

files["components/layout/sidebar.tsx"] = """
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, FileText, CheckSquare, AlertTriangle, ShoppingCart, BarChart3, Settings, Users, ShieldAlert, Package, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const navGroups = [
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
    <div className="flex h-screen w-64 flex-col border-r bg-[#0A192F] text-white">
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

files["components/layout/topbar.tsx"] = """
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center text-sm text-slate-500 font-medium">
        <span>MetronIQ &raquo; Command Center</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative w-64 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search rules, inspections..." 
            className="w-full bg-slate-50 pl-9 border-slate-200"
          />
        </div>
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>
    </header>
  );
}
"""

files["app/globals.css"] = """
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

:root {
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;
  
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  
  --primary: 216 65% 12%; /* Deep Navy */
  --primary-foreground: 210 40% 98%;
  
  --secondary: 224 64% 33%; /* Blue */
  --secondary-foreground: 210 40% 98%;
  
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* Slate Gray */
  
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  --destructive: 0 84% 60%; /* FAIL/Red */
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 216 65% 12%;
  
  --radius: 0.5rem;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: ui-sans-serif, system-ui, sans-serif;
}
"""

files["app/layout.tsx"] = """
import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const metadata: Metadata = {
  title: "MetronIQ | Compliance Platform",
  description: "AI-assisted Legal Metrology Compliance",
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
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
