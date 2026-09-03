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