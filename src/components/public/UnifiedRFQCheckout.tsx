"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuoteCart } from "@/context/QuoteCartContext";
import { submitMultiItemRFQ } from "@/actions/rfq";
import {
  Send,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Package,
  Calendar,
  Anchor,
  ShieldCheck,
} from "lucide-react";

interface EnterpriseOption {
  id: string;
  name: string;
  city: string;
}

export function UnifiedRFQCheckout({
  enterprises,
}: {
  enterprises: EnterpriseOption[];
}) {
  const { items, removeItem, updateQuantity, updateSpecifications, clearCart, addItem } =
    useQuoteCart();

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("");
  const [targetFobPort, setTargetFobPort] = useState("Kolkata / Haldia (Sea) or Tribhuvan Airport (Air)");
  const [targetDeliveryDate, setTargetDeliveryDate] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    inquiryNumber?: string;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If cart is empty, allow adding an enterprise on the fly
  const [selectedQuickEnterprise, setSelectedQuickEnterprise] = useState(
    enterprises[0]?.id || ""
  );

  const handleAddGeneralRequirement = () => {
    const ent = enterprises.find((e) => e.id === selectedQuickEnterprise);
    if (ent) {
      addItem({
        enterpriseId: ent.id,
        enterpriseName: ent.name,
        requestedQuantity: 1000,
        customSpecifications: "Custom apparel manufacturing requirement.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Please add at least one garment or factory requirement to your RFQ.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitMultiItemRFQ({
        buyerName,
        buyerEmail,
        buyerCompany,
        buyerCountry,
        targetFobPort,
        targetDeliveryDate,
        generalMessage,
        honeypot,
        items,
      });

      if (response.success) {
        setSubmitResult({
          success: true,
          inquiryNumber: response.inquiryNumber,
          message: response.message,
        });
        clearCart();
      } else {
        setErrorMessage(response.error || "Failed to submit RFQ");
      }
    } catch (err) {
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult?.success) {
    return (
      <div className="bg-white border border-[#E1E4E7] p-8 sm:p-12 text-center space-y-6">
        <div className="w-12 h-12 border border-[#E1E4E7] text-[#1E3A52] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <span className="tag-approved text-[10px]">
            PURCHASE REQUISITION LOGGED
          </span>
          <h2 className="text-2xl font-bold font-mono text-[#0D0D0D] mt-2">
            PO REF: {submitResult.inquiryNumber}
          </h2>
          <p className="text-xs text-[#6B7280] max-w-xl mx-auto leading-relaxed">
            Your commercial request for quotation has been officially registered with the Garment Association of Nepal Secretariat. Detailed line items have been dispatched to designated factory merchandising desks.
          </p>
        </div>

        <div className="p-3.5 bg-[#F6F7F8] border border-[#1E3A52] max-w-md mx-auto text-xs font-mono text-[#0D0D0D]">
          DISPATCH TRANSMITTED TO: <strong>{buyerEmail}</strong>. Factory merchandising teams typically respond with preliminary cost matrices within 24 to 48 hours.
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/directory"
            className="px-5 py-2.5 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] rounded-none transition-colors"
          >
            DISCOVER ACCREDITED MILLS
          </Link>
          <button
            onClick={() => setSubmitResult(null)}
            className="px-5 py-2.5 text-xs font-mono text-[#0D0D0D] bg-[#F6F7F8] border border-[#E1E4E7] hover:bg-white rounded-none transition-colors cursor-pointer"
          >
            NEW REQUISITION DOCKET
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-3 bg-[#F6F7F8] border border-red-600 flex items-center text-xs text-red-600 font-mono">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Honeypot field */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Buyer Credentials & Commercial Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E1E4E7]">
            <div className="px-5 py-3 border-b border-[#E1E4E7] bg-[#F6F7F8] flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#0D0D0D] flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-[#1E3A52]" />
                Buyer Identity & Procurement Entity
              </h3>
              <span className="text-[10px] font-mono text-[#6B7280]">
                SECTION 01
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Procurement Officer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="s.jenkins@apparelgroup.com"
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Buyer Corporation / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    placeholder="Nordic Outfitters AS"
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                    Destination Market / Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerCountry}
                    onChange={(e) => setBuyerCountry(e.target.value)}
                    placeholder="United States, Germany, Japan"
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1 flex items-center">
                    <Anchor className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                    Target Port / Incoterms
                  </label>
                  <input
                    type="text"
                    value={targetFobPort}
                    onChange={(e) => setTargetFobPort(e.target.value)}
                    placeholder="FOB Kathmandu / CIF Hamburg"
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={targetDeliveryDate}
                    onChange={(e) => setTargetDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                  General Commercial Notes & Compliance Instructions
                </label>
                <textarea
                  rows={3}
                  value={generalMessage}
                  onChange={(e) => setGeneralMessage(e.target.value)}
                  placeholder="Include labeling requirements, test protocols (OEKO-TEX, WRAP), sampling deadlines, and packing instructions."
                  className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs rounded-none focus:outline-none bg-white"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Multi-Item Basket Review & Dispatch Button */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E1E4E7]">
            <div className="px-4 py-3 border-b border-[#E1E4E7] bg-[#F6F7F8] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-3.5 h-3.5 text-[#1E3A52]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#0D0D0D]">
                  Requisition Docket ({items.length})
                </h3>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[10px] font-mono text-[#6B7280] hover:text-red-600 uppercase cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {items.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs font-mono text-[#6B7280]">Basket empty.</p>
                  <div className="pt-1">
                    <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1 text-left">
                      Select Manufacturer:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedQuickEnterprise}
                        onChange={(e) => setSelectedQuickEnterprise(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-[#E1E4E7] text-xs font-mono bg-white rounded-none focus:outline-none"
                      >
                        {enterprises.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            {ent.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddGeneralRequirement}
                        className="px-3 py-1.5 bg-[#1E3A52] text-white rounded-none text-xs font-mono shrink-0 hover:bg-[#0D0D0D] cursor-pointer"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto divide-y divide-[#E1E4E7] pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-[#0D0D0D] font-sans line-clamp-1">
                            {item.productTitle || "General Mill Quotation"}
                          </div>
                          <div className="text-[10px] font-mono text-[#1E3A52]">
                            {item.enterpriseName}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-[#6B7280] hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#6B7280] block">Volume (Pcs):</span>
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-[#E1E4E7] text-xs font-bold text-[#0D0D0D] rounded-none bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6B7280] block">Tech Pack Specs:</span>
                          <input
                            type="text"
                            placeholder="Pantone / specs"
                            value={item.customSpecifications || ""}
                            onChange={(e) => updateSpecifications(idx, e.target.value)}
                            className="w-full px-2 py-1 border border-[#E1E4E7] text-xs rounded-none bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#E1E4E7]">
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-3 px-4 text-xs font-mono font-medium text-white bg-[#1E3A52] hover:bg-[#0D0D0D] disabled:opacity-50 transition-colors rounded-none flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>DISPATCHING REQUISITION...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>SUBMIT B2B RFQ ({items.length} ITEMS)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
