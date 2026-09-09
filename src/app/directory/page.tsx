import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { DirectorySearch } from "@/components/directory/DirectorySearch";
import { DirectoryToolbar } from "@/components/directory/DirectoryToolbar";
import { FactoryCard } from "@/components/directory/FactoryCard";
import { PaginationControls } from "@/components/common/PaginationControls";
import { ShieldCheck, Building2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exporter Registry | Verified Nepalese Garment Manufacturers",
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
    page?: string;
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

  const pageSize = 12;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  // Build Prisma where clause
  const where: any = {
    status: "APPROVED",
  };

  // Multi-keyword fuzzy search
  if (search.trim()) {
    const terms = search.trim().split(/\s+/).filter(Boolean);
    where.AND = terms.map((term) => ({
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
        { city: { contains: term } },
        { address: { contains: term } },
        {
          products: {
            some: {
              OR: [
                { title: { contains: term } },
                { fabricType: { contains: term } },
                { description: { contains: term } },
                { category: { name: { contains: term } } },
              ],
            },
          },
        },
      ],
    }));
  }

  if (category) {
    where.products = {
      ...where.products,
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
  if (sort === "established-desc") orderBy = { yearEstablished: "asc" };
  if (sort === "name-asc") orderBy = { name: "asc" };

  // Fetch factories and metadata options in parallel with pagination
  const [totalCount, factories, categories, allCertifications, allEnterprises] = await Promise.all([
    prisma.enterprise.count({ where }),
    prisma.enterprise.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
      where: { status: "APPROVED" },
      select: { exportMarkets: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

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
    <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Directory Masthead Strip */}
        <div className="bg-[#0D0D0D] text-white py-10 border-b border-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center space-x-2 font-mono text-[10px] uppercase tracking-widest text-[#E1E4E7]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>B2B Exporter Accreditation Ledger</span>
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                Verified Garment Manufacturers of Nepal
              </h1>
              <p className="text-xs text-[#E1E4E7] leading-relaxed font-sans">
                Accredited export mills verified for WRAP, OEKO-TEX, and GOTS standards. Filter by monthly production volume, apparel specialization, and bilateral export destinations.
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
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] border border-[#0D0D0D] transition-colors shrink-0"
            >
              Submit Custom Commercial RFQ
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
              <DirectoryToolbar totalCount={totalCount} />

              {factories.length === 0 ? (
                <div className="bg-white rounded-none border border-[#E1E4E7] p-12 text-center space-y-4">
                  <div className="w-12 h-12 border border-[#E1E4E7] text-[#6B7280] flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-mono text-sm uppercase font-bold tracking-wider text-[#0D0D0D]">
                    No Matching Exporters Indexed
                  </h3>
                  <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
                    No manufacturers match your active filter parameters. Clear selected certifications, increase the MOQ threshold, or route an inquiry directly to the secretariat trade desk.
                  </p>
                  <div className="pt-2 flex justify-center space-x-3">
                    <Link
                      href="/directory"
                      className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] transition-colors"
                    >
                      Clear All Filters
                    </Link>
                    <Link
                      href="/rfq"
                      className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                    >
                      Post Trade Desk RFQ
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

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                baseUrl="/directory"
                searchParams={resolvedParams}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
