"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render without admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navGroups = [
    {
      heading: "Operations",
      items: [
        { href: "/admin", label: "Overview", exact: true },
        { href: "/admin/applications", label: "Accreditation queue" },
        { href: "/admin/enterprises", label: "Member mills" },
        { href: "/admin/products", label: "Garment catalog" },
      ],
    },
    {
      heading: "Commercial",
      items: [
        { href: "/admin/inquiries", label: "Trade inquiries & RFQs" },
        { href: "/admin/import", label: "Bulk registry import" },
      ],
    },
    {
      heading: "Governance",
      items: [
        { href: "/admin/audit-logs", label: "Compliance audit trail" },
        { href: "/admin/analytics", label: "Buyer telemetry" },
      ],
    },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Derive active page title for header
  const getActiveTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (isItemActive(item.href, item.exact)) {
          return item.label;
        }
      }
    }
    return "Operations console";
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col md:flex-row text-[#0D0D0D]">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#FFFFFF] px-4 py-3 flex items-center justify-between border-b border-[#E1E4E7]">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold bg-[#0D0D0D] text-white px-1.5 py-0.5">
            GAN
          </span>
          <span className="text-xs font-semibold text-[#0D0D0D]">
            Procurement Console
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 border border-[#E1E4E7] text-[#0D0D0D] hover:bg-[#F6F7F8]"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Structured Text-First Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-60 bg-[#FFFFFF] flex flex-col justify-between border-r border-[#E1E4E7] transition-transform duration-150 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto">
          {/* Masthead */}
          <div className="p-5 border-b border-[#E1E4E7]">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold bg-[#0D0D0D] text-white px-1.5 py-0.5">
                GAN
              </span>
              <span className="text-xs font-semibold text-[#0D0D0D] tracking-tight">
                Procurement Console
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-1.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-[#1E3A52]"></span>
              <span>Registry v3.2 active</span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.heading} className="space-y-1">
                <div className="px-2 text-[11px] font-medium text-[#6B7280] pb-1">
                  {group.heading}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-2.5 py-1.5 text-xs transition-colors ${
                          active
                            ? "bg-[#F6F7F8] text-[#0D0D0D] font-semibold border-l-2 border-[#1E3A52]"
                            : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#FAFAFA]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Operator Identity & Logout */}
        <div className="p-4 border-t border-[#E1E4E7] bg-[#FAFAFA] space-y-2.5 text-xs font-mono">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-[#6B7280] hover:text-[#0D0D0D] transition-colors py-0.5"
          >
            <span>Public portal</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <div className="pt-2 border-t border-[#E1E4E7] flex items-center justify-between">
            <div className="truncate">
              <div className="font-semibold text-[#0D0D0D] truncate">
                {session?.user?.name || "Secretariat officer"}
              </div>
              <div className="text-[10px] text-[#6B7280] truncate">
                {session?.user?.email || "admin@ganepal.org"}
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              title="Sign out"
              className="p-1 text-[#6B7280] hover:text-[#0D0D0D] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-12 bg-[#FFFFFF] border-b border-[#E1E4E7] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#6B7280]">Console</span>
            <span className="text-[#E1E4E7]">/</span>
            <span className="font-medium text-[#0D0D0D] capitalize">
              {getActiveTitle()}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-4 font-mono text-[11px] text-[#6B7280]">
            <span>Session: Encrypted</span>
            <span className="text-[#E1E4E7]">|</span>
            <span>Chobhar ICD clearing active</span>
          </div>
        </header>

        {/* 12-Column Grid Canvas */}
        <main className="p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
