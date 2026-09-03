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