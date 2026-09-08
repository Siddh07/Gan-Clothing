"use client";

import React, { useState, useTransition } from "react";
import { updateInquiryStatus } from "@/actions/admin";
import {
  Inbox,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Send,
  X,
  Building2,
  Mail,
  Globe,
} from "lucide-react";

interface InquiryItem {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  buyerCountry: string;
  orderQuantityTarget: number;
  message: string;
  status: string;
  createdAt: Date;
  enterprise?: { name: string } | null;
  product?: { title: string } | null;
}

export function InquiryManager({
  initialInquiries,
}: {
  initialInquiries: InquiryItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeInquiry, setActiveInquiry] = useState<InquiryItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = initialInquiries.filter((item) => {
    const matchesSearch =
      item.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerCountry.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (item.enterprise?.name && item.enterprise.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: "NEW" | "FORWARDED" | "CLOSED") => {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
      if (activeInquiry && activeInquiry.id === id) {
        setActiveInquiry({ ...activeInquiry, status: newStatus });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by buyer, company, country..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {["ALL", "NEW", "FORWARDED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === s
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/api/export-csv"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export All Leads (.CSV)
        </a>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Buyer & Company</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Target Recipient</th>
                <th className="px-6 py-4">Target Volume</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Logged Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {item.buyerCompany}
                    </div>
                    <div className="text-[11px] text-slate-700">
                      {item.buyerName} • {item.buyerEmail}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {item.buyerCountry}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {item.enterprise?.name || "General GAN Trade Desk"}
                    </div>
                    {item.product && (
                      <div className="text-[10px] text-emerald-700">
                        Item: {item.product.title}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 font-bold text-emerald-800">
                    {item.orderQuantityTarget.toLocaleString()} pcs
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={item.status}
                      disabled={isPending}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as "NEW" | "FORWARDED" | "CLOSED"
                        )
                      }
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                        item.status === "NEW"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "FORWARDED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="FORWARDED">FORWARDED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setActiveInquiry(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold inline-flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-outfit font-bold text-base">
                  Trade Lead #{activeInquiry.id.slice(-6).toUpperCase()}
                </h3>
                <span className="text-[11px] text-slate-700">
                  {new Date(activeInquiry.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setActiveInquiry(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700">Buyer Name:</span>
                  <span className="font-bold text-slate-900">{activeInquiry.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Company:</span>
                  <span className="font-bold text-slate-900">{activeInquiry.buyerCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Country:</span>
                  <span className="font-bold text-slate-900">{activeInquiry.buyerCountry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Email:</span>
                  <a
                    href={`mailto:${activeInquiry.buyerEmail}`}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    {activeInquiry.buyerEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Target Volume:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {activeInquiry.orderQuantityTarget.toLocaleString()} pcs
                  </span>
                </div>
              </div>

              <div>
                <strong className="block text-slate-900 mb-1">Target Recipient:</strong>
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100">
                  {activeInquiry.enterprise?.name || "General GAN Trade Desk Routing"}
                  {activeInquiry.product && ` (Product: ${activeInquiry.product.title})`}
                </div>
              </div>

              <div>
                <strong className="block text-slate-900 mb-1">Buyer Specification & Message:</strong>
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                  {activeInquiry.message}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-700">Lead Status:</span>
                  <select
                    value={activeInquiry.status}
                    onChange={(e) =>
                      handleStatusChange(
                        activeInquiry.id,
                        e.target.value as "NEW" | "FORWARDED" | "CLOSED"
                      )
                    }
                    className="px-2.5 py-1 rounded-md border text-xs font-semibold"
                  >
                    <option value="NEW">NEW</option>
                    <option value="FORWARDED">FORWARDED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <button
                  onClick={() => setActiveInquiry(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
