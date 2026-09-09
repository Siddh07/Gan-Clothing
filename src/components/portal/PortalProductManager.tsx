"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addFactoryProduct, deleteFactoryProduct } from "@/actions/portal";
import { Plus, Trash2, ExternalLink, Package, X, Loader2, AlertCircle } from "lucide-react";

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await addFactoryProduct(formData);
        if (res.success && res.product) {
          setProducts((prev) => [res.product as unknown as Product, ...prev]);
          setIsCreateOpen(false);
          setFormData({
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
          router.refresh();
        } else {
          setFormError("Failed to enroll sample. Please check your inputs.");
        }
      } catch (err: any) {
        setFormError(err?.message || "Failed to create product. Check that your account is linked to a factory.");
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove "${title}" from your product showroom?`)) {
      startTransition(async () => {
        try {
          const res = await deleteFactoryProduct(id);
          if (res.success) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            router.refresh();
          }
        } catch (err: any) {
          alert(err?.message || "Failed to remove product.");
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-[#E1E4E7] p-3">
        <p className="text-xs font-mono text-[#6B7280]">
          EXHIBITION REGISTER: {products.length} SAMPLE SPECIMEN{products.length === 1 ? "" : "S"}
        </p>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center px-3.5 py-2 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] transition-colors rounded-none cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          ENROLL SAMPLE SPECIMEN
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-[#E1E4E7] p-12 text-center space-y-3">
          <div className="w-10 h-10 border border-[#E1E4E7] text-[#6B7280] flex items-center justify-center mx-auto">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0D0D0D]">
            No Garment Samples Registered
          </h3>
          <p className="text-xs font-mono text-[#6B7280] max-w-sm mx-auto">
            Upload sample garments to showcase fabric weights, yarn compositions, and production craft to international procurement buyers.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E1E4E7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead className="bg-[#F6F7F8] border-b border-[#E1E4E7] text-[10px] font-mono uppercase text-[#6B7280]">
                <tr>
                  <th className="px-4 py-3">Garment Specimen</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Material & GSM</th>
                  <th className="px-4 py-3">MOQ (Pcs)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4E7] font-mono text-xs">
                {products.map((prod) => {
                  let img = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200";
                  try {
                    const parsed = JSON.parse(prod.images);
                    if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                  } catch { }

                  return (
                    <tr key={prod.id} className="hover:bg-[#F6F7F8] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={prod.title}
                            className="w-10 h-10 object-cover bg-[#F6F7F8] border border-[#E1E4E7] shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[#0D0D0D] font-sans text-xs">
                              {prod.title}
                            </div>
                            <div className="text-[10px] text-[#6B7280]">
                              DEMO: {prod.targetGender || "UNISEX"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="tag-neutral text-[10px]">
                          {prod.category.name}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-[#0D0D0D] font-sans">{prod.fabricType}</div>
                        {prod.gsmWeight && (
                          <div className="text-[10px] text-[#6B7280]">{prod.gsmWeight} GSM</div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-bold text-[#0D0D0D]">
                        {prod.moq.toLocaleString()} pcs
                      </td>

                      <td className="px-4 py-3 text-right space-x-1.5">
                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F6F7F8] border border-transparent hover:border-[#E1E4E7] inline-block"
                          title="View Specimen Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          disabled={isPending}
                          className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 inline-block cursor-pointer"
                          title="Archive Specimen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create Product Modal / Tech Pack Spec Form */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D]/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full border border-[#E1E4E7] shadow-xl overflow-hidden">
            <div className="bg-[#0D0D0D] text-white px-5 py-3.5 flex justify-between items-center">
              <div>
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                  Technical Tech Pack Specimen Enrollment
                </h3>
                <p className="text-[10px] font-mono text-[#E1E4E7]/70">
                  STANDARD OPERATING PROCEDURE: SAMPLE SPECIFICATION ENTRY
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#E1E4E7] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Garment Style Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 100% Cashmere Ribbed Cardigan"
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Apparel Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Target Demographic
                  </label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
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
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Fabric Composition & Weave *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Fabric Weight (GSM)
                  </label>
                  <input
                    type="number"
                    value={formData.gsmWeight}
                    onChange={(e) => setFormData({ ...formData, gsmWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Minimum Order Quantity (MOQ Pcs) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.moq}
                  onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Primary Specimen Photograph URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Technical Description & Finishing Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs rounded-none focus:outline-none bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E1E4E7]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] rounded-none cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] rounded-none cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "REGISTERING..." : "COMMIT SPECIMEN TO SHOWROOM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
