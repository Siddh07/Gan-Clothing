"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Package, Inbox, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/portal", label: "Facility profile", icon: Building2, exact: true },
  { href: "/portal/products", label: "Products", icon: Package },
  { href: "/portal/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/portal/certifications", label: "Certifications", icon: ShieldCheck },
];

export function PortalNav({ enterpriseSlug }: { enterpriseSlug?: string }) {
  const pathname = usePathname();
  void enterpriseSlug;

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
              active
                ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium border-l-2 border-[#3B5BDB] -ml-px pl-[11px]"
                : "text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6]"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#3B5BDB]" : "text-[#9CA3AF]"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
