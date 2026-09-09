"use client";

import React, { useState, useTransition } from "react";
import { updateFactoryInquiryStatus, addInquiryNote } from "@/actions/portal";
import { Inbox, MessageSquare, X, Eye, Send, CheckCircle2 } from "lucide-react";

interface InquiryItem {
  id: string;
  requestedQuantity: number;
  customSpecifications?: string | null;
  product?: { title: string } | null;
  inquiry: {
    id: string;
    inquiryNumber: string;
    buyerName: string;
    buyerEmail: string;
    buyerCompany: string;
    buyerCountry: string;
    generalMessage: string;
    status: string;
    targetDeliveryDate?: Date | null;
    createdAt: Date;
    communications: { id: string; author: string; content: string; createdAt: Date }[];
  };
}

const STATUS_ACTIONS: { label: string; value: "VIEWED" | "RESPONDED" | "CLOSED"; icon: React.ElementType }[] = [
  { label: "Mark viewed", value: "VIEWED", icon: Eye },
  { label: "Mark responded", value: "RESPONDED", icon: Send },
  { label: "Close", value: "CLOSED", icon: CheckCircle2 },
];

function statusBadge(status: string) {
  if (status === "NEW") return <span className="badge badge-warning">New</span>;
  if (status === "VIEWED") return <span className="badge badge-neutral">Viewed</span>;
  if (status === "RESPONDED") return <span className="badge badge-success">Responded</span>;
  if (status === "CLOSED") return <span className="badge badge-neutral">Closed</span>;
  return <span className="badge badge-neutral">{status}</span>;
}

export function PortalInquiryInbox({ initialItems }: { initialItems: InquiryItem[] }) {
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (inquiryId: string, status: "VIEWED" | "RESPONDED" | "CLOSED") => {
    startTransition(async () => {
      await updateFactoryInquiryStatus(inquiryId, status);
      if (selectedInquiry?.inquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, inquiry: { ...selectedInquiry.inquiry, status } });
      }
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedInquiry) return;
    startTransition(async () => {
      const res = await addInquiryNote(selectedInquiry.inquiry.id, newNoteContent);
      if (res.success && res.note) {
        setSelectedInquiry({
          ...selectedInquiry,
          inquiry: {
            ...selectedInquiry.inquiry,
            communications: [...selectedInquiry.inquiry.communications, res.note as any],
          },
        });
        setNewNoteContent("");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <span className="badge badge-warning">{initialItems.filter((i) => i.inquiry.status === "NEW").length} new</span>
        <span className="text-sm text-[#6B7280]">{initialItems.length} total inquiries from buyers</span>
      </div>

      {/* List */}
      {initialItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#D1D5DB] py-16 text-center">
          <Inbox className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-[#1A1A1A] font-medium">No inquiries yet</p>
          <p className="text-sm text-[#6B7280] mt-1">Buyer inquiries addressed to your mill will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Product requested</th>
                  <th className="text-right">Quantity</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {initialItems.map((item) => (
                  <tr key={item.id} className={item.inquiry.status === "NEW" ? "bg-[#FFFBEB]" : ""}>
                    <td>
                      <div className="font-medium text-[#1A1A1A] text-sm">{item.inquiry.buyerName}</div>
                      <div className="text-xs text-[#6B7280]">{item.inquiry.buyerCompany} · {item.inquiry.buyerCountry}</div>
                    </td>
                    <td className="text-sm text-[#1A1A1A] max-w-[180px] truncate">
                      {item.product?.title || "General inquiry"}
                    </td>
                    <td className="text-right text-sm font-medium tabular-nums">
                      {item.requestedQuantity.toLocaleString()} pcs
                    </td>
                    <td>{statusBadge(item.inquiry.status)}</td>
                    <td className="text-sm text-[#6B7280] tabular-nums">
                      {new Date(item.inquiry.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedInquiry(item)}
                        className="text-sm font-medium text-[#3B5BDB] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry detail modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D1D5DB] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D5DB] sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    {selectedInquiry.inquiry.inquiryNumber || `INQ-${selectedInquiry.inquiry.id.slice(-6).toUpperCase()}`}
                  </h2>
                  {statusBadge(selectedInquiry.inquiry.status)}
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  {selectedInquiry.inquiry.buyerCompany} · {selectedInquiry.inquiry.buyerCountry}
                </p>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-1.5 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Buyer details */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Buyer", selectedInquiry.inquiry.buyerName],
                  ["Email", selectedInquiry.inquiry.buyerEmail],
                  ["Product", selectedInquiry.product?.title || "General"],
                  ["Quantity", `${selectedInquiry.requestedQuantity.toLocaleString()} pcs`],
                  ["Target delivery", selectedInquiry.inquiry.targetDeliveryDate
                    ? new Date(selectedInquiry.inquiry.targetDeliveryDate).toLocaleDateString()
                    : "Not specified"],
                  ["Received", new Date(selectedInquiry.inquiry.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-[#6B7280]">{k}</dt>
                    <dd className="text-sm font-medium text-[#1A1A1A] mt-0.5">{v}</dd>
                  </div>
                ))}
              </div>

              {/* Message */}
              {selectedInquiry.inquiry.generalMessage && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Buyer message</h3>
                  <p className="text-sm text-[#6B7280] bg-[#F8F8F6] rounded p-3 leading-relaxed">
                    {selectedInquiry.inquiry.generalMessage}
                  </p>
                </div>
              )}

              {/* Specs */}
              {selectedInquiry.customSpecifications && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Custom specifications</h3>
                  <p className="text-sm text-[#6B7280] bg-[#F8F8F6] rounded p-3 leading-relaxed">
                    {selectedInquiry.customSpecifications}
                  </p>
                </div>
              )}

              {/* Status actions */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Update status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ACTIONS.map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleStatusChange(selectedInquiry.inquiry.id, value)}
                      disabled={isPending || selectedInquiry.inquiry.status === value}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border transition ${
                        selectedInquiry.inquiry.status === value
                          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                          : "bg-white text-[#6B7280] border-[#D1D5DB] hover:text-[#1A1A1A] hover:border-[#1A1A1A]"
                      } disabled:opacity-50`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#6B7280]" />
                  Notes
                </h3>
                <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                  <input
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add a note…"
                    className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] focus:border-[#3B5BDB] focus:outline-none"
                  />
                  <button type="submit" disabled={isPending || !newNoteContent.trim()}
                    className="px-3 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-50">
                    Add
                  </button>
                </form>
                {selectedInquiry.inquiry.communications.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF]">No notes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedInquiry.inquiry.communications.map((note) => (
                      <div key={note.id} className="bg-[#F8F8F6] rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#1A1A1A]">{note.author}</span>
                          <span className="text-xs text-[#6B7280]">
                            {new Date(note.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-[#D1D5DB] bg-[#F8F8F6]">
              <button onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
