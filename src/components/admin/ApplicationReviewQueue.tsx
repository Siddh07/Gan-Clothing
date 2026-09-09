"use client";

import React, { useState, useTransition } from "react";
import { approveFactoryApplication, rejectFactoryApplication } from "@/actions/apply";
import {
  ShieldCheck,
  MapPin,
  Mail,
  Search,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";

interface PendingEnterprise {
  id: string;
  name: string;
  slug: string;
  status: string;
  registrationNumber: string;
  panNumber: string;
  city: string;
  address: string;
  monthlyCapacityPcs: number;
  employeeCount: number;
  description: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
  users: { name: string | null; email: string }[];
}

export function ApplicationReviewQueue({
  initialApplications,
}: {
  initialApplications: PendingEnterprise[];
}) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = initialApplications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.panNumber.includes(search) ||
      app.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => {
    if (confirm("Confirm approval of this garment manufacturing facility for full GAN certification and export directory listing?")) {
      startTransition(async () => {
        await approveFactoryApplication(id);
      });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Specify audit rejection grounds / compliance deficiencies:");
    if (reason !== null) {
      startTransition(async () => {
        await rejectFactoryApplication(id, reason);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-[#E1E4E7]">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter pending files by mill name, PAN, city..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono placeholder:font-sans placeholder:text-[#6B7280] focus:border-[#0D0D0D] focus:outline-none"
          />
        </div>
        <div className="font-mono text-xs text-[#6B7280]">
          Pending Compliance Audit: <span className="font-bold text-[#0D0D0D]">{filtered.length} Dossiers</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-[#E1E4E7] bg-white p-12 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-[#6B7280] mx-auto stroke-1" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
            Review Queue Clean · All Mills Audited
          </h3>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            No factory membership dossiers currently require compliance review. Prospective mills will appear here upon submission through the accreditation portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="border border-[#E1E4E7] bg-white hover:border-[#0D0D0D] transition-colors p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="tag-pending">
                      AUDIT PENDING
                    </span>
                    <h3 className="text-base font-bold text-[#0D0D0D] mt-1.5">
                      {app.name}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#6B7280]">
                    Logged: {new Date(app.createdAt).toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Audit Attributes Table */}
                <div className="mt-3 border border-[#E1E4E7] bg-[#F6F7F8] divide-y divide-[#E1E4E7] text-xs">
                  <div className="p-2 flex justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#6B7280]">PAN / VAT:</span>
                    <span className="font-mono font-bold text-[#0D0D0D]">{app.panNumber}</span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#6B7280]">Govt Reg Number:</span>
                    <span className="font-mono font-semibold text-[#0D0D0D]">{app.registrationNumber}</span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#6B7280]">Claimed Monthly Output:</span>
                    <span className="font-mono font-bold text-[#1E3A52]">
                      {app.monthlyCapacityPcs.toLocaleString()} pcs/mo
                    </span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#6B7280]">Workforce / Floor:</span>
                    <span className="font-mono text-[#0D0D0D]">{app.employeeCount} staff</span>
                  </div>
                </div>

                <div className="pt-3 text-xs space-y-1">
                  <div className="flex items-center text-[#6B7280]">
                    <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-[#0D0D0D]" />
                    <span>{app.address}, {app.city}</span>
                  </div>
                  <div className="flex items-center text-[#6B7280]">
                    <Mail className="w-3.5 h-3.5 mr-1 shrink-0 text-[#0D0D0D]" />
                    <span>{app.contactEmail} ({app.contactPhone})</span>
                  </div>
                  {app.users[0] && (
                    <div className="font-mono text-[10px] text-[#6B7280] pt-1">
                      Applicant Rep: <strong className="text-[#0D0D0D]">{app.users[0].name}</strong> ({app.users[0].email})
                    </div>
                  )}
                </div>

                {app.description && (
                  <p className="text-xs text-[#0D0D0D] mt-2 italic bg-[#F6F7F8] p-2.5 border border-[#E1E4E7] line-clamp-2">
                    "{app.description}"
                  </p>
                )}
              </div>

              {/* Action Strip */}
              <div className="pt-3 border-t border-[#E1E4E7] flex items-center justify-end gap-2 font-mono text-xs">
                <button
                  onClick={() => handleReject(app.id)}
                  disabled={isPending}
                  className="px-3 py-1 text-red-700 hover:text-red-900 border border-transparent hover:border-red-200 transition-colors"
                >
                  Reject Application
                </button>

                <button
                  onClick={() => handleApprove(app.id)}
                  disabled={isPending}
                  className="inline-flex items-center px-4 py-1.5 font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Accredit & Verify Mill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

