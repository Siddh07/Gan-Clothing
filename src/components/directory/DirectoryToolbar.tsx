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
    <div className="bg-white border border-[#E4E4E7] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="text-sm text-[#71717A]">
        <span className="font-medium text-[#18181B]">{totalCount}</span>{" "}
        accredited {totalCount === 1 ? "exporter" : "exporters"} found
      </div>

      <div className="flex items-center gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2 text-sm text-[#71717A]">
          <span className="hidden sm:inline">Sort by</span>
          <select
            value={currentSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="px-2.5 py-1.5 rounded border border-[#E4E4E7] text-sm text-[#18181B] bg-white focus:outline-none focus:border-[#2D5BE3] focus:ring-2 focus:ring-[#EFF4FF] transition"
          >
            <option value="capacity-desc">Highest capacity</option>
            <option value="capacity-asc">Lowest capacity</option>
            <option value="established-desc">Earliest established</option>
            <option value="name-asc">Alphabetical (A–Z)</option>
          </select>
        </div>

        {/* View switcher */}
        <div className="flex items-center bg-[#F7F8FA] p-0.5 border border-[#E4E4E7] rounded">
          <button
            onClick={() => setParam("view", "grid")}
            aria-label="Grid view"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              currentView === "grid"
                ? "bg-white text-[#18181B] shadow-sm border border-[#E4E4E7]"
                : "text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setParam("view", "list")}
            aria-label="List view"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              currentView === "list"
                ? "bg-white text-[#18181B] shadow-sm border border-[#E4E4E7]"
                : "text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
