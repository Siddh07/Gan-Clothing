"use client";

import React, { useState, useTransition } from "react";
import { updateInquiryStatus, addAdminInquiryNote } from "@/actions/admin";
import { Download, Search, X, Mail, Globe, Calendar, MessageSquare, Building2 } from "lucide-react";

interface InquiryItemDetail {
  id: string;
  requestedQuantity: number;
  customSpecifications: string | null;
  enterprise: { id: string; name: string; contactEmail: string };
  product: { id: string; title: string; images: string } | null;
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

const STATUS_OPTIONS: FullInquiry["status"][] = ["NEW", "VIEWED", "FORWARDED", "RESPONDED", "CLOSED"];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    NEW: "badge badge-warning",
    VIEWED: "badge badge-neutral",
    FORWARDED: "badge badge-accent",
    RESPONDED: "badge badge-success",
    CLOSED: "badge badge-neutral",
  };
  const labels: Record<string, string> = {
    NEW: "New",
    VIEWED: "Viewed",
    FORWARDED: "Forwarded",
    RESPONDED: "Responded",
    CLOSED: "Closed",
  };
  return <span className={map[status] || "badge badge-neutral"}>{labels[status] || status}</span>;
}

export function InquiryManager({ initialInquiries }: { initialInquiries: FullInquiry[] }) {
  const [inquiries, setInquiries] = useState<FullInquiry[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeInquiry, setActiveInquiry] = useState<FullInquiry | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalUnits = inquiries.reduce(
    (acc, inq) => acc + inq.items.reduce((sum, item) => sum + item.requestedQuantity, 0),
    0
  );

  const filtered = inquiries.filter((item) => {
    const matchesSearch =
      (item.inquiryNumber && item.inquiryNumber.toLowerCase().includes(search.toLowerCase())) ||
      item.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerCountry.toLowerCase().includes(search.toLowerCase()) ||
      item.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
      item.items.some((i) => i.enterprise.name.toLowerCase().includes(search.toLowerCase())) ||
      item.items.some((i) => i.product?.title.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: FullInquiry["status"]) => {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)));
      if (activeInquiry?.id === id) setActiveInquiry({ ...activeInquiry, status: newStatus });
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
        setInquiries((prev) => prev.map((inq) => (inq.id === activeInquiry.id ? updatedInquiry : inq)));
        setNoteContent("");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total inquiries", value: inquiries.length, sub: "All time" },
          { label: "Volume in pipeline", value: `${totalUnits.toLocaleString()} pcs`, sub: "Combined demand" },
          { label: "Awaiting review", value: inquiries.filter((i) => i.status === "NEW").length, sub: "New status" },
          { label: "Resolved", value: inquiries.filter((i) => ["RESPONDED", "CLOSED"].includes(i.status)).length, sub: "Responded or closed" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-lg border border-[#D1D5DB] p-4">
            <p className="text-sm text-[#6B7280]">{k.label}</p>
            <p className="text-2xl font-semibold text-[#1A1A1A] mt-1">{k.value}</p>
            <p className="text-xs text-[#6B7280] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer, company, RFQ #…"
              className="pl-8 pr-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none w-60"
            />
          </div>

          {/* Status tab filter */}
          <div className="flex border border-[#D1D5DB] rounded overflow-hidden">
            {["ALL", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium transition ${
                  statusFilter === s
                    ? "bg-[#3B5BDB] text-white"
                    : "bg-white text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6]"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/api/export-csv"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#D1D5DB] rounded hover:bg-[#F3F4F6] transition shrink-0"
        >
          <Download className="w-4 h-4 text-[#6B7280]" />
          Export CSV
        </a>
      </div>

      {/* Showing count */}
      <p className="text-sm text-[#6B7280]">
        Showing <span className="font-medium text-[#1A1A1A]">{filtered.length}</span> of {inquiries.length} inquiries
      </p>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Buyer</th>
                <th>Company</th>
                <th>Country</th>
                <th>Items</th>
                <th className="text-right">Volume</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-sm text-[#6B7280]">
                    No inquiries match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((inq) => {
                  const totalVol = inq.items.reduce((a, i) => a + i.requestedQuantity, 0);
                  return (
                    <tr key={inq.id}>
                      <td>
                        <span className="text-xs font-mono text-[#3B5BDB] font-medium">
                          {inq.inquiryNumber || `INQ-${inq.id.slice(-6).toUpperCase()}`}
                        </span>
                      </td>
                      <td>
                        <div className="font-medium text-[#1A1A1A] text-sm">{inq.buyerName}</div>
                        <div className="text-xs text-[#6B7280]">{inq.buyerEmail}</div>
                      </td>
                      <td className="text-sm text-[#1A1A1A]">{inq.buyerCompany}</td>
                      <td className="text-sm text-[#6B7280]">{inq.buyerCountry}</td>
                      <td className="text-sm text-[#6B7280]">{inq.items.length} item{inq.items.length !== 1 && "s"}</td>
                      <td className="text-right text-sm font-medium text-[#1A1A1A] tabular-nums">
                        {totalVol.toLocaleString()} pcs
                      </td>
                      <td>{statusBadge(inq.status)}</td>
                      <td className="text-sm text-[#6B7280] tabular-nums">
                        {new Date(inq.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setActiveInquiry(inq)}
                          className="text-sm font-medium text-[#3B5BDB] hover:underline"
                        >
                          Review
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

      {/* Inquiry detail drawer/modal */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:rounded-lg sm:border border-[#D1D5DB] sm:shadow-xl max-w-3xl sm:max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D5DB] sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">{activeInquiry.inquiryNumber || `INQ-${activeInquiry.id.slice(-6).toUpperCase()}`}</h2>
                  {statusBadge(activeInquiry.status)}
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{activeInquiry.buyerCompany} · {activeInquiry.buyerCountry}</p>
              </div>
              <button
                onClick={() => setActiveInquiry(null)}
                className="p-1.5 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Buyer info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Mail, label: "Email", val: activeInquiry.buyerEmail },
                  { icon: Building2, label: "Company", val: activeInquiry.buyerCompany },
                  { icon: Globe, label: "Country", val: activeInquiry.buyerCountry },
                  {
                    icon: Calendar,
                    label: "Target delivery",
                    val: activeInquiry.targetDeliveryDate
                      ? new Date(activeInquiry.targetDeliveryDate).toLocaleDateString()
                      : "Not specified",
                  },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-[#F8F8F6] rounded p-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{val}</p>
                  </div>
                ))}
              </div>

              {/* Message */}
              {activeInquiry.generalMessage && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Message</h3>
                  <p className="text-sm text-[#6B7280] bg-[#F8F8F6] rounded p-3 leading-relaxed">
                    {activeInquiry.generalMessage}
                  </p>
                </div>
              )}

              {/* Requested items */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Requested items</h3>
                <div className="rounded border border-[#D1D5DB] overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Mill</th>
                        <th className="text-right">Quantity</th>
                        <th>Specifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInquiry.items.map((item) => (
                        <tr key={item.id}>
                          <td className="font-medium text-sm text-[#1A1A1A]">
                            {item.product?.title || "General inquiry"}
                          </td>
                          <td className="text-sm text-[#6B7280]">{item.enterprise.name}</td>
                          <td className="text-right text-sm font-medium tabular-nums">
                            {item.requestedQuantity.toLocaleString()} pcs
                          </td>
                          <td className="text-sm text-[#6B7280] max-w-[200px] truncate">
                            {item.customSpecifications || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status update */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Update status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(activeInquiry.id, s)}
                      disabled={isPending || activeInquiry.status === s}
                      className={`px-3 py-1.5 text-sm font-medium rounded border transition ${
                        activeInquiry.status === s
                          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                          : "bg-white text-[#6B7280] border-[#D1D5DB] hover:text-[#1A1A1A] hover:border-[#1A1A1A]"
                      } disabled:opacity-50`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#6B7280]" />
                  Internal notes
                  {activeInquiry.communications?.length > 0 && (
                    <span className="badge badge-neutral">{activeInquiry.communications.length}</span>
                  )}
                </h3>

                <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                  <input
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add a note…"
                    className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !noteContent.trim()}
                    className="px-3 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>

                {activeInquiry.communications?.length > 0 ? (
                  <div className="space-y-2">
                    {activeInquiry.communications.map((note) => (
                      <div key={note.id} className="bg-[#F8F8F6] rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#1A1A1A]">{note.author}</span>
                          <span className="text-xs text-[#6B7280]">
                            {new Date(note.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">No notes yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-[#D1D5DB] bg-[#F8F8F6]">
              <button
                onClick={() => setActiveInquiry(null)}
                className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
