"use client";

import React, { useState, useTransition } from "react";
import { updateFactoryProfile } from "@/actions/portal";
import { CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";

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
          setErrorMsg("Failed to update factory profile.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "An error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="p-3 bg-[#F6F7F8] border border-[#1E3A52] flex items-center text-xs text-[#0D0D0D] font-mono">
          <CheckCircle2 className="w-4 h-4 mr-2 text-[#1E3A52] shrink-0" />
          Technical dossier updated and synchronized with central trade directory.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-[#F6F7F8] border border-red-600 flex items-center text-xs text-red-600 font-mono">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Registered Legal Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Production Hub / City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Monthly Production Capacity (Pcs) *
          </label>
          <input
            type="number"
            required
            value={formData.monthlyCapacityPcs}
            onChange={(e) => setFormData({ ...formData, monthlyCapacityPcs: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Artisan & Labor Force Headcount *
          </label>
          <input
            type="number"
            required
            value={formData.employeeCount}
            onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Export Desk Official Email *
          </label>
          <input
            type="email"
            required
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Official Telephone / Hotline *
          </label>
          <input
            type="text"
            required
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
          Physical Plant Facility Address *
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
          Technical Capabilities & Machinery Description *
        </label>
        <textarea
          rows={4}
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs rounded-none focus:outline-none bg-white"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Active Export Corridors (Comma-separated)
          </label>
          <input
            type="text"
            value={formData.exportMarkets}
            onChange={(e) => setFormData({ ...formData, exportMarkets: e.target.value })}
            placeholder="EU, US, Japan, Germany..."
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
            Corporate Domain / URL
          </label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
          Plant / Facility Cover Photograph URL
        </label>
        <input
          type="url"
          value={formData.coverImageUrl}
          onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-[#E1E4E7]">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-5 py-2.5 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] transition-colors rounded-none cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              SYNCHRONIZING...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-2" />
              SAVE DOSSIER CHANGES
            </>
          )}
        </button>
      </div>
    </form>
  );
}
