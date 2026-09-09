import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PortalProductManager } from "@/components/portal/PortalProductManager";

export const dynamic = "force-dynamic";

export default async function PortalProductsPage() {
  const session = await getServerSession(authOptions);
  const enterpriseId = (session?.user as any)?.enterpriseId;

  if (!enterpriseId) {
    redirect("/portal");
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { enterpriseId },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E1E4E7] pb-4">
        <h1 className="text-xl font-bold text-[#0D0D0D] tracking-tight">
          Export Garment Samples & Tech Packs
        </h1>
        <p className="text-xs font-mono text-[#6B7280] mt-1">
          REGISTERED SPECIMENS EXHIBITED IN THE CENTRAL B2B SOURCING CATALOG
        </p>
      </div>

      <PortalProductManager
        initialProducts={products}
        categories={categories}
      />
    </div>
  );
}
