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
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-emerald-700 font-black">
            B2B Trade Inquiry Authenticated
          </span>
          <h2 className="font-outfit text-3xl font-black text-slate-900">
            RFQ Ref: {submitResult.inquiryNumber}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Your unified request for quotation has been officially logged with the Garment Association of Nepal. 
            Detailed specifications have been routed directly to the designated factory merchandising representatives.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 max-w-md mx-auto text-xs text-emerald-900">
          A confirmation dispatch has been sent to <strong>{buyerEmail}</strong>. 
          Factory representatives typically respond with FOB/CIF quotes within 24 to 48 hours.
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/directory"
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
          >
            Explore More Exporters
          </Link>
          <button
            onClick={() => setSubmitResult(null)}
            className="px-6 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Submit Another RFQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center text-xs text-red-700">
          <AlertCircle className="w-4 h-4 mr-2.5 shrink-0" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Buyer Credentials & Commercial Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-outfit text-xl font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
              Buyer Identity & Corporate Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="s.jenkins@apparelgroup.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  placeholder="Nordic Outfitters AS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Buyer Country *
                </label>
                <input
                  type="text"
                  required
                  value={buyerCountry}
                  onChange={(e) => setBuyerCountry(e.target.value)}
                  placeholder="United States, Germany, Japan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <Anchor className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Target Port / Incoterms
                </label>
                <input
                  type="text"
                  value={targetFobPort}
                  onChange={(e) => setTargetFobPort(e.target.value)}
                  placeholder="FOB Kathmandu / CIF Hamburg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Target Delivery Date
                </label>
                <input
                  type="date"
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                General Commercial Notes & Compliance Instructions
              </label>
              <textarea
                rows={3}
                value={generalMessage}
                onChange={(e) => setGeneralMessage(e.target.value)}
                placeholder="Include labeling requirements, test protocols (OEKO-TEX, WRAP), sampling deadlines, and packing instructions."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Col: Multi-Item Basket Review & Dispatch Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <h3 className="font-outfit text-base font-bold text-slate-900">
                  Quote Basket ({items.length})
                </h3>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-slate-400 hover:text-red-500 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-slate-500">Your basket is currently empty.</p>
                <div className="pt-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                    Add Mill to RFQ:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedQuickEnterprise}
                      onChange={(e) => setSelectedQuickEnterprise(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
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
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-emerald-800"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto divide-y divide-slate-100 pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.productTitle || "General Mill Quotation"}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          {item.enterpriseName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Pcs:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.requestedQuantity}
                          onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Specs:</span>
                        <input
                          type="text"
                          placeholder="Pantone / Tech details"
                          value={item.customSpecifications || ""}
                          onChange={(e) => updateSpecifications(idx, e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Unified RFQ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit B2B RFQ ({items.length} Line-Items)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
