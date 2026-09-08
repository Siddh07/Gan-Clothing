import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { DirectorySearch } from "@/components/directory/DirectorySearch";
import { DirectoryToolbar } from "@/components/directory/DirectoryToolbar";
import { FactoryCard } from "@/components/directory/FactoryCard";
import { ShieldCheck, Building2, HelpCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exporter Directory | Verified Nepalese Garment Manufacturers",
  description:
    "Explore certified garment export mills, cashmere factories, and sustainable apparel manufacturers registered with the Garment Association of Nepal.",
};

interface DirectoryPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    certification?: string;
    market?: string;
    moq?: string;
    view?: "grid" | "list";
    sort?: string;
  }>;
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const certification = resolvedParams.certification || "";
  const market = resolvedParams.market || "";
  const moq = resolvedParams.moq ? parseInt(resolvedParams.moq) : undefined;
  const viewMode = resolvedParams.view || "grid";
  const sort = resolvedParams.sort || "capacity-desc";

  // Build Prisma where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { city: { contains: search } },
      { address: { contains: search } },
    ];
  }

  if (category) {
    where.products = {
      some: {
        category: {
          slug: category,
        },
      },
    };
  }

  if (certification) {
    where.certifications = {
      some: {
        name: { contains: certification },
      },
    };
  }

  if (market) {
    where.exportMarkets = {
      contains: market,
    };
  }

  if (moq) {
    where.products = {
      ...where.products,
      some: {
        ...where.products?.some,
        moq: { lte: moq },
      },
    };
  }

  // Determine sorting order
  let orderBy: any = { monthlyCapacityPcs: "desc" };
  if (sort === "capacity-asc") orderBy = { monthlyCapacityPcs: "asc" };
  if (sort === "established-desc") orderBy = { yearEstablished: "asc" }; // Earlier year = more established
  if (sort === "name-asc") orderBy = { name: "asc" };

  // Fetch factories and metadata options in parallel
  const [factories, categories, allCertifications, allEnterprises] = await Promise.all([
    prisma.enterprise.findMany({
      where,
      orderBy,
      include: {
        certifications: true,
        products: {
          select: { id: true, title: true, fabricType: true, moq: true },
        },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.certification.findMany({
      select: { name: true },
      distinct: ["name"],
    }),
    prisma.enterprise.findMany({
      select: { exportMarkets: true },
    }),
  ]);

  // Extract distinct markets
  const marketSet = new Set<string>();
  allEnterprises.forEach((e) => {
    e.exportMarkets.split(",").forEach((m) => {
      const trimmed = m.trim();
      if (trimmed) marketSet.add(trimmed);
    });
  });
  const availableMarkets = Array.from(marketSet).sort();
  const availableCertifications = allCertifications.map((c) => c.name).sort();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Directory Header Banner */}
        <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Exporter Catalog</span>
              </div>
              <h1 className="font-outfit text-3xl sm:text-4xl font-black">
                Verified Garment Manufacturers of Nepal
              </h1>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Connect with accredited mills certified for WRAP, OEKO-TEX, and GOTS standards. Filter by production capacity, apparel specialization, and export destinations.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Controls & Main Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Top Search & Global RFQ Trigger */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <DirectorySearch />
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors shadow-xs shrink-0"
            >
              Can't Find a Mill? Submit Custom Sourcing RFQ
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Faceted Filters Sidebar */}
            <aside className="lg:col-span-1 lg:sticky lg:top-28">
              <DirectoryFilters
                categories={categories}
                availableCertifications={availableCertifications}
                availableMarkets={availableMarkets}
              />
            </aside>

            {/* Right Factory Results Section */}
            <div className="lg:col-span-3 space-y-6">
              <DirectoryToolbar totalCount={factories.length} />

              {factories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-slate-900">
                    No Matching Exporters Found
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    No manufacturers match your active filter criteria. Try clearing selected certifications, increasing the MOQ threshold, or submitting a direct trade desk RFQ.
                  </p>
                  <div className="pt-2 flex justify-center space-x-3">
                    <Link
                      href="/directory"
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Clear All Filters
                    </Link>
                    <Link
                      href="/rfq"
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
                    >
                      Post Trade Desk Inquiry
                    </Link>
                  </div>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-4">
                  {factories.map((factory) => (
                    <FactoryCard key={factory.id} factory={factory} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {factories.map((factory) => (
                    <FactoryCard key={factory.id} factory={factory} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
