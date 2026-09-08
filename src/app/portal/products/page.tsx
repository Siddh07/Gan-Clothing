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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Factory Apparel Catalog & Samples
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage sample garments exhibited in the public GAN directory for international buyer tech-pack reviews.
        </p>
      </div>

      <PortalProductManager
        initialProducts={products}
        categories={categories}
      />
    </div>
  );
}
