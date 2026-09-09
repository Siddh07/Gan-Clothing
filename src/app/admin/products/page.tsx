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
      <div className="pb-4 border-b border-[#E4E4E7]">
        <h1 className="text-xl font-semibold text-[#18181B]">
          Export products
        </h1>
        <p className="text-sm text-[#71717A] mt-0.5 max-w-2xl">
          Apparel sample specifications, mill attributions, MOQ thresholds, and public showcase status.
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
