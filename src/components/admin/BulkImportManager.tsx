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
  ArrowRight,
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
      // Auto-validate on select
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Standard GAN Member Directory Schema
          </h2>
          <p className="text-xs text-slate-700 mt-1 max-w-2xl">
            Upload a CSV formatted file with enterprise profiles, PAN tax registrations, monthly capacity in pieces, and export market designations.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 mr-2 text-emerald-600" />
          Download Sample Template (.CSV)
        </button>
      </div>

      {/* Success banner if completed */}
      {importCompleted && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Import Executed Successfully</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Successfully ingested <strong>{importCount}</strong> garment manufacturing enterprises into the live directory.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Upload Another
            </button>
            <Link
              href="/admin/enterprises"
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors inline-flex items-center"
            >
              View Members
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {!importCompleted && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 transition-colors p-8 text-center">
          <input
            type="file"
            id="csv-upload"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">
                {fileName ? fileName : "Click to select or drop CSV file"}
              </span>
              <p className="text-xs text-slate-700 mt-1">
                Supports standard comma-separated `.csv` exports from Excel, Google Sheets, or internal ERPs.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Validation & Ingestion Controls */}
      {validationResult && !importCompleted && (
        <div className="space-y-6">
          {/* Summary Matrix Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 uppercase">Total Rows</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {validationResult.totalRows}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Valid Records
              </span>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                {validationResult.validCount}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
              <span className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Invalid / Flagged Rows
              </span>
              <div className="text-2xl font-black text-red-700 mt-1">
                {validationResult.invalidCount}
              </div>
            </div>
          </div>

          {/* Error Diagnostics Matrix */}
          {validationResult.errors.length > 0 && (
            <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Validation Errors Detected ({validationResult.errors.length})</span>
              </div>
              <p className="text-xs text-red-700">
                The following issues were identified. Invalid rows will be skipped during database ingestion.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                {validationResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-white/90 border border-red-200/80 rounded-lg p-2.5 flex items-start justify-between text-slate-800"
                  >
                    <div>
                      <span className="font-bold text-red-700 mr-2">
                        Row #{err.row}:
                      </span>
                      <span className="font-semibold text-slate-900 mr-1.5">
                        [{err.field}]
                      </span>
                      {err.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm">Ready for Transactional Ingestion</div>
              <p className="text-xs text-slate-400 mt-0.5">
                {validationResult.validCount} valid factory profiles will be created with status `APPROVED`.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={resetAll}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isPending || validationResult.validCount === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Ingesting Records...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Import {validationResult.validCount} Valid Records
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                In-Memory Parsed Data Preview
              </h3>
              <span className="text-xs text-slate-700">
                Showing all {validationResult.parsedData.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Row #</th>
                    <th className="p-3">Factory Name</th>
                    <th className="p-3">PAN</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Capacity (pcs/mo)</th>
                    <th className="p-3">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResult.parsedData.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !row.isValid ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="p-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            Flagged
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-700">#{row.rowNumber}</td>
                      <td className="p-3 font-semibold text-slate-900">{row.name || "-"}</td>
                      <td className="p-3 font-mono text-slate-700">{row.panNumber || "-"}</td>
                      <td className="p-3 text-slate-700">{row.city || "-"}</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {row.monthlyCapacityPcs.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-700">{row.contactEmail || "-"}</td>
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
