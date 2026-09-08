import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Printer,
  ArrowLeft,
  Award,
  Calendar,
  Layers,
  Users,
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
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-slate-900">
      {/* Non-printed action toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/directory/${enterprise.slug}`}
          className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Factory Profile
        </Link>

        <PrintButton />
      </div>

      {/* A4 Printable Dossier Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-lg print:border-none print:shadow-none print:p-0 print:max-w-none space-y-8">
        {/* Official GAN Header */}
        <div className="border-b-2 border-emerald-800 pb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-black flex items-center justify-center text-2xl print:border print:border-emerald-800">
              GAN
            </div>
            <div>
              <h1 className="font-outfit text-xl font-black text-slate-900 tracking-tight uppercase">
                Garment Association of Nepal
              </h1>
              <p className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">
                Official B2B Export Accreditation Dossier
              </p>
              <p className="text-[11px] text-slate-700 mt-0.5">
                Secretariat Reference: GAN-EXP-{enterprise.id.slice(-6).toUpperCase()} • Issued: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="text-right">
            {enterprise.isVerified ? (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                Accredited Member
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                Pending Verification
              </div>
            )}
          </div>
        </div>

        {/* Factory Title & Identity */}
        <div>
          <h2 className="font-outfit text-3xl font-black text-slate-900">
            {enterprise.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 mt-2">
            <span><strong>Reg No:</strong> {enterprise.registrationNumber}</span>
            <span>•</span>
            <span><strong>Tax PAN:</strong> {enterprise.panNumber}</span>
            <span>•</span>
            <span><strong>Location:</strong> {enterprise.address}, {enterprise.city}, Nepal</span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-700 block uppercase font-semibold text-[10px]">Year Established</span>
            <span className="font-outfit font-black text-lg text-slate-900">{enterprise.yearEstablished}</span>
          </div>
          <div>
            <span className="text-slate-700 block uppercase font-semibold text-[10px]">Workforce Size</span>
            <span className="font-outfit font-black text-lg text-slate-900">{enterprise.employeeCount.toLocaleString()} workers</span>
          </div>
          <div>
            <span className="text-slate-700 block uppercase font-semibold text-[10px]">Monthly Capacity</span>
            <span className="font-outfit font-black text-lg text-emerald-800">{enterprise.monthlyCapacityPcs.toLocaleString()} pcs</span>
          </div>
          <div>
            <span className="text-slate-700 block uppercase font-semibold text-[10px]">Status</span>
            <span className="font-outfit font-black text-lg text-slate-900">{enterprise.status}</span>
          </div>
        </div>

        {/* Factory Overview */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Manufacturing Overview & Core Capabilities
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {enterprise.description}
          </p>
        </div>

        {/* Compliance Certifications */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>Audited Social & Quality Standards</span>
            <span className="text-[10px] text-slate-700 font-normal">Third-party audited</span>
          </h3>

          {enterprise.certifications.length === 0 ? (
            <p className="text-xs text-slate-700 italic">Self-declaration pending formal audit submission.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {enterprise.certifications.map((cert) => (
                <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{cert.name}</div>
                  <div className="text-[11px] text-slate-700">Issued by {cert.issuer}</div>
                  {cert.expiryDate && (
                    <div className="text-[10px] text-slate-700 mt-1">
                      Valid through: {new Date(cert.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Markets */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Active Export Destinations
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {exportMarkets.map((m) => (
              <span key={m} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Product Sample Highlights */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Sample Product Portfolio & MOQs
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {enterprise.products.map((prod) => (
              <div key={prod.id} className="p-3 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900">{prod.title}</div>
                <div className="text-[11px] text-slate-700">
                  Fabric: {prod.fabricType} • Category: {prod.category.name}
                </div>
                <div className="text-[11px] font-semibold text-emerald-800">
                  Minimum Order: {prod.moq.toLocaleString()} pcs
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Commercial Terms */}
        <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1.5">
              Direct Commercial Contact
            </h4>
            <div className="space-y-1 text-slate-700">
              <div><strong>Email:</strong> {enterprise.contactEmail}</div>
              <div><strong>Phone:</strong> {enterprise.contactPhone}</div>
              {enterprise.websiteUrl && <div><strong>Web:</strong> {enterprise.websiteUrl}</div>}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1.5">
              Accreditation Authority
            </h4>
            <div className="space-y-1 text-slate-700 text-[11px]">
              <div>Garment Association of Nepal (GAN)</div>
              <div>Sankhamul Road, New Baneshwor, Kathmandu, Nepal</div>
              <div>Email: trade@ganepal.org • Tel: +977-1-4781477</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
