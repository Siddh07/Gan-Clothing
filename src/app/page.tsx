import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductSpecCard } from "@/components/ProductSpecCard";
import { ProductionSection } from "@/components/ProductionSection";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nepal Garment Export Registry // Apex B2B Sourcing Architecture",
  description:
    "Official institutional registry for verified Nepalese ready-made garment and textile manufacturers. Heavyweight blanks, combed jersey, Himalayan natural fibers. 0% US import duty under NTPA, WRAP and ILO certified.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nepal Garment Export Registry // Apex B2B Sourcing Architecture",
    description:
      "Direct procurement from verified Nepalese RMG manufacturers. FOB Nepal, 0% US duty under NTPA, ILO LDC Graduation Project.",
    url: "/",
  },
};

export default async function HomePage() {
  const [
    enterpriseCount,
    productCount,
    featuredEnterprises,
    categories,
    verifiedCount,
    specimenProducts,
    totalCapacity,
  ] = await Promise.all([
    prisma.enterprise.count(),
    prisma.product.count(),
    prisma.enterprise.findMany({
      where: { isVerified: true },
      include: {
        certifications: true,
        products: { take: 2 },
      },
      take: 4,
      orderBy: { monthlyCapacityPcs: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.enterprise.count({
      where: { isVerified: true },
    }),
    prisma.product.findMany({
      take: 8,
      include: {
        enterprise: {
          select: { name: true, slug: true, isVerified: true },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enterprise.aggregate({
      _sum: { monthlyCapacityPcs: true },
    }),
  ]);

  const capacitySum = totalCapacity._sum.monthlyCapacityPcs || 865000;
  const capacityFormatted = `${(capacitySum / 1000).toLocaleString()}K`;

  return (
    <>
      <OrganizationJsonLd
        name="Garment Association of Nepal (GAN)"
        url="https://ganb2b.org.np"
        description="Apex trade organization and official registry of verified Nepalese ready-made garment and textile exporters. Supported by the ILO LDC Graduation Project."
        address="Sankhamul, Kathmandu, Nepal"
        email="ganasso2011@gmail.com"
        telephone="+977-1-4350123"
      />

      <div className="flex flex-col bg-[#F2F2F2] text-[#231F20]">
        {/* ─── 1. Asymmetric Hero (8:4 Split) ─── */}
        <section className="bg-white border-b border-[#DFD8CE]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DFD8CE]">
              {/* Left Column (8 / 12 Split) */}
              <div className="lg:col-span-8 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-[#231F20]" />
                    <span className="font-mono text-[9px] sm:text-[11px] tracking-widest uppercase text-[#5E5F5A]">
                      INSTITUTIONAL PROCUREMENT ARCHITECTURE // SPECIMEN TRADE DESK
                    </span>
                  </div>

                  <h1 className="text-[35px] sm:text-[43px] font-bold tracking-tight text-[#231F20] uppercase leading-[1.05] max-w-3xl mb-6">
                    HEAVYWEIGHT BLANKS, TECHNICAL KNITTING &amp; VERIFIED EXPORT
                    REGISTRY.
                  </h1>

                  <p className="text-[13px] text-[#5E5F5A] leading-relaxed max-w-2xl mb-8">
                    Direct wholesale and contract procurement gateway to Nepal’s
                    apex textile mills. Sourcing combed cotton fleece (350–500
                    GSM), custom-milled jersey, and high-altitude Himalayan
                    natural fibers under WRAP social audit standards. Eligible
                    for zero-tariff US import under the Nepal Trade Preference
                    Act.
                  </p>

                  {/* Primary CTA Cluster */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/products"
                      className="bg-[#231F20] text-white hover:bg-[#5E5F5A] text-[11px] font-mono tracking-wider uppercase px-6 py-3.5 rounded-none inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
                    >
                      <span>EXPLORE SPECIMEN CATALOG</span>
                      <span className="font-mono">→</span>
                    </Link>

                    <Link
                      href="/rfq"
                      className="bg-[#F2F2F2] hover:bg-[#DFD8CE] border border-[#DFD8CE] text-[#231F20] text-[11px] font-mono tracking-wider uppercase px-6 py-3.5 rounded-none inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#231F20]"
                    >
                      <span>SUBMIT CONTRACT RFQ</span>
                      <span className="font-mono">+</span>
                    </Link>

                    <Link
                      href="/directory"
                      className="text-[11px] font-mono text-[#5E5F5A] hover:text-[#231F20] uppercase underline underline-offset-4 px-2 py-3 transition-colors"
                    >
                      VERIFIED MILL DIRECTORY ({verifiedCount || enterpriseCount})
                    </Link>
                  </div>
                </div>

                {/* Micro Spec Ledger at Base of Hero */}
                <div className="mt-10 pt-6 border-t border-[#DFD8CE] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[9px] text-[#5E5F5A]">
                  <div>
                    <div className="text-[#231F20] font-bold uppercase">
                      DOMESTIC DISPATCH
                    </div>
                    <div>24–48H INVENTORY TURN</div>
                  </div>
                  <div>
                    <div className="text-[#231F20] font-bold uppercase">
                      CUSTOM MILLING
                    </div>
                    <div>14–21 DAYS PRODUCTION</div>
                  </div>
                  <div>
                    <div className="text-[#231F20] font-bold uppercase">
                      EXPORT FREIGHT
                    </div>
                    <div>FOB BIRGUNJ / KTM AIR</div>
                  </div>
                  <div>
                    <div className="text-[#231F20] font-bold uppercase">
                      TARIFF PROFILE
                    </div>
                    <div>0% DUTY US / EU EBA</div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 / 12 Split): Live Sourcing Telemetry & Aggregates */}
              <div className="lg:col-span-4 bg-[#F2F2F2] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DFD8CE]">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#231F20]">
                      REGISTRY TELEMETRY
                    </span>
                    <span className="font-mono text-[9px] text-[#5E5F5A]">
                      LIVE SYNC
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 border border-[#DFD8CE]">
                      <div className="font-mono text-[9px] text-[#5E5F5A] uppercase tracking-wider mb-1">
                        VERIFIED APEX MILLS
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[22px] font-bold text-[#231F20]">
                          {verifiedCount || enterpriseCount}
                        </span>
                        <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                          100% COMPLIANT
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 border border-[#DFD8CE]">
                      <div className="font-mono text-[9px] text-[#5E5F5A] uppercase tracking-wider mb-1">
                        ACTIVE PRODUCT SPECIMENS
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[22px] font-bold text-[#231F20]">
                          {productCount}
                        </span>
                        <span className="font-mono text-[9px] text-[#5E5F5A]">
                          RAW / FINISHED
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 border border-[#DFD8CE]">
                      <div className="font-mono text-[9px] text-[#5E5F5A] uppercase tracking-wider mb-1">
                        AGGREGATE MONTHLY CAPACITY
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[22px] font-bold text-[#231F20]">
                          {capacityFormatted}
                        </span>
                        <span className="font-mono text-[9px] text-[#5E5F5A]">
                          PCS / MONTH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Architecture Details */}
                  <div className="mt-6 border border-[#DFD8CE] bg-white divide-y divide-[#DFD8CE] font-mono text-[11px]">
                    <div className="p-2.5 flex items-center justify-between text-[#5E5F5A]">
                      <span>US TARIFF CODE:</span>
                      <strong className="text-[#231F20]">HTS 9822.06.00</strong>
                    </div>
                    <div className="p-2.5 flex items-center justify-between text-[#5E5F5A]">
                      <span>INSPECTION STANDARD:</span>
                      <strong className="text-[#231F20]">AQL 1.5 / 2.5</strong>
                    </div>
                    <div className="p-2.5 flex items-center justify-between text-[#5E5F5A]">
                      <span>SOCIAL GOVERNANCE:</span>
                      <strong className="text-[#231F20]">WRAP / SEDEX</strong>
                    </div>
                    <div className="p-2.5 flex items-center justify-between text-[#5E5F5A]">
                      <span>DISPATCH INTERACTION:</span>
                      <strong className="text-[#231F20]">FOB / CIF GLOBAL</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DFD8CE] flex items-center justify-between font-mono text-[9px] text-[#5E5F5A]">
                  <span>AUTHENTICATED VIA PRISMA ORM</span>
                  <span className="w-1.5 h-1.5 bg-[#231F20]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. Moving Category Carousel Ticker ─── */}
        <section className="bg-[#DFD8CE] border-b border-[#231F20]/20 overflow-hidden relative group select-none">
          <div className="flex items-center">
            {/* Fixed Anchor Label */}
            <div className="shrink-0 z-10 bg-[#DFD8CE] px-4 py-2.5 flex items-center gap-2 border-r border-[#231F20]/20 font-mono text-[11px] font-bold text-[#231F20] uppercase tracking-wider">
              <span className="inline-block w-1.5 h-1.5 bg-[#231F20] rounded-full animate-pulse" />
              <span>SPEC SECTORS:</span>
            </div>

            {/* Moving Marquee Track with Pause on Hover */}
            <div className="overflow-hidden flex-1 relative">
              <div className="animate-marquee flex items-center gap-6 text-[11px] font-mono whitespace-nowrap py-2.5">
                {/* Loop Segment A */}
                {[...categories, ...categories].map((cat, idx) => (
                  <Link
                    key={`cat-a-${cat.id}-${idx}`}
                    href={`/products?category=${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-[#231F20] hover:text-[#5E5F5A] transition-colors border-b border-transparent hover:border-[#231F20] uppercase tracking-wider shrink-0"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[#5E5F5A] text-[9px]">
                      [{cat._count?.products ?? 0}]
                    </span>
                    <span className="text-[#231F20]/30 ml-4 font-normal">/</span>
                  </Link>
                ))}

                {/* Loop Segment B (Identical clone for seamless infinite loop) */}
                {[...categories, ...categories].map((cat, idx) => (
                  <Link
                    key={`cat-b-${cat.id}-${idx}`}
                    href={`/products?category=${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-[#231F20] hover:text-[#5E5F5A] transition-colors border-b border-transparent hover:border-[#231F20] uppercase tracking-wider shrink-0"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[#5E5F5A] text-[9px]">
                      [{cat._count?.products ?? 0}]
                    </span>
                    <span className="text-[#231F20]/30 ml-4 font-normal">/</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. Standard Spec Grid (4-Column Hairline Grid) ─── */}
        <section className="bg-white border-b border-[#DFD8CE]">
          <div className="max-w-7xl mx-auto">
            {/* Header Bar */}
            <div className="p-4 sm:p-6 border-b border-[#DFD8CE] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[9px] text-[#5E5F5A] tracking-widest uppercase block mb-1">
                  CURATED ARCHIVE // PRODUCTION APPAREL BLANKS
                </span>
                <h2 className="text-[18px] sm:text-[22px] font-bold text-[#231F20] tracking-tight uppercase">
                  STANDARD SPECIMEN SPECIFICATIONS
                </h2>
              </div>
              <Link
                href="/products"
                className="font-mono text-[11px] text-[#231F20] font-medium tracking-wide uppercase hover:underline inline-flex items-center gap-1"
              >
                <span>VIEW FULL CATALOG ({productCount} STYLES)</span>
                <span>→</span>
              </Link>
            </div>

            {/* 4-Column Hairline Specimen Grid */}
            {specimenProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DFD8CE]">
                {specimenProducts.map((product) => {
                  let parsedImage: string | null = null;
                  try {
                    const imgArr = JSON.parse(product.images);
                    if (Array.isArray(imgArr) && imgArr.length > 0) {
                      parsedImage = imgArr[0];
                    }
                  } catch {
                    // Fallback
                  }

                  return (
                    <div key={product.id} className="p-3 sm:p-4">
                      <ProductSpecCard
                        id={product.id}
                        title={product.title}
                        slug={product.slug}
                        gsm={product.gsmWeight}
                        material={product.fabricType}
                        category={product.category?.name}
                        moq={product.moq}
                        imageUrl={parsedImage}
                        enterpriseName={product.enterprise?.name}
                        enterpriseSlug={product.enterprise?.slug}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center font-mono text-[11px] text-[#5E5F5A]">
                NO SPECIMENS RECORDED IN ACTIVE TELEMETRY ARCHIVE
              </div>
            )}
          </div>
        </section>

        {/* ─── 4. Our Production (Knitting Mill / Dye House / Sewing Factory) ─── */}
        <ProductionSection />

        {/* ─── 5. Verified Enterprise Registry Matrix ─── */}
        <section className="bg-[#F2F2F2] border-b border-[#DFD8CE] py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <span className="font-mono text-[9px] text-[#5E5F5A] tracking-widest uppercase block mb-1">
                  APEX MILL ROSTER // AUDITED ENTERPRISES
                </span>
                <h2 className="text-[18px] sm:text-[22px] font-bold text-[#231F20] tracking-tight uppercase">
                  VERIFIED MANUFACTURER INDEX
                </h2>
              </div>
              <Link
                href="/directory"
                className="font-mono text-[11px] text-[#231F20] font-medium tracking-wide uppercase hover:underline inline-flex items-center gap-1"
              >
                <span>ACCESS FULL ROSTER ({verifiedCount || enterpriseCount} MILLS)</span>
                <span>→</span>
              </Link>
            </div>

            {/* Matrix of Audited Mills */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredEnterprises.map((enterprise) => (
                <div
                  key={enterprise.id}
                  className="bg-white border border-[#DFD8CE] p-5 flex flex-col justify-between hover:border-[#231F20] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#5E5F5A] mb-2 pb-2 border-b border-[#DFD8CE]">
                      <span>EST. {enterprise.yearEstablished}</span>
                      <span className="text-[#231F20] font-bold">
                        {enterprise.city.toUpperCase()}, NEPAL
                      </span>
                    </div>

                    <h3 className="text-[14px] font-bold text-[#231F20] uppercase tracking-tight mb-2">
                      <Link
                        href={`/directory/${enterprise.slug}`}
                        className="hover:underline"
                      >
                        {enterprise.name}
                      </Link>
                    </h3>

                    <p className="text-[11px] text-[#5E5F5A] line-clamp-3 leading-relaxed mb-4">
                      {enterprise.description}
                    </p>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] text-[#5E5F5A] mb-3 space-y-1 pt-3 border-t border-[#DFD8CE]">
                      <div className="flex justify-between">
                        <span>CAPACITY:</span>
                        <strong className="text-[#231F20]">
                          {(enterprise.monthlyCapacityPcs / 1000).toFixed(0)}K
                          PCS/MO
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>LABOR FORCE:</span>
                        <strong className="text-[#231F20]">
                          {enterprise.employeeCount} SPECIALISTS
                        </strong>
                      </div>
                    </div>

                    {/* Cert Badges */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {enterprise.certifications.map((c) => (
                        <span
                          key={c.id}
                          className="bg-[#F2F2F2] text-[#231F20] border border-[#DFD8CE] font-mono text-[9px] px-1.5 py-0.5"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/directory/${enterprise.slug}`}
                      className="block text-center font-mono text-[11px] uppercase tracking-wider bg-[#F2F2F2] hover:bg-[#231F20] hover:text-white text-[#231F20] py-2 transition-colors border border-[#DFD8CE]"
                    >
                      INSPECT MILL PROFILE →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. B2B Service Footprint ─── */}
        <section className="bg-white border-b border-[#DFD8CE]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#DFD8CE]">
              {/* Pillar 1: Direct Wholesale Account Access */}
              <div className="p-8 sm:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-[#231F20]" />
                    <span className="font-mono text-[11px] tracking-widest uppercase text-[#5E5F5A]">
                      SERVICE SPECIMEN // SECTION A
                    </span>
                  </div>

                  <h3 className="text-[22px] sm:text-[29px] font-bold text-[#231F20] tracking-tight uppercase mb-4">
                    DIRECT WHOLESALE ACCOUNT ACCESS
                  </h3>

                  <p className="text-[13px] text-[#5E5F5A] leading-relaxed mb-6">
                    Establish an institutional procurement agreement directly
                    with GAN-accredited apparel manufacturers. Receive
                    negotiated volume tier pricing, dedicated monthly production
                    allocations, physical swatch binders, and direct port FOB
                    terms.
                  </p>

                  <div className="bg-[#F2F2F2] border border-[#DFD8CE] divide-y divide-[#DFD8CE] font-mono text-[11px] mb-8">
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">TIER 1 (STARTER BULK):</span>
                      <strong className="text-[#231F20]">500 – 2,500 UNITS / STYLE</strong>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">TIER 2 (CONTRACT SCALE):</span>
                      <strong className="text-[#231F20]">2,500 – 10,000 UNITS / STYLE</strong>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">ENTERPRISE CUSTOM:</span>
                      <strong className="text-[#231F20]">10,000+ DEDICATED LINES</strong>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">PAYMENT TERMS:</span>
                      <strong className="text-[#231F20]">LC / CAD / TT WIRE</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href="/apply"
                    className="inline-flex items-center gap-2 bg-[#231F20] text-white hover:bg-[#5E5F5A] text-[11px] font-mono uppercase tracking-wider px-6 py-3.5 transition-colors"
                  >
                    <span>APPLY FOR WHOLESALE ACCOUNT</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Contract Milling & Dye Lab */}
              <div className="p-8 sm:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-[#231F20]" />
                    <span className="font-mono text-[11px] tracking-widest uppercase text-[#5E5F5A]">
                      SERVICE SPECIMEN // SECTION B
                    </span>
                  </div>

                  <h3 className="text-[22px] sm:text-[29px] font-bold text-[#231F20] tracking-tight uppercase mb-4">
                    CONTRACT MILLING &amp; DYE LAB
                  </h3>

                  <p className="text-[13px] text-[#5E5F5A] leading-relaxed mb-6">
                    Bespoke fabric engineering from raw fiber to finished blank.
                    Full Pantone TCX laboratory color matching, custom tubular or
                    open-width knitting, brushing, carbon finishing, enzyme
                    washes, and private label neck tapings.
                  </p>

                  <div className="bg-[#F2F2F2] border border-[#DFD8CE] divide-y divide-[#DFD8CE] font-mono text-[11px] mb-8">
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">LAB DIP TURNAROUND:</span>
                      <strong className="text-[#231F20]">5 BUSINESS DAYS</strong>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">FABRIC WEIGHT SPECS:</span>
                      <strong className="text-[#231F20]">180 GSM TO 600 GSM</strong>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">FINISHING CAPABILITIES:</span>
                      <strong className="text-[#231F20]">ENZYME / SUEDED / ACID</strong>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#5E5F5A]">TESTING PROTOCOL:</span>
                      <strong className="text-[#231F20]">AATCC 4-POINT INSPECTION</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href="/rfq"
                    className="inline-flex items-center gap-2 bg-[#231F20] text-white hover:bg-[#5E5F5A] text-[11px] font-mono uppercase tracking-wider px-6 py-3.5 transition-colors"
                  >
                    <span>SUBMIT SPECIFICATION RFQ</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. Global Duty Exemption & Institutional Mandate ─── */}
        <section className="bg-[#F2F2F2] py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto border border-[#DFD8CE] bg-white p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-3xl">
                <span className="font-mono text-[9px] text-[#5E5F5A] tracking-widest uppercase block mb-1">
                  TRADE ACCORD COMPLIANCE MANDATE
                </span>
                <h4 className="text-[16px] font-bold text-[#231F20] uppercase tracking-tight mb-2">
                  NEPAL TRADE PREFERENCE ACT (NTPA) &amp; ILO LDC GRADUATION
                </h4>
                <p className="text-[11px] text-[#5E5F5A] leading-relaxed">
                  Established under Public Law 114-125, the Nepal Trade
                  Preference Act authorizes duty-free import into the United
                  States for 77 Harmonized Tariff Schedule tariff lines spanning
                  apparel, textile accessories, and travel goods. Audited
                  Nepalese manufacturers provide certified country-of-origin
                  documentation guaranteeing immediate tariff relief.
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/apply"
                  className="bg-[#231F20] text-white hover:bg-[#5E5F5A] text-[11px] font-mono uppercase px-5 py-2.5 text-center transition-colors"
                >
                  START SOURCING
                </Link>
                <Link
                  href="/rfq"
                  className="border border-[#DFD8CE] bg-[#F2F2F2] text-[#231F20] hover:bg-[#DFD8CE] text-[11px] font-mono uppercase px-5 py-2.5 text-center transition-colors"
                >
                  INQUIRE WITH TRADE DESK
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
