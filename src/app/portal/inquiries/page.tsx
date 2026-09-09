import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PortalInquiryInbox } from "@/components/portal/PortalInquiryInbox";

export const dynamic = "force-dynamic";

export default async function PortalInquiriesPage() {
  const session = await getServerSession(authOptions);
  const enterpriseId = (session?.user as any)?.enterpriseId;

  if (!enterpriseId) {
    redirect("/portal");
  }

  // Fetch inquiry items specifically targeted at this factory
  const inquiryItems = await prisma.leadInquiryItem.findMany({
    where: { enterpriseId },
    include: {
      product: { select: { title: true } },
      inquiry: {
        include: {
          communications: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { inquiry: { createdAt: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E1E4E7] pb-4">
        <h1 className="text-xl font-bold text-[#0D0D0D] tracking-tight">
          Commercial RFQs & Buyer Dispatch Inbox
        </h1>
        <p className="text-xs font-mono text-[#6B7280] mt-1">
          MONITOR PROCUREMENT REQUISITIONS ROUTED BY THE CENTRAL TRADE DESK
        </p>
      </div>

      <PortalInquiryInbox initialItems={inquiryItems as any} />
    </div>
  );
}
