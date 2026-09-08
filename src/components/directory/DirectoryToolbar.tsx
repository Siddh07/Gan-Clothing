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
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div className="text-xs text-slate-600">
        Showing <strong className="text-slate-900">{totalCount}</strong> verified Nepalese garment exporter{totalCount === 1 ? "" : "s"}
      </div>

      <div className="flex items-center space-x-3">
        {/* Sort Select */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
          <span className="hidden sm:inline">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="capacity-desc">Highest Capacity</option>
            <option value="capacity-asc">Lowest Capacity</option>
            <option value="established-desc">Most Established</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setParam("view", "grid")}
            aria-label="Grid view"
            className={`p-1.5 rounded-md transition-colors ${
              currentView === "grid"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-700 hover:text-slate-700"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setParam("view", "list")}
            aria-label="List view"
            className={`p-1.5 rounded-md transition-colors ${
              currentView === "list"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-700 hover:text-slate-700"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
