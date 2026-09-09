"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Cpu,
  ShieldCheck,
  Package,
  Send,
  Download,
  ExternalLink,
  Award,
  CheckCircle2,
  Layers,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { QuoteModal } from "@/components/public/QuoteModal";

interface Certification {
  id: string;
  name: string;
  issuer: string;
  certificateNumber?: string | null;
  issueDate?: Date | string | null;
  expiryDate?: Date | string | null;
  certificateFileUrl?: string | null;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  fabricType: string;
  gsmWeight?: number | null;
  moq: number;
  targetGender?: string | null;
  description: string;
  images: string;
  category: {
    name: string;
  };
}

interface EnterpriseTabsProps {
  enterprise: {
    id: string;
    name: string;
    slug: string;
    description: string;
    yearEstablished: number;
    employeeCount: number;
    monthlyCapacityPcs: number;
    address: string;
    city: string;
    websiteUrl?: string | null;
    contactEmail: string;
    contactPhone: string;
    exportMarkets: string;
    isVerified: boolean;
    registrationNumber: string;
    panNumber: string;
    certifications: Certification[];
    products: Product[];
  };
}

export function EnterpriseTabs({ enterprise }: EnterpriseTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "machinery" | "certifications" | "products" | "rfq"
  >("overview");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<{
    id: string;
    title: string;
    moq: number;
  } | null>(null);

  const tabs = [
    { id: "overview", label: "Company Overview", icon: Building2 },
    { id: "machinery", label: "Machinery & Production Specs", icon: Cpu },
    {
      id: "certifications",
      label: `Certifications (${enterprise.certifications.length})`,
      icon: ShieldCheck,
    },
    {
      id: "products",
      label: `Export Products (${enterprise.products.length})`,
      icon: Package,
    },
    { id: "rfq", label: "Request Direct Quote", icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${isActive
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Company Overview */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div>
            <h3 className="font-outfit text-2xl font-bold text-slate-900 mb-4">
              About {enterprise.name}
            </h3>
            <p className="text-slate-600 leading-relaxed text-base">
              {enterprise.description}
            </p>
          </div>

          {/* Plant Vital Signs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs text-slate-700 block">Established:</span>
              <span className="font-outfit text-xl font-black text-slate-900">
                {enterprise.yearEstablished}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-700 block">Artisan & Labor Workforce:</span>
              <span className="font-outfit text-xl font-black text-slate-900">
                {enterprise.employeeCount} Personnel
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-700 block">Monthly Export Capacity:</span>
              <span className="font-outfit text-xl font-black text-emerald-700">
                {enterprise.monthlyCapacityPcs.toLocaleString()} pcs
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-700 block">Accreditation:</span>
              <span className="font-outfit text-xl font-black text-slate-900">
                GAN Member
              </span>
            </div>
          </div>

          {/* Global Markets */}
          <div>
            <h4 className="font-outfit text-lg font-bold text-slate-900 mb-3">
              Key Export Destinations
            </h4>
            <div className="flex flex-wrap gap-2">
              {enterprise.exportMarkets.split(",").map((market, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {market.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Statutory Registration Details */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <strong>Government Registration No:</strong> {enterprise.registrationNumber}
            </div>
            <div>
              <strong>PAN / VAT Tax ID:</strong> {enterprise.panNumber} (Inland Revenue Dept)
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Machinery & Production Specs */}
      {activeTab === "machinery" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div>
            <h3 className="font-outfit text-2xl font-bold text-slate-900 mb-2">
              Production Machinery & Technical Capabilities
            </h3>
            <p className="text-slate-600 text-sm">
              Audited production infrastructure deployed at the {enterprise.city} manufacturing plant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="font-outfit text-base font-bold text-slate-900">
                Pattern & Cutting Suite
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• CAD Digitized Pattern Grading & Marker Making</li>
                <li>• Automated Fabric Spreading & High-Ply Knife Cutting</li>
                <li>• End-to-end fabric shrinkage testing baths</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="font-outfit text-base font-bold text-slate-900">
                Sewing & Knitting Assembly
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• Direct-drive computerized lockstitch & overlock machines</li>
                <li>• Shima Seiki / Stoll computerized multi-gauge flatbeds</li>
                <li>• Laser cutting & ultrasonic seam-sealing lines</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="font-outfit text-base font-bold text-slate-900">
                Finishing & Quality Assurance
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• Vacuum suction ironing tables & tension presses</li>
                <li>• Hasima conveyor needle detectors (9-point audit)</li>
                <li>• AQL 2.5 standard pre-shipment quality inspection</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Certifications */}
      {activeTab === "certifications" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-outfit text-2xl font-bold text-slate-900 mb-2">
              Compliance & Sustainability Certifications
            </h3>
            <p className="text-slate-600 text-sm">
              Verified by international independent auditing agencies for social accountability and chemical safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enterprise.certifications.map((cert) => {
              const now = new Date();
              const expiry = cert.expiryDate ? new Date(cert.expiryDate) : null;
              const daysRemaining = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

              const isExpired = daysRemaining !== null && daysRemaining <= 0;
              const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
              const isActive = !isExpired && !isExpiringSoon;

              return (
                <div
                  key={cert.id}
                  className={`p-5 rounded-xl border transition-all flex items-start justify-between gap-4 ${isExpired
                      ? "border-red-200 bg-red-50/40"
                      : isExpiringSoon
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-500 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-lg shrink-0 ${isExpired
                        ? "bg-red-100 text-red-700"
                        : isExpiringSoon
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-outfit font-bold text-slate-900 text-base">
                        {cert.name}
                      </h4>
                      <p className="text-xs text-slate-700">
                        Issuing Body: <strong>{cert.issuer}</strong>
                        {cert.certificateNumber && ` • Cert #${cert.certificateNumber}`}
                      </p>

                      {cert.expiryDate && (
                        <p className="text-[11px] text-slate-700">
                          Valid: {cert.issueDate ? `${new Date(cert.issueDate).toLocaleDateString()} — ` : ""}
                          {new Date(cert.expiryDate).toLocaleDateString()}
                        </p>
                      )}

                      {/* Compliance Status Badge */}
                      <div className="pt-1">
                        {isActive && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Active & Audited in GAN Registry
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            ⚠ Renewal in Progress ({daysRemaining} days remaining)
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                            ✕ Audit Expired — Recertification Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {cert.certificateFileUrl && (
                    <a
                      href={cert.certificateFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="View Certificate PDF"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Product Catalog */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-outfit text-2xl font-bold text-slate-900">
                Products Manufactured by {enterprise.name}
              </h3>
              <p className="text-slate-600 text-sm">
                Export samples available for tech-pack evaluation and bulk manufacturing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterprise.products.map((product) => {
              let images: string[] = [];
              try {
                images = JSON.parse(product.images);
              } catch {
                images = [product.images];
              }
              const displayImage = images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600";

              return (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-200">
                      <img
                        src={displayImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {product.category.name}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <Link href={`/products/${product.slug}`} className="block">
                        <h4 className="font-outfit font-bold text-slate-900 hover:text-emerald-700 transition-colors text-sm line-clamp-1">
                          {product.title}
                        </h4>
                      </Link>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div>
                          <strong>Fabric:</strong> {product.fabricType}
                        </div>
                        {product.gsmWeight && (
                          <div>
                            <strong>Weight:</strong> {product.gsmWeight} GSM
                          </div>
                        )}
                        <div>
                          <strong>MOQ:</strong> {product.moq} pcs
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100/80 mt-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-semibold text-slate-700 hover:text-emerald-700"
                    >
                      Specifications
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedProductForQuote({
                          id: product.id,
                          title: product.title,
                          moq: product.moq,
                        });
                        setIsQuoteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
                    >
                      Quote Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Direct RFQ section */}
      {activeTab === "rfq" && (
        <div id="rfq" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-in fade-in duration-200">
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="font-outfit text-3xl font-black text-slate-900">
              Submit Direct RFQ to {enterprise.name}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your inquiry will be logged with the Garment Association of Nepal and transmitted directly to the export merchandising team of {enterprise.name}.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedProductForQuote(null);
                  setIsQuoteModalOpen(true);
                }}
                className="px-8 py-4 rounded-xl text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all hover:scale-105"
              >
                Launch Factory Quotation Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setSelectedProductForQuote(null);
        }}
        enterpriseId={enterprise.id}
        enterpriseName={enterprise.name}
        productId={selectedProductForQuote?.id}
        productTitle={selectedProductForQuote?.title}
        defaultMoq={selectedProductForQuote?.moq}
      />
    </div>
  );
}
