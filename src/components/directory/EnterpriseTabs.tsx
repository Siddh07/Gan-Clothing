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
  category: { name: string };
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
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "machinery", label: "Machinery & specs", icon: Cpu },
    {
      id: "certifications",
      label: `Certifications (${enterprise.certifications.length})`,
      icon: ShieldCheck,
    },
    {
      id: "products",
      label: `Products (${enterprise.products.length})`,
      icon: Package,
    },
    { id: "rfq", label: "Request quote", icon: Send },
  ];

  const [currentTimestamp] = useState(() => Date.now());

  const getCertStatus = (expiryDate?: Date | string | null) => {
    if (!expiryDate) return { label: "Active", type: "success" as const };
    const daysLeft = Math.ceil(
      (new Date(expiryDate).getTime() - currentTimestamp) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return { label: "Expired", type: "error" as const };
    if (daysLeft <= 30) return { label: `Expires in ${daysLeft}d`, type: "warning" as const };
    return { label: "Active", type: "success" as const };
  };

  const badgeClass = (type: "success" | "warning" | "error") =>
    type === "success"
      ? "badge badge-success"
      : type === "warning"
      ? "badge badge-warning"
      : "badge badge-error";

  return (
    <div className="space-y-0">
      {/* Tab nav — underline style */}
      <div className="bg-white border border-[#E4E4E7] border-b-0 px-1 flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-[#2D5BE3] text-[#2D5BE3] font-medium"
                  : "border-transparent text-[#71717A] hover:text-[#18181B] hover:border-[#E4E4E7]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="bg-white border border-[#E4E4E7]">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-[#18181B] mb-3">
                About {enterprise.name}
              </h3>
              <p className="text-sm text-[#71717A] leading-relaxed max-w-3xl">
                {enterprise.description}
              </p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E4E4E7]">
              {[
                { label: "Year established", value: String(enterprise.yearEstablished) },
                { label: "Workforce", value: `${enterprise.employeeCount} workers` },
                {
                  label: "Monthly capacity",
                  value: `${enterprise.monthlyCapacityPcs.toLocaleString()} pcs`,
                },
                { label: "Accreditation", value: "GAN verified" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#F7F8FA] px-5 py-4">
                  <div className="text-xs text-[#71717A] mb-1">{stat.label}</div>
                  <div className="text-base font-semibold text-[#18181B]">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Export markets */}
            <div>
              <h4 className="text-sm font-medium text-[#18181B] mb-3">
                Export destinations
              </h4>
              <div className="flex flex-wrap gap-2">
                {enterprise.exportMarkets.split(",").map((market, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm bg-[#F7F8FA] text-[#18181B] border border-[#E4E4E7] rounded"
                  >
                    {market.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Registration details */}
            <div className="pt-6 border-t border-[#E4E4E7] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#71717A]">Enterprise registration: </span>
                <span className="font-medium text-[#18181B]">{enterprise.registrationNumber}</span>
              </div>
              <div>
                <span className="text-[#71717A]">Inland Revenue PAN: </span>
                <span className="font-medium text-[#18181B]">{enterprise.panNumber}</span>
              </div>
              {enterprise.contactEmail && (
                <div>
                  <span className="text-[#71717A]">Contact: </span>
                  <a
                    href={`mailto:${enterprise.contactEmail}`}
                    className="text-[#2D5BE3] hover:underline"
                  >
                    {enterprise.contactEmail}
                  </a>
                </div>
              )}
              {enterprise.websiteUrl && (
                <div>
                  <span className="text-[#71717A]">Website: </span>
                  <a
                    href={enterprise.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2D5BE3] hover:underline inline-flex items-center gap-1"
                  >
                    {enterprise.websiteUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Machinery & specs */}
        {activeTab === "machinery" && (
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#18181B] mb-1">
                Production machinery &amp; technical capabilities
              </h3>
              <p className="text-sm text-[#71717A]">
                Audited production infrastructure deployed at the {enterprise.city} manufacturing plant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  num: "01",
                  title: "Pattern & cutting suite",
                  items: [
                    "CAD digitized pattern grading & marker optimization",
                    "Automated fabric spreading & high-ply knife cutting",
                    "End-to-end fabric shrinkage & torque testing baths",
                  ],
                },
                {
                  num: "02",
                  title: "Assembly & knitting lines",
                  items: [
                    "Direct-drive programmable lockstitch & 5-thread overlockers",
                    "Computerized multi-gauge Shima Seiki / Stoll flatbed knitters",
                    "Laser contour cutting & ultrasonic seam-bonding lines",
                  ],
                },
                {
                  num: "03",
                  title: "Finishing & quality assurance",
                  items: [
                    "Suction vacuum pressing boards & garment steamers",
                    "Hasima dual-sensor conveyor needle detection stations",
                    "AQL 1.5 / 2.5 standard pre-dispatch inspection protocols",
                  ],
                },
              ].map((suite) => (
                <div
                  key={suite.num}
                  className="p-5 bg-[#F7F8FA] border border-[#E4E4E7] rounded-md space-y-3"
                >
                  <div className="text-xs text-[#2D5BE3] font-medium">Suite {suite.num}</div>
                  <h4 className="text-sm font-semibold text-[#18181B]">{suite.title}</h4>
                  <ul className="space-y-1.5">
                    {suite.items.map((item, i) => (
                      <li key={i} className="text-sm text-[#71717A] flex items-start gap-2">
                        <span className="text-[#E4E4E7] mt-0.5">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {activeTab === "certifications" && (
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#18181B] mb-1">
                Certifications &amp; compliance records
              </h3>
              <p className="text-sm text-[#71717A]">
                Validated against international accreditation databases for environmental safety and fair labor standards.
              </p>
            </div>

            {enterprise.certifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#71717A]">
                No certifications on record.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enterprise.certifications.map((cert) => {
                  const status = getCertStatus(cert.expiryDate);
                  return (
                    <div
                      key={cert.id}
                      className="p-4 border border-[#E4E4E7] bg-[#F7F8FA] rounded-md flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-[#EFF4FF] flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4 text-[#2D5BE3]" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-[#18181B]">
                            {cert.name}
                          </div>
                          <div className="text-xs text-[#71717A]">
                            Issued by {cert.issuer}
                            {cert.certificateNumber && ` — ${cert.certificateNumber}`}
                          </div>
                          {cert.expiryDate && (
                            <div className="text-xs text-[#71717A]">
                              {cert.issueDate
                                ? `${new Date(cert.issueDate as string).toLocaleDateString("en-US", { month: "short", year: "numeric" })} – `
                                : ""}
                              {new Date(cert.expiryDate as string).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          <span className={badgeClass(status.type)}>{status.label}</span>
                        </div>
                      </div>
                      {cert.certificateFileUrl && (
                        <a
                          href={cert.certificateFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#2D5BE3] hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#18181B] mb-1">
                Products from {enterprise.name}
              </h3>
              <p className="text-sm text-[#71717A]">
                Garment samples configured for tech-pack replication and bulk contract cutting.
              </p>
            </div>

            {enterprise.products.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#71717A]">
                No products listed yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enterprise.products.map((product) => {
                  let images: string[] = [];
                  try {
                    images = JSON.parse(product.images);
                  } catch {
                    images = [product.images];
                  }
                  const displayImage =
                    images[0] ||
                    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600";

                  return (
                    <div
                      key={product.id}
                      className="border border-[#E4E4E7] hover:border-[#2D5BE3] bg-white rounded-md overflow-hidden flex flex-col transition-colors"
                    >
                      <div className="relative h-44 bg-[#F7F8FA]">
                        <img
                          src={displayImage}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 badge badge-neutral text-xs">
                          {product.category.name}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <Link href={`/products/${product.slug}`}>
                          <h4 className="text-sm font-semibold text-[#18181B] hover:text-[#2D5BE3] line-clamp-1 transition-colors mb-2">
                            {product.title}
                          </h4>
                        </Link>

                        <div className="text-xs text-[#71717A] space-y-0.5 mb-3 flex-1">
                          <div>
                            <span className="font-medium">Fabric: </span>
                            {product.fabricType}
                          </div>
                          {product.gsmWeight && (
                            <div>
                              <span className="font-medium">Weight: </span>
                              {product.gsmWeight} GSM
                            </div>
                          )}
                          <div>
                            <span className="font-medium">MOQ: </span>
                            {product.moq.toLocaleString()} pcs
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E4E4E7]">
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-sm text-[#2D5BE3] hover:underline"
                          >
                            View specs
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
                            className="px-3 py-1.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors cursor-pointer"
                          >
                            Request quote
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RFQ tab */}
        {activeTab === "rfq" && (
          <div id="rfq" className="p-8">
            <div className="max-w-lg mx-auto text-center space-y-4 py-8">
              <div className="w-12 h-12 rounded-full bg-[#EFF4FF] flex items-center justify-center mx-auto">
                <Send className="w-5 h-5 text-[#2D5BE3]" />
              </div>
              <h3 className="text-lg font-semibold text-[#18181B]">
                Submit a sourcing request to {enterprise.name}
              </h3>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Your inquiry will be logged with the GAN trade desk and transmitted directly to the export merchandising team at {enterprise.name}.
              </p>
              <button
                onClick={() => {
                  setSelectedProductForQuote(null);
                  setIsQuoteModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Open quote form
              </button>
            </div>
          </div>
        )}
      </div>

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
