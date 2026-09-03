import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileBottomNav } from "@/components/layout/mobile_nav";

export const metadata: Metadata = {
  title: "MetronIQ | Compliance Platform",
  description: "AI-assisted Legal Metrology Compliance",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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