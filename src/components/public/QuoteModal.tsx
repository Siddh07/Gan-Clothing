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
    } catch (err) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-slate-900 text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-700/60 rounded-lg">
              <Send className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-lg leading-tight">
                Request a Quote (B2B RFQ)
              </h3>
              <p className="text-xs text-emerald-200/80">
                Official Garment Association of Nepal Sourcing Network
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Context Pill */}
        {(enterpriseName || productTitle) && (
          <div className="bg-emerald-50/80 border-b border-emerald-100 px-6 py-2.5 flex flex-wrap items-center gap-2 text-xs text-emerald-900">
            {enterpriseName && (
              <span className="inline-flex items-center font-medium bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-md">
                <Building2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                Target Factory: <strong>{enterpriseName}</strong>
              </span>
            )}
            {productTitle && (
              <span className="inline-flex items-center font-medium bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-md">
                <Package className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                Product: <strong>{productTitle}</strong>
              </span>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="font-outfit text-xl font-bold text-slate-900">
                Trade Inquiry Transmitted!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your B2B sourcing request has been securely logged with the Garment Association of Nepal. 
                A confirmation email has been dispatched, and the export merchandising team will review your specifications shortly.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {serverError}
                </div>
              )}

              {/* Honeypot field (hidden from real users, filled by bots) */}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    {...register("buyerName")}
                    className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.buyerName
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                  />
                  {errors.buyerName && (
                    <p className="text-red-500 text-xs mt-1">{errors.buyerName.message}</p>
                  )}
                </div>

                {/* Buyer Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    placeholder="sarah@apparelbrand.com"
                    {...register("buyerEmail")}
                    className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.buyerEmail
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                  />
                  {errors.buyerEmail && (
                    <p className="text-red-500 text-xs mt-1">{errors.buyerEmail.message}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Brand Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nordic Outfitters AS"
                    {...register("buyerCompany")}
                    className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.buyerCompany
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                  />
                  {errors.buyerCompany && (
                    <p className="text-red-500 text-xs mt-1">{errors.buyerCompany.message}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer Country *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United States, Germany, Japan"
                    {...register("buyerCountry")}
                    className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.buyerCountry
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                  />
                  {errors.buyerCountry && (
                    <p className="text-red-500 text-xs mt-1">{errors.buyerCountry.message}</p>
                  )}
                </div>
              </div>

              {/* Order Target Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Target Order Quantity (Pieces) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  {...register("orderQuantityTarget", { valueAsNumber: true })}
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.orderQuantityTarget
                      ? "border-red-300 focus:ring-red-400"
                      : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                />
                {errors.orderQuantityTarget && (
                  <p className="text-red-500 text-xs mt-1">{errors.orderQuantityTarget.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tech Pack & Sourcing Specifications *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your garment specifications, target delivery timeline, fabric preferences, required certifications (e.g., WRAP, GOTS), and destination port."
                  {...register("message")}
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.message
                      ? "border-red-300 focus:ring-red-400"
                      : "border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="inline-flex items-center text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                  Direct GAN Trade Protection
                </span>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
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
