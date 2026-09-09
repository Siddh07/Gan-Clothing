"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Users,
  Layers,
  ArrowRight,
  Send,
  CheckCircle,
} from "lucide-react";
import { QuoteModal } from "@/components/public/QuoteModal";

interface Certification {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  fabricType: string;
}

export interface FactoryCardProps {
  factory: {
    id: string;
    name: string;
    slug: string;
    description: string;
    city: string;
    address: string;
    yearEstablished: number;
    employeeCount: number;
    monthlyCapacityPcs: number;
    exportMarkets: string;
    isVerified: boolean;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    certifications: Certification[];
    products: Product[];
  };
  viewMode?: "grid" | "list";
}

export function FactoryCard({ factory, viewMode = "grid" }: FactoryCardProps) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  if (viewMode === "list") {
    return (
      <>
        <div className="bg-white border border-[#E1E4E7] p-5 hover:border-[#1E3A52] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-14 h-14 bg-[#F6F7F8] shrink-0 overflow-hidden border border-[#E1E4E7]">
              {factory.coverImageUrl ? (
                <img
                  src={factory.coverImageUrl}
                  alt={factory.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/directory/${factory.slug}`}
                  className="text-sm font-bold text-[#0D0D0D] hover:underline font-sans"
                >
                  {factory.name}
                </Link>
                {factory.isVerified && (
                  <span className="tag-approved text-[9px]">
                    ACCREDITED
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-mono text-[#6B7280]">
                <span>{factory.city.toUpperCase()}, NEPAL</span>
                <span>•</span>
                <span>EST. {factory.yearEstablished}</span>
                <span>•</span>
                <span>{factory.employeeCount} ARTISANS</span>
                <span>•</span>
                <span className="font-bold text-[#0D0D0D]">
                  {factory.monthlyCapacityPcs.toLocaleString()} PCS/MO
                </span>
              </div>

              <p className="text-xs text-[#6B7280] line-clamp-2 pt-0.5 max-w-2xl font-sans">
                {factory.description}
              </p>

              {/* Certifications */}
              <div className="flex flex-wrap gap-1 pt-1">
                {factory.certifications.map((cert) => (
                  <span
                    key={cert.id}
                    className="tag-neutral text-[9px]"
                  >
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E1E4E7]">
            <Link
              href={`/directory/${factory.slug}`}
              className="px-3 py-1.5 text-xs font-mono text-[#0D0D0D] bg-[#F6F7F8] border border-[#E1E4E7] hover:bg-white transition-colors"
            >
              TECHNICAL DOSSIER
            </Link>
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="px-3 py-1.5 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] transition-colors inline-flex items-center cursor-pointer"
            >
              <Send className="w-3 h-3 mr-1.5" />
              DISPATCH RFQ
            </button>
          </div>
        </div>

        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          enterpriseId={factory.id}
          enterpriseName={factory.name}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#E1E4E7] hover:border-[#1E3A52] transition-colors overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header Image */}
          <div className="relative h-40 w-full bg-[#F6F7F8] border-b border-[#E1E4E7]">
            {factory.coverImageUrl ? (
              <img
                src={factory.coverImageUrl}
                alt={factory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div className="absolute top-2.5 right-2.5">
              {factory.isVerified && (
                <span className="tag-approved text-[9px] bg-white/95">
                  ACCREDITED MILL
                </span>
              )}
            </div>
            <div className="absolute bottom-2.5 left-2.5">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-[#0D0D0D]/90 text-white">
                <MapPin className="w-2.5 h-2.5 mr-1 text-[#C5A059]" />
                {factory.city.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-2.5">
            <div>
              <span className="text-[10px] font-mono text-[#6B7280]">
                REGISTRY ID: #{factory.slug.toUpperCase().slice(0, 8)} • EST. {factory.yearEstablished}
              </span>
              <Link href={`/directory/${factory.slug}`} className="block mt-0.5">
                <h3 className="font-bold text-sm text-[#0D0D0D] hover:underline font-sans line-clamp-1">
                  {factory.name}
                </h3>
              </Link>
            </div>

            <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-sans">
              {factory.description}
            </p>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#E1E4E7] text-xs font-mono">
              <div>
                <span className="text-[#6B7280] block text-[10px]">CAPACITY:</span>
                <span className="font-bold text-[#0D0D0D]">
                  {factory.monthlyCapacityPcs.toLocaleString()} pcs/mo
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[10px]">WORKFORCE:</span>
                <span className="font-bold text-[#0D0D0D]">
                  {factory.employeeCount} staff
                </span>
              </div>
            </div>

            {/* Certifications badges */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {factory.certifications.slice(0, 3).map((cert) => (
                <span
                  key={cert.id}
                  className="tag-neutral text-[9px]"
                >
                  {cert.name}
                </span>
              ))}
              {factory.certifications.length > 3 && (
                <span className="text-[9px] font-mono text-[#6B7280] px-1 py-0.5 bg-[#F6F7F8] border border-[#E1E4E7]">
                  +{factory.certifications.length - 3} MORE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[#E1E4E7] mt-2 pt-3 font-mono text-xs">
          <Link
            href={`/directory/${factory.slug}`}
            className="text-[#1E3A52] hover:underline text-[11px]"
          >
            TECHNICAL DOSSIER
          </Link>
          <button
            onClick={() => setIsQuoteOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] transition-colors inline-flex items-center cursor-pointer"
          >
            <Send className="w-3 h-3 mr-1" />
            DISPATCH RFQ
          </button>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        enterpriseId={factory.id}
        enterpriseName={factory.name}
      />
    </>
  );
}
