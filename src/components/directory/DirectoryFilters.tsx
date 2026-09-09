"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";

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

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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

  const filterItemClass = (active: boolean) =>
    `w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between cursor-pointer ${
      active
        ? "bg-[#EFF4FF] text-[#2D5BE3] font-medium border-l-2 border-[#2D5BE3] -ml-px pl-[11px]"
        : "text-[#71717A] hover:bg-[#F7F8FA] hover:text-[#18181B]"
    }`;

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-md p-4 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
        <h3 className="text-sm font-medium text-[#18181B]">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#2D5BE3] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sector filter */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-[#71717A] mb-2">Apparel sector</div>
        <button
          onClick={() => updateParam("category", "")}
          className={filterItemClass(!selectedCategory)}
        >
          <span>All sectors</span>
          {!selectedCategory && <Check className="w-3.5 h-3.5 text-[#2D5BE3]" />}
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => updateParam("category", isSelected ? "" : cat.slug)}
              className={filterItemClass(isSelected)}
            >
              <span className="truncate">{cat.name}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-[#2D5BE3] shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Certification filter */}
      <div className="space-y-1 pt-3 border-t border-[#E4E4E7]">
        <div className="text-xs font-medium text-[#71717A] mb-2">Compliance standard</div>
        <button
          onClick={() => updateParam("certification", "")}
          className={filterItemClass(!selectedCertification)}
        >
          <span>Any standard</span>
          {!selectedCertification && <Check className="w-3.5 h-3.5 text-[#2D5BE3]" />}
        </button>
        {availableCertifications.map((cert) => {
          const isSelected =
            selectedCertification.toLowerCase() === cert.toLowerCase();
          return (
            <button
              key={cert}
              onClick={() => updateParam("certification", isSelected ? "" : cert)}
              className={filterItemClass(isSelected)}
            >
              <span className="truncate text-xs">{cert}</span>
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-[#2D5BE3] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Export market filter */}
      <div className="space-y-2 pt-3 border-t border-[#E4E4E7]">
        <div className="text-xs font-medium text-[#71717A]">Export destination</div>
        <select
          value={selectedMarket}
          onChange={(e) => updateParam("market", e.target.value)}
          className="w-full px-3 py-2 border border-[#E4E4E7] rounded text-sm text-[#18181B] bg-white focus:outline-none focus:border-[#2D5BE3] focus:ring-2 focus:ring-[#EFF4FF] transition"
        >
          <option value="">All export markets</option>
          {availableMarkets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* MOQ filter */}
      <div className="space-y-2 pt-3 border-t border-[#E4E4E7]">
        <div className="text-xs font-medium text-[#71717A]">Minimum order (MOQ)</div>
        <div className="grid grid-cols-2 gap-1.5">
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
                className={`px-2 py-1.5 text-sm text-center rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#2D5BE3] text-white border-[#2D5BE3] font-medium"
                    : "bg-[#F7F8FA] text-[#18181B] border-[#E4E4E7] hover:bg-white"
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
