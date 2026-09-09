"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

interface DirectoryToolbarProps {
  totalCount: number;
}

export function DirectoryToolbar({ totalCount }: DirectoryToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentView = (searchParams.get("view") as "grid" | "list") || "grid";
  const currentSort = searchParams.get("sort") || "capacity-desc";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="bg-white border border-[#E1E4E7] px-4 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      <div className="text-[#6B7280]">
        INDEXED: <strong className="text-[#0D0D0D]">{totalCount}</strong> ACCREDITED EXPORTER{totalCount === 1 ? "" : "S"}
      </div>

      <div className="flex items-center space-x-3">
        {/* Sort Select */}
        <div className="flex items-center space-x-1.5 text-[#6B7280]">
          <span className="hidden sm:inline uppercase text-[10px] tracking-wider">Order:</span>
          <select
            value={currentSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="px-2.5 py-1.5 rounded-none border border-[#E1E4E7] text-xs font-mono text-[#0D0D0D] bg-white focus:outline-none focus:border-[#0D0D0D]"
          >
            <option value="capacity-desc">Highest Monthly Capacity</option>
            <option value="capacity-asc">Lowest Monthly Capacity</option>
            <option value="established-desc">Earliest Established</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-[#F6F7F8] p-0.5 border border-[#E1E4E7]">
          <button
            onClick={() => setParam("view", "grid")}
            aria-label="Grid view"
            className={`p-1.5 transition-colors ${
              currentView === "grid"
                ? "bg-white text-[#0D0D0D] shadow-xs border border-[#E1E4E7]"
                : "text-[#6B7280] hover:text-[#0D0D0D]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setParam("view", "list")}
            aria-label="List view"
            className={`p-1.5 transition-colors ${
              currentView === "list"
                ? "bg-white text-[#0D0D0D] shadow-xs border border-[#E1E4E7]"
                : "text-[#6B7280] hover:text-[#0D0D0D]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
