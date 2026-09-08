"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Package,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  User,
  UserCheck,
  FileSpreadsheet,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, don't show admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/applications", label: "Review Queue", icon: UserCheck },
    { href: "/admin/enterprises", label: "Member Enterprises", icon: Building2 },
    { href: "/admin/products", label: "Product Catalog", icon: Package },
    { href: "/admin/inquiries", label: "Inquiries & RFQs", icon: Inbox },
    { href: "/admin/import", label: "Bulk CSV Import", icon: FileSpreadsheet },
    { href: "/admin/audit-logs", label: "Audit Trail", icon: ShieldAlert },
    { href: "/admin/analytics", label: "Buyer Analytics", icon: BarChart3 },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            GAN
          </div>
          <span className="font-outfit font-bold text-sm">Admin CMS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-md">
              GAN
            </div>
            <div>
              <h2 className="font-outfit font-bold text-white text-base leading-tight">
                GAN Trade CMS
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                Secretariat Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Public switch */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center">
              <ExternalLink className="w-3.5 h-3.5 mr-2 text-emerald-400" />
              View Public Directory
            </span>
          </Link>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <div className="font-semibold text-white truncate">
                  {session?.user?.name || "Admin"}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  Superadmin
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
