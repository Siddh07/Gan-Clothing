import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductManager } from "@/components/admin/ProductManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, enterprises, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        enterprise: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enterprise.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E1E4E7]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
          Catalog & Technical Specifications · Central Registry
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
          Export Product Catalog & Tech Packs
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Apparel sample specifications, factory mill attributions, MOQ thresholds, and international FOB export tiers.
        </p>
      </div>

      <ProductManager
        initialProducts={products}
        enterprises={enterprises}
        categories={categories}
      />
    </div>
  );
}
