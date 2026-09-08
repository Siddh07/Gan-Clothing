import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import {
  ShieldCheck,
  Building2,
  Globe2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Award,
  Factory,
  Send,
  Zap,
  Leaf,
  Users,
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

      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 lg:pt-28 lg:pb-32 border-b border-slate-800">
            {/* Background Texture & Ambient Glow */}
            <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity pointer-events-none">
              <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-teal-600 blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl space-y-6">
                {/* Accreditation Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Nepalese Exporters Registry • GOTS, WRAP & Sedex Audited</span>
                </div>

                {/* Primary Headline */}
                <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Source Ethical Apparel from the{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-amber-300">
                    Roof of the World
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
                  Connect directly with Nepal’s premier garment manufacturers. From hand-combed Himalayan cashmere and wild organic nettle to high-capacity woven shirts and technical alpine outerwear — duty-free to USA and EU markets.
                </p>

                {/* Search / CTA Strip */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                  <Link
                    href="/directory"
                    className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                  >
                    <Building2 className="w-5 h-5 mr-2.5 text-slate-950" />
                    Browse Verified Exporters
                  </Link>

                  <Link
                    href="/rfq"
                    className="inline-flex items-center justify-center px-6 py-4 rounded-xl text-base font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all"
                  >
                    <Send className="w-5 h-5 mr-2 text-emerald-400" />
                    Post Global RFQ
                  </Link>
                </div>

                {/* Quick Trust Highlights */}
                <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>0% US Tariff under Nepal Trade Preference Act</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero-Duty EU EBA / GSP Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No Intermediaries — Direct Factory Quotes</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Metrics Bar */}
          <section className="bg-emerald-900 border-y border-emerald-800 py-8 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <div className="font-outfit text-3xl sm:text-4xl font-black text-white">
                    {enterpriseCount}+
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-200/80 font-medium uppercase tracking-wider mt-1">
                    Registered Exporters
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <div className="font-outfit text-3xl sm:text-4xl font-black text-white">
                    {(aggregatePcs / 1000).toFixed(0)}k+
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-200/80 font-medium uppercase tracking-wider mt-1">
                    Monthly Production Pcs
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <div className="font-outfit text-3xl sm:text-4xl font-black text-white">
                    28+
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-200/80 font-medium uppercase tracking-wider mt-1">
                    Global Export Markets
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <div className="font-outfit text-3xl sm:text-4xl font-black text-emerald-300">
                    100%
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-200/80 font-medium uppercase tracking-wider mt-1">
                    Audited Labor Standards
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Garment Categories Grid */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">
                    Specialized Product Sectors
                  </div>
                  <h2 className="font-outfit text-3xl sm:text-4xl font-black text-slate-900">
                    Nepalese Apparel Export Categories
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors group"
                >
                  View All Product Catalog
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/directory?category=${cat.slug}`}
                    className="group relative p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                          <Layers className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors">
                          {cat._count.products} Products Live
                        </span>
                      </div>
                      <h3 className="font-outfit text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>Explore Mills & Exporters</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Why Source From Nepal Section */}
          <section id="why-nepal" className="py-20 bg-slate-900 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  Bilateral Competitiveness
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl font-black">
                  Why Global Apparel Brands Source from Nepal
                </h2>
                <p className="text-slate-700 text-base leading-relaxed">
                  Nepal pairs deep Himalayan artisan traditions with certified modern manufacturing infrastructure, backed by sovereign preferential trade agreements with Western economies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 1 */}
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    US Nepal Trade Preference Act
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Under Public Law 114-125, eligible apparel items (including knitwear, cardigans, and woven outerwear) enter the United States with <strong>0% customs duties</strong>, offering significant margin advantages over other Asian hubs.
                  </p>
                </div>

                {/* 2 */}
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    Duty-Free European Union (EBA / GSP)
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Nepalese apparel exports to the 27 EU member states, United Kingdom, and Switzerland qualify for <strong>zero-duty tariff treatment</strong> under the Everything But Arms (EBA) arrangement with streamlined Form A certification.
                  </p>
                </div>

                {/* 3 */}
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    Authentic Chyangra Cashmere
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Nepal is home to the world's most authentic high-altitude goat down, certified with the <em>Chyangra Pashmina</em> trademark for pure 100% fine hair fiber spun and hand-finished with heritage craftsmanship.
                  </p>
                </div>

                {/* 4 */}
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    Regenerative Mountain Fibers
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Pioneers in wild Himalayan Giant Nettle (Allo), wild mountain hemp, and organic bamboo silk. Naturally pesticide-free, low-water harvesting supporting mountain indigenous communities.
                  </p>
                </div>

                {/* 5 */}
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    Strict Ethical Compliance
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Zero child labor enforcement, audited by WRAP, Sedex SMETA, and amfori BSCI. Fair wages, gender parity in skilled tailoring, and fully registered PAN/VAT operations.
                  </p>
                </div>

                {/* 6 */}
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    Hydro-Powered Clean Processing
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Over 95% of Nepal’s national electrical grid is generated from zero-carbon Himalayan hydroelectricity, drastically reducing Scope 2 manufacturing emissions for global ESG reporting.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Exporters Showcase */}
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">
                    Audited Member Mills
                  </div>
                  <h2 className="font-outfit text-3xl sm:text-4xl font-black text-slate-900">
                    Featured Garment Manufacturers
                  </h2>
                </div>
                <Link
                  href="/directory"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
                >
                  View All Exporters Directory
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredEnterprises.map((factory) => (
                  <div
                    key={factory.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative h-48 w-full bg-slate-200">
                        {factory.coverImageUrl ? (
                          <img
                            src={factory.coverImageUrl}
                            alt={factory.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-700">
                            No Cover Image
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-md">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            GAN Verified
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs text-slate-700 font-medium">
                              Est. {factory.yearEstablished} • {factory.city}, Nepal
                            </span>
                            <h3 className="font-outfit text-2xl font-bold text-slate-900 mt-0.5">
                              {factory.name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                          {factory.description}
                        </p>

                        {/* Specs grid */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-700 block">Monthly Capacity:</span>
                            <span className="font-bold text-slate-900">
                              {factory.monthlyCapacityPcs.toLocaleString()} pcs
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-700 block">Employees:</span>
                            <span className="font-bold text-slate-900">
                              {factory.employeeCount} craftspeople
                            </span>
                          </div>
                        </div>

                        {/* Certifications badges */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {factory.certifications.map((cert) => (
                            <span
                              key={cert.id}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {cert.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-6 pt-0 flex items-center justify-between">
                      <Link
                        href={`/directory/${factory.slug}`}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center"
                      >
                        Inspect Plant Profile & Specs
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>

                      <Link
                        href={`/directory/${factory.slug}#rfq`}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center"
                      >
                        <Send className="w-3 h-3 mr-1.5" />
                        Request Quote
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Institutional CTA Strip */}
          <section className="bg-linear-to-r from-emerald-800 to-slate-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <h2 className="font-outfit text-3xl sm:text-4xl font-black max-w-2xl mx-auto">
                Ready to Initiate Your Sourcing Program in Nepal?
              </h2>
              <p className="text-emerald-100 max-w-xl mx-auto text-base leading-relaxed">
                The Garment Association of Nepal Secretariat coordinates sample dispatches, compliance validation, and direct introductions with verified factory principals.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/rfq"
                  className="px-8 py-4 rounded-xl text-slate-950 bg-white hover:bg-emerald-50 font-bold text-sm shadow-xl transition-all hover:scale-105"
                >
                  Submit Sourcing Specification (RFQ)
                </Link>
                <Link
                  href="/directory"
                  className="px-8 py-4 rounded-xl text-white bg-emerald-700 hover:bg-emerald-600 font-semibold text-sm border border-emerald-500/40 transition-all"
                >
                  Search Verified Member Factories
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
