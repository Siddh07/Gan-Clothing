"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Package, Inbox, ShieldCheck } from "lucide-react";

export function PortalNav({ enterpriseSlug }: { enterpriseSlug?: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/portal", label: "Facility Dossier", icon: Building2, exact: true },
    { href: "/portal/products", label: "Export Styles & Tech Packs", icon: Package },
    { href: "/portal/inquiries", label: "Trade Inquiries (RFQs)", icon: Inbox },
    { href: "/portal/certifications", label: "Compliance & Certifications", icon: ShieldCheck },
  ];

  return (
    <nav className="p-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 text-xs font-mono transition-colors ${
              active
                ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-l-2 border-[#1E3A52]"
                : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F6F7F8] border-l-2 border-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5 mr-2.5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

