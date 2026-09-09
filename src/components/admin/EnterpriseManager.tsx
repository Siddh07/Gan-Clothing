"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleEnterpriseVerification,
  createEnterprise,
  deleteEnterprise,
} from "@/actions/admin";
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  X,
  FileSpreadsheet,
  Globe,
  Award,
} from "lucide-react";

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

export function EnterpriseManager({
  initialEnterprises,
}: {
  initialEnterprises: EnterpriseItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedMill, setSelectedMill] = useState<EnterpriseItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // New Enterprise Form State
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    panNumber: "",
    description: "",
    yearEstablished: 2000,
    employeeCount: 150,
    monthlyCapacityPcs: 50000,
    address: "",
    city: "Kathmandu",
    contactEmail: "",
    contactPhone: "+977-1-",
    websiteUrl: "",
    exportMarkets: "USA, Germany, United Kingdom, Japan",
    coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
    isVerified: true,
  });

  const filteredEnterprises = initialEnterprises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.panNumber.includes(search) ||
      e.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalCapacity = initialEnterprises.reduce(
    (acc, e) => acc + (e.monthlyCapacityPcs || 0),
    0
  );

  const verifiedCount = initialEnterprises.filter((e) => e.isVerified).length;

  const handleToggleVerification = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleEnterpriseVerification(id, currentStatus);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Confirm revocation and deletion of mill "${name}" from directory?`)) {
      startTransition(async () => {
        await deleteEnterprise(id);
      });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createEnterprise(formData as any);
      setIsCreateOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 border border-[#E1E4E7] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7]">
        <div className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Member Manufacturers
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-[#0D0D0D]">
            {initialEnterprises.length} Mills
          </div>
        </div>
        <div className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Accredited & Verified
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-[#0D0D0D]">
            {verifiedCount} / {initialEnterprises.length} Mills
          </div>
        </div>
        <div className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Combined Monthly Output
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-[#0D0D0D]">
            {(totalCapacity / 1000).toFixed(0)}k pcs/mo
          </div>
        </div>
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
              Compliance Audit
            </div>
            <div className="mt-1 font-mono text-xs text-[#0D0D0D]">
              PAN & WRAP Standard
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Mill
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-[#E1E4E7]">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mill name, city, PAN, or registration..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono placeholder:font-sans placeholder:text-[#6B7280] focus:border-[#0D0D0D] focus:outline-none"
          />
        </div>

        <div className="font-mono text-xs text-[#6B7280]">
          Showing <span className="font-bold text-[#0D0D0D]">{filteredEnterprises.length}</span> accredited facilities
        </div>
      </div>

      {/* Enterprises Table */}
      <div className="border border-[#E1E4E7] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-ledger">
            <thead>
              <tr>
                <th>Enterprise / Mill Name</th>
                <th>City & Tax Reg</th>
                <th className="text-right">Monthly Capacity</th>
                <th className="text-right">Workforce</th>
                <th>Accreditations</th>
                <th>Compliance Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnterprises.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                    No manufacturing mills match current query.
                  </td>
                </tr>
              ) : (
                filteredEnterprises.map((factory) => (
                  <tr key={factory.id} className="group">
                    <td>
                      <div
                        onClick={() => setSelectedMill(factory)}
                        className="font-bold text-[#0D0D0D] cursor-pointer hover:text-[#1E3A52]"
                      >
                        {factory.name}
                      </div>
                      <div className="font-mono text-[10px] text-[#6B7280]">
                        {factory.contactEmail}
                      </div>
                    </td>

                    <td>
                      <div className="font-medium text-[#0D0D0D]">{factory.city}</div>
                      <div className="font-mono text-[10px] text-[#6B7280]">
                        PAN: {factory.panNumber} · Reg: {factory.registrationNumber}
                      </div>
                    </td>

                    <td className="text-right font-mono font-bold text-[#0D0D0D]">
                      {factory.monthlyCapacityPcs.toLocaleString()} pcs
                    </td>

                    <td className="text-right font-mono text-[#0D0D0D]">
                      {factory.employeeCount} staff
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1">
                        {factory.certifications.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className="tag-neutral text-[10px]"
                          >
                            {c.name}
                          </span>
                        ))}
                        {factory.certifications.length > 3 && (
                          <span className="font-mono text-[10px] text-[#6B7280]">
                            +{factory.certifications.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleVerification(factory.id, factory.isVerified)}
                        disabled={isPending}
                        className={factory.isVerified ? "tag-approved" : "tag-pending"}
                        title="Click to toggle official verification"
                      >
                        {factory.isVerified ? "VERIFIED" : "AUDIT PENDING"}
                      </button>
                    </td>

                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                        <button
                          onClick={() => setSelectedMill(factory)}
                          className="px-1.5 py-0.5 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#0D0D0D]"
                          title="Inspect Plant Dossier"
                        >
                          Dossier
                        </button>
                        <Link
                          href={`/directory/${factory.slug}`}
                          target="_blank"
                          className="p-1 text-[#6B7280] hover:text-[#0D0D0D]"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(factory.id, factory.name)}
                          disabled={isPending}
                          className="p-1 text-[#6B7280] hover:text-red-700"
                          title="Revoke Mill"
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

      {/* MILL DOSSIER INSPECTOR MODAL */}
      {selectedMill && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#0D0D0D] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#E1E4E7] bg-[#F6F7F8] flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
                  Accreditation Dossier · Facility #{selectedMill.registrationNumber}
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#0D0D0D]">
                  {selectedMill.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedMill(null)}
                className="p-1 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#6B7280] hover:text-[#0D0D0D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Core Verification Attributes */}
              <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E1E4E7] bg-[#F6F7F8] divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7] text-xs">
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    PAN Registration
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    {selectedMill.panNumber}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Monthly Capacity
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    {selectedMill.monthlyCapacityPcs.toLocaleString()} pcs
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Labor Force
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    {selectedMill.employeeCount} full-time
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Accreditation Status
                  </div>
                  <div className="mt-0.5">
                    <span className={selectedMill.isVerified ? "tag-approved" : "tag-pending"}>
                      {selectedMill.isVerified ? "AUDITED & VERIFIED" : "AUDIT PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manufacturing Plant Location & Markets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-[#E1E4E7] space-y-2">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280] pb-1 border-b border-[#E1E4E7]">
                    Plant Location & Dispatch Hub
                  </div>
                  <div className="font-bold text-[#0D0D0D]">
                    {selectedMill.address || "Kathmandu Industrial Estate"}
                  </div>
                  <div className="font-mono text-[11px] text-[#6B7280]">
                    City: {selectedMill.city}, Nepal
                  </div>
                  <div className="font-mono text-[11px] text-[#6B7280]">
                    Contact: {selectedMill.contactEmail}
                  </div>
                </div>

                <div className="p-4 border border-[#E1E4E7] space-y-2">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280] pb-1 border-b border-[#E1E4E7]">
                    Primary Export Markets
                  </div>
                  <div className="font-mono text-[11px] font-semibold text-[#0D0D0D]">
                    {selectedMill.exportMarkets || "USA, Germany, United Kingdom, Japan"}
                  </div>
                  <div className="font-mono text-[10px] text-[#6B7280]">
                    Customs Clearance: Tribhuvan International Airport & Birgunj Dry Port
                  </div>
                </div>
              </div>

              {/* Accreditations & Certifications */}
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0D0D0D] mb-2">
                  Audited Compliance Standards
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMill.certifications.length === 0 ? (
                    <span className="font-mono text-xs text-[#6B7280]">
                      No standard third-party certifications attached yet.
                    </span>
                  ) : (
                    selectedMill.certifications.map((c) => (
                      <span key={c.id} className="tag-neutral font-mono text-xs px-2.5 py-1">
                        {c.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedMill.description && (
                <div className="p-4 border border-[#E1E4E7] bg-[#F6F7F8]">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280] mb-1">
                    Facility Overview
                  </div>
                  <p className="text-xs text-[#0D0D0D] leading-relaxed">
                    {selectedMill.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F6F7F8] border-t border-[#E1E4E7] flex items-center justify-between">
              <Link
                href={`/directory/${selectedMill.slug}`}
                target="_blank"
                className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-[#0D0D0D] bg-white border border-[#E1E4E7] hover:border-[#0D0D0D]"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                Public Directory Page
              </Link>
              <button
                onClick={() => setSelectedMill(null)}
                className="px-4 py-1.5 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MILL MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#0D0D0D] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#E1E4E7] bg-[#F6F7F8] flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
                  New Mill Accreditation
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
                  Enroll Manufacturing Plant
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#6B7280] hover:text-[#0D0D0D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Company / Mill Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                    placeholder="e.g. Himalayan Knitwear Industries Ltd."
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    PAN / Tax Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                    placeholder="600123456"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Company Reg Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                    placeholder="REG-2045-NP"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    City / Industrial Zone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                    placeholder="Kathmandu"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Monthly Capacity (Pcs) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyCapacityPcs}
                    onChange={(e) => setFormData({ ...formData, monthlyCapacityPcs: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Workforce Count *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Plant Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                  placeholder="Balaju Industrial District, Kathmandu"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Plant Overview & Technical Capabilities *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs focus:border-[#0D0D0D] focus:outline-none"
                  placeholder="Specializes in fine-gauge cashmere and organic cotton apparel for export..."
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Export Corridors / Markets (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.exportMarkets}
                  onChange={(e) => setFormData({ ...formData, exportMarkets: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  placeholder="USA, Germany, UK, Japan"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="border-[#E1E4E7] text-[#0D0D0D] focus:ring-0"
                />
                <label htmlFor="isVerified" className="font-mono text-xs text-[#0D0D0D]">
                  Mark as Verified Member Plant
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E1E4E7]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                >
                  {isPending ? "Registering..." : "Save Member Plant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
