import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-[#E1E4E7] border-t border-[#E1E4E7]">
      {/* Accreditation strip */}
      <div className="border-b border-[#E1E4E7]/20 bg-[#161616] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span className="font-bold uppercase tracking-wider text-white text-[11px]">
                Accredited Bilateral Standards & Compliance Frameworks:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#E1E4E7]/70 uppercase">
              <span>WRAP GOLD/PLATINUM</span>
              <span>/</span>
              <span>OEKO-TEX® STANDARD 100</span>
              <span>/</span>
              <span>SEDEX SMETA 4-PILLAR</span>
              <span>/</span>
              <span>GOTS ORGANIC</span>
              <span>/</span>
              <span>ISO 9001:2015</span>
              <span>/</span>
              <span>BLUESIGN® SYSTEM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs font-mono">
          {/* Col 1 & 2: About GAN */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white text-[#0D0D0D] flex items-center justify-center font-bold text-xs">
                GAN
              </div>
              <span className="font-bold text-sm text-white font-sans">
                Garment Association of Nepal
              </span>
            </div>
            <p className="text-xs text-[#E1E4E7]/70 leading-relaxed max-w-sm font-sans">
              Non-profit apex trade association representing registered garment manufacturers and export mills in Nepal. Driving bilateral duty-free access, social compliance, and technical export production.
            </p>
            <div className="pt-2 text-[11px] text-[#E1E4E7]/60 space-y-1">
              <div>SECRETARIAT: Sankhamul, Kathmandu, Nepal</div>
              <div>HOTLINE: +977-1-4350123 / +977-1-4350124</div>
              <div>TRADE DESK: trade-desk@ganepal.org</div>
            </div>
          </div>

          {/* Col 3: Sourcing Directory */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
              Registry Sectors
            </h3>
            <ul className="space-y-1.5 text-[11px] text-[#E1E4E7]/70">
              <li>
                <Link href="/directory" className="hover:text-white transition-colors">
                  All Member Mills
                </Link>
              </li>
              <li>
                <Link href="/directory?category=knitwear" className="hover:text-white transition-colors">
                  Cashmere & Knitwear
                </Link>
              </li>
              <li>
                <Link href="/directory?category=woven" className="hover:text-white transition-colors">
                  Woven & Tailored Outerwear
                </Link>
              </li>
              <li>
                <Link href="/directory?category=activewear" className="hover:text-white transition-colors">
                  Alpine Technical Wear
                </Link>
              </li>
              <li>
                <Link href="/directory?category=eco-fiber" className="hover:text-white transition-colors">
                  Wild Nettle (Allo) & Hemp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trade Benefits */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
              Statutory Regimes
            </h3>
            <ul className="space-y-2 text-[11px] text-[#E1E4E7]/70">
              <li>
                <span className="text-white font-medium">US NTPA (P.L. 114-125)</span>
                <p className="text-[10px] text-[#E1E4E7]/50">0% customs tariff on 77 lines</p>
              </li>
              <li>
                <span className="text-white font-medium">EU EBA / GSP</span>
                <p className="text-[10px] text-[#E1E4E7]/50">Zero-duty import treatment</p>
              </li>
              <li>
                <span className="text-white font-medium">Hydroelectric Grid</span>
                <p className="text-[10px] text-[#E1E4E7]/50">95%+ zero-carbon manufacturing</p>
              </li>
            </ul>
          </div>

          {/* Col 5: International Buyer Support */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
              Buyer Trade Desk
            </h3>
            <ul className="space-y-1.5 text-[11px] text-[#E1E4E7]/70">
              <li>
                <Link href="/rfq" className="hover:text-white transition-colors">
                  Submit Global RFQ Docket
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Specimen Showroom
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Secretariat Terminal Login
                </Link>
              </li>
            </ul>
            <div className="pt-2">
              <div className="p-3 border border-[#E1E4E7]/20 bg-[#161616]">
                <span className="text-[10px] font-bold text-[#C5A059] uppercase block mb-1">
                  Procurement Matchmaking
                </span>
                <p className="text-[10px] text-[#E1E4E7]/60 font-sans mb-2">
                  Secretariat officers route tech packs directly to accredited production floors without commercial broker margins.
                </p>
                <Link
                  href="/rfq"
                  className="inline-block text-[10px] font-mono font-medium text-white bg-[#1E3A52] hover:bg-white hover:text-[#0D0D0D] px-2.5 py-1 transition-colors"
                >
                  DISPATCH RFQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#E1E4E7]/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#E1E4E7]/50 gap-4">
          <p>© {new Date().getFullYear()} Garment Association of Nepal (GAN). All statutory rights reserved.</p>
          <div className="flex space-x-4">
            <span>REGISTRY ARCHITECTURE V2.6</span>
            <span>/</span>
            <span>NTPA COMPLIANT</span>
            <span>/</span>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              STAFF CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
