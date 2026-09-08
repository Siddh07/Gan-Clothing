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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Factory Onboarding & Review Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review legal registration, PAN authenticity, and capacity figures submitted by prospective member garment mills.
        </p>
      </div>

      <ApplicationReviewQueue initialApplications={pendingApplications as any} />
    </div>
  );
}
