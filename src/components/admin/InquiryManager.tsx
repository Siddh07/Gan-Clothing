"use client";

import React, { useState, useTransition } from "react";
import { updateInquiryStatus, addAdminInquiryNote } from "@/actions/admin";
import {
  Download,
  Search,
  X,
  Building2,
  Mail,
  Globe,
  Calendar,
  MessageSquare,
  Plus,
  FileCheck2,
  FileText,
  Printer,
  Ship,
  CheckCircle2,
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

  const totalUnits = inquiries.reduce(
    (acc, inq) =>
      acc + inq.items.reduce((sum, item) => sum + item.requestedQuantity, 0),
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
        return "tag-pending";
      case "RESPONDED":
      case "CLOSED":
        return "tag-approved";
      default:
        return "tag-neutral";
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric & Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 border border-[#E1E4E7] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7]">
        <div className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Total RFQ Pipeline
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-[#0D0D0D]">
            {inquiries.length} Requisitions
          </div>
        </div>
        <div className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Total Volume In Demand
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-[#0D0D0D]">
            {totalUnits.toLocaleString()} pcs
          </div>
        </div>
        <div className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Pending Secretariat Triage
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-[#1E3A52]">
            {inquiries.filter((i) => i.status === "NEW").length} Leads
          </div>
        </div>
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
              Export Manifest
            </div>
            <div className="mt-1 font-mono text-xs text-[#0D0D0D]">
              Bilateral Customs Format
            </div>
          </div>
          <a
            href="/api/export-csv"
            className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-[#0D0D0D] bg-[#F6F7F8] border border-[#E1E4E7] hover:border-[#0D0D0D] transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
            CSV
          </a>
        </div>
      </div>

      {/* Control Strip: Search & Status Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white border border-[#E1E4E7]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO#, buyer, company, country, or factory..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono placeholder:font-sans placeholder:text-[#6B7280] focus:border-[#0D0D0D] focus:outline-none"
          />
        </div>

        {/* Status Tab Bar */}
        <div className="flex items-center border border-[#E1E4E7] overflow-x-auto">
          {(["ALL", "NEW", "VIEWED", "FORWARDED", "RESPONDED", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap transition-colors border-r border-[#E1E4E7] last:border-r-0 ${
                statusFilter === s
                  ? "bg-[#0D0D0D] text-white font-bold"
                  : "bg-white text-[#6B7280] hover:text-[#0D0D0D]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* SCREEN 5: REQUISITIONS / ORDERS LEDGER TABLE */}
      <div className="border border-[#E1E4E7] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-ledger">
            <thead>
              <tr>
                <th>PO / RFQ #</th>
                <th>Date Logged</th>
                <th>Buyer & Enterprise</th>
                <th>Assigned Mill(s)</th>
                <th className="text-right">Order Units</th>
                <th>Target Ex-Factory</th>
                <th>Terms</th>
                <th>Routing Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#6B7280]">
                    No purchase orders or sourcing inquiries match current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const totalVolume = item.items.reduce(
                    (acc, i) => acc + i.requestedQuantity,
                    0
                  );
                  const mills = Array.from(
                    new Set(item.items.map((i) => i.enterprise.name))
                  );
                  const createdDate = new Date(item.createdAt).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={item.id} className="group">
                      <td>
                        <button
                          onClick={() => setActiveInquiry(item)}
                          className="font-mono text-[11px] font-bold text-[#1E3A52] hover:underline"
                        >
                          {item.inquiryNumber || "GAN-RFQ"}
                        </button>
                      </td>

                      <td className="font-mono text-[11px] text-[#6B7280]">
                        {createdDate}
                      </td>

                      <td>
                        <div className="font-semibold text-[#0D0D0D]">
                          {item.buyerCompany}
                        </div>
                        <div className="font-mono text-[10px] text-[#6B7280]">
                          {item.buyerName} ({item.buyerCountry})
                        </div>
                      </td>

                      <td>
                        <div className="text-[#0D0D0D] line-clamp-1 max-w-[160px]">
                          {mills.join(", ") || "General GAN Trade Desk"}
                        </div>
                        <div className="font-mono text-[10px] text-[#6B7280]">
                          {item.items.length} line item(s)
                        </div>
                      </td>

                      <td className="text-right font-mono font-semibold text-[#0D0D0D]">
                        {totalVolume.toLocaleString()} pcs
                      </td>

                      <td className="font-mono text-[11px] text-[#6B7280]">
                        {item.targetDeliveryDate
                          ? new Date(item.targetDeliveryDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })
                          : "Negotiable"}
                      </td>

                      <td className="font-mono text-[10px] text-[#6B7280]">
                        FOB / LC
                      </td>

                      <td>
                        <span className={getStatusBadge(item.status)}>
                          {item.status}
                        </span>
                      </td>

                      <td className="text-right">
                        <button
                          onClick={() => setActiveInquiry(item)}
                          className="font-mono text-[11px] px-2 py-0.5 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#0D0D0D]"
                        >
                          Inspect PO
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

      {/* SCREEN 6: FORMAL PURCHASE ORDER / REQUISITION INSPECTOR DOSSIER */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#0D0D0D] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header: Commercial Invoice / PO Masthead */}
            <div className="p-4 border-b border-[#E1E4E7] bg-[#F6F7F8] flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
                  Commercial Requisition & Export Purchase Order
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <h2 className="text-lg font-bold tracking-tight text-[#0D0D0D]">
                    {activeInquiry.inquiryNumber || "GAN-RFQ"}
                  </h2>
                  <span className={getStatusBadge(activeInquiry.status)}>
                    {activeInquiry.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#6B7280] hover:text-[#0D0D0D]"
                  title="Print Formal Requisition"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveInquiry(null)}
                  className="p-1.5 border border-[#E1E4E7] hover:border-[#0D0D0D] text-[#6B7280] hover:text-[#0D0D0D]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Order Commercial Metadata Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E1E4E7] bg-[#F6F7F8] divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7] text-xs">
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Date Requisitioned
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    {new Date(activeInquiry.createdAt).toLocaleDateString([], {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Target Ex-Factory Date
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    {activeInquiry.targetDeliveryDate
                      ? new Date(activeInquiry.targetDeliveryDate).toLocaleDateString([], {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Negotiable / Open"}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Incoterms / Port
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    FOB Kathmandu (TIA / Birgunj)
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280]">
                    Settlement Terms
                  </div>
                  <div className="font-mono font-bold text-[#0D0D0D] mt-0.5">
                    LC at sight / 30% TT Deposit
                  </div>
                </div>
              </div>

              {/* Section 2: Buyer vs Attributed Mill Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer Dossier */}
                <div className="p-4 border border-[#E1E4E7] space-y-2 text-xs">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280] pb-1 border-b border-[#E1E4E7]">
                    Buyer / Procuring Brand
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0D0D0D]">
                      {activeInquiry.buyerCompany}
                    </div>
                    <div className="text-[#6B7280] mt-0.5">
                      Representative: <strong className="text-[#0D0D0D]">{activeInquiry.buyerName}</strong>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5">
                    <div>Origin: {activeInquiry.buyerCountry}</div>
                    <a
                      href={`mailto:${activeInquiry.buyerEmail}`}
                      className="text-[#1E3A52] hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {activeInquiry.buyerEmail}
                    </a>
                  </div>
                </div>

                {/* Assigned Factory / Mill */}
                <div className="p-4 border border-[#E1E4E7] space-y-2 text-xs">
                  <div className="font-mono text-[10px] uppercase text-[#6B7280] pb-1 border-b border-[#E1E4E7]">
                    Assigned Contract Manufacturer
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0D0D0D]">
                      {Array.from(new Set(activeInquiry.items.map((i) => i.enterprise.name))).join(", ") || "Central GAN Export Allocation Desk"}
                    </div>
                    <div className="text-[#6B7280] mt-0.5">
                      Registry: Certified Export Mill Member (Nepal)
                    </div>
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5">
                    <div>Jurisdiction: Kathmandu Valley Industrial Zone</div>
                    <div>Compliance: WRAP / ISO 9001 Audited</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Buyer Message / Requisition Specifications */}
              <div className="p-4 border border-[#E1E4E7] bg-[#F6F7F8]">
                <div className="font-mono text-[10px] uppercase text-[#6B7280] mb-1">
                  Buyer Requisition Notes & Compliance Directives
                </div>
                <p className="text-xs text-[#0D0D0D] italic leading-relaxed">
                  "{activeInquiry.generalMessage}"
                </p>
              </div>

              {/* Section 4: Line Items Table */}
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0D0D0D] mb-2">
                  Requisition Line Items ({activeInquiry.items.length})
                </div>
                <div className="border border-[#E1E4E7] overflow-x-auto">
                  <table className="w-full text-left text-xs table-ledger">
                    <thead>
                      <tr>
                        <th>Style / Product Title</th>
                        <th>Target Mill</th>
                        <th>Custom Specifications</th>
                        <th>Size Ratio</th>
                        <th className="text-right">Quantity (Pcs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInquiry.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="font-medium text-[#0D0D0D]">
                              {item.product?.title || "Custom Apparel Style"}
                            </span>
                          </td>
                          <td className="font-mono text-[11px]">
                            {item.enterprise.name}
                          </td>
                          <td className="text-[#6B7280]">
                            {item.customSpecifications || "Standard export tech pack specs"}
                          </td>
                          <td className="font-mono text-[11px] text-[#6B7280]">
                            S:20% M:40% L:30% XL:10%
                          </td>
                          <td className="text-right font-mono font-bold text-[#0D0D0D]">
                            {item.requestedQuantity.toLocaleString()} pcs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Production & Milestone Tracking */}
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0D0D0D] mb-2">
                  Export Production Milestones
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 border border-[#E1E4E7] divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7] text-xs">
                  <div className="p-3 bg-[#F6F7F8]">
                    <div className="font-mono text-[10px] text-[#6B7280]">Stage 01</div>
                    <div className="font-bold text-[#0D0D0D] mt-0.5">PO Registered</div>
                    <div className="font-mono text-[10px] text-emerald-700 mt-1">Confirmed</div>
                  </div>
                  <div className="p-3 bg-[#F6F7F8]">
                    <div className="font-mono text-[10px] text-[#6B7280]">Stage 02</div>
                    <div className="font-bold text-[#0D0D0D] mt-0.5">Lab Dip / Strike-off</div>
                    <div className="font-mono text-[10px] text-emerald-700 mt-1">Approved</div>
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-[#6B7280]">Stage 03</div>
                    <div className="font-bold text-[#0D0D0D] mt-0.5">Knitting / Weaving</div>
                    <div className="font-mono text-[10px] text-[#6B7280] mt-1">In progress</div>
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-[#6B7280]">Stage 04</div>
                    <div className="font-bold text-[#0D0D0D] mt-0.5">Cutting & Sewing</div>
                    <div className="font-mono text-[10px] text-[#6B7280] mt-1">Scheduled</div>
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-[#6B7280]">Stage 05</div>
                    <div className="font-bold text-[#0D0D0D] mt-0.5">Final QC & Freight</div>
                    <div className="font-mono text-[10px] text-[#6B7280] mt-1">Pending</div>
                  </div>
                </div>
              </div>

              {/* Section 6: Routing Status Selector */}
              <div className="p-3.5 border border-[#E1E4E7] bg-[#F6F7F8] flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold text-[#0D0D0D]">
                  Set Trade Routing Stage:
                </span>
                <div className="flex items-center border border-[#E1E4E7]">
                  {(["NEW", "VIEWED", "FORWARDED", "RESPONDED", "CLOSED"] as const).map((statusOption) => (
                    <button
                      key={statusOption}
                      disabled={isPending || activeInquiry.status === statusOption}
                      onClick={() => handleStatusChange(activeInquiry.id, statusOption)}
                      className={`px-3 py-1 text-xs font-mono transition-colors border-r border-[#E1E4E7] last:border-r-0 ${
                        activeInquiry.status === statusOption
                          ? "bg-[#0D0D0D] text-white font-bold"
                          : "bg-white text-[#6B7280] hover:text-[#0D0D0D]"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 7: Internal Secretariat Dispatch Notes */}
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                  Secretariat Progress & Audit Notes
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Log factory feedback, customs verification, or buyer follow-up note..."
                    className="flex-1 px-3 py-1.5 bg-white border border-[#E1E4E7] text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !noteContent.trim()}
                    className="px-4 py-1.5 bg-[#0D0D0D] text-white text-xs font-mono font-medium hover:bg-[#1E3A52] transition-colors disabled:opacity-50"
                  >
                    Add Entry
                  </button>
                </form>

                <div className="divide-y divide-[#E1E4E7] border border-[#E1E4E7] max-h-44 overflow-y-auto">
                  {!activeInquiry.communications || activeInquiry.communications.length === 0 ? (
                    <p className="p-3 text-xs text-[#6B7280] italic font-mono">
                      No internal secretariat entries logged for this purchase requisition.
                    </p>
                  ) : (
                    activeInquiry.communications.map((note) => (
                      <div key={note.id} className="p-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="font-bold text-[#0D0D0D]">{note.author}</span>
                          <span className="text-[#6B7280]">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#0D0D0D] font-mono text-[11px]">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#F6F7F8] border-t border-[#E1E4E7] flex justify-end">
              <button
                onClick={() => setActiveInquiry(null)}
                className="px-4 py-1.5 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52]"
              >
                Close Requisition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

