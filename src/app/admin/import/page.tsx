import React from "react";
import { BulkImportManager } from "@/components/admin/BulkImportManager";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E1E4E7]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
          Registry Administration · Ingestion Engine
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
          Bulk Member Directory Ingestion
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Batch import verified garment manufacturing mills via standardized CSV manifest with automated schema validation and PAN deduplication.
        </p>
      </div>

      <BulkImportManager />
    </div>
  );
}
