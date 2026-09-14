"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuoteCart } from "@/context/QuoteCartContext";

export function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount, setIsDrawerOpen } = useQuoteCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If in isolated admin or portal views, render children without public shell
  const isIsolatedView =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  if (isIsolatedView) {
    return <>{children}</>;
  }

  const navLinks = [
    { href: "/products", label: "Catalog" },
    { href: "/directory", label: "Mill Directory" },
    { href: "/rfq", label: "Submit RFQ" },
    { href: "/portal", label: "Wholesale Portal" },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2] text-[#231F20]">
      {/* ─── 1. Operational Ticker ─── */}
      <div className="bg-[#231F20] text-white border-b border-[#231F20] px-4 py-1.5 text-[9px] sm:text-[11px] font-mono tracking-widest uppercase">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>
              STATUS: DOMESTIC MILLING ACTIVE — DISPATCH CYCLE 24–48H
            </span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/80">
              WRAP &amp; ILO CERTIFIED SPECIMENS
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <span className="hidden sm:inline">
              ZERO US IMPORT DUTY (NEPAL PREFERENCE ACT)
            </span>
            <Link
              href="/apply"
              className="text-[#DFD8CE] hover:text-white underline underline-offset-2 transition-colors"
            >
              APPLY FOR WHOLESALE TIER →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. Sticky Header ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DFD8CE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Masthead / Brand Identifier */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group flex flex-col focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#231F20]" />
                  <span className="font-bold text-[14px] sm:text-[16px] tracking-tight uppercase text-[#231F20]">
                    GAN EXPORT REGISTRY
                  </span>
                </div>
                <span className="font-mono text-[9px] tracking-wider text-[#5E5F5A]">
                  NEPAL READY-MADE GARMENTS GUILD // SPECIMEN SPEC
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 font-mono text-[11px] uppercase tracking-wider">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 transition-colors hover:text-[#231F20] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20] ${
                    isActive(link.href)
                      ? "text-[#231F20] font-bold border-b-2 border-[#231F20]"
                      : "text-[#5E5F5A]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Action Terminal: RFQ Drawer Trigger & Quick Apply */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-2 bg-[#F2F2F2] hover:bg-[#DFD8CE] border border-[#DFD8CE] text-[#231F20] px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
                aria-label="View RFQ specimens cart"
              >
                <span>RFQ SPECIMENS</span>
                <span className="bg-[#231F20] text-white font-mono text-[9px] px-1.5 py-0.2">
                  {itemCount}
                </span>
              </button>

              <Link
                href="/rfq"
                className="hidden lg:inline-flex items-center bg-[#231F20] text-white hover:bg-[#5E5F5A] px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
              >
                DIRECT DISPATCH
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 text-[#231F20] border border-[#DFD8CE] font-mono text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
                aria-label="Toggle navigation"
              >
                {mobileNavOpen ? "✕ CLOSE" : "☰ MENU"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-[#DFD8CE] bg-white p-4 space-y-3 font-mono text-[11px] uppercase tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`block py-1.5 border-b border-[#DFD8CE]/40 ${
                  isActive(link.href)
                    ? "font-bold text-[#231F20]"
                    : "text-[#5E5F5A]"
                }`}
              >
                {link.label} →
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/apply"
                onClick={() => setMobileNavOpen(false)}
                className="block text-center bg-[#231F20] text-white py-2"
              >
                APPLY FOR WHOLESALE ACCESS
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1">{children}</main>

      {/* ─── 3. Architectural Multi-Column Footer ─── */}
      <footer className="bg-white border-t border-[#DFD8CE]">
        {/* Hairline Divided Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#DFD8CE]">
          {/* Column 1: Institutional Authority & Registry Profile */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 bg-[#231F20]" />
                <span className="font-bold text-[13px] tracking-tight uppercase text-[#231F20]">
                  GARMENT ASSOC. OF NEPAL
                </span>
              </div>
              <p className="text-[11px] text-[#5E5F5A] leading-relaxed mb-4">
                Apex trade registry representing Nepal’s ready-made garment and
                specialty textile manufacturing enterprises. Operating under the
                auspices of the Nepal Trade Policy &amp; ILO LDC Graduation
                framework.
              </p>
              <div className="font-mono text-[9px] text-[#5E5F5A] space-y-1">
                <div>SECRETARIAT: KATHMANDU, BAGMATI, NEPAL</div>
                <div>EXCHANGE: +977-1-4350123 / TRADE-DESK@GANEPAL.ORG</div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DFD8CE] font-mono text-[9px] text-[#5E5F5A]">
              STATUS: GOV-RECOGNIZED APEX ENTITY
            </div>
          </div>

          {/* Column 2: Technical Specs List & Milling Standards */}
          <div className="p-6 sm:p-8">
            <h4 className="font-mono text-[11px] font-bold text-[#231F20] uppercase tracking-wider mb-3">
              TECHNICAL SPEC STANDARDS
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-[#5E5F5A]">
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>180–500 GSM Combed Ring-Spun Cotton</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>Himalayan Mountain Wool &amp; Cashmere Blends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>OEKO-TEX Standard 100 Class I &amp; II Non-Toxic Dyes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>WRAP &amp; SEDEX Certified Social Compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>Precision Flatlock &amp; 3-Needle Chain Stitching</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Factory Dispatch & Trade Protocol */}
          <div className="p-6 sm:p-8">
            <h4 className="font-mono text-[11px] font-bold text-[#231F20] uppercase tracking-wider mb-3">
              DISPATCH &amp; SOURCING LEDGER
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-[#5E5F5A]">
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>FOB Birgunj Dry Port (ICD) / Kolkata Port Sea Freight</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>Tribhuvan Intl. Airport (KTM) Direct Air Dispatch</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>US Nepal Trade Preference Act: 0% Import Tariff</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>EU Everything But Arms (EBA) Zero Duty Regime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#231F20] font-bold">—</span>
                <span>Specimen Swatch Delivery: 3–5 Business Days Global</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Wholesale Access & System Index */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h4 className="font-mono text-[11px] font-bold text-[#231F20] uppercase tracking-wider mb-3">
                REGISTRY TERMINAL INDEX
              </h4>
              <ul className="space-y-1.5 font-mono text-[11px]">
                <li>
                  <Link
                    href="/products"
                    className="text-[#5E5F5A] hover:text-[#231F20] hover:underline"
                  >
                    → Specimen Product Catalog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/directory"
                    className="text-[#5E5F5A] hover:text-[#231F20] hover:underline"
                  >
                    → Certified Exporter Directory
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rfq"
                    className="text-[#5E5F5A] hover:text-[#231F20] hover:underline"
                  >
                    → Centralized RFQ Submission
                  </Link>
                </li>
                <li>
                  <Link
                    href="/apply"
                    className="text-[#5E5F5A] hover:text-[#231F20] hover:underline"
                  >
                    → Wholesale B2B Account Application
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal"
                    className="text-[#5E5F5A] hover:text-[#231F20] hover:underline"
                  >
                    → Factory Representative Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/login"
                    className="text-[#5E5F5A] hover:text-[#231F20] hover:underline"
                  >
                    → Internal Administrative Console
                  </Link>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DFD8CE]">
              <div className="font-mono text-[9px] text-[#5E5F5A]">
                DATA REFRESH: REALTIME PRISMA SYNC
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Ledger Bar */}
        <div className="border-t border-[#DFD8CE] bg-[#F2F2F2] px-4 sm:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[9px] text-[#5E5F5A]">
            <div>
              © {new Date().getFullYear()} GARMENT ASSOCIATION OF NEPAL (GAN).
              ALL RIGHTS RESERVED. HOUSE OF BLANKS SPECIFICATION.
            </div>
            <div className="flex items-center space-x-4">
              <span>LEGAL CODE: NTPA-2016-GAN-LDC</span>
              <span>•</span>
              <span>TERMS OF EXPORT</span>
              <span>•</span>
              <span>PRIVACY PROTOCOL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
