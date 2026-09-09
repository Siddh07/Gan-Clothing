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
    <div className="bg-white border border-[#E1E4E7] p-4 space-y-5 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E4E7]">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#1E3A52]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#0D0D0D]">Faceted Sourcing Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] text-[#1E3A52] hover:underline inline-flex items-center uppercase cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            RESET
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase text-[#6B7280] block">
          Apparel Sector
        </label>
        <div className="space-y-0.5">
          <button
            onClick={() => updateParam("category", "")}
            className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
              !selectedCategory
                ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-l-2 border-[#1E3A52]"
                : "text-[#6B7280] hover:bg-[#F6F7F8] hover:text-[#0D0D0D]"
            }`}
          >
            <span>All Sectors</span>
            {!selectedCategory && <Check className="w-3 h-3 text-[#1E3A52]" />}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam("category", isSelected ? "" : cat.slug)}
                className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-l-2 border-[#1E3A52]"
                    : "text-[#6B7280] hover:bg-[#F6F7F8] hover:text-[#0D0D0D]"
                }`}
              >
                <span className="truncate font-sans">{cat.name}</span>
                {isSelected && <Check className="w-3 h-3 text-[#1E3A52] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Certification Filter */}
      <div className="space-y-2 pt-3 border-t border-[#E1E4E7]">
        <label className="text-[10px] uppercase text-[#6B7280] block">
          Audited Compliance
        </label>
        <div className="space-y-0.5">
          <button
            onClick={() => updateParam("certification", "")}
            className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
              !selectedCertification
                ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-l-2 border-[#1E3A52]"
                : "text-[#6B7280] hover:bg-[#F6F7F8] hover:text-[#0D0D0D]"
            }`}
          >
            <span>Any Audit Standard</span>
            {!selectedCertification && <Check className="w-3 h-3 text-[#1E3A52]" />}
          </button>
          {availableCertifications.map((cert) => {
            const isSelected = selectedCertification.toLowerCase() === cert.toLowerCase();
            return (
              <button
                key={cert}
                onClick={() => updateParam("certification", isSelected ? "" : cert)}
                className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#F6F7F8] text-[#0D0D0D] font-bold border-l-2 border-[#1E3A52]"
                    : "text-[#6B7280] hover:bg-[#F6F7F8] hover:text-[#0D0D0D]"
                }`}
              >
                <span className="truncate">{cert}</span>
                {isSelected && <Check className="w-3 h-3 text-[#1E3A52] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Destination Market */}
      <div className="space-y-2 pt-3 border-t border-[#E1E4E7]">
        <label className="text-[10px] uppercase text-[#6B7280] block">
          Export Destinations
        </label>
        <select
          value={selectedMarket}
          onChange={(e) => updateParam("market", e.target.value)}
          className="w-full px-2.5 py-1.5 border border-[#E1E4E7] text-xs font-mono bg-white rounded-none focus:border-[#0D0D0D] focus:outline-none"
        >
          <option value="">All Export Markets</option>
          {availableMarkets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Max MOQ Selector */}
      <div className="space-y-2 pt-3 border-t border-[#E1E4E7]">
        <label className="text-[10px] uppercase text-[#6B7280] block">
          Minimum Order (MOQ)
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
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
                className={`px-2 py-1.5 border text-center transition-colors rounded-none cursor-pointer ${
                  isSelected
                    ? "bg-[#1E3A52] text-white border-[#1E3A52] font-bold"
                    : "bg-[#F6F7F8] text-[#0D0D0D] border-[#E1E4E7] hover:bg-white"
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
