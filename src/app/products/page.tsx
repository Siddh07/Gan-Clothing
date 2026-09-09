import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { PaginationControls } from "@/components/common/PaginationControls";
import {
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Export Product Catalog | Garment Association of Nepal",
  description:
    "Browse export-grade cashmere knitwear, tailored woven shirts, high-altitude outdoor gear, selvedge denim, and organic hemp garments made in Nepal.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;
  const pageSize = 12;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  const where: any = {};
  if (category) {
    where.category = { slug: category };
  }

  const [totalCount, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        enterprise: {
          select: { name: true, slug: true, city: true, isVerified: true },
        },
        category: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner */}
        <div className="bg-[#0D0D0D] text-white py-10 border-b border-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center space-x-2 font-mono text-[10px] uppercase tracking-widest text-[#E1E4E7]">
                <Layers className="w-3.5 h-3.5 text-white" />
                <span>Export Showroom & Technical Specimen Registry</span>
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                Nepal Apparel Export Catalog
              </h1>
              <p className="text-xs text-[#E1E4E7] leading-relaxed font-sans">
                Export-ready specimens produced by verified Nepalese mills. All garments support bespoke brand tech-packs, labels, Pantone formulations, and bulk FOB/CIF shipment terms.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-6 border-b border-[#E1E4E7] font-mono text-xs">
            <Link
              href="/products"
              className={`px-3 py-1.5 uppercase tracking-wider font-bold transition-colors ${
                !category
                  ? "bg-[#0D0D0D] text-white"
                  : "bg-white text-[#6B7280] border border-[#E1E4E7] hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
              }`}
            >
              All Categories ({totalCount})
            </Link>
            {categories.map((cat) => {
              const isSelected = category === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`px-3 py-1.5 uppercase tracking-wider font-bold transition-colors ${
                    isSelected
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-white text-[#6B7280] border border-[#E1E4E7] hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
                  }`}
                >
                  {cat.name} ({cat._count.products})
                </Link>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {products.map((product) => {
              let parsedImages: string[] = [];
              try {
                parsedImages = JSON.parse(product.images);
              } catch {
                parsedImages = [product.images];
              }
              const displayImage =
                parsedImages[0] ||
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800";

              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#E1E4E7] overflow-hidden hover:border-[#0D0D0D] transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-4/3 bg-[#F6F7F8] overflow-hidden border-b border-[#E1E4E7]">
                      <img
                        src={displayImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 font-mono text-[9px] uppercase font-bold">
                        <span className="bg-[#0D0D0D] text-white px-2 py-0.5">
                          {product.category.name}
                        </span>
                        {product.isFeatured && (
                          <span className="bg-[#1E3A52] text-white px-2 py-0.5">
                            Priority Run
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div>
                        <span className="font-mono text-[10px] text-[#6B7280] uppercase block">
                          Mill: {product.enterprise.name} // {product.enterprise.city}
                        </span>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-mono text-sm font-bold uppercase text-[#0D0D0D] hover:text-[#1E3A52] transition-colors truncate mt-0.5">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-sans">
                        {product.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#E1E4E7] font-mono text-xs">
                        <div>
                          <span className="text-[#6B7280] block text-[9px] uppercase">Composition:</span>
                          <span className="text-[#0D0D0D] truncate block font-bold">
                            {product.fabricType}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block text-[9px] uppercase">Target MOQ:</span>
                          <span className="font-bold text-[#1E3A52]">
                            {product.moq.toLocaleString()} pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex items-center justify-between gap-3 font-mono text-xs">
                    <Link
                      href={`/products/${product.slug}`}
                      className="uppercase tracking-wider font-bold text-[#6B7280] hover:text-[#0D0D0D]"
                    >
                      Tech Specs
                    </Link>

                    <Link
                      href={`/products/${product.slug}`}
                      className="px-3.5 py-1.5 text-xs uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                    >
                      Inspect & Quote
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              baseUrl="/products"
              searchParams={resolvedParams}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
