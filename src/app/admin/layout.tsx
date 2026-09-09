"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Layers,
  BarChart2,
  Users,
  FileText,
  Upload,
  ShieldCheck,
  Activity,
  Building2,
  Search,
  Bell,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navGroups = [
  {
    heading: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/enterprises", label: "Member mills", icon: Building2 },
    ],
  },
  {
    heading: "Orders & Inquiries",
    items: [
      { href: "/admin/inquiries", label: "Trade inquiries & RFQs", icon: FileText },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/admin/applications", label: "Accreditation queue", icon: ShieldCheck },
      { href: "/admin/import", label: "Bulk import", icon: Upload },
    ],
  },
  {
    heading: "Governance",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/admin/audit-logs", label: "Audit trail", icon: Activity },
    ],
  },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
        isActive
          ? "bg-[#EFF4FF] text-[#2D5BE3] font-medium border-l-2 border-[#2D5BE3] -ml-px pl-[11px]"
          : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F0F0F2]"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#2D5BE3]" : "text-[#A1A1AA]"}`} />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#F7F8FA] border-r border-[#E4E4E7] flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand zone */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[#E4E4E7] shrink-0">
          <div className="w-6 h-6 bg-[#2D5BE3] rounded flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-semibold">G</span>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#18181B] leading-tight truncate">GAN Trade Platform</div>
            <div className="text-[11px] text-[#71717A] leading-tight">Admin console</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.heading}>
              <div className="px-3 mb-1 text-[11px] font-medium text-[#71717A]">
                {group.heading}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    exact={item.exact}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User zone */}
        <div className="border-t border-[#E4E4E7] p-4 space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-[#71717A] hover:text-[#18181B] transition-colors py-1"
          >
            <span>Public directory</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-7 h-7 rounded-full bg-[#2D5BE3] flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-semibold">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#18181B] truncate">
                {session?.user?.name || "Admin"}
              </div>
              <div className="text-[11px] text-[#6B7280] truncate">
                {session?.user?.email || "admin@ganepal.org"}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              title="Sign out"
              className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        {/* Top header */}
        <header className="h-14 bg-white border-b border-[#E4E4E7] flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded text-[#71717A] hover:text-[#18181B] hover:bg-[#F7F8FA] transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Search */}
          <div className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A1A1AA] pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders, SKUs, buyers…"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#F7F8FA] border border-[#E4E4E7] rounded text-[#18181B] placeholder:text-[#71717A] focus:bg-white focus:border-[#2D5BE3] focus:ring-2 focus:ring-[#EFF4FF] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded text-[#71717A] hover:text-[#18181B] hover:bg-[#F7F8FA] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-[#E4E4E7]">
              <div className="w-7 h-7 rounded-full bg-[#2D5BE3] flex items-center justify-center">
                <span className="text-white text-[11px] font-semibold">{userInitials}</span>
              </div>
              <span className="hidden sm:block text-sm text-[#18181B] font-medium">
                {session?.user?.name?.split(" ")[0] || "Admin"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
