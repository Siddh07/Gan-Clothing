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
      <div className="pb-5 border-b border-[#E4E4E7]">
        <h1 className="text-xl font-semibold text-[#18181B]">Certifications</h1>
        <p className="text-sm text-[#71717A] mt-1">
          Manage compliance certifications displayed on your public factory profile. Buyers filter by WRAP, GOTS, ISO, and similar standards.
        </p>
      </div>

      <PortalCertificationManager initialCertifications={certifications} />
    </div>
  );
}
