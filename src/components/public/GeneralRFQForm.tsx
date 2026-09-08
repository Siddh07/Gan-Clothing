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
    } catch (e) {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-outfit text-2xl font-bold text-slate-900">
          Inquiry Successfully Dispatched!
        </h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Your request for quotation has been officially logged with the Garment Association of Nepal Trade Desk. An acknowledgment has been dispatched to your email, and relevant factory merchandisers will connect with you.
        </p>
        <div className="pt-4">
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-sm text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Honeypot field */}
      <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="Sarah Jenkins"
            {...register("buyerName")}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {errors.buyerName && (
            <p className="text-red-500 text-xs mt-1">{errors.buyerName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Corporate Email *
          </label>
          <input
            type="email"
            placeholder="s.jenkins@retailbrand.com"
            {...register("buyerEmail")}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {errors.buyerEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.buyerEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Company / Brand Name *
          </label>
          <input
            type="text"
            placeholder="Nordic Apparel Group"
            {...register("buyerCompany")}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {errors.buyerCompany && (
            <p className="text-red-500 text-xs mt-1">{errors.buyerCompany.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Country of Operation *
          </label>
          <input
            type="text"
            placeholder="e.g. United States, Germany, Japan"
            {...register("buyerCountry")}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {errors.buyerCountry && (
            <p className="text-red-500 text-xs mt-1">{errors.buyerCountry.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Estimated Target Quantity (Pcs) *
          </label>
          <input
            type="number"
            min="1"
            placeholder="1000"
            {...register("orderQuantityTarget", { valueAsNumber: true })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {errors.orderQuantityTarget && (
            <p className="text-red-500 text-xs mt-1">{errors.orderQuantityTarget.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Target Factory (Optional)
          </label>
          <select
            {...register("enterpriseId")}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
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
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
          Detailed Sourcing Specification & Requirements *
        </label>
        <textarea
          rows={5}
          placeholder="Please describe fabric specifications (e.g. 100% Cashmere, Organic Cotton Oxford), target GSM, required certifications (WRAP, GOTS, Sedex), preferred incoterms (FOB Kathmandu), and sample delivery deadline."
          {...register("message")}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        ></textarea>
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-4 rounded-xl text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-md inline-flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Transmitting to GAN Trade Desk...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Official RFQ
            </>
          )}
        </button>
      </div>
    </form>
  );
}
