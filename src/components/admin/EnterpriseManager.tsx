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
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

interface EnterpriseItem {
  id: string;
  name: string;
  slug: string;
  registrationNumber: string;
  panNumber: string;
  city: string;
  employeeCount: number;
  monthlyCapacityPcs: number;
  contactEmail: string;
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
      e.panNumber.includes(search)
  );

  const handleToggleVerification = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleEnterpriseVerification(id, currentStatus);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the directory?`)) {
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
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by factory name, city, PAN..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Member Factory
        </button>
      </div>

      {/* Enterprises Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Enterprise Name</th>
                <th className="px-6 py-4">City / Reg</th>
                <th className="px-6 py-4">Monthly Capacity</th>
                <th className="px-6 py-4">Labor Force</th>
                <th className="px-6 py-4">Certifications</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEnterprises.map((factory) => (
                <tr key={factory.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {factory.name}
                    </div>
                    <div className="text-[11px] text-slate-700">
                      PAN: {factory.panNumber} • {factory.contactEmail}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-semibold">{factory.city}</div>
                    <div className="text-[10px] text-slate-700">Reg: {factory.registrationNumber}</div>
                  </td>

                  <td className="px-6 py-4 font-bold text-emerald-800">
                    {factory.monthlyCapacityPcs.toLocaleString()} pcs
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {factory.employeeCount} staff
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {factory.certifications.slice(0, 2).map((c) => (
                        <span
                          key={c.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800"
                        >
                          {c.name}
                        </span>
                      ))}
                      {factory.certifications.length > 2 && (
                        <span className="text-[10px] text-slate-700">
                          +{factory.certifications.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleVerification(factory.id, factory.isVerified)}
                      disabled={isPending}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        factory.isVerified
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {factory.isVerified ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Verified
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-slate-700" />
                          Unverified
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/directory/${factory.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-700 hover:text-emerald-700 inline-block"
                      title="View public directory profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(factory.id, factory.name)}
                      disabled={isPending}
                      className="p-1.5 text-slate-700 hover:text-red-600 inline-block"
                      title="Delete enterprise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Enterprise */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-outfit font-bold text-lg">Add Member Garment Factory</h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Factory Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Pokhara Fine Cashmere Mills"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Kathmandu, Lalitpur, Pokhara"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Govt Reg Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="12456/051"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PAN / VAT ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="300124567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Capacity (Pcs) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyCapacityPcs}
                    onChange={(e) => setFormData({ ...formData, monthlyCapacityPcs: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Count *</label>
                  <input
                    type="number"
                    required
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="export@factory.com.np"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="+977-1-4350123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Factory Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Plot 12, Balaju Industrial Area"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Description & History *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Describe manufacturing lines, machinery, and specialty."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Export Markets (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.exportMarkets}
                  onChange={(e) => setFormData({ ...formData, exportMarkets: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="USA, Germany, UK, Japan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL (Cloud/Unsplash)</label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isVerified" className="text-xs font-semibold text-slate-700">
                  Mark as GAN Verified Exporter
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {isPending ? "Creating Factory..." : "Save Member Factory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
