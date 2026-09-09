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
  CheckCircle2,
  SlidersHorizontal,
  Download,
  Building2,
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
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "GRID">("LIST");
  const [selectedTechPack, setSelectedTechPack] = useState<ProductItem | null>(null);
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
    description: "Export quality apparel sample manufactured in Nepal with authentic mountain fiber.",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
    isFeatured: true,
  });

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.fabricType.toLowerCase().includes(search.toLowerCase()) ||
      p.enterprise.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" || p.category.id === categoryFilter;

    const matchesGender =
      genderFilter === "ALL" || p.targetGender === genderFilter;

    const matchesFeatured =
      featuredFilter === "ALL"
        ? true
        : featuredFilter === "FEATURED"
        ? p.isFeatured
        : !p.isFeatured;

    return matchesSearch && matchesCategory && matchesGender && matchesFeatured;
  });

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleProductFeatured(id, currentStatus);
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Confirm decommissioning of product style "${title}"?`)) {
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

  const parseImages = (imagesStr: string): string[] => {
    try {
      const parsed = JSON.parse(imagesStr);
      return Array.isArray(parsed) ? parsed : [imagesStr];
    } catch {
      return [imagesStr];
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters, View Mode Toggle, Add Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white border border-[#E1E4E7]">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, style, fabric, or mill..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono placeholder:font-sans placeholder:text-[#6B7280] focus:border-[#0D0D0D] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Gender */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-2 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="ALL">All Demographics</option>
            <option value="Unisex">Unisex</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>

          {/* Featured Status */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-2 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="FEATURED">Featured Showroom</option>
            <option value="STANDARD">Standard Catalog</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#E1E4E7]">
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 text-xs ${
                viewMode === "LIST"
                  ? "bg-[#0D0D0D] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#0D0D0D]"
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 text-xs ${
                viewMode === "GRID"
                  ? "bg-[#0D0D0D] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#0D0D0D]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Sample Trigger */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Style Spec
          </button>
        </div>
      </div>

      {/* Meta Bar: Product Count and Active Filter Indicators */}
      <div className="flex items-center justify-between text-xs font-mono text-[#6B7280] px-1">
        <div>
          Showing <span className="font-bold text-[#0D0D0D]">{filteredProducts.length}</span> of {initialProducts.length} product styles
        </div>
        {(search || categoryFilter !== "ALL" || genderFilter !== "ALL" || featuredFilter !== "ALL") && (
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("ALL");
              setGenderFilter("ALL");
              setFeaturedFilter("ALL");
            }}
            className="text-[11px] text-[#1E3A52] hover:underline"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Empty State vs Filtered Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="border border-[#E1E4E7] bg-white p-12 text-center">
          {initialProducts.length === 0 ? (
            <div className="space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-[#6B7280] mx-auto stroke-1" />
              <div className="font-bold text-sm text-[#0D0D0D]">No Product Styles Registered</div>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                No apparel styles currently exist in the GAN Central Catalog. Issue the first tech pack using the button above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <SlidersHorizontal className="w-8 h-8 text-[#6B7280] mx-auto stroke-1" />
              <div className="font-bold text-sm text-[#0D0D0D]">No Matching Styles Found</div>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                No styles match the current query & filter parameters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("ALL");
                  setGenderFilter("ALL");
                  setFeaturedFilter("ALL");
                }}
                className="font-mono text-xs px-3 py-1 bg-[#F6F7F8] border border-[#E1E4E7] hover:border-[#0D0D0D]"
              >
                Clear Filter Constraints
              </button>
            </div>
          )}
        </div>
      ) : viewMode === "LIST" ? (
        /* SCREEN 3: LIST VIEW (Pattern-Cutting Ledger Table) */
        <div className="border border-[#E1E4E7] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead>
                <tr>
                  <th className="w-12">Photo</th>
                  <th>SKU / Style Code</th>
                  <th>Style Name</th>
                  <th>Manufacturer / Mill</th>
                  <th>Category</th>
                  <th>Fabric & GSM</th>
                  <th className="text-right">MOQ</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const images = parseImages(prod.images);
                  const img = images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200";
                  const skuCode = `NEP-${prod.slug.slice(0, 8).toUpperCase()}`;

                  return (
                    <tr key={prod.id} className="group">
                      <td className="p-2">
                        <img
                          src={img}
                          alt={prod.title}
                          className="w-9 h-9 object-cover border border-[#E1E4E7] bg-[#F6F7F8]"
                        />
                      </td>

                      <td>
                        <button
                          onClick={() => setSelectedTechPack(prod)}
                          className="font-mono text-[11px] font-bold text-[#1E3A52] hover:underline"
                        >
                          {skuCode}
                        </button>
                      </td>

                      <td>
                        <div
                          onClick={() => setSelectedTechPack(prod)}
                          className="font-medium text-[#0D0D0D] cursor-pointer hover:text-[#1E3A52]"
                        >
                          {prod.title}
                        </div>
                        <div className="font-mono text-[10px] text-[#6B7280]">
                          Fit: {prod.targetGender}
                        </div>
                      </td>

                      <td>
                        <div className="text-[#0D0D0D]">{prod.enterprise.name}</div>
                        <div className="font-mono text-[10px] text-[#6B7280]">Nepal</div>
                      </td>

                      <td>
                        <span className="font-mono text-[10px] text-[#0D0D0D]">
                          {prod.category.name}
                        </span>
                      </td>

                      <td>
                        <div className="text-[#0D0D0D] line-clamp-1 max-w-[180px]">
                          {prod.fabricType}
                        </div>
                        {prod.gsmWeight && (
                          <div className="font-mono text-[10px] text-[#6B7280]">
                            {prod.gsmWeight} GSM
                          </div>
                        )}
                      </td>

                      <td className="text-right font-mono font-semibold text-[#0D0D0D]">
                        {prod.moq.toLocaleString()} pcs
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggleFeatured(prod.id, prod.isFeatured)}
                          disabled={isPending}
                          className={prod.isFeatured ? "tag-approved" : "tag-neutral"}
                        >
                          {prod.isFeatured ? "FEATURED" : "STANDARD"}
                        </button>
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                          <button
                            onClick={() => setSelectedTechPack(prod)}
                            className="px-1.5 py-0.5 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#0D0D0D]"
                            title="Inspect Tech Pack Dossier"
                          >
                            Tech Pack
                          </button>
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="p-1 text-[#6B7280] hover:text-[#0D0D0D]"
                            title="View Public Showcase"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod.id, prod.title)}
                            disabled={isPending}
                            className="p-1 text-[#6B7280] hover:text-red-700"
                            title="Decommission SKU"
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
        /* SCREEN 3: GRID VIEW (Architectural Collection Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const images = parseImages(prod.images);
            const img = images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400";
            const skuCode = `NEP-${prod.slug.slice(0, 8).toUpperCase()}`;

            return (
              <div
                key={prod.id}
                className="border border-[#E1E4E7] bg-white hover:border-[#0D0D0D] transition-colors flex flex-col"
              >
                {/* Image & Monospace SKU Header */}
                <div className="relative aspect-4/3 bg-[#F6F7F8] border-b border-[#E1E4E7] overflow-hidden">
                  <img
                    src={img}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#0D0D0D] text-[#0D0D0D]">
                      {skuCode}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleFeatured(prod.id, prod.isFeatured)}
                      className={prod.isFeatured ? "tag-approved" : "tag-neutral"}
                    >
                      {prod.isFeatured ? "FEATURED" : "STANDARD"}
                    </button>
                  </div>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="font-mono text-[10px] text-[#6B7280] uppercase">
                      {prod.category.name} · {prod.targetGender}
                    </div>
                    <h3 className="font-medium text-xs text-[#0D0D0D] mt-0.5 line-clamp-1">
                      {prod.title}
                    </h3>
                    <div className="text-[11px] text-[#6B7280] mt-1 line-clamp-1">
                      {prod.fabricType}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E1E4E7] space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#6B7280]">Mill:</span>
                      <span className="font-medium text-[#0D0D0D] truncate max-w-[130px]">
                        {prod.enterprise.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#6B7280]">MOQ:</span>
                      <span className="font-bold text-[#0D0D0D]">
                        {prod.moq.toLocaleString()} pcs
                      </span>
                    </div>
                    {prod.gsmWeight && (
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-[#6B7280]">Weight:</span>
                        <span className="text-[#0D0D0D]">{prod.gsmWeight} GSM</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-2.5 bg-[#F6F7F8] border-t border-[#E1E4E7] flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setSelectedTechPack(prod)}
                    className="text-[11px] font-semibold text-[#1E3A52] hover:underline"
                  >
                    Inspect Tech Pack
                  </button>
                  <Link
                    href={`/products/${prod.slug}`}
                    target="_blank"
                    className="text-[#6B7280] hover:text-[#0D0D0D]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCREEN 4: PRODUCT DETAIL / TECH PACK INSPECTOR MODAL */}
      {selectedTechPack && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#0D0D0D] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Tech Pack Dossier Header */}
            <div className="p-4 border-b border-[#E1E4E7] flex items-center justify-between bg-[#F6F7F8]">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
                  Technical Specification Sheet · Spec #{selectedTechPack.slug.slice(0, 8).toUpperCase()}
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#0D0D0D]">
                  {selectedTechPack.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTechPack(null)}
                className="p-1 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#6B7280] hover:text-[#0D0D0D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Top Two-Column: Imagery & Core Dossier */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Garment Inspection Image (5 cols) */}
                <div className="md:col-span-5 space-y-3">
                  <div className="aspect-3/4 border border-[#E1E4E7] bg-[#F6F7F8] overflow-hidden">
                    <img
                      src={parseImages(selectedTechPack.images)[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600"}
                      alt={selectedTechPack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 border border-[#E1E4E7] bg-[#F6F7F8] space-y-1 text-xs">
                    <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                      Attributed Mill Origin
                    </div>
                    <div className="font-bold text-[#0D0D0D]">
                      {selectedTechPack.enterprise.name}
                    </div>
                    <div className="font-mono text-[10px] text-[#6B7280]">
                      Kathmandu Valley Industrial Corridor, Nepal
                    </div>
                  </div>
                </div>

                {/* Right: Technical Spec Sheet (7 cols) */}
                <div className="md:col-span-7 space-y-5">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D0D0D] pb-1.5 border-b border-[#E1E4E7]">
                      1. Material & Physical Parameters
                    </h3>
                    <div className="mt-2 divide-y divide-[#E1E4E7] border border-[#E1E4E7] text-xs">
                      <div className="p-2.5 flex justify-between bg-[#F6F7F8]">
                        <span className="font-mono text-[#6B7280]">Fabric Blend / Fiber:</span>
                        <span className="font-semibold text-[#0D0D0D]">{selectedTechPack.fabricType}</span>
                      </div>
                      <div className="p-2.5 flex justify-between">
                        <span className="font-mono text-[#6B7280]">Fabric Weight:</span>
                        <span className="font-mono font-semibold text-[#0D0D0D]">
                          {selectedTechPack.gsmWeight ? `${selectedTechPack.gsmWeight} GSM` : "Not specified"}
                        </span>
                      </div>
                      <div className="p-2.5 flex justify-between bg-[#F6F7F8]">
                        <span className="font-mono text-[#6B7280]">Apparel Category:</span>
                        <span className="font-medium text-[#0D0D0D]">{selectedTechPack.category.name}</span>
                      </div>
                      <div className="p-2.5 flex justify-between">
                        <span className="font-mono text-[#6B7280]">Target Demographic:</span>
                        <span className="font-medium text-[#0D0D0D]">{selectedTechPack.targetGender}</span>
                      </div>
                      <div className="p-2.5 flex justify-between bg-[#F6F7F8]">
                        <span className="font-mono text-[#6B7280]">HS Tariff Code:</span>
                        <span className="font-mono font-bold text-[#1E3A52]">
                          6110.12 (Cashmere / Fine Animal Hair)
                        </span>
                      </div>
                      <div className="p-2.5 flex justify-between">
                        <span className="font-mono text-[#6B7280]">Sample Lead Time:</span>
                        <span className="font-mono text-[#0D0D0D]">7 – 10 working days</span>
                      </div>
                    </div>
                  </div>

                  {/* Sizing Run Cross-Table */}
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D0D0D] pb-1.5 border-b border-[#E1E4E7]">
                      2. Sizing Run Matrix (Grading Table)
                    </h3>
                    <div className="mt-2 border border-[#E1E4E7] overflow-x-auto">
                      <table className="w-full text-left text-[11px] table-ledger">
                        <thead>
                          <tr>
                            <th>Size</th>
                            <th>Chest (in)</th>
                            <th>Body Length (in)</th>
                            <th>Sleeve (in)</th>
                            <th className="text-right">Tolerance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { size: "S", chest: "38.0", length: "26.5", sleeve: "33.0" },
                            { size: "M", chest: "40.0", length: "27.5", sleeve: "34.0" },
                            { size: "L", chest: "42.0", length: "28.5", sleeve: "35.0" },
                            { size: "XL", chest: "45.0", length: "29.5", sleeve: "36.0" },
                          ].map((row) => (
                            <tr key={row.size}>
                              <td className="font-mono font-bold text-[#0D0D0D]">{row.size}</td>
                              <td className="font-mono">{row.chest}</td>
                              <td className="font-mono">{row.length}</td>
                              <td className="font-mono">{row.sleeve}</td>
                              <td className="text-right font-mono text-[#6B7280]">±0.5 in</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* FOB Pricing Tier Comparison */}
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D0D0D] pb-1.5 border-b border-[#E1E4E7]">
                      3. FOB Tier Pricing by Volume
                    </h3>
                    <div className="mt-2 border border-[#E1E4E7] overflow-x-auto">
                      <table className="w-full text-left text-[11px] table-ledger">
                        <thead>
                          <tr>
                            <th>Volume Tier</th>
                            <th>Quantity (Pcs)</th>
                            <th>FOB Estimate (USD)</th>
                            <th className="text-right">Lead Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-mono font-medium">Tier 1 (Base MOQ)</td>
                            <td className="font-mono font-bold">{selectedTechPack.moq} – 999</td>
                            <td className="font-mono font-semibold text-[#0D0D0D]">$48.00 / pc</td>
                            <td className="text-right font-mono text-[#6B7280]">4–5 weeks</td>
                          </tr>
                          <tr>
                            <td className="font-mono font-medium">Tier 2 (Commercial)</td>
                            <td className="font-mono font-bold">1,000 – 4,999</td>
                            <td className="font-mono font-semibold text-[#0D0D0D]">$42.50 / pc</td>
                            <td className="text-right font-mono text-[#6B7280]">5–6 weeks</td>
                          </tr>
                          <tr>
                            <td className="font-mono font-medium">Tier 3 (Export Bulk)</td>
                            <td className="font-mono font-bold">5,000+</td>
                            <td className="font-mono font-bold text-[#1E3A52]">$37.00 / pc</td>
                            <td className="text-right font-mono text-[#6B7280]">6–8 weeks</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garment Description */}
              {selectedTechPack.description && (
                <div className="p-4 border border-[#E1E4E7] bg-[#F6F7F8]">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280] mb-1">
                    Garment Construction Notes
                  </div>
                  <p className="text-xs text-[#0D0D0D] leading-relaxed">
                    {selectedTechPack.description}
                  </p>
                </div>
              )}
            </div>

            {/* Tech Pack Footer Actions */}
            <div className="p-4 bg-[#F6F7F8] border-t border-[#E1E4E7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${selectedTechPack.slug}`}
                  target="_blank"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-[#0D0D0D] bg-white border border-[#E1E4E7] hover:border-[#0D0D0D]"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                  Public Showcase
                </Link>
                <button
                  onClick={() => handleToggleFeatured(selectedTechPack.id, selectedTechPack.isFeatured)}
                  className="px-3 py-1.5 text-xs font-mono border border-[#E1E4E7] bg-white hover:border-[#0D0D0D]"
                >
                  Toggle Featured ({selectedTechPack.isFeatured ? "Active" : "Off"})
                </button>
              </div>

              <button
                onClick={() => setSelectedTechPack(null)}
                className="px-4 py-1.5 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52]"
              >
                Close Tech Pack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL (Strict Rectangular Tech Pack Form) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#0D0D0D] max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#E1E4E7] flex items-center justify-between bg-[#F6F7F8]">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
                  New Apparel Tech Pack
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
                  Register Export Sample Style
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#6B7280] hover:text-[#0D0D0D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Product Style Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                  placeholder="e.g. 100% Chyangra Cashmere Crewneck (12 GG)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Contract Manufacturer *
                  </label>
                  <select
                    required
                    value={formData.enterpriseId}
                    onChange={(e) => setFormData({ ...formData, enterpriseId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  >
                    {enterprises.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Fabric Blend / Composition *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                    placeholder="e.g. 100% Organic Cotton Twill"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    GSM Weight (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.gsmWeight}
                    onChange={(e) => setFormData({ ...formData, gsmWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                    placeholder="260"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Minimum Order Quantity (MOQ) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Target Fit / Demographic *
                  </label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Sample Image URL (Hosted / Cloud) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Garment Construction & Technical Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="border-[#E1E4E7] text-[#0D0D0D] focus:ring-0"
                />
                <label htmlFor="isFeatured" className="font-mono text-xs text-[#0D0D0D]">
                  Feature in Public Trade Showcase
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E1E4E7]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                >
                  {isPending ? "Registering..." : "Save Style Tech Pack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

