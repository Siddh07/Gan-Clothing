"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { addFactoryProduct, deleteFactoryProduct } from "@/actions/portal";
import { Plus, Trash2, ExternalLink, Package, X, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  fabricType: string;
  gsmWeight?: number | null;
  moq: number;
  targetGender?: string | null;
  images: string;
  isFeatured: boolean;
  category: { name: string };
}

export function PortalProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: categories[0]?.id || "",
    fabricType: "100% Combed Cotton / Himalayan Wool",
    gsmWeight: 220,
    moq: 300,
    targetGender: "Unisex",
    description: "Export-grade sample garment made with certified Nepalese craftsmanship.",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
    isFeatured: true,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await addFactoryProduct(formData);
      setIsCreateOpen(false);
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove "${title}" from your product showroom?`)) {
      startTransition(async () => {
        await deleteFactoryProduct(id);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">
          Showing {initialProducts.length} export apparel sample{initialProducts.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Sample Garment
        </button>
      </div>

      {initialProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-outfit text-base font-bold text-slate-900">
            No Sample Garments Listed
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload sample garments to showcase your mill's fabric textures, stitch quality, and production capabilities to global buyers.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Apparel Sample</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Fabric Composition</th>
                  <th className="px-6 py-4">MOQ</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {initialProducts.map((prod) => {
                  let img = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200";
                  try {
                    const parsed = JSON.parse(prod.images);
                    if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                  } catch {}

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={img}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {prod.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {prod.targetGender || "Unisex"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {prod.category.name}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-800">{prod.fabricType}</div>
                        {prod.gsmWeight && (
                          <div className="text-[10px] text-slate-400">{prod.gsmWeight} GSM</div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-700">
                        {prod.moq.toLocaleString()} pcs
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-emerald-700 inline-block"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          disabled={isPending}
                          className="p-1.5 text-slate-400 hover:text-red-600 inline-block cursor-pointer"
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
      )}

      {/* Create Product Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-outfit font-bold text-base">Add Sample Garment to Showroom</h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 100% Cashmere Ribbed Cardigan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Demographic
                  </label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fabric Composition *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GSM Weight (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.gsmWeight}
                    onChange={(e) => setFormData({ ...formData, gsmWeight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Minimum Order Quantity (MOQ) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.moq}
                  onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Photo URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Garment Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                ></textarea>
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm"
                >
                  {isPending ? "Adding Sample..." : "Add to Showroom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
