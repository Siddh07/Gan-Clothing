import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import {
  ShieldCheck,
  Building2,
  Globe2,
  Award,
  Send,
  Leaf,
  Users,
  Layers,
  FileCheck,
  Zap,
  ExternalLink,
} from "lucide-react";

export const revalidate = 60; // Revalidate every 60s for live metrics

export default async function HomePage() {
  // Fetch real database counts and featured data
  const [enterpriseCount, productCount, featuredEnterprises, categories] = await Promise.all([
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
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalCapacity = await prisma.enterprise.aggregate({
    _sum: { monthlyCapacityPcs: true },
  });

  const aggregatePcs = totalCapacity._sum.monthlyCapacityPcs || 865000;

  return (
    <>
      <OrganizationJsonLd
        name="Garment Association of Nepal (GAN)"
        url="https://ganepal.org"
        description="Apex trade organization of Nepalese ready-made garment and textile exporters."
        address="Sankhamul, Kathmandu, Nepal"
        email="trade-desk@ganepal.org"
        telephone="+977-1-4350123"
      />

      <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
        <Navbar />

        <main className="flex-1">
          {/* Institutional Trade Hero */}
          <section className="bg-white border-b border-[#E1E4E7] py-14 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tag-approved text-[10px]">
                      APEX SOURCING REGISTRY
                    </span>
                    <span className="tag-neutral text-[10px]">
                      ESTABLISHED 1986
                    </span>
                    <span className="text-[10px] font-mono text-[#6B7280]">
                      NEPAL TRADE PREFERENCE ACT (P.L. 114-125) COMPLIANT
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight">
                    Sovereign Trade Gateway & Factory Accreditation Registry
                  </h1>

                  <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-2xl font-sans">
                    The official institutional directory of verified Nepalese ready-made garment manufacturers and export mills. Direct sourcing access for international apparel brands seeking duty-free entry into US and European Union markets under bilateral trade preference acts.
                  </p>

                  {/* Primary CTA and Triage */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href="/directory"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] rounded-none transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 mr-2" />
                      EXPLORE ACCREDITED MILLS
                    </Link>

                    <Link
                      href="/rfq"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-mono text-[#0D0D0D] bg-[#F6F7F8] border border-[#E1E4E7] hover:bg-white rounded-none transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 mr-2 text-[#1E3A52]" />
                      SUBMIT B2B RFQ DOCKET
                    </Link>
                  </div>

                  {/* Statutory Ticker */}
                  <div className="pt-4 border-t border-[#E1E4E7] flex flex-wrap gap-6 text-[11px] font-mono text-[#6B7280]">
                    <div>
                      TARIFF STATUS: <strong className="text-[#0D0D0D]">0% US DUTY (77 LINES)</strong>
                    </div>
                    <div>
                      EU REGIME: <strong className="text-[#0D0D0D]">EBA / GSP DUTY-FREE</strong>
                    </div>
                    <div>
                      ARBITRATION: <strong className="text-[#0D0D0D]">GAN SECRETARIAT DESK</strong>
                    </div>
                  </div>
                </div>

                {/* Right Column: Institutional Operational Summary */}
                <div className="lg:col-span-4 border border-[#E1E4E7] bg-[#F6F7F8] p-5 space-y-4 font-mono text-xs">
                  <div className="border-b border-[#E1E4E7] pb-3">
                    <div className="text-[10px] uppercase text-[#6B7280] font-bold">
                      National Sourcing Capacity
                    </div>
                    <div className="text-2xl font-bold text-[#0D0D0D] mt-1">
                      {(aggregatePcs / 1000).toFixed(0)}K <span className="text-xs font-normal text-[#6B7280]">pcs/month</span>
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5">
                      Aggregate member monthly line capacity
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-[#E1E4E7]">
                      <span className="text-[#6B7280]">Accredited Mills:</span>
                      <strong className="text-[#0D0D0D]">{enterpriseCount} Registered</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E1E4E7]">
                      <span className="text-[#6B7280]">Exhibition Samples:</span>
                      <strong className="text-[#0D0D0D]">{productCount} Styles Live</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E1E4E7]">
                      <span className="text-[#6B7280]">Active Corridors:</span>
                      <strong className="text-[#0D0D0D]">US, EU, UK, Japan</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#6B7280]">Compliance Body:</span>
                      <strong className="text-[#0D0D0D]">WRAP, Sedex, GOTS</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/apply"
                      className="block text-center py-2 bg-white border border-[#E1E4E7] text-[#0D0D0D] text-[10px] font-bold uppercase hover:bg-[#F6F7F8] transition-colors"
                    >
                      Factory Accreditation Enrollment
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metric Strip */}
          <section className="bg-white border-b border-[#E1E4E7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E1E4E7] border-x border-[#E1E4E7]">
                <div className="p-5">
                  <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
                    Accredited Mills
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0D0D0D] mt-1">
                    {enterpriseCount}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                    Verified PAN & IRD registration
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
                    Monthly Output
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0D0D0D] mt-1">
                    {(aggregatePcs / 1000).toFixed(0)}k+ <span className="text-xs font-normal text-[#6B7280]">pcs</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                    Apparel & knitwear lines
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
                    Export Corridors
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0D0D0D] mt-1">
                    28+ <span className="text-xs font-normal text-[#6B7280]">markets</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                    Bilateral duty-free routes
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
                    Labor Standards
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0D0D0D] mt-1">
                    100% <span className="text-xs font-normal text-[#6B7280]">audited</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                    Zero child labor verification
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Garment Categories Registry */}
          <section className="py-14 bg-[#F6F7F8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-b border-[#E1E4E7] pb-3 mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#0D0D0D] tracking-tight">
                    Specialized Apparel Export Sectors
                  </h2>
                  <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                    CLASSIFICATION ACCORDING TO HS TARIFF HEADINGS AND TECHNICAL FABRICATIONS
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-mono text-[#1E3A52] hover:underline"
                >
                  FULL SPECIMEN CATALOG
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/directory?category=${cat.slug}`}
                    className="p-5 bg-white border border-[#E1E4E7] hover:border-[#1E3A52] transition-colors flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="tag-neutral text-[10px]">
                          {cat._count.products} STYLES EXHIBITED
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280]">
                          SECTOR CODE #{cat.slug.toUpperCase().slice(0, 4)}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#0D0D0D] font-sans">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] line-clamp-2 mt-1.5 leading-relaxed font-sans">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E1E4E7] flex items-center justify-between text-[10px] font-mono text-[#1E3A52] font-medium uppercase">
                      <span>INSPECT ACCREDITED MILLS</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Strategic Advantages / Bilateral Frameworks */}
          <section id="why-nepal" className="py-14 bg-white border-y border-[#E1E4E7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-b border-[#E1E4E7] pb-3 mb-8">
                <h2 className="text-lg font-bold text-[#0D0D0D] tracking-tight">
                  Bilateral Sourcing Advantages & Legal Frameworks
                </h2>
                <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                  PREFERENTIAL STATUTES, ARTISAN LUXURY SUPPLY CHAINS, AND CLEAN ENERGY PROCESSING
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1 */}
                <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#1E3A52] font-bold">
                    01 / STATUTORY TARIFF RELIEF
                  </div>
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    US Nepal Trade Preference Act
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-sans">
                    Under Public Law 114-125, eligible apparel articles enter the United States at <strong className="text-[#0D0D0D]">0% customs duties</strong>, providing structural margin advantages over other Asian garment manufacturing hubs.
                  </p>
                </div>

                {/* 2 */}
                <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#1E3A52] font-bold">
                    02 / EUROPEAN UNION ACCESS
                  </div>
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    Duty-Free EBA / GSP Regime
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-sans">
                    Exports to all 27 EU member states, the United Kingdom, and Switzerland receive <strong className="text-[#0D0D0D]">zero-duty tariff treatment</strong> under the Everything But Arms (EBA) arrangement via expedited Form A certification.
                  </p>
                </div>

                {/* 3 */}
                <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#1E3A52] font-bold">
                    03 / ARTISAN FIBER HERITAGE
                  </div>
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    Chyangra Cashmere Trademark
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-sans">
                    Nepal holds the globally registered <em>Chyangra Pashmina</em> collective mark, guaranteeing 100% authentic high-altitude goat down harvested in Himalayan pastures and hand-loomed by craft guilds.
                  </p>
                </div>

                {/* 4 */}
                <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#1E3A52] font-bold">
                    04 / SUSTAINABLE REGENERATIVE FIBERS
                  </div>
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    Wild Mountain Nettle & Hemp
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-sans">
                    Pioneers in wild Himalayan Giant Nettle (Allo), wild hemp, and organic bamboo silk. Naturally pesticide-free, low-water harvesting supporting mountain indigenous harvesting collectives.
                  </p>
                </div>

                {/* 5 */}
                <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#1E3A52] font-bold">
                    05 / SOCIAL LABOR COMPLIANCE
                  </div>
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    Zero Child Labor & Audited Workplaces
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-sans">
                    Strict zero child labor enforcement verified by WRAP, Sedex SMETA, and amfori BSCI. Fair wages, gender parity in skilled tailoring, and fully formalized tax registrations.
                  </p>
                </div>

                {/* 6 */}
                <div className="p-5 bg-[#F6F7F8] border border-[#E1E4E7] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#1E3A52] font-bold">
                    06 / CLEAN ENERGY SUPPLY CHAIN
                  </div>
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    Hydro-Powered Processing Grid
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-sans">
                    Over 95% of Nepal’s national electrical grid is generated from zero-carbon Himalayan hydroelectricity, substantially reducing Scope 2 manufacturing emissions for corporate ESG disclosures.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Exporters Showcase */}
          <section className="py-14 bg-[#F6F7F8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-b border-[#E1E4E7] pb-3 mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#0D0D0D] tracking-tight">
                    Audited Member Mills & Production Plants
                  </h2>
                  <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                    LICENSED MANUFACTURERS VERIFIED BY THE GAN SECRETARIAT TRADE DESK
                  </p>
                </div>
                <Link
                  href="/directory"
                  className="text-xs font-mono text-[#1E3A52] hover:underline"
                >
                  FULL EXPORTERS REGISTRY
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredEnterprises.map((factory) => (
                  <div
                    key={factory.id}
                    className="bg-white border border-[#E1E4E7] p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="text-[10px] font-mono text-[#6B7280]">
                            EST. {factory.yearEstablished} • {factory.city.toUpperCase()}, NEPAL
                          </div>
                          <h3 className="font-bold text-base text-[#0D0D0D] font-sans mt-0.5">
                            {factory.name}
                          </h3>
                        </div>
                        <span className="tag-approved text-[10px] shrink-0">
                          ACCREDITED
                        </span>
                      </div>

                      <p className="text-xs text-[#6B7280] line-clamp-2 mt-2 leading-relaxed font-sans">
                        {factory.description}
                      </p>

                      {/* Specs Ledger */}
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#E1E4E7] text-xs font-mono">
                        <div>
                          <span className="text-[#6B7280] text-[10px] block">MONTHLY CAPACITY:</span>
                          <span className="font-bold text-[#0D0D0D]">
                            {factory.monthlyCapacityPcs.toLocaleString()} pcs
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] text-[10px] block">WORKFORCE:</span>
                          <span className="font-bold text-[#0D0D0D]">
                            {factory.employeeCount} craftspeople
                          </span>
                        </div>
                      </div>

                      {/* Certifications tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
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

                    {/* Bottom Action Strip */}
                    <div className="pt-3 border-t border-[#E1E4E7] flex items-center justify-between text-xs font-mono">
                      <Link
                        href={`/directory/${factory.slug}`}
                        className="text-[#1E3A52] hover:underline"
                      >
                        TECHNICAL DOSSIER
                      </Link>

                      <Link
                        href={`/directory/${factory.slug}#rfq`}
                        className="px-3 py-1 bg-[#1E3A52] text-white hover:bg-[#0D0D0D] transition-colors"
                      >
                        REQUEST QUOTE
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Institutional Trade Desk Callout */}
          <section className="bg-white border-t border-[#E1E4E7] py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border border-[#E1E4E7] bg-[#F6F7F8] p-8 sm:p-12 text-center space-y-4">
                <span className="tag-approved text-[10px]">
                  CENTRAL SECRETARIAT ARBITRATION
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#0D0D0D] max-w-xl mx-auto">
                  Initiate Commercial Sourcing via the Secretariat Desk
                </h2>
                <p className="text-xs text-[#6B7280] max-w-xl mx-auto leading-relaxed font-sans">
                  The Garment Association of Nepal trade desk routes technical packs directly to licensed member mills, coordinates physical fabric swatches, and validates bilateral tariff documentation free of broker commissions.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <Link
                    href="/rfq"
                    className="px-5 py-2.5 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] transition-colors"
                  >
                    DISPATCH SOURCING RFQ
                  </Link>
                  <Link
                    href="/directory"
                    className="px-5 py-2.5 text-xs font-mono text-[#0D0D0D] bg-white border border-[#E1E4E7] hover:bg-[#F6F7F8] transition-colors"
                  >
                    SEARCH VERIFIED FACTORIES
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
