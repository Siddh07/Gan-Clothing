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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Export Product Catalog Management
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Review live apparel sample specifications, assign factory attribution, and curate featured showroom items.
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
