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
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-[#E1E4E7] p-3">
        <p className="text-xs font-mono text-[#6B7280]">
          ALLOCATED REQUISITIONS: {initialItems.length} INCOMING ORDER{initialItems.length === 1 ? "" : "S"}
        </p>
      </div>

      {initialItems.length === 0 ? (
        <div className="bg-white border border-[#E1E4E7] p-12 text-center space-y-3">
          <div className="w-10 h-10 border border-[#E1E4E7] text-[#6B7280] flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0D0D0D]">
            No Procurement Requisitions Allocated
          </h3>
          <p className="text-xs font-mono text-[#6B7280] max-w-sm mx-auto">
            Trade leads dispatched by global buyers through the GAN Directory or central secretariat will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E1E4E7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead className="bg-[#F6F7F8] border-b border-[#E1E4E7] text-[10px] font-mono uppercase text-[#6B7280]">
                <tr>
                  <th className="px-4 py-3">PO Ref & Client Entity</th>
                  <th className="px-4 py-3">Origin / Destination</th>
                  <th className="px-4 py-3">Target Apparel Specimen</th>
                  <th className="px-4 py-3">Target Volume</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Logged Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4E7] font-mono text-xs">
                {initialItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F6F7F8] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#0D0D0D] font-sans text-xs">
                        {item.inquiry.buyerCompany}
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-mono">
                        {item.inquiry.inquiryNumber} • {item.inquiry.buyerName}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-[#0D0D0D]">
                      {item.inquiry.buyerCountry}
                    </td>

                    <td className="px-4 py-3 text-[#1E3A52] font-sans font-medium">
                      {item.product?.title || "General Sourcing Request"}
                    </td>

                    <td className="px-4 py-3 font-bold text-[#0D0D0D]">
                      {item.requestedQuantity.toLocaleString()} pcs
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={
                          item.inquiry.status === "NEW"
                            ? "tag-pending"
                            : item.inquiry.status === "RESPONDED"
                            ? "tag-approved"
                            : "tag-neutral"
                        }
                      >
                        {item.inquiry.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#6B7280]">
                      {new Date(item.inquiry.createdAt).toISOString().split("T")[0]}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInquiry(item)}
                        className="px-2.5 py-1 text-xs font-mono text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] rounded-none inline-flex items-center cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                        INSPECT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Inspection Modal / Commercial Dossier */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D]/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-[#E1E4E7] shadow-xl overflow-hidden">
            <div className="bg-[#0D0D0D] text-white px-5 py-3.5 flex justify-between items-center">
              <div>
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                  Commercial Purchase Requisition #{selectedInquiry.inquiry.inquiryNumber}
                </h3>
                <span className="text-[10px] font-mono text-[#E1E4E7]/70">
                  BUYER: {selectedInquiry.inquiry.buyerCompany} ({selectedInquiry.inquiry.buyerCountry})
                </span>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="text-[#E1E4E7] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs font-mono max-h-[80vh] overflow-y-auto">
              {/* Buyer specs */}
              <div className="border border-[#E1E4E7] divide-y divide-[#E1E4E7] bg-[#F6F7F8]">
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#6B7280] uppercase text-[10px]">Buyer Officer:</span>
                  <span className="font-bold text-[#0D0D0D]">
                    {selectedInquiry.inquiry.buyerName}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#6B7280] uppercase text-[10px]">Contact Email:</span>
                  <a
                    href={`mailto:${selectedInquiry.inquiry.buyerEmail}`}
                    className="font-bold text-[#1E3A52] hover:underline"
                  >
                    {selectedInquiry.inquiry.buyerEmail}
                  </a>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#6B7280] uppercase text-[10px]">Target Garment:</span>
                  <span className="font-bold text-[#0D0D0D] font-sans">
                    {selectedInquiry.product?.title || "General Sourcing Requirement"}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#6B7280] uppercase text-[10px]">Target Volume:</span>
                  <span className="font-bold text-[#0D0D0D]">
                    {selectedInquiry.requestedQuantity.toLocaleString()} pcs
                  </span>
                </div>
              </div>

              {/* Line item specifications */}
              {selectedInquiry.customSpecifications && (
                <div>
                  <span className="text-[10px] uppercase text-[#6B7280] block mb-1">
                    Custom Technical Specifications & Grading:
                  </span>
                  <div className="p-3 bg-[#F6F7F8] border border-[#1E3A52] text-[#0D0D0D] text-xs font-sans">
                    {selectedInquiry.customSpecifications}
                  </div>
                </div>
              )}

              {/* General Message */}
              <div>
                <span className="text-[10px] uppercase text-[#6B7280] block mb-1">
                  Procurement Brief / Notes:
                </span>
                <div className="p-3 bg-[#F6F7F8] border border-[#E1E4E7] text-[#0D0D0D] whitespace-pre-wrap text-[11px]">
                  {selectedInquiry.inquiry.generalMessage}
                </div>
              </div>

              {/* Internal Communications Log */}
              <div className="pt-3 border-t border-[#E1E4E7] space-y-3">
                <span className="text-[10px] uppercase text-[#6B7280] block font-bold">
                  Merchandising Follow-up & Audit Trail
                </span>

                {selectedInquiry.inquiry.communications.length === 0 ? (
                  <p className="text-[11px] text-[#6B7280] italic">
                    No follow-up notes logged yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedInquiry.inquiry.communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-2.5 bg-white border border-[#E1E4E7] text-xs"
                      >
                        <div className="flex justify-between text-[10px] text-[#6B7280] mb-1">
                          <span className="font-bold text-[#1E3A52]">{comm.author}</span>
                          <span>
                            {new Date(comm.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#0D0D0D] font-sans">{comm.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Log progress note (e.g. Swatches dispatched via DHL, Costing sheet sent)..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs rounded-none focus:outline-none bg-white font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !newNoteContent.trim()}
                    className="px-4 py-2 bg-[#1E3A52] hover:bg-[#0D0D0D] text-white rounded-none text-xs font-mono disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    APPEND NOTE
                  </button>
                </form>
              </div>

              {/* Status Update Strip */}
              <div className="pt-4 border-t border-[#E1E4E7] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[#6B7280] text-[10px] uppercase">Requisition Status:</span>
                  <select
                    value={selectedInquiry.inquiry.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedInquiry.inquiry.id,
                        e.target.value as any
                      )
                    }
                    className="px-2.5 py-1.5 border border-[#E1E4E7] font-bold text-xs bg-white rounded-none focus:outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="VIEWED">VIEWED</option>
                    <option value="RESPONDED">RESPONDED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-1.5 bg-[#F6F7F8] text-[#0D0D0D] font-mono text-xs border border-[#E1E4E7] hover:bg-white rounded-none cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
