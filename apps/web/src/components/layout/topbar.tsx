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