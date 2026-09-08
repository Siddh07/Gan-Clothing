import React from "react";
import { BulkImportManager } from "@/components/admin/BulkImportManager";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Bulk Member Directory Ingestion
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Import verified garment manufacturing mills in bulk via CSV spreadsheets with automated schema validation and PAN duplicate checking.
        </p>
      </div>

      <BulkImportManager />
    </div>
  );
}
