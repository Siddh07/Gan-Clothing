import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Accreditation strip */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Recognized International Compliance Frameworks:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 font-medium text-slate-300">
              <span className="hover:text-white transition-colors">WRAP Certified</span>
              <span className="text-slate-700">•</span>
              <span className="hover:text-white transition-colors">OEKO-TEX® Standard 100</span>
              <span className="text-slate-700">•</span>
              <span className="hover:text-white transition-colors">Sedex SMETA</span>
              <span className="text-slate-700">•</span>
              <span className="hover:text-white transition-colors">GOTS Organic</span>
              <span className="text-slate-700">•</span>
              <span className="hover:text-white transition-colors">ISO 9001:2015</span>
              <span className="text-slate-700">•</span>
              <span className="hover:text-white transition-colors">bluesign®</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: About GAN */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                GAN
              </div>
              <span className="font-outfit font-bold text-xl text-white">
                Garment Association of Nepal
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed max-w-sm">
              The Garment Association of Nepal (GAN) is the non-profit apex trade organization representing registered garment manufacturers and ready-made apparel exporters in Nepal. Driving ethical production, tariff advantages, and sustainable mountain luxury.
            </p>
            <div className="pt-2 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GAN Secretariat, Sankhamul, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+977-1-4350123 / +977-1-4350124</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>trade-desk@ganepal.org / info@ganepal.org</span>
              </div>
            </div>
          </div>

          {/* Col 3: Sourcing Directory */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Export Directory
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <Link href="/directory" className="hover:text-emerald-400 transition-colors">
                  All Member Factories
                </Link>
              </li>
              <li>
                <Link href="/directory?category=knitwear" className="hover:text-emerald-400 transition-colors">
                  Cashmere & Knitwear
                </Link>
              </li>
              <li>
                <Link href="/directory?category=woven" className="hover:text-emerald-400 transition-colors">
                  Woven & Tailored Shirts
                </Link>
              </li>
              <li>
                <Link href="/directory?category=activewear" className="hover:text-emerald-400 transition-colors">
                  Technical Outdoor Wear
                </Link>
              </li>
              <li>
                <Link href="/directory?category=eco-fiber" className="hover:text-emerald-400 transition-colors">
                  Himalayan Hemp & Allo
                </Link>
              </li>
              <li>
                <Link href="/directory?category=denim" className="hover:text-emerald-400 transition-colors">
                  Denim & Workwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trade Benefits */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Trade Advantages
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <span className="text-slate-300 font-medium">US Nepal Trade Preference Act</span>
                <p className="text-xs text-slate-700">Duty-free access on 77 tariff lines</p>
              </li>
              <li>
                <span className="text-slate-300 font-medium">EU Everything But Arms (EBA)</span>
                <p className="text-xs text-slate-700">Zero-tariff import under GSP schemes</p>
              </li>
              <li>
                <span className="text-slate-300 font-medium">Zero-Carbon Mountain Water</span>
                <p className="text-xs text-slate-700">Abundant hydro-powered garment washing</p>
              </li>
              <li>
                <span className="text-slate-300 font-medium">Social & Ethical Audited</span>
                <p className="text-xs text-slate-700">Fair living wages, strictly zero child labor</p>
              </li>
            </ul>
          </div>

          {/* Col 5: Buyer Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              International Buyers
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <Link href="/rfq" className="hover:text-emerald-400 transition-colors flex items-center">
                  Submit Global RFQ
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">
                  Featured Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-emerald-400 transition-colors">
                  Member Portal Login
                </Link>
              </li>
            </ul>
            <div className="pt-3">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  Need Help Sourcing?
                </span>
                <p className="text-xs text-slate-700 mb-2">
                  Our trade desk matches global apparel brands with verified Nepalese mills free of charge.
                </p>
                <Link
                  href="/rfq"
                  className="inline-block text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded transition-colors"
                >
                  Contact Trade Desk
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-700 gap-4">
          <p>© {new Date().getFullYear()} Garment Association of Nepal (GAN). All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-300 transition-colors">Export Directory Registry v2.4</span>
            <span className="hover:text-slate-300 transition-colors">Nepal Trade Preferences Compliant</span>
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
              Staff CMS Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
