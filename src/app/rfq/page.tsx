import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";
import { GeneralRFQForm } from "@/components/public/GeneralRFQForm";
import { ShieldCheck, Globe2, Building2, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit B2B RFQ | Garment Association of Nepal Trade Desk",
  description:
    "Submit your apparel sourcing requirements, tech packs, and target quantities directly to the Garment Association of Nepal Secretariat.",
};

export default async function RFQPage() {
  const enterprises = await prisma.enterprise.findMany({
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner */}
        <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                <Globe2 className="w-4 h-4" />
                <span>Centralized Bilateral Trade Desk</span>
              </div>
              <h1 className="font-outfit text-3xl sm:text-4xl font-black">
                Request for Quotation (B2B RFQ)
              </h1>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Connect with the apex trade body. Submit your apparel specifications to receive competitive FOB/CIF quotations from verified Nepalese export factories.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md space-y-8">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-outfit text-2xl font-bold text-slate-900">
                  Sourcing Specification Form
                </h2>
                <p className="text-xs text-slate-700 mt-1">
                  All trade inquiries are confidential and vetted by GAN Secretariat Trade Officers.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Protected Trade Routing</span>
              </div>
            </div>

            {/* Client form */}
            <GeneralRFQForm enterprises={enterprises} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
