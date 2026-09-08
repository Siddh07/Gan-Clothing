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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Factory Trade Inquiries & RFQs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review B2B trade inquiries routed to your mill, update merchandising response status, and communicate internal progress.
        </p>
      </div>

      <PortalInquiryInbox initialItems={inquiryItems as any} />
    </div>
  );
}
