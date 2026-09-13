import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductQuoteTrigger } from "@/components/products/ProductQuoteTrigger";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  ShieldCheck,
  MapPin,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np";

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
    include: {
      enterprise: {
        include: { certifications: { select: { name: true } } },
      },
      category: true,
    },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  // Parse product images for OG
  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    if (product.images) images = [product.images];
  }

  // Build rich description
  const certNames = product.enterprise.certifications
    .slice(0, 2)
    .map((c) => c.name)
    .join(", ");
  const gsmPart = product.gsmWeight ? `, ${product.gsmWeight}gsm` : "";
  const certPart = certNames ? ` Manufacturer certified: ${certNames}.` : "";

  const description =
    `${product.fabricType}${gsmPart}, MOQ ${product.moq.toLocaleString()} pcs. ` +
    `Manufactured by ${product.enterprise.name} in ${product.enterprise.city}, Nepal.${certPart} ` +
    `Export-ready FOB Nepal. Category: ${product.category.name}.`;

  return {
    title: `${product.title} — Wholesale FOB Sourcing | Nepal Garment Association`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      type: "website",
      title: `${product.title} — Nepal Wholesale FOB Garment`,
      description: `${product.fabricType}${gsmPart}, MOQ ${product.moq.toLocaleString()} pcs from ${product.enterprise.name}, Nepal.`,
      url: `/products/${slug}`,
      images:
        images.length > 0
          ? images.slice(0, 3).map((img) => ({
              url: img,
              alt: `${product.title} — ${product.category.name} made in Nepal by ${product.enterprise.name}`,
            }))
          : [
              {
                url: "/og-default.png",
                alt: `${product.title} — Nepal Garment Export`,
              },
            ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — Nepal FOB Garment`,
      description: `${product.fabricType}${gsmPart}, MOQ ${product.moq.toLocaleString()} pcs. Made in Nepal.`,
      images: images.length > 0 ? [images[0]] : ["/og-default.png"],
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
      {/* Product-level Schema.org JSON-LD */}
      <ProductJsonLd
        name={product.title}
        description={product.description}
        images={images}
        manufacturerName={product.enterprise.name}
        manufacturerSlug={product.enterprise.slug}
        categoryName={product.category.name}
        sku={`GAN-PROD-${product.id.slice(-6).toUpperCase()}`}
        fabricType={product.fabricType}
        gsmWeight={product.gsmWeight}
        moq={product.moq}
        baseUrl={SITE_URL}
      />

      {/* Breadcrumb JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Product Showroom", url: `${SITE_URL}/products` },
          { name: product.category.name, url: `${SITE_URL}/products?category=${product.category.slug}` },
          {
            name: product.title,
            url: `${SITE_URL}/products/${product.slug}`,
          },
        ]}
      />

      <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
        <Navbar />

        <main className="flex-1 pb-20">
          {/* Breadcrumb Header */}
          <div className="bg-[#0D0D0D] text-[#E1E4E7] border-b border-[#0D0D0D] py-3 font-mono text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link
                  href="/products"
                  className="hover:text-white transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Product Showroom
                </Link>
                <span>/</span>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-[#6B7280] uppercase hover:text-white transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
                <span className="text-white uppercase truncate max-w-xs">{product.title}</span>
              </div>
              <span className="hidden sm:inline">SKU: #{product.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Left Column: Image Gallery with Zoom */}
              <div>
                <ProductGallery images={images} title={product.title} />
              </div>

              {/* Right Column: Garment Specs & Quote Engine */}
              <div className="space-y-6">
                {/* Category & Badge */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase">
                  <span className="px-2 py-0.5 bg-[#0D0D0D] text-white font-bold">
                    {product.category.name}
                  </span>
                  {product.isFeatured && (
                    <span className="px-2 py-0.5 bg-[#1E3A52] text-white font-bold">
                      Priority Export Specimen
                    </span>
                  )}
                </div>

                {/* Product Title — single H1 per page */}
                <div>
                  <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0D0D0D]">
                    {product.title}
                  </h1>
                </div>

                {/* Description */}
                <p className="text-[#6B7280] text-xs leading-relaxed font-sans">
                  {product.description}
                </p>

                {/* Manufacturer Attribution Card */}
                <div className="p-5 bg-white border border-[#E1E4E7] space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">
                      Contract Manufacturer
                    </span>
                    {product.enterprise.isVerified && (
                      <span className="inline-flex items-center text-[10px] font-bold text-[#1E3A52] uppercase">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        GAN Verified Mill
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <Link
                        href={`/directory/${product.enterprise.slug}`}
                        className="text-base font-bold uppercase text-[#0D0D0D] hover:text-[#1E3A52] transition-colors flex items-center"
                      >
                        {product.enterprise.name}
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-60" />
                      </Link>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-[#6B7280]" />
                        {product.enterprise.city}, Nepal // Est. {product.enterprise.yearEstablished}
                      </p>
                    </div>

                    <Link
                      href={`/directory/${product.enterprise.slug}`}
                      className="px-3 py-1 text-xs uppercase font-bold text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] transition-colors"
                    >
                      Mill Dossier
                    </Link>
                  </div>

                  {/* Mill Certifications */}
                  <div className="pt-3 border-t border-[#E1E4E7] flex flex-wrap gap-1.5">
                    {product.enterprise.certifications.map((cert) => (
                      <span
                        key={cert.id}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#F6F7F8] text-[#0D0D0D] border border-[#E1E4E7]"
                      >
                        {cert.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Specification Table */}
                <div className="bg-white border border-[#0D0D0D] overflow-hidden font-mono">
                  <div className="bg-[#0D0D0D] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider">
                    Technical Specifications Dossier
                  </div>

                  <div className="divide-y divide-[#E1E4E7] text-xs">
                    <div className="px-5 py-2.5 flex justify-between">
                      <span className="text-[#6B7280] uppercase text-[10px]">Fabric Composition</span>
                      <span className="font-bold text-[#0D0D0D] text-right">
                        {product.fabricType}
                      </span>
                    </div>

                    {product.gsmWeight && (
                      <div className="px-5 py-2.5 flex justify-between">
                        <span className="text-[#6B7280] uppercase text-[10px]">Areal Density (Weight)</span>
                        <span className="font-bold text-[#0D0D0D]">
                          {product.gsmWeight} GSM
                        </span>
                      </div>
                    )}

                    <div className="px-5 py-2.5 flex justify-between">
                      <span className="text-[#6B7280] uppercase text-[10px]">Minimum Order Volume (MOQ)</span>
                      <span className="font-bold text-[#1E3A52]">
                        {product.moq.toLocaleString()} pcs / style
                      </span>
                    </div>

                    <div className="px-5 py-2.5 flex justify-between">
                      <span className="text-[#6B7280] uppercase text-[10px]">Target Demographic</span>
                      <span className="font-bold text-[#0D0D0D]">
                        {product.targetGender || "Universal / Unisex"}
                      </span>
                    </div>

                    <div className="px-5 py-2.5 flex justify-between">
                      <span className="text-[#6B7280] uppercase text-[10px]">Standard Lead Time</span>
                      <span className="font-bold text-[#0D0D0D]">
                        45 – 60 Days (Post Tech-Pack Approval)
                      </span>
                    </div>

                    <div className="px-5 py-2.5 flex justify-between">
                      <span className="text-[#6B7280] uppercase text-[10px]">Physical Sampling</span>
                      <span className="font-bold text-[#0D0D0D] flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#1E3A52]" />
                        Dispatch 7-10 days via DHL / FedEx
                      </span>
                    </div>

                    <div className="px-5 py-2.5 flex justify-between">
                      <span className="text-[#6B7280] uppercase text-[10px]">Incoterms Supported</span>
                      <span className="font-bold text-[#0D0D0D]">
                        FOB Tribhuvan / CIF Kolkata Seaport
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
