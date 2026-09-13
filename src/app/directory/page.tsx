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
  title: "Verified Exporter Registry | Nepal Garment Manufacturers Directory",
  description:
    "Browse 50+ certified Nepalese garment manufacturers. Filter by WRAP, ISO 9001, OEKO-TEX, Sedex, and GOTS certifications. Source cashmere, knitwear, woven, denim, and outdoor gear at FOB Nepal pricing.",
  alternates: {
    canonical: "/directory",
  },
  openGraph: {
    title: "Verified Nepalese Garment Manufacturer Directory | GAN",
    description:
      "Discover certified Nepalese apparel factories — WRAP, ISO, OEKO-TEX certified. Direct B2B sourcing at FOB Nepal pricing.",
    url: "/directory",
  },
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
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-[#18181B]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Page header */}
        <div className="bg-white border-b border-[#E4E4E7] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5BE3]" />
                <span className="text-sm text-[#71717A]">GAN accreditation registry</span>
              </div>
              <h1 className="text-2xl font-semibold text-[#18181B] mb-2">
                Verified garment manufacturers of Nepal
              </h1>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Accredited export mills verified for WRAP, OEKO-TEX, and GOTS standards. Filter by monthly production volume, apparel specialization, and bilateral export destinations.
              </p>
            </div>
          </div>
        </div>

        {/* Controls + layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Search + RFQ */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <DirectorySearch />
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors shrink-0"
            >
              Submit sourcing RFQ
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Filters sidebar */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24">
              <DirectoryFilters
                categories={categories}
                availableCertifications={availableCertifications}
                availableMarkets={availableMarkets}
              />
            </aside>

            {/* Results */}
            <div className="lg:col-span-3 space-y-4">
              <DirectoryToolbar totalCount={totalCount} />

              {factories.length === 0 ? (
                <div className="bg-white border border-[#E4E4E7] rounded-md p-12 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-5 h-5 text-[#71717A]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#18181B] mb-1">
                    No matching exporters found
                  </h3>
                  <p className="text-sm text-[#71717A] max-w-md mx-auto leading-relaxed mb-4">
                    No manufacturers match your current filters. Try clearing certifications, adjusting the MOQ range, or submitting a direct inquiry to the secretariat.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      href="/directory"
                      className="px-4 py-2 text-sm text-[#71717A] border border-[#E4E4E7] rounded hover:bg-[#F7F8FA] transition-colors"
                    >
                      Clear filters
                    </Link>
                    <Link
                      href="/rfq"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors"
                    >
                      Submit RFQ
                    </Link>
                  </div>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-3">
                  {factories.map((factory) => (
                    <FactoryCard key={factory.id} factory={factory} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {factories.map((factory) => (
                    <FactoryCard key={factory.id} factory={factory} viewMode="grid" />
                  ))}
                </div>
              )}

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
