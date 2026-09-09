import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";
import { UnifiedRFQCheckout } from "@/components/public/UnifiedRFQCheckout";
import { Globe2 } from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner */}
        <div className="bg-[#0D0D0D] text-white py-10 border-b border-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center space-x-2 font-mono text-[10px] uppercase tracking-widest text-[#E1E4E7]">
                <Globe2 className="w-3.5 h-3.5 text-white" />
                <span>Centralized Multi-Item Sourcing Desk</span>
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                Unified Request for Quotation (B2B RFQ)
              </h1>
              <p className="text-xs text-[#E1E4E7] leading-relaxed font-sans">
                Source directly from accredited Nepalese manufacturers. Review line items, configure bespoke technical specifications, and submit for direct FOB/CIF quotations.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <UnifiedRFQCheckout enterprises={enterprises} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
