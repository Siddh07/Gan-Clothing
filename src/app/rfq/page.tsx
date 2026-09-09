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
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-[#18181B]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Page header */}
        <div className="bg-white border-b border-[#E4E4E7] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Globe2 className="w-4 h-4 text-[#2D5BE3]" />
                <span className="text-sm text-[#71717A]">Multi-item sourcing desk</span>
              </div>
              <h1 className="text-2xl font-semibold text-[#18181B] mb-2">
                Submit a sourcing request
              </h1>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Source directly from accredited Nepalese manufacturers. Configure line items and specifications, then submit for direct FOB/CIF quotations from the GAN trade desk.
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
