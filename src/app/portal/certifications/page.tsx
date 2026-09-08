import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PortalCertificationManager } from "@/components/portal/PortalCertificationManager";

export const dynamic = "force-dynamic";

export default async function PortalCertificationsPage() {
  const session = await getServerSession(authOptions);
  const enterpriseId = (session?.user as any)?.enterpriseId;

  if (!enterpriseId) {
    redirect("/portal");
  }

  const certifications = await prisma.certification.findMany({
    where: { enterpriseId },
    orderBy: { expiryDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Compliance & Sustainability Audits
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain active accreditation credentials for social labor, chemical safety (OEKO-TEX), and environmental management.
        </p>
      </div>

      <PortalCertificationManager initialCertifications={certifications} />
    </div>
  );
}
