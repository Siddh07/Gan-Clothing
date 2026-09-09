"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  baseUrl,
  searchParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const buildPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") {
        params.set(k, v);
      }
    });
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    }
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E4E4E7]">
      <div className="text-sm text-[#71717A]">
        Showing{" "}
        <span className="font-medium text-[#18181B]">{startItem}–{endItem}</span>{" "}
        of{" "}
        <span className="font-medium text-[#18181B]">{totalCount}</span>
      </div>

      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="p-2 border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F7F8FA] rounded transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <span className="p-2 border border-[#E4E4E7] bg-[#F7F8FA] text-[#71717A] rounded cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </span>
        )}

        {startPage > 1 && (
          <>
            <Link
              href={buildPageUrl(1)}
              className="px-3 py-1.5 border border-[#E4E4E7] bg-white text-sm text-[#18181B] hover:bg-[#F7F8FA] rounded transition-colors"
            >
              1
            </Link>
            {startPage > 2 && <span className="px-1 text-[#71717A] text-sm">…</span>}
          </>
        )}

        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <Link
              key={p}
              href={buildPageUrl(p)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                isCurrent
                  ? "bg-[#2D5BE3] text-white border-[#2D5BE3] font-medium"
                  : "bg-white border-[#E4E4E7] text-[#18181B] hover:bg-[#F7F8FA]"
              }`}
            >
              {p}
            </Link>
          );
        })}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 text-[#71717A] text-sm">…</span>
            )}
            <Link
              href={buildPageUrl(totalPages)}
              className="px-3 py-1.5 border border-[#E4E4E7] bg-white text-sm text-[#18181B] hover:bg-[#F7F8FA] rounded transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}

        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="p-2 border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F7F8FA] rounded transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="p-2 border border-[#E4E4E7] bg-[#F7F8FA] text-[#71717A] rounded cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
