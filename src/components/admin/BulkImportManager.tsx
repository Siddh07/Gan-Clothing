"use client";

import React, { useState, useTransition } from "react";
import { processEnterpriseCSV, ImportValidationResult } from "@/actions/import";
import { Upload, Download, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";

const SAMPLE_CSV = `name,registrationNumber,panNumber,description,yearEstablished,employeeCount,monthlyCapacityPcs,address,city,websiteUrl,contactEmail,contactPhone,exportMarkets,isVerified
Everest Apparel Group,REG-77821,304918231,Specialized in organic cotton knitwear and technical fleece garments for European brands,2014,350,75000,Balaju Industrial Estate,Kathmandu,https://everestapparel.com,sourcing@everestapparel.com,+977-1-4356000,"Germany, France, Sweden",true
Annapurna Sportswear Ltd,REG-88204,409182743,Export manufacturer of recycled polyester performance activewear and tracksuits,2018,220,45000,Patandhoka Road,Lalitpur,https://annapurnasports.com,export@annapurnasports.com,+977-1-5524000,"USA, Canada, Australia",true`;

export function BulkImportManager() {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [importCompleted, setImportCompleted] = useState(false);
  const [importCount, setImportCount] = useState<number>(0);

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "gan-member-directory-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportCompleted(false);
    setValidationResult(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      validateContent(content);
    };
    reader.readAsText(file);
  };

  const validateContent = (content: string) => {
    startTransition(async () => {
      try {
        const result = await processEnterpriseCSV(content, false);
        setValidationResult(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to parse CSV";
        setValidationResult({
          success: false, totalRows: 0, validCount: 0, invalidCount: 0,
          errors: [{ row: 0, field: "system", message }], parsedData: [],
        });
      }
    });
  };

  const handleExecuteImport = () => {
    if (!fileContent) return;
    startTransition(async () => {
      try {
        const result = await processEnterpriseCSV(fileContent, true);
        setValidationResult(result);
        if (result.insertedCount !== undefined && result.insertedCount > 0) {
          setImportCompleted(true);
          setImportCount(result.insertedCount);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Import failed";
        alert("Import failed: " + message);
      }
    });
  };

  const resetAll = () => {
    setFileContent(""); setFileName(""); setValidationResult(null);
    setImportCompleted(false); setImportCount(0);
  };

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-white rounded-lg border border-[#D1D5DB] flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Bulk mill import</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Upload a UTF-8 CSV file containing mill profiles, PAN registrations, and capacity data.
          </p>
        </div>
        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#D1D5DB] rounded hover:bg-[#F3F4F6] transition shrink-0"
        >
          <Download className="w-4 h-4 text-[#6B7280]" />
          Download template
        </button>
      </div>

      {/* Success state */}
      {importCompleted && (
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Import successful</p>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {importCount} mills added to the directory with Approved status.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={resetAll} className="px-3 py-2 text-sm font-medium border border-[#D1D5DB] rounded bg-white hover:bg-[#F3F4F6] transition">
              Upload another
            </button>
            <Link href="/admin/enterprises" className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition">
              View directory
            </Link>
          </div>
        </div>
      )}

      {/* Upload dropzone */}
      {!importCompleted && (
        <div className="bg-white rounded-lg border-2 border-dashed border-[#D1D5DB] hover:border-[#3B5BDB] transition-colors">
          <input
            type="file"
            id="csv-upload"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#3B5BDB]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {fileName ? fileName : "Click to select a CSV file"}
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                CSV format from ERP, Excel, or customs exports
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Validation results */}
      {validationResult && !importCompleted && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total rows", value: validationResult.totalRows, color: "" },
              { label: "Valid records", value: validationResult.validCount, color: "text-[#16A34A]" },
              { label: "Flagged rows", value: validationResult.invalidCount, color: validationResult.invalidCount > 0 ? "text-[#DC2626]" : "" },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg border border-[#D1D5DB] p-4">
                <p className="text-sm text-[#6B7280]">{k.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${k.color || "text-[#1A1A1A]"}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Validation errors */}
          {validationResult.errors.length > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#DC2626]">
                <AlertTriangle className="w-4 h-4" />
                {validationResult.errors.length} validation error{validationResult.errors.length !== 1 && "s"}
              </div>
              <p className="text-sm text-[#6B7280]">
                Invalid rows will be skipped. Correct the CSV or proceed with valid records only.
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 mt-2">
                {validationResult.errors.map((err, idx) => (
                  <div key={idx} className="text-xs bg-white rounded border border-[#FCA5A5] p-2 font-mono">
                    <span className="text-[#DC2626] font-bold">Row {err.row}:</span>{" "}
                    <span className="text-[#6B7280]">[{err.field}]</span> {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="bg-[#F8F8F6] rounded-lg border border-[#D1D5DB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Ready to import</p>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {validationResult.validCount} valid mills will be added to the directory.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetAll} disabled={isPending}
                className="px-3 py-2 text-sm font-medium border border-[#D1D5DB] rounded bg-white hover:bg-[#F3F4F6] transition">
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isPending || validationResult.validCount === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-50"
              >
                {isPending ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Importing…</>
                ) : (
                  `Import ${validationResult.validCount} mills`
                )}
              </button>
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D1D5DB]">
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Data preview</h3>
              <span className="text-sm text-[#6B7280]">{validationResult.parsedData.length} rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Row</th>
                    <th>Mill name</th>
                    <th>PAN</th>
                    <th>City</th>
                    <th className="text-right">Capacity</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.parsedData.map((row) => (
                    <tr key={row.rowNumber} className={!row.isValid ? "bg-[#FEF2F2]" : ""}>
                      <td>
                        <span className={`badge ${row.isValid ? "badge-success" : "badge-error"}`}>
                          {row.isValid ? "Valid" : "Flagged"}
                        </span>
                      </td>
                      <td className="text-xs font-mono text-[#6B7280]">#{row.rowNumber}</td>
                      <td className="font-medium text-sm text-[#1A1A1A]">{row.name || "—"}</td>
                      <td className="text-xs font-mono text-[#6B7280]">{row.panNumber || "—"}</td>
                      <td className="text-sm text-[#6B7280]">{row.city || "—"}</td>
                      <td className="text-right text-sm font-medium tabular-nums">
                        {row.monthlyCapacityPcs?.toLocaleString() || "—"} pcs
                      </td>
                      <td className="text-sm text-[#6B7280] truncate max-w-[160px]">{row.contactEmail || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
