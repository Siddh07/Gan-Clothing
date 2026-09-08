"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Package, Inbox, ShieldCheck } from "lucide-react";

export function PortalNav({ enterpriseSlug }: { enterpriseSlug?: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/portal", label: "Factory Profile", icon: Building2, exact: true },
    { href: "/portal/products", label: "Product Catalog", icon: Package },
    { href: "/portal/inquiries", label: "Trade Inquiries (RFQs)", icon: Inbox },
    { href: "/portal/certifications", label: "Compliance Audits", icon: ShieldCheck },
  ];

  return (
    <nav className="p-4 space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
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
  );
}
