"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X, Check, RotateCcw } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface DirectoryFiltersProps {
  categories: CategoryOption[];
  availableCertifications: string[];
  availableMarkets: string[];
}

export function DirectoryFilters({
  categories,
  availableCertifications,
  availableMarkets,
}: DirectoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get("category") || "";
  const selectedCertification = searchParams.get("certification") || "";
  const selectedMarket = searchParams.get("market") || "";
  const selectedMoq = searchParams.get("moq") || "";

  // Helper to update a param in the URL query string
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset pagination if any
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    const view = searchParams.get("view");
    if (search) params.set("search", search);
    if (view) params.set("view", view);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedCertification || selectedMarket || selectedMoq
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-emerald-700" />
          <h3 className="font-outfit font-bold text-slate-900 text-base">Faceted Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Apparel Sector
        </label>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", "")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${!selectedCategory
                ? "bg-emerald-50 text-emerald-800 font-bold"
                : "text-slate-600 hover:bg-slate-50"
              }`}
          >
            <span>All Sectors</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5 text-emerald-700" />}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam("category", isSelected ? "" : cat.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${isSelected
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Certification Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Audited Compliance
        </label>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("certification", "")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${!selectedCertification
                ? "bg-emerald-50 text-emerald-800 font-bold"
                : "text-slate-600 hover:bg-slate-50"
              }`}
          >
            <span>Any Certification</span>
            {!selectedCertification && <Check className="w-3.5 h-3.5 text-emerald-700" />}
          </button>
          {availableCertifications.map((cert) => {
            const isSelected = selectedCertification.toLowerCase() === cert.toLowerCase();
            return (
              <button
                key={cert}
                onClick={() => updateParam("certification", isSelected ? "" : cert)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${isSelected
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span className="truncate">{cert}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Destination Market */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Export Destinations
        </label>
        <select
          value={selectedMarket}
          onChange={(e) => updateParam("market", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All Global Markets</option>
          {availableMarkets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Max MOQ Selector */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Max Minimum Order (MOQ)
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Any MOQ", value: "" },
            { label: "≤ 200 pcs", value: "200" },
            { label: "≤ 500 pcs", value: "500" },
            { label: "≤ 1,000 pcs", value: "1000" },
          ].map((moqOption) => {
            const isSelected = selectedMoq === moqOption.value;
            return (
              <button
                key={moqOption.label}
                onClick={() => updateParam("moq", moqOption.value)}
                className={`px-2.5 py-2 rounded-lg font-medium border text-center transition-colors ${isSelected
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {moqOption.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
