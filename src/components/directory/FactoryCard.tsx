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
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
              {factory.coverImageUrl ? (
                <img
                  src={factory.coverImageUrl}
                  alt={factory.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/directory/${factory.slug}`}
                  className="font-outfit text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  {factory.name}
                </Link>
                {factory.isVerified && (
                  <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-700" />
                  {factory.city}, Nepal
                </span>
                <span>Est. {factory.yearEstablished}</span>
                <span>{factory.employeeCount} craftspeople</span>
                <span className="font-semibold text-slate-700">
                  {factory.monthlyCapacityPcs.toLocaleString()} pcs / mo
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 pt-1 max-w-2xl">
                {factory.description}
              </p>

              {/* Certifications */}
              <div className="flex flex-wrap gap-1 pt-1">
                {factory.certifications.map((cert) => (
                  <span
                    key={cert.id}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                  >
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <Link
              href={`/directory/${factory.slug}`}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              View Plant Profile
            </Link>
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors inline-flex items-center shadow-xs"
            >
              <Send className="w-3 h-3 mr-1.5" />
              Request RFQ
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header Image */}
          <div className="relative h-44 w-full bg-slate-100">
            {factory.coverImageUrl ? (
              <img
                src={factory.coverImageUrl}
                alt={factory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div className="absolute top-3 right-3 flex space-x-1.5">
              {factory.isVerified && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-700 text-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified
                </span>
              )}
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900/80 text-white backdrop-blur-xs">
                <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
                {factory.city}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 space-y-3">
            <div>
              <span className="text-[11px] text-slate-700 font-medium">
                Est. {factory.yearEstablished}
              </span>
              <Link href={`/directory/${factory.slug}`} className="block">
                <h3 className="font-outfit text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
                  {factory.name}
                </h3>
              </Link>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {factory.description}
            </p>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-700 block text-[11px]">Monthly Capacity:</span>
                <span className="font-bold text-slate-900">
                  {factory.monthlyCapacityPcs.toLocaleString()} pcs
                </span>
              </div>
              <div>
                <span className="text-slate-700 block text-[11px]">Artisans/Labor:</span>
                <span className="font-bold text-slate-900">
                  {factory.employeeCount} staff
                </span>
              </div>
            </div>

            {/* Certifications badges */}
            <div className="flex flex-wrap gap-1 pt-1">
              {factory.certifications.slice(0, 3).map((cert) => (
                <span
                  key={cert.id}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100"
                >
                  {cert.name}
                </span>
              ))}
              {factory.certifications.length > 3 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  +{factory.certifications.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-0 flex items-center justify-between gap-2">
          <Link
            href={`/directory/${factory.slug}`}
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors inline-flex items-center"
          >
            Profile & Specs
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <button
            onClick={() => setIsQuoteOpen(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors inline-flex items-center shadow-xs"
          >
            <Send className="w-3 h-3 mr-1.5" />
            Request Quote
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
