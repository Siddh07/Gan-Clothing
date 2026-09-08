"use client";

import React, { useState, useTransition } from "react";
import { updateFactoryInquiryStatus, addInquiryNote } from "@/actions/portal";
import {
  Inbox,
  Eye,
  Send,
  MessageSquare,
  Clock,
  Building2,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";

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
    communications: {
      id: string;
      author: string;
      content: string;
      createdAt: Date;
    }[];
  };
}

export function PortalInquiryInbox({
  initialItems,
}: {
  initialItems: InquiryItem[];
}) {
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (inquiryId: string, status: "VIEWED" | "RESPONDED" | "CLOSED") => {
    startTransition(async () => {
      await updateFactoryInquiryStatus(inquiryId, status);
      if (selectedInquiry && selectedInquiry.inquiry.id === inquiryId) {
        setSelectedInquiry({
          ...selectedInquiry,
          inquiry: {
            ...selectedInquiry.inquiry,
            status,
          },
        });
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
            communications: [
              ...selectedInquiry.inquiry.communications,
              res.note as any,
            ],
          },
        });
        setNewNoteContent("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>
          Showing {initialItems.length} trade lead{initialItems.length === 1 ? "" : "s"} allocated to your mill
        </span>
      </div>

      {initialItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-outfit text-base font-bold text-slate-900">
            No Incoming Inquiries
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Trade leads dispatched by global buyers through the GAN Directory or central secretariat will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ref & Buyer Company</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Target Apparel Item</th>
                  <th className="px-6 py-4">Target Volume</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Logged Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {initialItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.inquiry.buyerCompany}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.inquiry.inquiryNumber} • {item.inquiry.buyerName}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {item.inquiry.buyerCountry}
                    </td>

                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      {item.product?.title || "General Sourcing Request"}
                    </td>

                    <td className="px-6 py-4 font-black text-slate-900">
                      {item.requestedQuantity.toLocaleString()} pcs
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.inquiry.status === "NEW"
                            ? "bg-amber-100 text-amber-800"
                            : item.inquiry.status === "RESPONDED"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.inquiry.status === "VIEWED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.inquiry.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(item.inquiry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInquiry(item)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold inline-flex items-center text-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Inspect Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Inspection Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-outfit font-bold text-base">
                  Trade Lead #{selectedInquiry.inquiry.inquiryNumber}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {selectedInquiry.inquiry.buyerCompany} ({selectedInquiry.inquiry.buyerCountry})
                </span>
              </div>
              <button onClick={() => setSelectedInquiry(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Buyer specs */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Contact:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInquiry.inquiry.buyerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buyer Email:</span>
                  <a
                    href={`mailto:${selectedInquiry.inquiry.buyerEmail}`}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    {selectedInquiry.inquiry.buyerEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Item:</span>
                  <span className="font-bold text-emerald-800">
                    {selectedInquiry.product?.title || "General Sourcing Requirement"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Quantity:</span>
                  <span className="font-black text-slate-900">
                    {selectedInquiry.requestedQuantity.toLocaleString()} pcs
                  </span>
                </div>
              </div>

              {/* Line item specifications */}
              {selectedInquiry.customSpecifications && (
                <div>
                  <strong className="block text-slate-900 mb-1">
                    Line Item Custom Specifications:
                  </strong>
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                    {selectedInquiry.customSpecifications}
                  </div>
                </div>
              )}

              {/* General Message */}
              <div>
                <strong className="block text-slate-900 mb-1">
                  Buyer General Sourcing Notes:
                </strong>
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono text-[11px]">
                  {selectedInquiry.inquiry.generalMessage}
                </div>
              </div>

              {/* Internal Communications Log */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <strong className="block text-slate-900 text-xs flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1.5 text-slate-500" />
                  Internal Progress Notes & Communications Log:
                </strong>

                {selectedInquiry.inquiry.communications.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No follow-up notes logged yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedInquiry.inquiry.communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                          <span className="text-emerald-800">{comm.author}</span>
                          <span>
                            {new Date(comm.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700">{comm.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Log a progress note (e.g., Sent cost matrix, swatches dispatched)..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !newNoteContent.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>
              </div>

              {/* Status Update Strip */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-semibold">Triage Lead Status:</span>
                  <select
                    value={selectedInquiry.inquiry.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedInquiry.inquiry.id,
                        e.target.value as any
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs bg-white focus:outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="VIEWED">VIEWED</option>
                    <option value="RESPONDED">RESPONDED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
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
