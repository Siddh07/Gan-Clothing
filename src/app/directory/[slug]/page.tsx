import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { EnterpriseTabs } from "@/components/directory/EnterpriseTabs";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  Layers,
  Users,
} from "lucide-react";

interface EnterpriseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EnterpriseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const enterprise = await prisma.enterprise.findUnique({
    where: { slug },
    select: { name: true, description: true, city: true },
  });

  if (!enterprise) {
    return { title: "Enterprise Not Found" };
  }

  return {
    title: `${enterprise.name} | Garment Association of Nepal`,
    description: enterprise.description.slice(0, 160),
    openGraph: {
      title: `${enterprise.name} - Nepal Apparel Exporter`,
      description: `Verified Nepalese garment factory based in ${enterprise.city}. Member of Garment Association of Nepal.`,
    },
  };
}

export default async function EnterpriseDetailPage({
  params,
}: EnterpriseDetailPageProps) {
  const { slug } = await params;

  const enterprise = await prisma.enterprise.findUnique({
    where: { slug },
    include: {
      certifications: true,
      products: {
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!enterprise) {
    notFound();
  }

  return (
    <>
      <OrganizationJsonLd
        name={enterprise.name}
        url={`https://ganepal.org/directory/${enterprise.slug}`}
        logo={enterprise.logoUrl || undefined}
        description={enterprise.description}
        address={`${enterprise.address}, ${enterprise.city}, Nepal`}
        email={enterprise.contactEmail}
        telephone={enterprise.contactPhone}
      />

      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pb-20">
          {/* Back Navigation Bar */}
          <div className="bg-slate-900 border-b border-slate-800 text-slate-700 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
              <Link
                href="/directory"
                className="inline-flex items-center hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to All Exporters Directory
              </Link>
              <span>GAN Registry Ref: #{enterprise.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          {/* Hero Header */}
          <section className="bg-white border-b border-slate-200">
            <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
              {enterprise.coverImageUrl ? (
                <img
                  src={enterprise.coverImageUrl}
                  alt={enterprise.name}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-r from-slate-900 to-emerald-950" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {enterprise.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      GAN Verified Exporter
                    </span>
                  )}
                  <span className="text-xs text-slate-300 font-medium">
                    Established in {enterprise.yearEstablished}
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {enterprise.city}, Nepal
                  </span>
                </div>
                <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  {enterprise.name}
                </h1>
              </div>
            </div>

            {/* Quick Contact & Info Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-6">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                  {enterprise.address}, {enterprise.city}
                </span>
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                  {enterprise.contactPhone}
                </span>
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                  {enterprise.contactEmail}
                </span>
                {enterprise.websiteUrl && (
                  <a
                    href={enterprise.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-emerald-700 font-medium"
                  >
                    <Globe className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Profile Tabbed Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <EnterpriseTabs enterprise={enterprise} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
