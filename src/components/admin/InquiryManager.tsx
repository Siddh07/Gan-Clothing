"use client";

import React, { useState, useTransition } from "react";
import { updateInquiryStatus, addAdminInquiryNote } from "@/actions/admin";
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
  Package,
  Calendar,
  MessageSquare,
  Plus,
} from "lucide-react";

interface InquiryItemDetail {
  id: string;
  requestedQuantity: number;
  customSpecifications: string | null;
  enterprise: {
    id: string;
    name: string;
    contactEmail: string;
  };
  product: {
    id: string;
    title: string;
    images: string;
  } | null;
}

interface InquiryNoteDetail {
  id: string;
  author: string;
  content: string;
  createdAt: Date | string;
}

interface FullInquiry {
  id: string;
  inquiryNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  buyerCountry: string;
  generalMessage: string;
  status: "NEW" | "VIEWED" | "FORWARDED" | "RESPONDED" | "CLOSED";
  targetDeliveryDate: Date | string | null;
  createdAt: Date | string;
  items: InquiryItemDetail[];
  communications: InquiryNoteDetail[];
}

export function InquiryManager({
  initialInquiries,
}: {
  initialInquiries: FullInquiry[];
}) {
  const [inquiries, setInquiries] = useState<FullInquiry[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeInquiry, setActiveInquiry] = useState<FullInquiry | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = inquiries.filter((item) => {
    const matchesSearch =
      (item.inquiryNumber && item.inquiryNumber.toLowerCase().includes(search.toLowerCase())) ||
      item.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerCountry.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
      item.items.some((i) => i.enterprise.name.toLowerCase().includes(search.toLowerCase())) ||
      item.items.some((i) => i.product?.title.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: "NEW" | "VIEWED" | "FORWARDED" | "RESPONDED" | "CLOSED") => {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      if (activeInquiry && activeInquiry.id === id) {
        setActiveInquiry({ ...activeInquiry, status: newStatus });
      }
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiry || !noteContent.trim()) return;

    startTransition(async () => {
      const res = await addAdminInquiryNote(activeInquiry.id, noteContent);
      if (res.success && res.note) {
        const newNote: InquiryNoteDetail = {
          id: res.note.id,
          author: res.note.author,
          content: res.note.content,
          createdAt: new Date().toISOString(),
        };
        const updatedComms = [newNote, ...(activeInquiry.communications || [])];
        const updatedInquiry = { ...activeInquiry, communications: updatedComms };

        setActiveInquiry(updatedInquiry);
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === activeInquiry.id ? updatedInquiry : inq))
        );
        setNoteContent("");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "VIEWED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FORWARDED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "RESPONDED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
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
              placeholder="Search RFQ#, buyer, mill, country..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            {["ALL", "NEW", "VIEWED", "FORWARDED", "RESPONDED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
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
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          Export All RFQs (.CSV)
        </a>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">RFQ Number</th>
                <th className="p-3.5">Buyer & Company</th>
                <th className="p-3.5">Country</th>
                <th className="p-3.5">Target Factories & Items</th>
                <th className="p-3.5">Total Qty</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-700">
                    No matching RFQ trade inquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const totalVolume = item.items.reduce((acc, i) => acc + i.requestedQuantity, 0);
                  const mills = Array.from(new Set(item.items.map((i) => i.enterprise.name)));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-emerald-800">
                        {item.inquiryNumber || "RFQ-PENDING"}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.buyerCompany}</div>
                        <div className="text-slate-700 text-[11px]">{item.buyerName}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{item.buyerCountry}</td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 line-clamp-1 max-w-xs">
                          {mills.join(", ") || "General GAN Trade Desk"}
                        </div>
                        <div className="text-slate-700 text-[11px]">
                          {item.items.length} line item(s)
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">
                        {totalVolume.toLocaleString()} pcs
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setActiveInquiry(item)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-700" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Inquiry Modal Drawer */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    {activeInquiry.inquiryNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(activeInquiry.status)}`}>
                    {activeInquiry.status}
                  </span>
                </div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 mt-1">
                  {activeInquiry.buyerCompany} — Sourcing RFQ
                </h3>
              </div>
              <button
                onClick={() => setActiveInquiry(null)}
                className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Buyer info card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-700 font-semibold">Buyer Representative</div>
                  <div className="text-slate-900 font-bold text-sm mt-0.5">{activeInquiry.buyerName}</div>
                  <a href={`mailto:${activeInquiry.buyerEmail}`} className="text-emerald-700 hover:underline flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {activeInquiry.buyerEmail}
                  </a>
                </div>
                <div>
                  <div className="text-slate-700 font-semibold">Origin & Market</div>
                  <div className="text-slate-900 font-bold text-sm mt-0.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-700" />
                    {activeInquiry.buyerCountry}
                  </div>
                </div>
                <div>
                  <div className="text-slate-700 font-semibold">Target Delivery Date</div>
                  <div className="text-slate-900 font-bold text-sm mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-700" />
                    {activeInquiry.targetDeliveryDate
                      ? new Date(activeInquiry.targetDeliveryDate).toLocaleDateString()
                      : "Open / Negotiable"}
                  </div>
                </div>
              </div>

              {/* General Message */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Buyer Specifications & Overview
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
                  "{activeInquiry.generalMessage}"
                </div>
              </div>

              {/* Line items */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Requested RFQ Line Items ({activeInquiry.items.length})
                </h4>
                <div className="space-y-2">
                  {activeInquiry.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.product?.title || "Custom Factory Inquiry"}
                        </div>
                        <div className="text-slate-700 flex items-center gap-2 mt-0.5">
                          <Building2 className="w-3 h-3 text-emerald-600" />
                          <span>Factory: {item.enterprise.name}</span>
                          {item.customSpecifications && (
                            <span className="text-slate-700">• Spec: {item.customSpecifications}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-800 font-mono text-sm">
                          {item.requestedQuantity.toLocaleString()} pcs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Strip */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Update Lead Routing Status:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["NEW", "VIEWED", "FORWARDED", "RESPONDED", "CLOSED"] as const).map((statusOption) => (
                    <button
                      key={statusOption}
                      disabled={isPending || activeInquiry.status === statusOption}
                      onClick={() => handleStatusChange(activeInquiry.id, statusOption)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        activeInquiry.status === statusOption
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communications Notes Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Internal Secretariat Progress Notes
                </h4>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Log progress, mill contact notes, or buyer follow-up..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !noteContent.trim()}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50 inline-flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Note
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(!activeInquiry.communications || activeInquiry.communications.length === 0) ? (
                    <p className="text-xs text-slate-700 italic">No notes logged yet for this lead.</p>
                  ) : (
                    activeInquiry.communications.map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-center justify-between text-slate-700 text-[11px] mb-1">
                          <span className="font-bold text-slate-800">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
