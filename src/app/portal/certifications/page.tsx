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
      <div className="border-b border-[#E1E4E7] pb-4">
        <h1 className="text-xl font-bold text-[#0D0D0D] tracking-tight">
          Compliance Accreditations & Social Audit Dossier
        </h1>
        <p className="text-xs font-mono text-[#6B7280] mt-1">
          LABOUR INTEGRITY, CHEMICAL RESTRICTIONS (OEKO-TEX) & ENVIRONMENTAL AUDIT RECORDS
        </p>
      </div>

      <PortalCertificationManager initialCertifications={certifications} />
    </div>
  );
}
