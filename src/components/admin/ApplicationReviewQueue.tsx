"use client";

import React, { useState, useTransition } from "react";
import { approveFactoryApplication, rejectFactoryApplication } from "@/actions/apply";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Search,
  Loader2,
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
  const [selectedApp, setSelectedApp] = useState<PendingEnterprise | null>(null);

  const filtered = initialApplications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.panNumber.includes(search) ||
      app.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => {
    if (confirm("Approve this factory for full GAN accreditation and public directory listing?")) {
      startTransition(async () => {
        await approveFactoryApplication(id);
        setSelectedApp(null);
      });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Enter rejection reason or feedback notes:");
    if (reason !== null) {
      startTransition(async () => {
        await rejectFactoryApplication(id, reason);
        setSelectedApp(null);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search toolbar */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending applications by name, PAN, city..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500">
          {filtered.length} pending review
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-outfit text-base font-bold text-slate-900">
            Review Queue Clean
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No factory membership applications are currently pending verification. All member applications have been processed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                      PENDING REVIEW
                    </span>
                    <h3 className="font-outfit text-lg font-bold text-slate-900 mt-2">
                      {app.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PAN / VAT ID:</span>
                    <strong className="font-mono text-slate-900">{app.panNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Company Reg #:</span>
                    <strong className="font-mono text-slate-900">{app.registrationNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Capacity:</span>
                    <strong className="text-emerald-700">{app.monthlyCapacityPcs.toLocaleString()} pcs/mo</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Workforce:</span>
                    <strong className="text-slate-900">{app.employeeCount} staff</strong>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                    {app.address}, {app.city}
                  </div>
                  <div className="flex items-center text-slate-500">
                    <Mail className="w-3.5 h-3.5 mr-1 shrink-0" />
                    {app.contactEmail} ({app.contactPhone})
                  </div>
                  {app.users[0] && (
                    <div className="text-[11px] text-slate-500">
                      Representative: <strong>{app.users[0].name}</strong> ({app.users[0].email})
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{app.description}"
                </p>
              </div>

              {/* Approval Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleReject(app.id)}
                  disabled={isPending}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  Reject Application
                </button>

                <button
                  onClick={() => handleApprove(app.id)}
                  disabled={isPending}
                  className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Approve & Verify Mill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
