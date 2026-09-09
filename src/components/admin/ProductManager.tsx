"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleProductFeatured,
  createProduct,
  deleteProduct,
} from "@/actions/admin";
import {
  Plus,
  Trash2,
  ExternalLink,
  Search,
  X,
  LayoutList,
  LayoutGrid,
  FileSpreadsheet,
  SlidersHorizontal,
} from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  fabricType: string;
  gsmWeight?: number | null;
  moq: number;
  targetGender?: string | null;
  description?: string;
  isFeatured: boolean;
  images: string;
  enterprise: { id: string; name: string; slug: string };
  category: { id: string; name: string };
}

interface EnterpriseOption { id: string; name: string; }
interface CategoryOption { id: string; name: string; }

export function ProductManager({
  initialProducts,
  enterprises,
  categories,
}: {
  initialProducts: ProductItem[];
  enterprises: EnterpriseOption[];
  categories: CategoryOption[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "GRID">("LIST");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    enterpriseId: enterprises[0]?.id || "",
    categoryId: categories[0]?.id || "",
    fabricType: "100% Himalayan Cashmere (12 GG)",
    gsmWeight: 260,
    moq: 300,
    targetGender: "Unisex",
    description: "Export quality apparel sample manufactured in Nepal.",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
    isFeatured: true,
  });

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.fabricType.toLowerCase().includes(search.toLowerCase()) ||
      p.enterprise.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || p.category.id === categoryFilter;
    const matchesGender = genderFilter === "ALL" || p.targetGender === genderFilter;
    const matchesFeatured =
      featuredFilter === "ALL" ? true : featuredFilter === "FEATURED" ? p.isFeatured : !p.isFeatured;
    return matchesSearch && matchesCategory && matchesGender && matchesFeatured;
  });

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    startTransition(async () => { await toggleProductFeatured(id, currentStatus); });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete product "${title}"? This cannot be undone.`)) {
      startTransition(async () => { await deleteProduct(id); });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createProduct({ ...formData, images: [formData.imageUrl] });
      setIsCreateOpen(false);
    });
  };

  const parseImages = (imagesStr: string): string[] => {
    try {
      const parsed = JSON.parse(imagesStr);
      return Array.isArray(parsed) ? parsed : [imagesStr];
    } catch { return [imagesStr]; }
  };

  const clearFilters = () => {
    setSearch(""); setCategoryFilter("ALL"); setGenderFilter("ALL"); setFeaturedFilter("ALL");
  };

  const hasFilters = search || categoryFilter !== "ALL" || genderFilter !== "ALL" || featuredFilter !== "ALL";

  const inputCls = "w-full px-3 py-2 border border-[#D1D5DB] rounded text-sm text-[#1A1A1A] bg-white placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/15 focus:outline-none transition";
  const labelCls = "block text-sm font-medium text-[#1A1A1A] mb-1.5";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, mills, fabric…"
              className="pl-8 pr-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none w-56"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] focus:border-[#3B5BDB] focus:outline-none"
          >
            <option value="ALL">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] focus:border-[#3B5BDB] focus:outline-none"
          >
            <option value="ALL">All demographics</option>
            <option value="Unisex">Unisex</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>

          {/* Status filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] focus:border-[#3B5BDB] focus:outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="FEATURED">Featured</option>
            <option value="STANDARD">Standard</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-[#D1D5DB] rounded overflow-hidden">
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-2 ${viewMode === "LIST" ? "bg-[#3B5BDB] text-white" : "bg-white text-[#6B7280] hover:text-[#1A1A1A]"}`}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-2 ${viewMode === "GRID" ? "bg-[#3B5BDB] text-white" : "bg-white text-[#6B7280] hover:text-[#1A1A1A]"}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add product
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-sm text-[#6B7280]">
        <span>
          Showing <span className="font-medium text-[#1A1A1A]">{filteredProducts.length}</span> of {initialProducts.length} products
        </span>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-[#3B5BDB] hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Empty states */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#D1D5DB] py-16 text-center">
          {initialProducts.length === 0 ? (
            <div className="space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-[#D1D5DB] mx-auto" />
              <p className="text-[#1A1A1A] font-medium">No products yet</p>
              <p className="text-sm text-[#6B7280]">Add your first product to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <SlidersHorizontal className="w-8 h-8 text-[#D1D5DB] mx-auto" />
              <p className="text-[#1A1A1A] font-medium">No matching products</p>
              <p className="text-sm text-[#6B7280] mb-3">Try adjusting your filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm text-[#3B5BDB] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : viewMode === "LIST" ? (
        /* List view */
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  <th>Product</th>
                  <th>Mill</th>
                  <th>Category</th>
                  <th>Fabric</th>
                  <th className="text-right">MOQ</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const images = parseImages(prod.images);
                  const img = images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200";
                  return (
                    <tr key={prod.id}>
                      <td className="px-3 py-2">
                        <img
                          src={img}
                          alt={prod.title}
                          className="w-9 h-9 object-cover rounded border border-[#D1D5DB]"
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="font-medium text-[#1A1A1A] hover:text-[#3B5BDB] text-left"
                        >
                          {prod.title}
                        </button>
                        <div className="text-xs text-[#6B7280]">{prod.targetGender}</div>
                      </td>
                      <td className="text-sm text-[#1A1A1A]">{prod.enterprise.name}</td>
                      <td className="text-sm text-[#6B7280]">{prod.category.name}</td>
                      <td>
                        <div className="text-sm text-[#1A1A1A] max-w-[160px] truncate">{prod.fabricType}</div>
                        {prod.gsmWeight && <div className="text-xs text-[#6B7280]">{prod.gsmWeight} GSM</div>}
                      </td>
                      <td className="text-right text-sm font-medium text-[#1A1A1A] tabular-nums">
                        {prod.moq.toLocaleString()} pcs
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleFeatured(prod.id, prod.isFeatured)}
                          disabled={isPending}
                          className={`badge ${prod.isFeatured ? "badge-accent" : "badge-neutral"} cursor-pointer hover:opacity-80`}
                        >
                          {prod.isFeatured ? "Featured" : "Standard"}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            className="px-2 py-1 text-xs font-medium text-[#3B5BDB] hover:bg-[#EEF2FF] rounded transition"
                          >
                            Details
                          </button>
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="p-1 text-[#9CA3AF] hover:text-[#1A1A1A] transition"
                            title="View public page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod.id, prod.title)}
                            disabled={isPending}
                            className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const images = parseImages(prod.images);
            const img = images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400";
            return (
              <div key={prod.id} className="bg-white rounded-lg border border-[#D1D5DB] flex flex-col overflow-hidden hover:border-[#3B5BDB] transition-colors">
                <div className="relative aspect-4/3 bg-[#F8F8F6] overflow-hidden">
                  <img src={img} alt={prod.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleFeatured(prod.id, prod.isFeatured)}
                      className={`badge ${prod.isFeatured ? "badge-accent" : "badge-neutral"} cursor-pointer`}
                    >
                      {prod.isFeatured ? "Featured" : "Standard"}
                    </button>
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-[#6B7280]">{prod.category.name} · {prod.targetGender}</p>
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="text-sm font-medium text-[#1A1A1A] hover:text-[#3B5BDB] text-left mt-0.5 line-clamp-1"
                    >
                      {prod.title}
                    </button>
                    <p className="text-xs text-[#6B7280] mt-0.5 truncate">{prod.fabricType}</p>
                  </div>
                  <div className="mt-auto pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">MOQ <span className="font-medium text-[#1A1A1A]">{prod.moq.toLocaleString()} pcs</span></span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="text-[#3B5BDB] hover:underline font-medium"
                      >
                        Details
                      </button>
                      <Link href={`/products/${prod.slug}`} target="_blank" className="text-[#9CA3AF] hover:text-[#1A1A1A] ml-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D1D5DB] shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D5DB]">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">{selectedProduct.title}</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">{selectedProduct.enterprise.name} · {selectedProduct.category.name}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Image */}
              <div className="md:col-span-2">
                <div className="aspect-3/4 bg-[#F8F8F6] rounded border border-[#D1D5DB] overflow-hidden">
                  <img
                    src={parseImages(selectedProduct.images)[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600"}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="md:col-span-3 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 pb-2 border-b border-[#D1D5DB]">Material & specifications</h3>
                  <dl className="space-y-2">
                    {[
                      ["Fabric", selectedProduct.fabricType],
                      ["Weight", selectedProduct.gsmWeight ? `${selectedProduct.gsmWeight} GSM` : "Not specified"],
                      ["Category", selectedProduct.category.name],
                      ["Target", selectedProduct.targetGender || "—"],
                      ["MOQ", `${selectedProduct.moq.toLocaleString()} pcs`],
                      ["HS Code", "6110.12 (Fine animal hair)"],
                      ["Lead time", "7–10 business days (sample)"],
                    ].map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="text-[#6B7280]">{key}</dt>
                        <dd className="font-medium text-[#1A1A1A] text-right max-w-[200px]">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {selectedProduct.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 pb-2 border-b border-[#D1D5DB]">Notes</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#D1D5DB] bg-[#F8F8F6]">
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${selectedProduct.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#D1D5DB] rounded bg-white hover:bg-[#F3F4F6] transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                  Public page
                </Link>
                <button
                  onClick={() => handleToggleFeatured(selectedProduct.id, selectedProduct.isFeatured)}
                  className="px-3 py-2 text-sm font-medium border border-[#D1D5DB] rounded bg-white hover:bg-[#F3F4F6] transition"
                >
                  {selectedProduct.isFeatured ? "Remove from featured" : "Mark as featured"}
                </button>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D1D5DB] shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D5DB]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Add product</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Product title *</label>
                <input
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls} placeholder="e.g. 100% Chyangra Cashmere Crewneck"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Manufacturer *</label>
                  <select value={formData.enterpriseId}
                    onChange={(e) => setFormData({ ...formData, enterpriseId: e.target.value })}
                    className={inputCls}>
                    {enterprises.map((ent) => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={inputCls}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Fabric composition *</label>
                  <input type="text" required value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className={inputCls} placeholder="e.g. 100% Organic Cotton" />
                </div>
                <div>
                  <label className={labelCls}>GSM weight</label>
                  <input type="number" value={formData.gsmWeight}
                    onChange={(e) => setFormData({ ...formData, gsmWeight: Number(e.target.value) })}
                    className={inputCls} placeholder="260" />
                </div>
                <div>
                  <label className={labelCls}>MOQ (pieces) *</label>
                  <input type="number" required value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Target demographic *</label>
                  <select value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className={inputCls}>
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Image URL *</label>
                <input type="url" required value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea rows={3} required value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isFeatured" checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-[#D1D5DB] text-[#3B5BDB] focus:ring-[#3B5BDB]" />
                <label htmlFor="isFeatured" className="text-sm text-[#1A1A1A]">Feature in public showcase</label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D1D5DB]">
                <button type="button" onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] transition">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-60">
                  {isPending ? "Saving…" : "Save product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
