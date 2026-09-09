"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveFactoryApplication, rejectFactoryApplication } from "@/actions/apply";
import { Search, ShieldCheck, ShieldAlert, FileText } from "lucide-react";

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
  const router = useRouter();
  const [applications, setApplications] = useState<PendingEnterprise[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const filtered = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.panNumber.includes(search) ||
      app.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => {
    if (confirm("Approve this mill and add to the verified directory?")) {
      const removed = applications.find((a) => a.id === id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      startTransition(async () => {
        try {
          const res = await approveFactoryApplication(id);
          if (res.success) {
            router.refresh();
          }
        } catch (err: any) {
          if (removed) setApplications((prev) => [removed, ...prev]);
          alert(err?.message || "Failed to approve application. Please ensure you are logged in as admin.");
        }
      });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Reason for rejection (will be logged):");
    if (reason !== null) {
      const removed = applications.find((a) => a.id === id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      startTransition(async () => {
        try {
          const res = await rejectFactoryApplication(id, reason);
          if (res.success) {
            router.refresh();
          }
        } catch (err: any) {
          if (removed) setApplications((prev) => [removed, ...prev]);
          alert(err?.message || "Failed to reject application. Please ensure you are logged in as admin.");
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="badge badge-warning">{applications.length} pending</span>
          <span className="text-sm text-[#6B7280]">applications awaiting review</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications…"
            className="pl-8 pr-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none w-56"
          />
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#D1D5DB] py-16 text-center">
          <ShieldCheck className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
          <p className="text-[#1A1A1A] font-medium">
            {initialApplications.length === 0 ? "No pending applications" : "No matching applications"}
          </p>
          <p className="text-sm text-[#6B7280] mt-1">
            {initialApplications.length === 0
              ? "All applications have been reviewed."
              : "Try adjusting your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
              {/* Application header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D1D5DB]">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1A1A1A]">{app.name}</h3>
                  <p className="text-sm text-[#6B7280] mt-0.5">{app.city} · Submitted {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-warning">Pending review</span>
              </div>

              {/* Details grid */}
              <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["PAN", app.panNumber],
                  ["Registration", app.registrationNumber],
                  ["Contact", app.contactEmail],
                  ["Employees", app.employeeCount.toLocaleString()],
                  ["Capacity", `${app.monthlyCapacityPcs.toLocaleString()} pcs/mo`],
                  ["Address", app.address || "—"],
                  ["Applicant", app.users[0]?.name || app.users[0]?.email || "—"],
                  ["Phone", app.contactPhone || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-[#6B7280]">{k}</dt>
                    <dd className="text-sm font-medium text-[#1A1A1A] mt-0.5 truncate">{v}</dd>
                  </div>
                ))}
              </div>

              {app.description && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-[#6B7280] bg-[#F8F8F6] rounded p-3 leading-relaxed">{app.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[#D1D5DB] bg-[#F8F8F6]">
                <button
                  onClick={() => handleReject(app.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#DC2626] text-[#DC2626] rounded hover:bg-[#FEF2F2] transition disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(app.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#16A34A] hover:bg-[#15803D] text-white rounded transition disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Approve & verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
