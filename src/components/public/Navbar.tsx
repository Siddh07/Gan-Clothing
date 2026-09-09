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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Institutional Top Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            Official Apex Body for Nepalese Apparel Manufacturers
          </span>
          <span className="hidden md:inline text-emerald-300/60">|</span>
          <span className="hidden md:inline text-emerald-200">
            Export Desk: +977-1-4350123 • trade@ganepal.org
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/login"
            className="inline-flex items-center text-emerald-200 hover:text-white transition-colors text-xs font-medium"
          >
            <Lock className="w-3 h-3 mr-1" />
            Member / Admin CMS
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-700 to-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              <span className="font-outfit tracking-tighter">GAN</span>
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Garment Association of Nepal
              </span>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-700">
                B2B Export Directory & Trade Desk
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
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2 opacity-70" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all hover:shadow-md"
            >
              <Send className="w-4 h-4 mr-2" />
              Request a Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${active
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <Icon className="w-5 h-5 mr-3 text-emerald-600" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            <Link
              href="/rfq"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Request a Quote (B2B RFQ)
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <Lock className="w-4 h-4 mr-2" />
              Member / Admin CMS Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
