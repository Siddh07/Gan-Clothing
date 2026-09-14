import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface ProductSpecCardProps {
  id: string;
  title: string;
  slug: string;
  sku?: string | null;
  gsm?: number | string | null;
  category?: string | null;
  imageUrl?: string | null;
  moq?: number | null;
  price?: number | string | null;
  enterpriseName?: string | null;
  enterpriseSlug?: string | null;
  material?: string | null;
}

export function ProductSpecCard({
  title,
  slug,
  sku,
  gsm,
  category,
  imageUrl,
  moq,
  price,
  enterpriseName,
  enterpriseSlug,
  material,
}: ProductSpecCardProps) {
  const displaySku = sku || `HB-${slug.slice(0, 6).toUpperCase()}`;
  const displayGsm = gsm ? `${gsm} GSM` : "400 GSM";

  return (
    <div className="group relative flex flex-col bg-white border border-[#DFD8CE] hover:border-[#231F20] transition-colors duration-200">
      {/* 4:5 Aspect Ratio Media Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#DFD8CE]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#DFD8CE] text-[#5E5F5A]">
            <span className="font-mono text-[9px] tracking-widest uppercase">
              SPECIMEN MEDIA
            </span>
            <span className="font-mono text-[11px] text-[#231F20] mt-1 font-medium text-center">
              {title}
            </span>
          </div>
        )}

        {/* Spec Bar / Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="bg-[#231F20] text-white font-mono text-[9px] tracking-wider px-1.5 py-0.5 uppercase">
            {displaySku}
          </span>
          <span className="bg-[#DFD8CE] text-[#231F20] border border-[#231F20]/20 font-mono text-[9px] font-medium tracking-wide px-1.5 py-0.5">
            {displayGsm}
          </span>
        </div>

        {/* Micro Category Overlay */}
        {category && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-xs text-[#231F20] font-mono text-[9px] px-1.5 py-0.5 border border-[#DFD8CE] uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Metadata & Editorial Details */}
      <div className="flex flex-col flex-1 p-3.5 justify-between gap-3 bg-white">
        <div>
          {/* Mill Attribution */}
          {enterpriseName && (
            <div className="text-[11px] font-mono text-[#5E5F5A] mb-1 truncate">
              {enterpriseSlug ? (
                <Link
                  href={`/directory/${enterpriseSlug}`}
                  className="hover:text-[#231F20] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
                >
                  {enterpriseName}
                </Link>
              ) : (
                enterpriseName
              )}
            </div>
          )}

          {/* Title with directional link */}
          <h3 className="text-[13px] font-bold text-[#231F20] uppercase tracking-tight leading-snug">
            <Link
              href={`/products/${slug}`}
              className="inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
            >
              <span>{title}</span>
              <span className="inline-block font-mono text-[13px] transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </h3>

          {/* Technical Specs line */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#5E5F5A]">
            {material && <span>{material}</span>}
            {moq && (
              <span>
                MOQ: <strong className="text-[#231F20] font-medium">{moq.toLocaleString()} pcs</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action / Procurement Spec Footer */}
        <div className="pt-2 border-t border-[#DFD8CE] flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#5E5F5A]">
            {price ? (
              <span className="text-[#231F20] font-semibold">${price} FOB</span>
            ) : (
              "INQUIRE FOB"
            )}
          </span>
          <Link
            href={`/products/${slug}`}
            className="text-[11px] font-mono text-[#231F20] font-medium tracking-wide uppercase hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
          >
            VIEW SPEC →
          </Link>
        </div>
      </div>
    </div>
  );
}
