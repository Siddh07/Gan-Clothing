"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Cpu,
  ShieldCheck,
  Package,
  Send,
  ExternalLink,
  Award,
  CheckCircle2,
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
    { id: "overview", label: "Mill Overview", icon: Building2 },
    { id: "machinery", label: "Machinery & Technical Specifications", icon: Cpu },
    {
      id: "certifications",
      label: `Accreditations (${enterprise.certifications.length})`,
      icon: ShieldCheck,
    },
    {
      id: "products",
      label: `Export Catalog (${enterprise.products.length})`,
      icon: Package,
    },
    { id: "rfq", label: "Direct Sourcing RFQ", icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white border border-[#E1E4E7] p-1 flex flex-wrap gap-1 font-mono text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-none uppercase tracking-wider text-xs font-bold transition-colors flex items-center justify-center space-x-2 ${
                isActive
                  ? "bg-[#0D0D0D] text-white"
                  : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F6F7F8]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Company Overview */}
      {activeTab === "overview" && (
        <div className="bg-white border border-[#E1E4E7] p-8 space-y-8 animate-in fade-in duration-150">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
              Operational Profile // Mill Overview
            </div>
            <h3 className="font-mono text-xl font-bold uppercase text-[#0D0D0D] mt-1 mb-4">
              About {enterprise.name}
            </h3>
            <p className="text-[#6B7280] leading-relaxed text-sm">
              {enterprise.description}
            </p>
          </div>

          {/* Plant Vital Signs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F6F7F8] border border-[#E1E4E7] font-mono">
            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block">Inception</span>
              <span className="text-base font-bold text-[#0D0D0D]">
                {enterprise.yearEstablished}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block">Workforce Headcount</span>
              <span className="text-base font-bold text-[#0D0D0D]">
                {enterprise.employeeCount} Operatives
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block">Monthly Volume Capacity</span>
              <span className="text-base font-bold text-[#1E3A52]">
                {enterprise.monthlyCapacityPcs.toLocaleString()} pcs
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block">Accreditation</span>
              <span className="text-base font-bold text-[#0D0D0D]">
                GAN Verified
              </span>
            </div>
          </div>

          {/* Global Markets */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0D0D0D] mb-3">
              Export Trading Destinations
            </h4>
            <div className="flex flex-wrap gap-2">
              {enterprise.exportMarkets.split(",").map((market, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono bg-[#F6F7F8] text-[#0D0D0D] border border-[#E1E4E7]"
                >
                  {market.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Statutory Registration Details */}
          <div className="pt-6 border-t border-[#E1E4E7] grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-[#6B7280]">
            <div>
              <strong className="text-[#0D0D0D]">Enterprise Reg ID:</strong> {enterprise.registrationNumber}
            </div>
            <div>
              <strong className="text-[#0D0D0D]">Inland Revenue PAN:</strong> {enterprise.panNumber}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Machinery & Production Specs */}
      {activeTab === "machinery" && (
        <div className="bg-white border border-[#E1E4E7] p-8 space-y-8 animate-in fade-in duration-150">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
              Facility Equipment Telemetry
            </div>
            <h3 className="font-mono text-xl font-bold uppercase text-[#0D0D0D] mt-1 mb-2">
              Production Machinery & Technical Capabilities
            </h3>
            <p className="text-[#6B7280] text-xs font-mono">
              Audited production infrastructure deployed at the {enterprise.city} manufacturing plant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-3 font-mono">
              <div className="text-xs font-bold text-[#1E3A52]">
                [SUITE 01]
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                Pattern & Cutting Suite
              </h4>
              <ul className="text-xs text-[#6B7280] space-y-1.5 font-sans">
                <li>• CAD Digitized Pattern Grading & Marker Optimization</li>
                <li>• Automated Fabric Spreading & High-Ply Knife Cutting</li>
                <li>• End-to-end fabric shrinkage & torque testing baths</li>
              </ul>
            </div>

            <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-3 font-mono">
              <div className="text-xs font-bold text-[#1E3A52]">
                [SUITE 02]
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                Assembly & Knitting Lines
              </h4>
              <ul className="text-xs text-[#6B7280] space-y-1.5 font-sans">
                <li>• Direct-drive programmable lockstitch & 5-thread overlockers</li>
                <li>• Computerized multi-gauge Shima Seiki / Stoll flatbed knitters</li>
                <li>• Laser contour cutting & ultrasonic seam-bonding lines</li>
              </ul>
            </div>

            <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-3 font-mono">
              <div className="text-xs font-bold text-[#1E3A52]">
                [SUITE 03]
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                Finishing & Quality Assurance
              </h4>
              <ul className="text-xs text-[#6B7280] space-y-1.5 font-sans">
                <li>• Suction vacuum pressing boards & garment steamers</li>
                <li>• Hasima dual-sensor conveyor needle detection stations</li>
                <li>• AQL 1.5 / 2.5 standard pre-dispatch inspection protocols</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Certifications */}
      {activeTab === "certifications" && (
        <div className="bg-white border border-[#E1E4E7] p-8 space-y-6 animate-in fade-in duration-150">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
              Audited Standards & Compliance Register
            </div>
            <h3 className="font-mono text-xl font-bold uppercase text-[#0D0D0D] mt-1 mb-2">
              Accreditations & Social Audit Records
            </h3>
            <p className="text-[#6B7280] text-xs font-mono">
              Validated against international accreditation databases for environmental safety and fair labor standards.
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
                  className="p-4 border border-[#E1E4E7] bg-[#F6F7F8] flex items-start justify-between gap-4 font-mono text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white border border-[#E1E4E7] text-[#0D0D0D]">
                      <Award className="w-5 h-5 text-[#1E3A52]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#0D0D0D] uppercase text-xs">
                        {cert.name}
                      </h4>
                      <p className="text-[11px] text-[#6B7280]">
                        Issuer: <strong className="text-[#0D0D0D]">{cert.issuer}</strong>
                        {cert.certificateNumber && ` // Cert #${cert.certificateNumber}`}
                      </p>

                      {cert.expiryDate && (
                        <p className="text-[10px] text-[#6B7280]">
                          Validity: {cert.issueDate ? `${new Date(cert.issueDate).toLocaleDateString()} — ` : ""}
                          {new Date(cert.expiryDate).toLocaleDateString()}
                        </p>
                      )}

                      {/* Status Tag */}
                      <div className="pt-1">
                        {isActive && (
                          <span className="tag-approved text-[10px]">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            AUDITED & ACTIVE
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="tag-pending text-[10px]">
                            RENEWAL PROTOCOL ({daysRemaining} DAYS REMAINING)
                          </span>
                        )}
                        {isExpired && (
                          <span className="tag-neutral text-[10px] text-red-600 border-red-200">
                            EXPIRED // AUDIT REQUIRED
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
                      className="p-1.5 border border-[#E1E4E7] bg-white text-[#6B7280] hover:text-[#0D0D0D] hover:border-[#0D0D0D] transition-colors"
                      title="View Certificate PDF"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="bg-white border border-[#E1E4E7] p-8 space-y-6 animate-in fade-in duration-150">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
              Sample Registry // Production Runs
            </div>
            <h3 className="font-mono text-xl font-bold uppercase text-[#0D0D0D] mt-1">
              Specimens Manufactured by {enterprise.name}
            </h3>
            <p className="text-[#6B7280] text-xs font-mono">
              Export specimens configured for tech-pack replication and bulk contract cutting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="border border-[#E1E4E7] bg-white hover:border-[#0D0D0D] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-[#F6F7F8] border-b border-[#E1E4E7]">
                      <img
                        src={displayImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider font-bold bg-[#0D0D0D] text-white">
                        {product.category.name}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <Link href={`/products/${product.slug}`} className="block">
                        <h4 className="font-mono text-xs font-bold uppercase text-[#0D0D0D] hover:text-[#1E3A52] transition-colors truncate">
                          {product.title}
                        </h4>
                      </Link>

                      <div className="font-mono text-[11px] text-[#6B7280] space-y-1">
                        <div>
                          <strong>FIBER:</strong> {product.fabricType}
                        </div>
                        {product.gsmWeight && (
                          <div>
                            <strong>WEIGHT:</strong> {product.gsmWeight} GSM
                          </div>
                        )}
                        <div>
                          <strong>MOQ:</strong> {product.moq.toLocaleString()} PCS
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[#E1E4E7] mt-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#6B7280] hover:text-[#0D0D0D]"
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
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                    >
                      Quote Specimen
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
        <div id="rfq" className="bg-white border border-[#E1E4E7] p-8 animate-in fade-in duration-150">
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="w-12 h-12 border border-[#E1E4E7] text-[#0D0D0D] flex items-center justify-center mx-auto">
              <Send className="w-5 h-5 text-[#1E3A52]" />
            </div>
            <div className="space-y-1 font-mono">
              <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">
                Contract Manufacturing Requisition
              </div>
              <h3 className="text-xl font-bold uppercase text-[#0D0D0D]">
                Submit Commercial RFQ to {enterprise.name}
              </h3>
            </div>
            <p className="text-[#6B7280] text-xs leading-relaxed font-sans">
              Your inquiry will be logged with the Garment Association of Nepal trade desk and transmitted directly to the export merchandising team of {enterprise.name}.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedProductForQuote(null);
                  setIsQuoteModalOpen(true);
                }}
                className="px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
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
