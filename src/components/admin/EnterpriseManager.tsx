"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleEnterpriseVerification, createEnterprise, deleteEnterprise } from "@/actions/admin";
import { Building2, ShieldCheck, ShieldAlert, Plus, Trash2, ExternalLink, Search, X, FileSpreadsheet, AlertCircle } from "lucide-react";

interface EnterpriseItem {
  id: string;
  name: string;
  slug: string;
  registrationNumber: string;
  panNumber: string;
  city: string;
  address?: string;
  employeeCount: number;
  monthlyCapacityPcs: number;
  contactEmail: string;
  contactPhone?: string;
  exportMarkets?: string;
  yearEstablished?: number;
  description?: string;
  isVerified: boolean;
  coverImageUrl?: string | null;
  certifications: { id: string; name: string }[];
  _count?: { products: number };
}

const EMPTY_FORM = {
  name: "", registrationNumber: "", panNumber: "", description: "",
  yearEstablished: 2000, employeeCount: 150, monthlyCapacityPcs: 50000,
  address: "Industrial Area", city: "Kathmandu", contactEmail: "", contactPhone: "+977-1-",
  websiteUrl: "", exportMarkets: "USA, Germany, United Kingdom, Japan",
  coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
  isVerified: true,
};

const inputCls = "w-full px-3 py-2 border border-[#D1D5DB] rounded text-sm text-[#1A1A1A] bg-white placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/15 focus:outline-none transition";
const labelCls = "block text-sm font-medium text-[#1A1A1A] mb-1.5";

