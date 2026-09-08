import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";
import { UnifiedRFQCheckout } from "@/components/public/UnifiedRFQCheckout";
import { Globe2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unified B2B RFQ Checkout | Garment Association of Nepal",
  description:
    "Submit your multi-item apparel sourcing specifications, custom tech packs, and target delivery timelines directly to verified Nepalese garment mills.",
};

export default async function RFQPage() {
  const enterprises = await prisma.enterprise.findMany({
    where: { status: "APPROVED" },
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
                <span>Centralized Multi-Item Sourcing Desk</span>
              </div>
              <h1 className="font-outfit text-3xl sm:text-4xl font-black">
                Unified Request for Quotation (B2B RFQ)
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Source directly from accredited Nepalese manufacturers. Review your line items, configure custom specifications, and submit for direct FOB/CIF quotations.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <UnifiedRFQCheckout enterprises={enterprises} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
