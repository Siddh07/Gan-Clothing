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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Member Garment Exporters Registry
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Manage accredited Nepalese apparel mills, verify compliance certifications, and configure plant capacity limits.
        </p>
      </div>

      <EnterpriseManager initialEnterprises={enterprises} />
    </div>
  );
}
