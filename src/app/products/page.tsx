import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { PaginationControls } from "@/components/common/PaginationControls";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nepal Garment Export Catalog | FOB Wholesale Sourcing",
  description:
    "Browse export-grade cashmere knitwear, tailored woven shirts, high-altitude outdoor gear, selvedge denim, and organic hemp garments from verified Nepalese manufacturers. FOB pricing, low MOQ, ILO-supported.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Nepal Garment Export Catalog | FOB Wholesale Sourcing | GAN",
    description:
      "Cashmere knitwear, woven shirts, outdoor gear, denim & sustainable apparel from verified Nepalese factories. FOB Nepal pricing.",
    url: "/products",
  },
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
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-[#18181B]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Page header */}
        <div className="bg-white border-b border-[#E4E4E7] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-[#2D5BE3]" />
                <span className="text-sm text-[#71717A]">Export showroom</span>
              </div>
              <h1 className="text-2xl font-semibold text-[#18181B] mb-2">
                Nepal apparel export catalog
              </h1>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Export-ready samples produced by verified Nepalese mills. All garments support bespoke tech-packs, Pantone formulations, and bulk FOB/CIF shipment terms.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Category filter tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-[#E4E4E7]">
            <Link
              href="/products"
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                !category
                  ? "bg-[#2D5BE3] text-white border-[#2D5BE3] font-medium"
                  : "bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#2D5BE3] hover:text-[#18181B]"
              }`}
            >
              All categories ({totalCount})
            </Link>
            {categories.map((cat) => {
              const isSelected = category === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                    isSelected
                      ? "bg-[#2D5BE3] text-white border-[#2D5BE3] font-medium"
                      : "bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#2D5BE3] hover:text-[#18181B]"
                  }`}
                >
                  {cat.name} ({cat._count.products})
                </Link>
              );
            })}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
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
                  className="bg-white border border-[#E4E4E7] hover:border-[#2D5BE3] rounded-md overflow-hidden flex flex-col transition-colors"
                >
                  {/* Image */}
                  <div className="relative h-52 bg-[#F7F8FA] border-b border-[#E4E4E7]">
                    <img
                      src={displayImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className="badge badge-neutral">{product.category.name}</span>
                      {product.isFeatured && (
                        <span className="badge badge-accent">Featured</span>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-2">
                      <div className="text-xs text-[#71717A] mb-0.5">
                        {product.enterprise.name} — {product.enterprise.city}
                      </div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-sm font-semibold text-[#18181B] hover:text-[#2D5BE3] line-clamp-1 transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                    </div>

                    <p className="text-sm text-[#71717A] line-clamp-2 leading-relaxed mb-3 flex-1">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#E4E4E7] text-sm mb-3">
                      <div>
                        <div className="text-xs text-[#71717A] mb-0.5">Fabric</div>
                        <div className="font-medium text-[#18181B] truncate text-xs">
                          {product.fabricType}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#71717A] mb-0.5">MOQ</div>
                        <div className="font-medium text-[#18181B] text-xs">
                          {product.moq.toLocaleString()} pcs
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-sm text-[#2D5BE3] hover:underline"
                      >
                        View specs
                      </Link>
                      <Link
                        href={`/products/${product.slug}`}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-[#2D5BE3] hover:bg-[#2650CC] rounded transition-colors"
                      >
                        Request quote
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
