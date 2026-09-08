"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleProductFeatured,
  createProduct,
  deleteProduct,
} from "@/actions/admin";
import {
  Package,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  X,
  Layers,
} from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  fabricType: string;
  gsmWeight?: number | null;
  moq: number;
  targetGender?: string | null;
  isFeatured: boolean;
  images: string;
  enterprise: { id: string; name: string; slug: string };
  category: { id: string; name: string };
}

interface EnterpriseOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

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

  const filteredProducts = initialProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.fabricType.toLowerCase().includes(search.toLowerCase()) ||
      p.enterprise.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleProductFeatured(id, currentStatus);
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete product sample "${title}"?`)) {
      startTransition(async () => {
        await deleteProduct(id);
      });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createProduct({
        ...formData,
        images: [formData.imageUrl],
      });
      setIsCreateOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product title, fabric, or factory..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product Sample
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product Sample</th>
                <th className="px-6 py-4">Manufacturer</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Fabric & GSM</th>
                <th className="px-6 py-4">MOQ</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((prod) => {
                let images: string[] = [];
                try {
                  images = JSON.parse(prod.images);
                } catch {
                  images = [prod.images];
                }
                const img = images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200";

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={img}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {prod.title}
                          </div>
                          <div className="text-[10px] text-slate-700">
                            Demographic: {prod.targetGender}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {prod.enterprise.name}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {prod.category.name}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800 line-clamp-1">{prod.fabricType}</div>
                      {prod.gsmWeight && (
                        <div className="text-[10px] text-slate-700">{prod.gsmWeight} GSM</div>
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-800">
                      {prod.moq.toLocaleString()} pcs
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(prod.id, prod.isFeatured)}
                        disabled={isPending}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.isFeatured
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {prod.isFeatured ? "Featured" : "Standard"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/products/${prod.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-700 hover:text-emerald-700 inline-block"
                        title="View product public page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod.id, prod.title)}
                        disabled={isPending}
                        className="p-1.5 text-slate-700 hover:text-red-600 inline-block"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Product */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-outfit font-bold text-lg">Add Export Product Sample</h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 100% Chyangra Cashmere Crewneck"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contract Manufacturer *</label>
                  <select
                    required
                    value={formData.enterpriseId}
                    onChange={(e) => setFormData({ ...formData, enterpriseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {enterprises.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Composition *</label>
                  <input
                    type="text"
                    required
                    value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 100% Organic Cotton Twill"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSM Weight (Optional)</label>
                  <input
                    type="number"
                    value={formData.gsmWeight}
                    onChange={(e) => setFormData({ ...formData, gsmWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="260"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Quantity (MOQ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Gender *</label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL (Cloud/Hosted)</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Garment Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700">
                  Feature in Public Showcase
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {isPending ? "Adding Sample..." : "Save Product Sample"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
