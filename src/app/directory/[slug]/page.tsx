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
  MapPin,
  Globe,
  Phone,
  Mail,
  ArrowLeft,
  Printer,
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

      <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
        <Navbar />

        <main className="flex-1 pb-20">
          {/* Back Navigation Bar */}
          <div className="bg-[#0D0D0D] border-b border-[#0D0D0D] text-[#E1E4E7] py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between font-mono text-xs">
              <Link
                href="/directory"
                className="inline-flex items-center hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Return to Exporter Registry
              </Link>
              <span>REGISTRY ID: #{enterprise.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          {/* Hero Header */}
          <section className="bg-white border-b border-[#E1E4E7]">
            <div className="relative h-64 sm:h-72 w-full bg-[#0D0D0D] overflow-hidden">
              {enterprise.coverImageUrl ? (
                <img
                  src={enterprise.coverImageUrl}
                  alt={enterprise.name}
                  className="w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="w-full h-full bg-[#0D0D0D]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />

              <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-[10px] uppercase">
                  {enterprise.isVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#1E3A52] text-white border border-white/20">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      GAN Verified Exporter
                    </span>
                  )}
                  <span className="text-[#E1E4E7]">
                    Est. {enterprise.yearEstablished}
                  </span>
                  <span className="text-[#6B7280]">//</span>
                  <span className="text-[#E1E4E7]">
                    {enterprise.city}, Nepal
                  </span>
                </div>
                <h1 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white">
                  {enterprise.name}
                </h1>
              </div>
            </div>

            {/* Quick Contact & Info Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#6B7280]">
              <div className="flex flex-wrap items-center gap-6">
                <span className="flex items-center text-[#0D0D0D]">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#1E3A52] shrink-0" />
                  {enterprise.address}, {enterprise.city}
                </span>
                <span className="flex items-center text-[#0D0D0D]">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-[#1E3A52] shrink-0" />
                  {enterprise.contactPhone}
                </span>
                <span className="flex items-center text-[#0D0D0D]">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-[#1E3A52] shrink-0" />
                  {enterprise.contactEmail}
                </span>
                {enterprise.websiteUrl && (
                  <a
                    href={enterprise.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[#1E3A52] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Web Portal
                  </a>
                )}
              </div>

              <div>
                <Link
                  href={`/directory/${enterprise.slug}/pdf`}
                  target="_blank"
                  className="inline-flex items-center px-3.5 py-1.5 rounded-none border border-[#E1E4E7] bg-white text-[#0D0D0D] hover:bg-[#F6F7F8] font-mono text-xs uppercase tracking-wider font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5 text-[#1E3A52]" />
                  Dossier (Print / PDF)
                </Link>
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
