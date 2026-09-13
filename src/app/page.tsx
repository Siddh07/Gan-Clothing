import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import {
  ShieldCheck,
  Building2,
  Send,
  Leaf,
  Award,
  Globe2,
  Zap,
  ExternalLink,
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title:
    "Nepal's Official Garment Export Registry & B2B Sourcing Portal",
  description:
    "Source directly from 50+ verified Nepalese RMG manufacturers. FOB Nepal pricing, 0% US import duty, zero-tariff EU access. Cashmere, knitwear, woven shirts, and sustainable apparel. Supported by the ILO LDC Graduation Project.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nepal's Official Garment Export Registry & B2B Sourcing Portal",
    description:
      "Verified Nepalese RMG manufacturers — FOB Nepal, 0% US duty, ILO LDC Graduation Project.",
    url: "/",
  },
};

export default async function HomePage() {
  const [enterpriseCount, productCount, featuredEnterprises, categories] =
    await Promise.all([
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
    ]);

  const totalCapacity = await prisma.enterprise.aggregate({
    _sum: { monthlyCapacityPcs: true },
  });
  const aggregatePcs = totalCapacity._sum.monthlyCapacityPcs || 865000;

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

      <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-[#18181B]">
        <Navbar />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-white border-b border-[#E4E4E7] py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-success">Verified registry</span>
                    <span className="badge badge-neutral">Est. 1986</span>
                    <span className="text-xs text-[#71717A]">
                      Nepal Trade Preference Act (P.L. 114-125) compliant
                    </span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-[#18181B] leading-tight">
                    Nepal&apos;s official garment factory registry and sourcing platform
                  </h1>

                  <p className="text-base text-[#71717A] leading-relaxed max-w-xl">
                    The institutional directory of verified Nepalese ready-made garment manufacturers and export mills. Direct sourcing access for international apparel brands — with 0% US duty and zero-tariff EU access under bilateral trade agreements.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/directory"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      Browse accredited factories
                    </Link>
                    <Link
                      href="/rfq"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#18181B] bg-white border border-[#E4E4E7] hover:bg-[#F7F8FA] rounded transition-colors"
                    >
                      <Send className="w-4 h-4 text-[#71717A]" />
                      Submit sourcing RFQ
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-[#E4E4E7] flex flex-wrap gap-6 text-sm text-[#71717A]">
                    <div>
                      US tariff:{" "}
                      <span className="font-medium text-[#18181B]">0% on 77 lines</span>
                    </div>
                    <div>
                      EU regime:{" "}
                      <span className="font-medium text-[#18181B]">EBA / GSP duty-free</span>
                    </div>
                    <div>
                      Arbitration:{" "}
                      <span className="font-medium text-[#18181B]">GAN secretariat desk</span>
                    </div>
                  </div>
                </div>

                {/* Stats panel */}
                <div className="lg:col-span-5 border border-[#E4E4E7] bg-white rounded-md overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E4E4E7] bg-[#F7F8FA]">
                    <div className="text-sm font-medium text-[#18181B]">
                      National sourcing capacity
                    </div>
                    <div className="text-3xl font-semibold text-[#18181B] mt-1">
                      {(aggregatePcs / 1000).toFixed(0)}k{" "}
                      <span className="text-sm font-normal text-[#71717A]">pcs / month</span>
                    </div>
                    <div className="text-xs text-[#71717A] mt-0.5">
                      Aggregate member monthly line capacity
                    </div>
                  </div>

                  <div className="divide-y divide-[#E4E4E7]">
                    {[
                      { label: "Accredited mills", value: `${enterpriseCount} registered` },
                      { label: "Exhibition samples", value: `${productCount} styles live` },
                      { label: "Active export corridors", value: "US, EU, UK, Japan" },
                      { label: "Compliance frameworks", value: "WRAP, Sedex, GOTS" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center px-5 py-3 text-sm"
                      >
                        <span className="text-[#71717A]">{row.label}</span>
                        <span className="font-medium text-[#18181B]">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-4 border-t border-[#E4E4E7]">
                    <Link
                      href="/apply"
                      className="block w-full text-center py-2 text-sm font-medium text-[#2D5BE3] border border-[#2D5BE3] rounded hover:bg-[#EFF4FF] transition-colors"
                    >
                      Apply for factory accreditation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics strip */}
          <section className="bg-white border-b border-[#E4E4E7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E4E4E7]">
                {[
                  {
                    label: "Accredited mills",
                    value: String(enterpriseCount),
                    sub: "Verified PAN & IRD registration",
                  },
                  {
                    label: "Monthly output",
                    value: `${(aggregatePcs / 1000).toFixed(0)}k+`,
                    sub: "Pieces across apparel & knitwear",
                  },
                  {
                    label: "Export corridors",
                    value: "28+",
                    sub: "Bilateral duty-free routes",
                  },
                  {
                    label: "Labor compliance",
                    value: "100%",
                    sub: "Zero child labor verified",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="px-6 py-5">
                    <div className="text-xs text-[#71717A] mb-1">{stat.label}</div>
                    <div className="text-2xl font-semibold text-[#18181B]">{stat.value}</div>
                    <div className="text-xs text-[#71717A] mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-14 bg-[#F7F8FA]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#E4E4E7]">
                <div>
                  <h2 className="text-xl font-semibold text-[#18181B]">
                    Apparel export sectors
                  </h2>
                  <p className="text-sm text-[#71717A] mt-1">
                    Classified by HS tariff headings and technical fabrication
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-sm text-[#2D5BE3] hover:underline"
                >
                  Full product catalog
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/directory?category=${cat.slug}`}
                    className="group bg-white border border-[#E4E4E7] hover:border-[#2D5BE3] rounded-md p-5 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-neutral">
                          {cat._count.products} styles
                        </span>
                        <span className="text-xs text-[#71717A]">
                          #{cat.slug.toUpperCase().slice(0, 4)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-[#18181B] mb-1.5">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-[#71717A] line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-sm text-[#2D5BE3] font-medium">
                      <span>View accredited mills</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Strategic advantages */}
          <section id="why-nepal" className="py-14 bg-white border-y border-[#E4E4E7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 pb-4 border-b border-[#E4E4E7]">
                <h2 className="text-xl font-semibold text-[#18181B]">
                  Why source from Nepal
                </h2>
                <p className="text-sm text-[#71717A] mt-1">
                  Preferential trade statutes, artisan supply chains, and clean energy processing
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    num: "01",
                    label: "US statutory tariff relief",
                    title: "Nepal Trade Preference Act",
                    body: "Under Public Law 114-125, eligible apparel enters the United States at 0% customs duty — a structural margin advantage over other Asian manufacturing hubs.",
                    icon: Globe2,
                  },
                  {
                    num: "02",
                    label: "European Union access",
                    title: "Duty-free EBA / GSP regime",
                    body: "Exports to all 27 EU member states, the UK, and Switzerland receive zero-duty tariff treatment under the Everything But Arms arrangement via Form A.",
                    icon: ShieldCheck,
                  },
                  {
                    num: "03",
                    label: "Artisan fiber heritage",
                    title: "Chyangra Cashmere trademark",
                    body: "Nepal holds the globally registered Chyangra Pashmina collective mark — 100% authentic high-altitude goat down, hand-loomed by certified craft guilds.",
                    icon: Award,
                  },
                  {
                    num: "04",
                    label: "Regenerative fibers",
                    title: "Wild mountain nettle & hemp",
                    body: "Himalayan Giant Nettle (Allo), wild hemp, and organic bamboo silk — naturally pesticide-free, low-water harvesting supporting indigenous mountain collectives.",
                    icon: Leaf,
                  },
                  {
                    num: "05",
                    label: "Social labor compliance",
                    title: "Zero child labor, audited workplaces",
                    body: "Strict enforcement verified by WRAP, Sedex SMETA, and amfori BSCI. Fair wages, gender parity in skilled tailoring, and fully formalized tax registrations.",
                    icon: ShieldCheck,
                  },
                  {
                    num: "06",
                    label: "Clean energy supply chain",
                    title: "Hydro-powered processing grid",
                    body: "Over 95% of Nepal's national electrical grid is zero-carbon Himalayan hydroelectricity — substantially reducing Scope 2 manufacturing emissions for ESG reporting.",
                    icon: Zap,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.num}
                      className="bg-[#F7F8FA] border border-[#E4E4E7] rounded-md p-5 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-[#2D5BE3] font-medium">
                        <Icon className="w-3.5 h-3.5" />
                        {item.label}
                      </div>
                      <h3 className="font-semibold text-sm text-[#18181B]">{item.title}</h3>
                      <p className="text-sm text-[#71717A] leading-relaxed">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Featured factories */}
          <section className="py-14 bg-[#F7F8FA]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#E4E4E7]">
                <div>
                  <h2 className="text-xl font-semibold text-[#18181B]">
                    Audited member mills
                  </h2>
                  <p className="text-sm text-[#71717A] mt-1">
                    Verified manufacturers licensed by the GAN secretariat
                  </p>
                </div>
                <Link href="/directory" className="text-sm text-[#2D5BE3] hover:underline">
                  Full registry
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredEnterprises.map((factory) => (
                  <div
                    key={factory.id}
                    className="bg-white border border-[#E4E4E7] rounded-md p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="text-xs text-[#71717A] mb-0.5">
                            Est. {factory.yearEstablished} — {factory.city}, Nepal
                          </div>
                          <h3 className="font-semibold text-base text-[#18181B]">
                            {factory.name}
                          </h3>
                        </div>
                        <span className="badge badge-success shrink-0">Accredited</span>
                      </div>

                      <p className="text-sm text-[#71717A] line-clamp-2 leading-relaxed mb-4">
                        {factory.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E4E4E7] text-sm">
                        <div>
                          <div className="text-xs text-[#71717A] mb-0.5">Monthly capacity</div>
                          <div className="font-medium text-[#18181B]">
                            {factory.monthlyCapacityPcs.toLocaleString()} pcs
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#71717A] mb-0.5">Workforce</div>
                          <div className="font-medium text-[#18181B]">
                            {factory.employeeCount} craftspeople
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {factory.certifications.map((cert) => (
                          <span key={cert.id} className="badge badge-neutral text-xs">
                            {cert.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E4E4E7] flex items-center justify-between">
                      <Link
                        href={`/directory/${factory.slug}`}
                        className="text-sm text-[#2D5BE3] hover:underline"
                      >
                        View full profile
                      </Link>
                      <Link
                        href={`/directory/${factory.slug}#rfq`}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors"
                      >
                        Request quote
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trade desk CTA */}
          <section className="bg-white border-t border-[#E4E4E7] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border border-[#E4E4E7] bg-[#F7F8FA] rounded-md p-10 sm:p-14 text-center">
                <span className="badge badge-accent mb-4 inline-block">
                  Secretariat trade desk
                </span>
                <h2 className="text-2xl font-semibold text-[#18181B] max-w-xl mx-auto mt-2">
                  Start commercial sourcing through the GAN secretariat
                </h2>
                <p className="text-sm text-[#71717A] max-w-lg mx-auto mt-3 leading-relaxed">
                  The GAN trade desk routes technical packs directly to licensed member mills, coordinates physical fabric swatches, and validates bilateral tariff documentation — at no broker commission.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/rfq"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors"
                  >
                    Submit sourcing RFQ
                  </Link>
                  <Link
                    href="/directory"
                    className="px-6 py-2.5 text-sm font-medium text-[#18181B] bg-white border border-[#E4E4E7] hover:bg-[#F7F8FA] rounded transition-colors"
                  >
                    Search verified factories
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
