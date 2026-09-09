"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@/types/inquiry";
import { submitInquiry } from "@/actions/inquiry";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface EnterpriseOption {
  id: string;
  name: string;
  city: string;
}

export function GeneralRFQForm({
  enterprises,
}: {
  enterprises: EnterpriseOption[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      orderQuantityTarget: 1000,
      enterpriseId: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (data: InquiryInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitInquiry(data);
      if (res.success) {
        setIsSuccess(true);
        reset();
      } else {
        setErrorMessage(res.error || "Failed to submit inquiry");
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 text-center space-y-4 font-mono">
        <div className="w-12 h-12 bg-[#F6F7F8] border border-[#0D0D0D] text-[#0D0D0D] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-[#1E3A52]" />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">
          Protocol Status: Dispatched
        </div>
        <h3 className="text-xl font-bold uppercase text-[#0D0D0D]">
          Requisition Logged with Trade Desk
        </h3>
        <p className="text-xs text-[#6B7280] max-w-lg mx-auto leading-relaxed font-sans">
          Your request for quotation has been recorded in the Garment Association of Nepal trade register. An encrypted dispatch copy has been routed to your corporate email, and accredited factory merchandising desks have been alerted.
        </p>
        <div className="pt-4">
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 bg-[#0D0D0D] text-white rounded-none text-xs font-mono uppercase tracking-wider font-bold hover:bg-[#1E3A52] transition-colors"
          >
            Submit Another RFQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="p-3 bg-[#F6F7F8] border border-[#0D0D0D] flex items-center text-xs font-mono text-[#0D0D0D]">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-[#1E3A52]" />
          {errorMessage}
        </div>
      )}

      {/* Honeypot field */}
      <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Buyer Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Sarah Jenkins"
            {...register("buyerName")}
            className={`w-full px-3.5 py-2.5 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
              errors.buyerName
                ? "border-[#0D0D0D] bg-red-50/20"
                : "border-[#E1E4E7] focus:border-[#0D0D0D]"
            }`}
          />
          {errors.buyerName && (
            <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerName.message}</p>
          )}
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Corporate Work Email *
          </label>
          <input
            type="email"
            placeholder="sourcing@retailbrand.com"
            {...register("buyerEmail")}
            className={`w-full px-3.5 py-2.5 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
              errors.buyerEmail
                ? "border-[#0D0D0D] bg-red-50/20"
                : "border-[#E1E4E7] focus:border-[#0D0D0D]"
            }`}
          />
          {errors.buyerEmail && (
            <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Company / Brand Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Nordic Apparel Group"
            {...register("buyerCompany")}
            className={`w-full px-3.5 py-2.5 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
              errors.buyerCompany
                ? "border-[#0D0D0D] bg-red-50/20"
                : "border-[#E1E4E7] focus:border-[#0D0D0D]"
            }`}
          />
          {errors.buyerCompany && (
            <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerCompany.message}</p>
          )}
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Destination Market / Country *
          </label>
          <input
            type="text"
            placeholder="e.g. Germany, Japan, United States"
            {...register("buyerCountry")}
            className={`w-full px-3.5 py-2.5 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
              errors.buyerCountry
                ? "border-[#0D0D0D] bg-red-50/20"
                : "border-[#E1E4E7] focus:border-[#0D0D0D]"
            }`}
          />
          {errors.buyerCountry && (
            <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.buyerCountry.message}</p>
          )}
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Target Volume Target (Pieces) *
          </label>
          <input
            type="number"
            min="1"
            placeholder="1000"
            {...register("orderQuantityTarget", { valueAsNumber: true })}
            className={`w-full px-3.5 py-2.5 rounded-none border text-xs font-mono text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
              errors.orderQuantityTarget
                ? "border-[#0D0D0D] bg-red-50/20"
                : "border-[#E1E4E7] focus:border-[#0D0D0D]"
            }`}
          />
          {errors.orderQuantityTarget && (
            <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.orderQuantityTarget.message}</p>
          )}
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Designated Mill (Optional)
          </label>
          <select
            {...register("enterpriseId")}
            className="w-full px-3.5 py-2.5 rounded-none border border-[#E1E4E7] font-mono text-xs text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] bg-white"
          >
            <option value="">General GAN Trade Desk (Apex Routing)</option>
            {enterprises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
          Detailed Sourcing Specification & Technical Requirements *
        </label>
        <textarea
          rows={5}
          placeholder="State fiber blend, target GSM weight, required accreditations (GOTS, OEKO-TEX, WRAP), destination seaport/airport, and target lab-dip schedule."
          {...register("message")}
          className={`w-full px-3.5 py-2.5 rounded-none border text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none ${
            errors.message
              ? "border-[#0D0D0D] bg-red-50/20"
              : "border-[#E1E4E7] focus:border-[#0D0D0D]"
          }`}
        ></textarea>
        {errors.message && (
          <p className="font-mono text-[10px] text-[#0D0D0D] mt-1">{errors.message.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-[#E1E4E7]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 rounded-none font-mono text-xs uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] disabled:opacity-50 transition-colors inline-flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging with Trade Desk...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Transmit Commercial RFQ
            </>
          )}
        </button>
      </div>
    </form>
  );
}