export function EnterpriseManager({ initialEnterprises }: { initialEnterprises: EnterpriseItem[] }) {
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<EnterpriseItem[]>(initialEnterprises);
  const [search, setSearch] = useState("");
  const [selectedMill, setSelectedMill] = useState<EnterpriseItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    setEnterprises(initialEnterprises);
  }, [initialEnterprises]);

  const filtered = enterprises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.panNumber.includes(search) ||
      e.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalCapacity = enterprises.reduce((acc, e) => acc + (e.monthlyCapacityPcs || 0), 0);
  const verifiedCount = enterprises.filter((e) => e.isVerified).length;

  const handleToggleVerification = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setEnterprises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isVerified: nextStatus } : e))
    );
    if (selectedMill?.id === id) {
      setSelectedMill((prev) => (prev ? { ...prev, isVerified: nextStatus } : null));
    }

    startTransition(async () => {
      try {
        const res = await toggleEnterpriseVerification(id, currentStatus);
        if (res.success) {
          router.refresh();
        }
      } catch (err: any) {
        // Revert on error
        setEnterprises((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isVerified: currentStatus } : e))
        );
        if (selectedMill?.id === id) {
          setSelectedMill((prev) => (prev ? { ...prev, isVerified: currentStatus } : null));
        }
        alert(err?.message || "Failed to toggle verification. Please ensure you are logged in as admin.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete mill "${name}" from the directory? This cannot be undone.`)) {
      startTransition(async () => {
        try {
          const res = await deleteEnterprise(id);
          if (res.success) {
            setEnterprises((prev) => prev.filter((e) => e.id !== id));
            if (selectedMill?.id === id) setSelectedMill(null);
            router.refresh();
          }
        } catch (err: any) {
          alert(err?.message || "Failed to delete mill. Please ensure you are logged in as admin.");
        }
      });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await createEnterprise(formData as any);
        if (res.success && res.enterprise) {
          setEnterprises((prev) => [res.enterprise as any, ...prev]);
          setIsCreateOpen(false);
          setFormData(EMPTY_FORM);
          router.refresh();
        } else {
          setFormError("Failed to add mill. Please check the submitted fields.");
        }
      } catch (err: any) {
        setFormError(err?.message || "Failed to add mill. Please check that you are signed in.");
      }
    });
  };

  const setF = (key: string, val: unknown) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total mills", value: initialEnterprises.length, sub: "Registered" },
          { label: "Verified", value: `${verifiedCount} / ${initialEnterprises.length}`, sub: "Compliance audited" },
          { label: "Monthly capacity", value: `${(totalCapacity / 1000).toFixed(0)}k pcs`, sub: "Combined output" },
          { label: "Standards", value: "PAN + WRAP", sub: "Audit framework" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-lg border border-[#D1D5DB] p-4">
            <p className="text-sm text-[#6B7280]">{k.label}</p>
            <p className="text-2xl font-semibold text-[#1A1A1A] mt-1">{k.value}</p>
            <p className="text-xs text-[#6B7280] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, PAN…"
            className="pl-8 pr-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B7280]">
            {filtered.length} of {initialEnterprises.length} mills
          </span>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition"
          >
            <Plus className="w-4 h-4" />
            Add mill
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mill name</th>
                <th>City</th>
                <th>PAN / Reg</th>
                <th className="text-right">Capacity</th>
                <th className="text-right">Employees</th>
                <th>Certifications</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <FileSpreadsheet className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                    <p className="text-sm text-[#6B7280]">No mills match your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((factory) => (
                  <tr key={factory.id}>
                    <td>
                      <button
                        onClick={() => setSelectedMill(factory)}
                        className="font-medium text-[#1A1A1A] hover:text-[#3B5BDB] text-left"
                      >
                        {factory.name}
                      </button>
                      {factory.yearEstablished && (
                        <div className="text-xs text-[#6B7280]">Est. {factory.yearEstablished}</div>
                      )}
                    </td>
                    <td className="text-sm text-[#6B7280]">{factory.city}</td>
                    <td>
                      <div className="text-xs font-mono text-[#1A1A1A]">{factory.panNumber}</div>
                      <div className="text-xs text-[#9CA3AF]">{factory.registrationNumber}</div>
                    </td>
                    <td className="text-right text-sm font-medium tabular-nums">
                      {factory.monthlyCapacityPcs.toLocaleString()} pcs/mo
                    </td>
                    <td className="text-right text-sm tabular-nums">{factory.employeeCount.toLocaleString()}</td>
                    <td>
                      {factory.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {factory.certifications.slice(0, 2).map((c) => (
                            <span key={c.id} className="badge badge-neutral">{c.name}</span>
                          ))}
                          {factory.certifications.length > 2 && (
                            <span className="badge badge-neutral">+{factory.certifications.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-[#9CA3AF]">None</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleVerification(factory.id, factory.isVerified)}
                        disabled={isPending}
                        className={`badge cursor-pointer hover:opacity-80 ${factory.isVerified ? "badge-success" : "badge-warning"}`}
                      >
                        {factory.isVerified ? "Verified" : "Unverified"}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedMill(factory)}
                          className="text-sm font-medium text-[#3B5BDB] hover:underline"
                        >
                          View
                        </button>
                        <Link
                          href={`/directory/${factory.slug}`}
                          target="_blank"
                          className="p-1 text-[#9CA3AF] hover:text-[#1A1A1A] transition"
                          title="Public profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(factory.id, factory.name)}
                          disabled={isPending}
                          className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mill detail modal */}
      {selectedMill && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D1D5DB] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D5DB]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">{selectedMill.name}</h2>
                  <span className={`badge ${selectedMill.isVerified ? "badge-success" : "badge-warning"}`}>
                    {selectedMill.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{selectedMill.city}, Nepal</p>
              </div>
              <button
                onClick={() => setSelectedMill(null)}
                className="p-1.5 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  ["PAN", selectedMill.panNumber],
                  ["Registration", selectedMill.registrationNumber],
                  ["Email", selectedMill.contactEmail],
                  ["Phone", selectedMill.contactPhone || "—"],
                  ["Established", selectedMill.yearEstablished?.toString() || "—"],
                  ["Employees", selectedMill.employeeCount.toLocaleString()],
                  ["Capacity", `${selectedMill.monthlyCapacityPcs.toLocaleString()} pcs/mo`],
                  ["Export markets", selectedMill.exportMarkets || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-[#6B7280]">{k}</dt>
                    <dd className="text-sm font-medium text-[#1A1A1A] mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>

              {selectedMill.description && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1.5">About</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{selectedMill.description}</p>
                </div>
              )}

              {selectedMill.certifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMill.certifications.map((c) => (
                      <span key={c.id} className="badge badge-accent">{c.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#D1D5DB] bg-[#F8F8F6]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVerification(selectedMill.id, selectedMill.isVerified)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded transition ${
                    selectedMill.isVerified
                      ? "border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]"
                      : "border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4]"
                  }`}
                >
                  {selectedMill.isVerified ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {selectedMill.isVerified ? "Revoke verification" : "Mark as verified"}
                </button>
                <Link
                  href={`/directory/${selectedMill.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#D1D5DB] rounded bg-white hover:bg-[#F3F4F6] transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                  Public profile
                </Link>
              </div>
              <button
                onClick={() => setSelectedMill(null)}
                className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create mill modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D1D5DB] shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D5DB]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Add mill</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-sm text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className={labelCls}>Mill name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setF("name", e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>PAN number *</label>
                  <input type="text" required value={formData.panNumber} onChange={(e) => setF("panNumber", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Registration no. *</label>
                  <input type="text" required value={formData.registrationNumber} onChange={(e) => setF("registrationNumber", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input type="text" required value={formData.city} onChange={(e) => setF("city", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Year established</label>
                  <input type="number" value={formData.yearEstablished} onChange={(e) => setF("yearEstablished", Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Employees</label>
                  <input type="number" value={formData.employeeCount} onChange={(e) => setF("employeeCount", Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Monthly capacity (pcs)</label>
                  <input type="number" value={formData.monthlyCapacityPcs} onChange={(e) => setF("monthlyCapacityPcs", Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Contact email *</label>
                <input type="email" required value={formData.contactEmail} onChange={(e) => setF("contactEmail", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Export markets</label>
                <input type="text" value={formData.exportMarkets} onChange={(e) => setF("exportMarkets", e.target.value)} className={inputCls} placeholder="USA, Germany, UK…" />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setF("description", e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isVerifiedCreate" checked={formData.isVerified} onChange={(e) => setF("isVerified", e.target.checked)} className="rounded border-[#D1D5DB] text-[#3B5BDB]" />
                <label htmlFor="isVerifiedCreate" className="text-sm text-[#1A1A1A]">Mark as verified on creation</label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#D1D5DB]">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] transition">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-60">
                  {isPending ? "Saving…" : "Add mill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
