"use client";

import React, { useState, useTransition } from "react";
import { updateFactoryProfile } from "@/actions/portal";
import { CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";

const inputCls = "w-full px-3 py-2 border border-[#D1D5DB] rounded text-sm text-[#1A1A1A] bg-white placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/15 focus:outline-none transition";
const labelCls = "block text-sm font-medium text-[#1A1A1A] mb-1.5";

export function FactoryProfileForm({ enterprise }: { enterprise: any }) {
  const [formData, setFormData] = useState({
    enterpriseId: enterprise.id,
    name: enterprise.name,
    description: enterprise.description,
    monthlyCapacityPcs: enterprise.monthlyCapacityPcs,
    employeeCount: enterprise.employeeCount,
    address: enterprise.address,
    city: enterprise.city,
    contactEmail: enterprise.contactEmail,
    contactPhone: enterprise.contactPhone,
    websiteUrl: enterprise.websiteUrl || "",
    coverImageUrl: enterprise.coverImageUrl || "",
    exportMarkets: enterprise.exportMarkets,
  });

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setF = (key: string, val: unknown) => setFormData((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(false);
    setErrorMsg(null);

    startTransition(async () => {
      try {
        const res = await updateFactoryProfile(formData);
        if (res.success) {
          setSuccessMsg(true);
          setTimeout(() => setSuccessMsg(false), 3000);
        } else {
          setErrorMsg("Failed to update profile. Please try again.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "An error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded flex items-center gap-2 text-sm text-[#16A34A]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Profile updated and synced to the directory.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded flex items-center gap-2 text-sm text-[#DC2626]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Core details */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 pb-2 border-b border-[#D1D5DB]">Basic information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Legal name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setF("name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>City *</label>
            <input type="text" required value={formData.city} onChange={(e) => setF("city", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Monthly capacity (pcs) *</label>
            <input type="number" required value={formData.monthlyCapacityPcs} onChange={(e) => setF("monthlyCapacityPcs", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Employees *</label>
            <input type="number" required value={formData.employeeCount} onChange={(e) => setF("employeeCount", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact email *</label>
            <input type="email" required value={formData.contactEmail} onChange={(e) => setF("contactEmail", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="text" required value={formData.contactPhone} onChange={(e) => setF("contactPhone", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Address *</label>
        <input type="text" required value={formData.address} onChange={(e) => setF("address", e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Description & capabilities *</label>
        <textarea rows={4} required value={formData.description} onChange={(e) => setF("description", e.target.value)} className={inputCls} />
      </div>

      {/* Commercial */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 pb-2 border-b border-[#D1D5DB]">Commercial details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Export markets</label>
            <input type="text" value={formData.exportMarkets} onChange={(e) => setF("exportMarkets", e.target.value)} className={inputCls} placeholder="USA, Germany, UK…" />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input type="url" value={formData.websiteUrl} onChange={(e) => setF("websiteUrl", e.target.value)} className={inputCls} placeholder="https://…" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Cover image URL</label>
            <input type="url" value={formData.coverImageUrl} onChange={(e) => setF("coverImageUrl", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-[#D1D5DB]">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-60 cursor-pointer"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="w-4 h-4" /> Save changes</>
          )}
        </button>
      </div>
    </form>
  );
}
