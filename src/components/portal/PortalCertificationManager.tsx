"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  AlertCircle,
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
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCertifications(initialCertifications);
  }, [initialCertifications]);

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
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await addFactoryCertification(formData);
        if (res.success && res.certification) {
          setCertifications((prev) => [res.certification as Certification, ...prev]);
          setIsUploadOpen(false);
          setFormData({
            name: "WRAP Gold Level",
            issuer: "Worldwide Responsible Accredited Production",
            certificateNumber: "",
            issueDate: "",
            expiryDate: "",
            certificateFileUrl: "",
          });
          router.refresh();
        } else {
          setFormError("Failed to upload certification. Please check required fields.");
        }
      } catch (err: any) {
        setFormError(err?.message || "Failed to submit certification. Check that you are signed in.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-[#E1E4E7] p-3">
        <p className="text-xs font-mono text-[#6B7280]">
          ACCREDITATION REGISTER: {certifications.length} VERIFIED AUDIT RECORD{certifications.length === 1 ? "" : "S"}
        </p>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center px-3.5 py-2 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] transition-colors rounded-none cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          FILE AUDIT CERTIFICATE
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((cert) => {
          const status = getStatus(cert.expiryDate);
          return (
            <div
              key={cert.id}
              className="bg-white border border-[#E1E4E7] p-4 flex flex-col justify-between space-y-4 hover:border-[#1E3A52] transition-colors"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="p-1.5 border border-[#E1E4E7] bg-[#F6F7F8] text-[#1E3A52]">
                    <Award className="w-4 h-4" />
                  </div>
                  <span
                    className={
                      status.alert
                        ? "tag-neutral text-[10px] text-red-700 border-red-200"
                        : status.warning
                          ? "tag-pending text-[10px]"
                          : "tag-approved text-[10px]"
                    }
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-xs text-[#0D0D0D] font-sans">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Issuer: <strong className="text-[#0D0D0D]">{cert.issuer}</strong>
                  </p>
                  {cert.certificateNumber && (
                    <p className="text-[10px] text-[#6B7280] font-mono">
                      CERT ID: {cert.certificateNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E4E7] text-[10px] font-mono text-[#6B7280] flex justify-between items-center">
                <div>
                  {cert.expiryDate ? (
                    <span>
                      EXPIRES:{" "}
                      <strong className="text-[#0D0D0D]">
                        {new Date(cert.expiryDate).toISOString().split("T")[0]}
                      </strong>
                    </span>
                  ) : (
                    <span>PERMANENT AUDIT RECORD</span>
                  )}
                </div>

                {cert.certificateFileUrl && (
                  <a
                    href={cert.certificateFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#6B7280] hover:text-[#0D0D0D] inline-flex items-center"
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

      {/* Upload Modal / Compliance Entry Form */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D]/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-[#E1E4E7] shadow-xl overflow-hidden">
            <div className="bg-[#0D0D0D] text-white px-5 py-3.5 flex justify-between items-center">
              <div>
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                  Accreditation Dossier Entry
                </h3>
                <p className="text-[10px] font-mono text-[#E1E4E7]/70">
                  RECORD SOCIAL, TECHNICAL OR CHEMICAL AUDIT
                </p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-[#E1E4E7] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Audit Standard & Framework *
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
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
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Accredited Auditing Body *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. SGS, Bureau Veritas, TÜV SÜD"
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Certificate Registration Number
                </label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  placeholder="WRAP-NP-2026"
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  Certificate Document URL (PDF)
                </label>
                <input
                  type="url"
                  value={formData.certificateFileUrl}
                  onChange={(e) => setFormData({ ...formData, certificateFileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E1E4E7]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] rounded-none cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] rounded-none cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "SUBMITTING..." : "COMMIT AUDIT RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
