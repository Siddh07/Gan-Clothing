"use client";

import React, { useState, useTransition } from "react";
import {
  processEnterpriseCSV,
  ImportValidationResult,
} from "@/actions/import";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  FileText,
} from "lucide-react";
import Link from "next/link";

const SAMPLE_CSV = `name,registrationNumber,panNumber,description,yearEstablished,employeeCount,monthlyCapacityPcs,address,city,websiteUrl,contactEmail,contactPhone,exportMarkets,isVerified
Everest Apparel Group,REG-77821,304918231,Specialized in organic cotton knitwear and technical fleece garments for European brands,2014,350,75000,Balaju Industrial Estate,Kathmandu,https://everestapparel.com,sourcing@everestapparel.com,+977-1-4356000,"Germany, France, Sweden",true
Annapurna Sportswear Ltd,REG-88204,409182743,Export manufacturer of recycled polyester performance activewear and tracksuits,2018,220,45000,Patandhoka Road,Lalitpur,https://annapurnasports.com,export@annapurnasports.com,+977-1-5524000,"USA, Canada, Australia",true
Trisuli Denim Mills,REG-99120,501928374,High-grade raw and wash denim manufacturing with eco-friendly ozone bleaching,2011,480,120000,Birgunj Special Economic Zone,Birgunj,https://trisulidenim.com,trade@trisulidenim.com,+977-51-523000,"UK, Netherlands, Japan",false`;

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
      } catch (err: any) {
        setValidationResult({
          success: false,
          totalRows: 0,
          validCount: 0,
          invalidCount: 0,
          errors: [{ row: 0, field: "system", message: err.message || "Failed to parse CSV" }],
          parsedData: [],
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
      } catch (err: any) {
        alert("Import failed: " + err.message);
      }
    });
  };

  const resetAll = () => {
    setFileContent("");
    setFileName("");
    setValidationResult(null);
    setImportCompleted(false);
    setImportCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sample Download */}
      <div className="border border-[#E1E4E7] bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
            Standard Trade Directory Schema Specification
          </h2>
          <p className="font-mono text-[11px] text-[#6B7280] mt-0.5 max-w-2xl">
            Accepts UTF-8 encoded comma-separated files containing legal mill profiles, PAN tax registrations, and capacity figures.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center px-3.5 py-1.5 border border-[#E1E4E7] hover:border-[#0D0D0D] text-xs font-mono font-medium text-[#0D0D0D] bg-[#F6F7F8] transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-[#6B7280]" />
          Download Template (.CSV)
        </button>
      </div>

      {/* Success banner if completed */}
      {importCompleted && (
        <div className="border border-[#1E3A52] bg-[#F6F7F8] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-mono text-[10px] font-bold text-[#1E3A52] uppercase">
              TRANSACTION COMMITTED
            </div>
            <div className="font-bold text-sm text-[#0D0D0D]">
              Successfully Ingested {importCount} Garment Manufacturing Plants
            </div>
            <div className="font-mono text-xs text-[#6B7280]">
              Entities have been provisioned in the live directory with status `APPROVED`.
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={resetAll}
              className="px-3 py-1.5 border border-[#E1E4E7] bg-white hover:border-[#0D0D0D] text-[#0D0D0D]"
            >
              Upload Another
            </button>
            <Link
              href="/admin/enterprises"
              className="px-3.5 py-1.5 bg-[#0D0D0D] hover:bg-[#1E3A52] text-white font-medium"
            >
              Inspect Directory
            </Link>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {!importCompleted && (
        <div className="border border-dashed border-[#E1E4E7] hover:border-[#0D0D0D] bg-white p-8 text-center transition-colors">
          <input
            type="file"
            id="csv-upload"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="w-6 h-6 text-[#0D0D0D]" />
            <div>
              <span className="font-mono text-xs font-bold text-[#0D0D0D]">
                {fileName ? fileName : "Select or drop CSV manifest file"}
              </span>
              <p className="font-mono text-[11px] text-[#6B7280] mt-1">
                Standard comma-separated `.csv` exports from ERP, Excel, or customs filings.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Validation & Ingestion Controls */}
      {validationResult && !importCompleted && (
        <div className="space-y-6">
          {/* Summary Matrix Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#E1E4E7] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E1E4E7]">
            <div className="p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">Total Parsed Rows</span>
              <div className="font-mono text-2xl font-bold text-[#0D0D0D] mt-1">
                {validationResult.totalRows}
              </div>
            </div>

            <div className="p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800">
                Verified Records
              </span>
              <div className="font-mono text-2xl font-bold text-emerald-800 mt-1">
                {validationResult.validCount}
              </div>
            </div>

            <div className="p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-red-700">
                Flagged / Deficient Rows
              </span>
              <div className="font-mono text-2xl font-bold text-red-700 mt-1">
                {validationResult.invalidCount}
              </div>
            </div>
          </div>

          {/* Error Diagnostics Matrix */}
          {validationResult.errors.length > 0 && (
            <div className="border border-red-200 bg-red-50/50 p-4 space-y-2 text-xs">
              <div className="font-mono font-bold text-red-800 uppercase tracking-tight flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Validation Deficiencies Identified ({validationResult.errors.length})</span>
              </div>
              <p className="text-[#6B7280]">
                Deficient rows will be skipped during database ingestion. Correct source CSV or proceed with verified rows.
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] pt-1">
                {validationResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 bg-white border border-red-200 text-[#0D0D0D]"
                  >
                    <span className="font-bold text-red-700 mr-2">
                      Row #{err.row}:
                    </span>
                    <span className="text-[#6B7280] mr-1.5">
                      [{err.field}]
                    </span>
                    {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger Bar */}
          <div className="border border-[#E1E4E7] bg-[#F6F7F8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div>
              <div className="font-bold text-[#0D0D0D]">Ready for Transaction Ingestion</div>
              <div className="text-[11px] text-[#6B7280]">
                {validationResult.validCount} verified mill profiles will be committed to the database.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                disabled={isPending}
                className="px-3 py-1.5 border border-[#E1E4E7] bg-white hover:border-[#0D0D0D] text-[#0D0D0D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isPending || validationResult.validCount === 0}
                className="px-4 py-1.5 bg-[#0D0D0D] hover:bg-[#1E3A52] text-white font-medium transition-colors disabled:opacity-50 inline-flex items-center"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Committing Records...
                  </>
                ) : (
                  <>
                    Import {validationResult.validCount} Valid Mills
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-[#E1E4E7] bg-white overflow-hidden">
            <div className="p-3 border-b border-[#E1E4E7] flex items-center justify-between font-mono text-xs">
              <h3 className="font-bold uppercase tracking-wider text-[#0D0D0D]">
                Parsed Data Preview
              </h3>
              <span className="text-[#6B7280]">
                {validationResult.parsedData.length} total records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-ledger">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Row</th>
                    <th>Mill Name</th>
                    <th>PAN</th>
                    <th>Location</th>
                    <th className="text-right">Monthly Capacity</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.parsedData.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={!row.isValid ? "bg-red-50/40" : ""}
                    >
                      <td>
                        <span className={row.isValid ? "tag-approved" : "tag-pending"}>
                          {row.isValid ? "VALID" : "FLAGGED"}
                        </span>
                      </td>
                      <td className="font-mono text-[#6B7280]">#{row.rowNumber}</td>
                      <td className="font-medium text-[#0D0D0D]">{row.name || "—"}</td>
                      <td className="font-mono text-[#6B7280]">{row.panNumber || "—"}</td>
                      <td className="text-[#0D0D0D]">{row.city || "—"}</td>
                      <td className="text-right font-mono font-semibold text-[#0D0D0D]">
                        {row.monthlyCapacityPcs.toLocaleString()} pcs
                      </td>
                      <td className="font-mono text-[11px] text-[#6B7280]">{row.contactEmail || "—"}</td>
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

