import React from "react";
import { prisma } from "@/lib/prisma";
import { EnterpriseManager } from "@/components/admin/EnterpriseManager";

export const dynamic = "force-dynamic";

export default async function AdminEnterprisesPage() {
  const enterprises = await prisma.enterprise.findMany({
    include: {
      certifications: {
        select: { id: true, name: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E1E4E7]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
          Accreditation & Mill Registry · Garment Association of Nepal
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
          Accredited Export Mill & Manufacturer Registry
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Verified apparel manufacturing plants, government PAN & company registrations, monthly volume capacities, and compliance accreditations.
        </p>
      </div>

      <EnterpriseManager initialEnterprises={enterprises} />
    </div>
  );
}
