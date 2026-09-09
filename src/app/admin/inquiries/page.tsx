import React from "react";
import { prisma } from "@/lib/prisma";
import { InquiryManager } from "@/components/admin/InquiryManager";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.leadInquiry.findMany({
    include: {
      items: {
        include: {
          enterprise: { select: { id: true, name: true, contactEmail: true } },
          product: { select: { id: true, title: true, images: true } },
        },
      },
      communications: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E1E4E7]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
          Bilateral Trade Desk · Export Purchase Requisitions
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
          Buyer Sourcing Inquiries & Purchase Orders
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          International buyer purchase requisitions, factory production allocations, FOB terms, and secretariat export routing.
        </p>
      </div>

      <InquiryManager initialInquiries={inquiries as any} />
    </div>
  );
}
