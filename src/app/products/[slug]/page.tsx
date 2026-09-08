import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductQuoteTrigger } from "@/components/products/ProductQuoteTrigger";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import {
  ShieldCheck,
  Building2,
  MapPin,
  ArrowLeft,
  Package,
  Layers,
  CheckCircle2,
  ExternalLink,
  Truck,
  Sparkles,
  Calendar,
} from "lucide-react";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { enterprise: true, category: true },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.title} | ${product.enterprise.name} | GAN`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} - Nepalese Apparel Export`,
      description: `Manufactured by ${product.enterprise.name}, Nepal. ${product.fabricType}, MOQ: ${product.moq} pcs.`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      enterprise: {
        include: {
          certifications: true,
        },
      },
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [product.images];
  }

  return (
    <>
      <ProductJsonLd
        name={product.title}
        description={product.description}
        images={images}
        manufacturerName={product.enterprise.name}
        categoryName={product.category.name}
        sku={`GAN-PROD-${product.id.slice(-6).toUpperCase()}`}
      />

      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pb-20">
          {/* Breadcrumb Header */}
          <div className="bg-slate-900 text-slate-700 border-b border-slate-800 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Link
                  href="/products"
                  className="hover:text-white transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Product Catalog
                </Link>
                <span>/</span>
                <span className="text-slate-700">{product.category.name}</span>
                <span>/</span>
                <span className="text-white font-medium truncate max-w-xs">{product.title}</span>
              </div>
              <span className="hidden sm:inline">SKU: #{product.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column: Image Gallery with Zoom */}
              <div>
                <ProductGallery images={images} title={product.title} />
              </div>

              {/* Right Column: Garment Specs & Quote Engine */}
              <div className="space-y-6">
                {/* Category & Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {product.category.name}
                  </span>
                  {product.isFeatured && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured Export Sample
                    </span>
                  )}
                </div>

                {/* Product Title */}
                <h1 className="font-outfit text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {product.title}
                </h1>

                {/* Description */}
                <p className="text-slate-600 text-base leading-relaxed">
                  {product.description}
                </p>

                {/* Manufacturer Attribution Badge */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 uppercase font-bold tracking-wider">
                      Contract Manufacturer
                    </span>
                    {product.enterprise.isVerified && (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        GAN Verified Mill
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/directory/${product.enterprise.slug}`}
                        className="font-outfit text-xl font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center"
                      >
                        {product.enterprise.name}
                        <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
                      </Link>
                      <p className="text-xs text-slate-700 mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-700" />
                        {product.enterprise.city}, Nepal • Est. {product.enterprise.yearEstablished}
                      </p>
                    </div>

                    <Link
                      href={`/directory/${product.enterprise.slug}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      View Factory
                    </Link>
                  </div>

                  {/* Mill Certifications */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {product.enterprise.certifications.map((cert) => (
                      <span
                        key={cert.id}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100"
                      >
                        {cert.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Specification Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-outfit font-bold text-sm text-slate-900">
                    Garment Technical Specifications
                  </div>

                  <div className="divide-y divide-slate-100 text-sm">
                    <div className="px-6 py-3 flex justify-between">
                      <span className="text-slate-700 font-medium">Fabric Composition</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {product.fabricType}
                      </span>
                    </div>

                    {product.gsmWeight && (
                      <div className="px-6 py-3 flex justify-between">
                        <span className="text-slate-700 font-medium">Fabric Weight</span>
                        <span className="font-semibold text-slate-900">
                          {product.gsmWeight} GSM
                        </span>
                      </div>
                    )}

                    <div className="px-6 py-3 flex justify-between">
                      <span className="text-slate-700 font-medium">Minimum Order Quantity (MOQ)</span>
                      <span className="font-bold text-emerald-700">
                        {product.moq.toLocaleString()} pcs / style
                      </span>
                    </div>

                    <div className="px-6 py-3 flex justify-between">
                      <span className="text-slate-700 font-medium">Target Demographic</span>
                      <span className="font-semibold text-slate-900">
                        {product.targetGender}
                      </span>
                    </div>

                    <div className="px-6 py-3 flex justify-between">
                      <span className="text-slate-700 font-medium">Standard Production Lead Time</span>
                      <span className="font-semibold text-slate-900">
                        45 - 60 Days (Post Tech-Pack & Lab Dips)
                      </span>
                    </div>

                    <div className="px-6 py-3 flex justify-between">
                      <span className="text-slate-700 font-medium">Sample Availability</span>
                      <span className="font-semibold text-slate-900 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                        Available within 7-10 days via DHL / FedEx
                      </span>
                    </div>

                    <div className="px-6 py-3 flex justify-between">
                      <span className="text-slate-700 font-medium">Incoterms Supported</span>
                      <span className="font-semibold text-slate-900">
                        FOB Kathmandu (Tribhuvan Airport) / CIF Kolkata Sea Port
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <ProductQuoteTrigger
                    productId={product.id}
                    productTitle={product.title}
                    enterpriseId={product.enterprise.id}
                    enterpriseName={product.enterprise.name}
                    defaultMoq={product.moq}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
