"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@/types/inquiry";
import { submitInquiry } from "@/actions/inquiry";
import {
  X,
  Send,
  Building2,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseId?: string | null;
  enterpriseName?: string | null;
  productId?: string | null;
  productTitle?: string | null;
  defaultMoq?: number;
}

export function QuoteModal({
  isOpen,
  onClose,
  enterpriseId,
  enterpriseName,
  productId,
  productTitle,
  defaultMoq,
}: QuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      buyerName: "",
      buyerEmail: "",
      buyerCompany: "",
      buyerCountry: "",
      orderQuantityTarget: defaultMoq || 500,
      message: productTitle
        ? `Inquiry regarding ${productTitle}. Please provide quotation for sampling and bulk FOB/CIF pricing.`
        : "We are interested in sourcing garments and would like to receive your catalog and pricing.",
      enterpriseId: enterpriseId || null,
      productId: productId || null,
      honeypot: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InquiryInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await submitInquiry(data);
      if (response.success) {
        setSubmitSuccess(true);
        reset();
      } else {
        setServerError(response.error || "Failed to submit inquiry");
      }
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitSuccess(false);
    setServerError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D]/60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-none border border-[#0D0D0D] max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0D0D0D] text-white px-6 py-4 flex justify-between items-center border-b border-[#0D0D0D]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#E1E4E7]">
              Commercial Requisition // Dispatch Protocol
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-white mt-0.5">
              Request for Quotation (B2B RFQ)
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-none text-[#E1E4E7] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Context Strip */}
        {(enterpriseName || productTitle) && (
          <div className="bg-[#F6F7F8] border-b border-[#E1E4E7] px-6 py-2.5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#0D0D0D]">
            {enterpriseName && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#E1E4E7] px-2 py-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#1E3A52]" />
                Target Mill: <strong className="font-semibold">{enterpriseName}</strong>
              </span>
            )}
            {productTitle && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#E1E4E7] px-2 py-0.5">
                <Package className="w-3.5 h-3.5 text-[#1E3A52]" />
                Specimen: <strong className="font-semibold">{productTitle}</strong>
              </span>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-[#F6F7F8] border border-[#0D0D0D] text-[#0D0D0D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#1E3A52]" />
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                Protocol Status: Dispatched
              </div>
              <h4 className="font-mono text-base font-bold text-[#0D0D0D] uppercase tracking-wider">
                Requisition Logged with Secretariat
              </h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
                Your B2B sourcing requisition has been recorded in the Garment Association of Nepal
                trade ledger. An encrypted dispatch copy was routed to the mill merchandising desk.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-[#0D0D0D] text-white rounded-none font-mono text-xs uppercase tracking-widest hover:bg-[#1E3A52] transition-colors"
                >
                  Close & Return to Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 bg-[#F6F7F8] border border-[#0D0D0D] flex items-center text-xs font-mono text-[#0D0D0D]">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-[#1E3A52]" />
                  {serverError}
                </div>
              )}

              {/* Honeypot field */}
              <input
                type="text"
                {...register("honeypot")}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Buyer Name */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                    Buyer Representative *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    {...register("buyerName")}
                    className={`w-full px-3 py-2 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
                      errors.buyerName
                        ? "border-[#0D0D0D] bg-red-50/20"
                        : "border-[#E1E4E7] focus:border-[#0D0D0D]"
                    }`}
                  />
                  {errors.buyerName && (
                    <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerName.message}</p>
                  )}
                </div>

                {/* Buyer Email */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    placeholder="sourcing@apparelbrand.com"
                    {...register("buyerEmail")}
                    className={`w-full px-3 py-2 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
                      errors.buyerEmail
                        ? "border-[#0D0D0D] bg-red-50/20"
                        : "border-[#E1E4E7] focus:border-[#0D0D0D]"
                    }`}
                  />
                  {errors.buyerEmail && (
                    <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerEmail.message}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                    Company / Enterprise Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nordic Outfitters AS"
                    {...register("buyerCompany")}
                    className={`w-full px-3 py-2 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
                      errors.buyerCompany
                        ? "border-[#0D0D0D] bg-red-50/20"
                        : "border-[#E1E4E7] focus:border-[#0D0D0D]"
                    }`}
                  />
                  {errors.buyerCompany && (
                    <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerCompany.message}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                    Destination Market / Country *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Germany, Japan, USA"
                    {...register("buyerCountry")}
                    className={`w-full px-3 py-2 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
                      errors.buyerCountry
                        ? "border-[#0D0D0D] bg-red-50/20"
                        : "border-[#E1E4E7] focus:border-[#0D0D0D]"
                    }`}
                  />
                  {errors.buyerCountry && (
                    <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerCountry.message}</p>
                  )}
                </div>
              </div>

              {/* Order Target Quantity */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                  Target Order Volume (Pieces) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  {...register("orderQuantityTarget", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] font-mono focus:outline-none ${
                    errors.orderQuantityTarget
                      ? "border-[#0D0D0D] bg-red-50/20"
                      : "border-[#E1E4E7] focus:border-[#0D0D0D]"
                  }`}
                />
                {errors.orderQuantityTarget && (
                  <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.orderQuantityTarget.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                  Technical Specifications & Sourcing Requirements *
                </label>
                <textarea
                  rows={4}
                  placeholder="State fiber blend, target GSM weight, required accreditations (GOTS, OEKO-TEX), destination port, and delivery schedule."
                  {...register("message")}
                  className={`w-full px-3 py-2 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
                    errors.message
                      ? "border-[#0D0D0D] bg-red-50/20"
                      : "border-[#E1E4E7] focus:border-[#0D0D0D]"
                  }`}
                ></textarea>
                {errors.message && (
                  <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.message.message}</p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E1E4E7] flex items-center justify-between">
                <span className="inline-flex items-center font-mono text-[10px] uppercase text-[#6B7280]">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#1E3A52]" />
                  GAN Secretariat Oversight
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#0D0D0D] border border-transparent hover:border-[#E1E4E7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-5 py-2 rounded-none text-xs font-mono uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Submit RFQ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
