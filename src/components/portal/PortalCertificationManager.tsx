"use client";

import React, { useState, useTransition } from "react";
import { addFactoryCertification } from "@/actions/portal";
import {
  Award,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Plus,
  ExternalLink,
  Calendar,
  X,
  Loader2,
} from "lucide-react";

interface Certification {
  id: string;
  name: string;
  issuer: string;
  certificateNumber?: string | null;
  issueDate?: Date | null;
  expiryDate?: Date | null;
  certificateFileUrl?: string | null;
}

export function PortalCertificationManager({
  initialCertifications,
}: {
  initialCertifications: Certification[];
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "WRAP Gold Level",
    issuer: "Worldwide Responsible Accredited Production",
    certificateNumber: "",
    issueDate: "",
    expiryDate: "",
    certificateFileUrl: "",
  });

  const getStatus = (expiryDate?: Date | null) => {
    if (!expiryDate) return { label: "Active", color: "bg-emerald-100 text-emerald-800" };
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        label: `Expired (${Math.abs(daysLeft)} days ago)`,
        color: "bg-red-100 text-red-800",
        alert: true,
      };
    }
    if (daysLeft <= 30) {
      return {
        label: `Expiring Soon (${daysLeft} days left)`,
        color: "bg-amber-100 text-amber-800",
        warning: true,
      };
    }
    return {
      label: `Active (${daysLeft} days remaining)`,
      color: "bg-emerald-100 text-emerald-800",
      active: true,
    };
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await addFactoryCertification(formData);
      setIsUploadOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">
          Showing {initialCertifications.length} verified social & environmental compliance audit{initialCertifications.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Submit New Audit Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCertifications.map((cert) => {
          const status = getStatus(cert.expiryDate);
          return (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Award className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-outfit text-base font-bold text-slate-900">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issuer: <strong className="text-slate-700">{cert.issuer}</strong>
                  </p>
                  {cert.certificateNumber && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Cert #: {cert.certificateNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                <div>
                  {cert.expiryDate ? (
                    <span>
                      Expires:{" "}
                      <strong>
                        {new Date(cert.expiryDate).toLocaleDateString()}
                      </strong>
                    </span>
                  ) : (
                    <span>Valid indefinitely</span>
                  )}
                </div>

                {cert.certificateFileUrl && (
                  <a
                    href={cert.certificateFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-emerald-700 inline-flex items-center"
                    title="View Certificate PDF"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-outfit font-bold text-base">Submit Compliance Audit</h3>
              <button onClick={() => setIsUploadOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Standard Name *
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="WRAP Gold Level">WRAP Gold Level</option>
                  <option value="WRAP Platinum Level">WRAP Platinum Level</option>
                  <option value="OEKO-TEX® Standard 100">OEKO-TEX® Standard 100</option>
                  <option value="Sedex SMETA 4-Pillar">Sedex SMETA 4-Pillar</option>
                  <option value="GOTS (Global Organic Textile Standard)">GOTS Organic</option>
                  <option value="ISO 9001:2015">ISO 9001:2015 Quality</option>
                  <option value="ISO 14001:2015">ISO 14001:2015 Environmental</option>
                  <option value="bluesign® System Partner">bluesign® System Partner</option>
                  <option value="WFTO Guaranteed Fair Trade">WFTO Fair Trade</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Auditing Body / Issuer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. SGS, Bureau Veritas, TÜV SÜD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Certificate Registration Number
                </label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  placeholder="WRAP-NP-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Certificate Document URL (PDF)
                </label>
                <input
                  type="url"
                  value={formData.certificateFileUrl}
                  onChange={(e) => setFormData({ ...formData, certificateFileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm"
                >
                  {isPending ? "Submitting..." : "Submit Audit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
