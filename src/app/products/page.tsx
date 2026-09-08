import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Filter,
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
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;

  const where: any = {};
  if (category) {
    where.category = { slug: category };
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner */}
        <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                <Layers className="w-4 h-4" />
                <span>Export Showroom & Pre-Production Samples</span>
              </div>
              <h1 className="font-outfit text-3xl sm:text-4xl font-black">
                Nepal Apparel Export Catalog
              </h1>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Discover export-ready styles produced by verified Nepalese manufacturers. All garments can be customized with your brand's tech-packs, labels, and Pantone colorways.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !category
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Products ({products.length})
            </Link>
            {categories.map((cat) => {
              const isSelected = category === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.name} ({cat._count.products})
                </Link>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {products.map((product) => {
              let images: string[] = [];
              try {
                images = JSON.parse(product.images);
              } catch {
                images = [product.images];
              }
              const primaryImage =
                images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600";

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          {product.category.name}
                        </span>
                        {product.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950">
                            Featured Sample
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700 block">
                          By {product.enterprise.name} ({product.enterprise.city})
                        </span>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-outfit text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 mt-0.5">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-700 block text-[10px]">Fabric:</span>
                          <span className="font-semibold text-slate-900 truncate block">
                            {product.fabricType}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-700 block text-[10px]">Min. Order:</span>
                          <span className="font-bold text-emerald-700">
                            {product.moq.toLocaleString()} pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center"
                    >
                      Full Tech Specs
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>

                    <Link
                      href={`/products/${product.slug}`}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                      Request Quotation
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
