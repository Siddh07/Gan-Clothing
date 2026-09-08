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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          International Buyer Sourcing Inquiries (RFQs)
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Monitor trade leads, update merchandising dispatch status, log internal secretariat notes, and download records for bilateral trade reporting.
        </p>
      </div>

      <InquiryManager initialInquiries={inquiries as any} />
    </div>
  );
}
