"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { submitFactoryApplication } from "@/actions/apply";
import {
  Building2,
  FileCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Profile & Tax
    companyName: "",
    panNumber: "",
    registrationNumber: "",
    address: "",
    city: "Kathmandu",
    // Step 2: Capabilities
    monthlyCapacityPcs: 50000,
    employeeCount: 120,
    description: "",
    exportMarkets: "USA, Germany, United Kingdom, Japan",
    // Step 3: Contact & Account
    contactName: "",
    contactEmail: "",
    contactPhone: "+977-1-",
    password: "",
  });

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep((s) => s - 1);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitFactoryApplication(formData);
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.error || "Failed to submit application");
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="font-outfit text-3xl font-black text-slate-900">
            Accreditation Application Submitted!
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your factory registration for <strong>{formData.companyName}</strong> (PAN: {formData.panNumber}) has been submitted to the GAN Secretariat. 
            Once verified by trade officers, you will receive an activation email to access your Factory Rep Portal.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Return to Homepage
          </Link>
          <Link
            href="/directory"
            className="px-6 py-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            Browse Member Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md space-y-8">
      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-6 text-center text-xs font-bold">
        <div className={`flex items-center justify-center space-x-1.5 ${step >= 1 ? "text-emerald-700" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"}`}>
            1
          </span>
          <span className="hidden sm:inline">Tax & Profile</span>
        </div>

        <div className={`flex items-center justify-center space-x-1.5 ${step >= 2 ? "text-emerald-700" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"}`}>
            2
          </span>
          <span className="hidden sm:inline">Capacity Specs</span>
        </div>

        <div className={`flex items-center justify-center space-x-1.5 ${step >= 3 ? "text-emerald-700" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"}`}>
            3
          </span>
          <span className="hidden sm:inline">Rep Account</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center text-xs text-red-700">
          <AlertCircle className="w-4 h-4 mr-2.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Enterprise Profile & Tax */}
      {step === 1 && (
        <form onSubmit={nextStep} className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-outfit text-xl font-bold text-slate-900 mb-1">
              Step 1: Enterprise Profile & Tax Verification
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter official legal registration details matching your Inland Revenue Department (IRD) certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Registered Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Annapurna Textiles Pvt. Ltd."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City / Municipality *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Kathmandu, Lalitpur, Pokhara"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Inland Revenue PAN / VAT ID *
              </label>
              <input
                type="text"
                required
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                placeholder="9-digit PAN Number (e.g. 300124567)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Registrar Reg. Number *
              </label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="e.g. 15480/054"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Factory Physical Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot Number, Industrial District, Road Name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
            >
              <span>Continue to Production Specs</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Capabilities */}
      {step === 2 && (
        <form onSubmit={nextStep} className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-outfit text-xl font-bold text-slate-900 mb-1">
              Step 2: Plant Capabilities & Sourcing Lines
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide verifiable manufacturing volume metrics and export specialties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Monthly Capacity (Pieces) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={formData.monthlyCapacityPcs}
                onChange={(e) => setFormData({ ...formData, monthlyCapacityPcs: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Factory Workforce (Employees) *
              </label>
              <input
                type="number"
                required
                min="10"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Production Machinery & Quality Summary *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail machine brands (Juki, Shima Seiki), sewing lines, CAD suites, and inspection standards."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target / Existing Export Markets
            </label>
            <input
              type="text"
              value={formData.exportMarkets}
              onChange={(e) => setFormData({ ...formData, exportMarkets: e.target.value })}
              placeholder="USA, Germany, UK, Japan, Australia"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
            >
              <span>Continue to Account Setup</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Contact & Representative Account */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-outfit text-xl font-bold text-slate-900 mb-1">
              Step 3: Primary Representative Account Setup
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create the designated Factory Representative login to access your portal upon GAN accreditation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Representative Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="e.g. Ramesh Karki (Managing Director)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Contact Telephone *
              </label>
              <input
                type="text"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+977-1-4350123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Corporate Email (Login ID) *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="director@factory.com.np"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Secure Account Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-700" />
              Accreditation Protocol:
            </div>
            <p className="text-[11px] text-emerald-800">
              Applications are reviewed by the GAN Secretariat Trade Desk within 2 business days. Physical mill inspections or IRD tax certificates may be requested.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-8 py-3.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <span>Submit Membership Application</span>
                  <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
