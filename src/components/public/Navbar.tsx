"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  Globe2,
  Building2,
  Layers,
  Send,
  Lock,
} from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/directory", label: "Exporter Directory", icon: Building2 },
    { href: "/products", label: "Product Catalog", icon: Layers },
    { href: "/#why-nepal", label: "Why Source Nepal", icon: Globe2 },
    { href: "/rfq", label: "Submit B2B RFQ", icon: Send },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E1E4E7] bg-white transition-all">
      {/* Institutional Top Bar */}
      <div className="bg-[#0D0D0D] text-[#E1E4E7] text-[10px] font-mono py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-[#E1E4E7]/20">
        <div className="flex items-center space-x-3 truncate">
          <span className="inline-flex items-center text-white font-medium">
            <span className="w-1.5 h-1.5 bg-[#C5A059] mr-2 shrink-0"></span>
            APEX REGISTRY: NEPAL READY-MADE GARMENTS & TEXTILES
          </span>
          <span className="hidden md:inline text-[#E1E4E7]/40">|</span>
          <span className="hidden md:inline text-[#E1E4E7]/70">
            TRADE DESK: +977-1-4350123 • SOURCING: trade-desk@ganepal.org
          </span>
        </div>
        <div className="flex items-center space-x-4 shrink-0">
          <Link
            href="/admin/login"
            className="inline-flex items-center text-[#E1E4E7] hover:text-white transition-colors text-[10px] font-mono uppercase"
          >
            <Lock className="w-3 h-3 mr-1 text-[#C5A059]" />
            Terminal Access
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-[#0D0D0D] flex items-center justify-center text-white font-mono font-bold text-sm shrink-0">
              GAN
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[#0D0D0D] leading-tight">
                Garment Association of Nepal
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                Trade Directory & Sourcing Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-1.5 text-xs font-mono transition-colors ${
                    active
                      ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-b-2 border-[#1E3A52]"
                      : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F6F7F8]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-2 opacity-70" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] rounded-none transition-colors"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              SUBMIT B2B RFQ
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 border border-[#E1E4E7] text-[#0D0D0D] hover:bg-[#F6F7F8]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-[#E1E4E7] bg-white px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 text-xs font-mono ${
                  active
                    ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-l-2 border-[#1E3A52]"
                    : "text-[#6B7280] hover:bg-[#F6F7F8] hover:text-[#0D0D0D]"
                }`}
              >
                <Icon className="w-4 h-4 mr-2.5 text-[#1E3A52]" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#E1E4E7] flex flex-col space-y-2">
            <Link
              href="/rfq"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] rounded-none"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              SUBMIT B2B RFQ
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2 text-xs font-mono text-[#0D0D0D] bg-[#F6F7F8] border border-[#E1E4E7]"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              TERMINAL LOGIN
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
