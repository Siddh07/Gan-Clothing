import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/directory/PrintButton";

export const dynamic = "force-dynamic";

interface PdfPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FactoryPdfDossierPage({ params }: PdfPageProps) {
  const { slug } = await params;

  const enterprise = await prisma.enterprise.findUnique({
    where: { slug },
    include: {
      certifications: true,
      products: {
        include: {
          category: true,
        },
        take: 6,
      },
    },
  });

  if (!enterprise) {
    notFound();
  }

  const exportMarkets = enterprise.exportMarkets.split(",").map((m) => m.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F6F7F8] py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-[#0D0D0D]">
      {/* Non-printed action toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/directory/${enterprise.slug}`}
          className="inline-flex items-center text-xs font-mono uppercase tracking-wider font-bold text-[#0D0D0D] hover:bg-[#F6F7F8] bg-white border border-[#E1E4E7] px-4 py-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Return to Mill Dossier
        </Link>

        <PrintButton />
      </div>

      {/* A4 Printable Dossier Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-[#0D0D0D] p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0 print:max-w-none space-y-8">
        {/* Official GAN Header */}
        <div className="border-b-2 border-[#0D0D0D] pb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#0D0D0D] text-white font-mono font-bold flex items-center justify-center text-xl">
              GAN
            </div>
            <div>
              <h1 className="font-mono text-base font-bold text-[#0D0D0D] tracking-wider uppercase">
                Garment Association of Nepal
              </h1>
              <p className="font-mono text-[10px] text-[#1E3A52] tracking-widest uppercase font-bold">
                Official B2B Export Accreditation Dossier
              </p>
              <p className="font-mono text-[10px] text-[#6B7280] mt-0.5">
                Secretariat Ref: GAN-EXP-{enterprise.id.slice(-6).toUpperCase()} // Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="text-right">
            {enterprise.isVerified ? (
              <div className="inline-flex items-center px-2.5 py-1 bg-white border border-[#0D0D0D] text-[#0D0D0D] font-mono font-bold text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#1E3A52]" />
                Accredited Member
              </div>
            ) : (
              <div className="inline-flex items-center px-2.5 py-1 bg-[#F6F7F8] border border-[#E1E4E7] text-[#6B7280] font-mono text-[10px] uppercase">
                Audit In Progress
              </div>
            )}
          </div>
        </div>

        {/* Factory Title & Identity */}
        <div>
          <h2 className="font-mono text-2xl font-bold uppercase text-[#0D0D0D]">
            {enterprise.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#6B7280] mt-1.5">
            <span><strong>REG:</strong> {enterprise.registrationNumber}</span>
            <span>//</span>
            <span><strong>TAX PAN:</strong> {enterprise.panNumber}</span>
            <span>//</span>
            <span><strong>LOCATION:</strong> {enterprise.address}, {enterprise.city}, Nepal</span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-[#F6F7F8] border border-[#E1E4E7] font-mono text-xs">
          <div>
            <span className="text-[#6B7280] block uppercase text-[9px]">Year Inception</span>
            <span className="font-bold text-sm text-[#0D0D0D]">{enterprise.yearEstablished}</span>
          </div>
          <div>
            <span className="text-[#6B7280] block uppercase text-[9px]">Workforce Size</span>
            <span className="font-bold text-sm text-[#0D0D0D]">{enterprise.employeeCount.toLocaleString()} Operatives</span>
          </div>
          <div>
            <span className="text-[#6B7280] block uppercase text-[9px]">Monthly Output</span>
            <span className="font-bold text-sm text-[#1E3A52]">{enterprise.monthlyCapacityPcs.toLocaleString()} pcs</span>
          </div>
          <div>
            <span className="text-[#6B7280] block uppercase text-[9px]">Status</span>
            <span className="font-bold text-sm text-[#0D0D0D]">{enterprise.status}</span>
          </div>
        </div>

        {/* Factory Overview */}
        <div className="space-y-2">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0D0D] border-b border-[#0D0D0D] pb-1">
            Manufacturing Overview & Plant Infrastructure
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed text-justify font-sans">
            {enterprise.description}
          </p>
        </div>

        {/* Compliance Certifications */}
        <div className="space-y-3">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0D0D] border-b border-[#0D0D0D] pb-1 flex items-center justify-between">
            <span>Audited Social & Quality Accreditations</span>
            <span className="text-[9px] text-[#6B7280] font-mono">Third-Party Validated</span>
          </h3>

          {enterprise.certifications.length === 0 ? (
            <p className="font-mono text-xs text-[#6B7280] italic">Self-declaration pending formal audit upload.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {enterprise.certifications.map((cert) => (
                <div key={cert.id} className="p-3 bg-[#F6F7F8] border border-[#E1E4E7] font-mono text-xs">
                  <div className="font-bold uppercase text-[#0D0D0D] text-[11px]">{cert.name}</div>
                  <div className="text-[10px] text-[#6B7280]">Issuer: {cert.issuer}</div>
                  {cert.expiryDate && (
                    <div className="text-[9px] text-[#6B7280] mt-1">
                      Valid to: {new Date(cert.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Markets */}
        <div className="space-y-2">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0D0D] border-b border-[#0D0D0D] pb-1">
            Active Export Destinations
          </h3>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
            {exportMarkets.map((m) => (
              <span key={m} className="px-2.5 py-0.5 bg-[#F6F7F8] text-[#0D0D0D] border border-[#E1E4E7]">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Product Sample Highlights */}
        <div className="space-y-3">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0D0D] border-b border-[#0D0D0D] pb-1">
            Sample Product Portfolio & Minimum Order Quantities
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {enterprise.products.map((prod) => (
              <div key={prod.id} className="p-3 border border-[#E1E4E7] font-mono text-xs space-y-1">
                <div className="font-bold uppercase text-[#0D0D0D] text-[11px]">{prod.title}</div>
                <div className="text-[10px] text-[#6B7280]">
                  Fiber: {prod.fabricType} // Category: {prod.category.name}
                </div>
                <div className="text-[10px] font-bold text-[#1E3A52]">
                  Target MOQ: {prod.moq.toLocaleString()} pcs
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Commercial Terms */}
        <div className="pt-4 border-t-2 border-[#0D0D0D] grid grid-cols-2 gap-6 font-mono text-xs">
          <div>
            <h4 className="font-bold text-[#0D0D0D] uppercase text-[10px] tracking-wider mb-1.5">
              Direct Commercial Point of Contact
            </h4>
            <div className="space-y-1 text-[#6B7280]">
              <div><strong className="text-[#0D0D0D]">Email:</strong> {enterprise.contactEmail}</div>
              <div><strong className="text-[#0D0D0D]">Phone:</strong> {enterprise.contactPhone}</div>
              {enterprise.websiteUrl && <div><strong className="text-[#0D0D0D]">Web:</strong> {enterprise.websiteUrl}</div>}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#0D0D0D] uppercase text-[10px] tracking-wider mb-1.5">
              Accreditation Authority
            </h4>
            <div className="space-y-0.5 text-[#6B7280] text-[10px]">
              <div className="text-[#0D0D0D] font-bold">Garment Association of Nepal (GAN)</div>
              <div>Sankhamul Road, New Baneshwor, Kathmandu, Nepal</div>
              <div>Email: trade@ganepal.org // Tel: +977-1-4781477</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
