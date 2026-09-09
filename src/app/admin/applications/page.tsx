import React from "react";
import { prisma } from "@/lib/prisma";
import { ApplicationReviewQueue } from "@/components/admin/ApplicationReviewQueue";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const pendingApplications = await prisma.enterprise.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      users: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E1E4E7]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
          Governance & Secretariat Review · Compliance Triage
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
          Mill Accreditation Applications & Review Queue
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Audit statutory tax numbers (PAN), business registration documents, and claimed monthly production capacity before certifying new export facilities.
        </p>
      </div>

      <ApplicationReviewQueue initialApplications={pendingApplications as any} />
    </div>
  );
}
