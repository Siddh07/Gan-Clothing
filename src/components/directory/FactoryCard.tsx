"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Send } from "lucide-react";
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
        <div className="bg-white border border-[#E4E4E7] p-5 hover:border-[#2D5BE3] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-md">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Logo / avatar */}
            <div className="w-12 h-12 bg-[#F7F8FA] border border-[#E4E4E7] rounded shrink-0 overflow-hidden flex items-center justify-center">
              {factory.coverImageUrl ? (
                <img
                  src={factory.coverImageUrl}
                  alt={factory.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-[#71717A]" />
              )}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/directory/${factory.slug}`}
                  className="text-sm font-semibold text-[#18181B] hover:text-[#2D5BE3] transition-colors"
                >
                  {factory.name}
                </Link>
                {factory.isVerified && (
                  <span className="badge badge-success">Accredited</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#71717A]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {factory.city}, Nepal
                </span>
                <span>Est. {factory.yearEstablished}</span>
                <span>{factory.employeeCount} workers</span>
                <span className="font-medium text-[#18181B]">
                  {factory.monthlyCapacityPcs.toLocaleString()} pcs/mo
                </span>
              </div>

              <p className="text-sm text-[#71717A] line-clamp-1 max-w-2xl">
                {factory.description}
              </p>

              <div className="flex flex-wrap gap-1 pt-0.5">
                {factory.certifications.map((cert) => (
                  <span key={cert.id} className="badge badge-neutral text-xs">
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E4E4E7]">
            <Link
              href={`/directory/${factory.slug}`}
              className="px-3 py-1.5 text-sm text-[#71717A] border border-[#E4E4E7] rounded hover:bg-[#F7F8FA] transition-colors"
            >
              View profile
            </Link>
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Request quote
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
      <div className="bg-white border border-[#E4E4E7] hover:border-[#2D5BE3] transition-colors overflow-hidden flex flex-col rounded-md">
        {/* Cover image */}
        <div className="relative h-40 w-full bg-[#F7F8FA] border-b border-[#E4E4E7]">
          {factory.coverImageUrl ? (
            <img
              src={factory.coverImageUrl}
              alt={factory.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#71717A]">
              <Building2 className="w-7 h-7" />
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            {factory.isVerified && (
              <span className="badge badge-success bg-white/95">Accredited</span>
            )}
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-black/70 text-white rounded">
              <MapPin className="w-2.5 h-2.5" />
              {factory.city}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2">
            <div className="text-xs text-[#71717A] mb-0.5">
              Est. {factory.yearEstablished}
            </div>
            <Link href={`/directory/${factory.slug}`}>
              <h3 className="font-semibold text-sm text-[#18181B] hover:text-[#2D5BE3] line-clamp-1 transition-colors">
                {factory.name}
              </h3>
            </Link>
          </div>

          <p className="text-sm text-[#71717A] line-clamp-2 leading-relaxed mb-3 flex-1">
            {factory.description}
          </p>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#E4E4E7] text-sm mb-3">
            <div>
              <div className="text-xs text-[#71717A]">Capacity</div>
              <div className="font-medium text-[#18181B]">
                {factory.monthlyCapacityPcs.toLocaleString()} pcs/mo
              </div>
            </div>
            <div>
              <div className="text-xs text-[#71717A]">Workforce</div>
              <div className="font-medium text-[#18181B]">
                {factory.employeeCount} staff
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-1 mb-4">
            {factory.certifications.slice(0, 3).map((cert) => (
              <span key={cert.id} className="badge badge-neutral text-xs">
                {cert.name}
              </span>
            ))}
            {factory.certifications.length > 3 && (
              <span className="text-xs text-[#71717A] px-1.5 py-0.5 bg-[#F7F8FA] border border-[#E4E4E7] rounded">
                +{factory.certifications.length - 3}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/directory/${factory.slug}`}
              className="text-sm text-[#2D5BE3] hover:underline"
            >
              View profile
            </Link>
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Request quote
            </button>
          </div>
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
