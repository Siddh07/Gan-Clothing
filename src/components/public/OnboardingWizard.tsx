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
      <div className="bg-white border border-[#E1E4E7] p-8 sm:p-12 text-center space-y-6">
        <div className="w-12 h-12 border border-[#E1E4E7] text-[#1E3A52] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <span className="tag-approved text-[10px]">
            APPLICATION DOSSIER REGISTERED
          </span>
          <h2 className="text-xl font-bold font-mono text-[#0D0D0D] mt-2">
            ACCREDITATION SUBMISSION RECEIVED
          </h2>
          <p className="text-xs text-[#6B7280] max-w-lg mx-auto leading-relaxed">
            Statutory application for <strong>{formData.companyName}</strong> (PAN: {formData.panNumber}) has been officially registered with the GAN Secretariat. Following secretariat audit and physical plant inspection, authorized officer credentials will be activated.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-2">
          <Link
            href="/"
            className="px-5 py-2 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] rounded-none transition-colors"
          >
            RETURN TO HOMEPAGE
          </Link>
          <Link
            href="/directory"
            className="px-5 py-2 text-xs font-mono text-[#0D0D0D] bg-[#F6F7F8] border border-[#E1E4E7] hover:bg-white rounded-none transition-colors"
          >
            MEMBER DIRECTORY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E4E7] p-6 sm:p-10 space-y-6">
      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-2 border-b border-[#E1E4E7] pb-4 text-xs font-mono">
        <div className={`p-2 border ${step >= 1 ? "border-[#1E3A52] bg-[#F6F7F8] text-[#0D0D0D] font-bold" : "border-[#E1E4E7] text-[#6B7280]"}`}>
          <div className="text-[10px] uppercase text-[#6B7280]">Stage 01</div>
          <div className="truncate">Tax & Registry</div>
        </div>

        <div className={`p-2 border ${step >= 2 ? "border-[#1E3A52] bg-[#F6F7F8] text-[#0D0D0D] font-bold" : "border-[#E1E4E7] text-[#6B7280]"}`}>
          <div className="text-[10px] uppercase text-[#6B7280]">Stage 02</div>
          <div className="truncate">Plant Capacity</div>
        </div>

        <div className={`p-2 border ${step >= 3 ? "border-[#1E3A52] bg-[#F6F7F8] text-[#0D0D0D] font-bold" : "border-[#E1E4E7] text-[#6B7280]"}`}>
          <div className="text-[10px] uppercase text-[#6B7280]">Stage 03</div>
          <div className="truncate">Officer Credentials</div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-[#F6F7F8] border border-red-600 flex items-center text-xs text-red-600 font-mono">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Enterprise Profile & Tax */}
      {step === 1 && (
        <form onSubmit={nextStep} className="space-y-4">
          <div className="border-b border-[#E1E4E7] pb-3">
            <h3 className="text-sm font-bold font-mono uppercase text-[#0D0D0D]">
              Step 1: Statutory Registry & Tax Verification
            </h3>
            <p className="text-xs font-mono text-[#6B7280] mt-0.5">
              LEGAL REGISTRATION DETAILS MATCHING INLAND REVENUE DEPARTMENT (IRD) CERTIFICATES
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Full Registered Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Annapurna Textiles Pvt. Ltd."
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Production Hub / City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Kathmandu, Lalitpur, Biratnagar"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Inland Revenue PAN / VAT ID *
              </label>
              <input
                type="text"
                required
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                placeholder="9-digit PAN Number (e.g. 300124567)"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Company Registrar Reg. Number *
              </label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="e.g. 15480/054"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
              Factory Physical Plant Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot Number, Industrial District, Road Name"
              className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E1E4E7]">
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2.5 bg-[#1E3A52] text-white rounded-none text-xs font-mono font-medium hover:bg-[#0D0D0D] transition-colors cursor-pointer"
            >
              <span>CONTINUE TO PRODUCTION CAPACITY</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Capabilities */}
      {step === 2 && (
        <form onSubmit={nextStep} className="space-y-4">
          <div className="border-b border-[#E1E4E7] pb-3">
            <h3 className="text-sm font-bold font-mono uppercase text-[#0D0D0D]">
              Step 2: Plant Capabilities & Sourcing Lines
            </h3>
            <p className="text-xs font-mono text-[#6B7280] mt-0.5">
              VERIFIABLE MANUFACTURING VOLUME METRICS AND EXPORT CORRIDORS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Monthly Capacity (Pieces) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={formData.monthlyCapacityPcs}
                onChange={(e) => setFormData({ ...formData, monthlyCapacityPcs: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Total Factory Workforce (Employees) *
              </label>
              <input
                type="number"
                required
                min="10"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
              Production Machinery & Quality Summary *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail machine brands (Juki, Shima Seiki), sewing lines, CAD suites, and inspection standards."
              className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs rounded-none focus:outline-none bg-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
              Target / Existing Export Markets
            </label>
            <input
              type="text"
              value={formData.exportMarkets}
              onChange={(e) => setFormData({ ...formData, exportMarkets: e.target.value })}
              placeholder="USA, Germany, UK, Japan, Australia"
              className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E1E4E7]">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] rounded-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              BACK
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2.5 bg-[#1E3A52] text-white rounded-none text-xs font-mono font-medium hover:bg-[#0D0D0D] transition-colors cursor-pointer"
            >
              <span>CONTINUE TO CREDENTIAL SETUP</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Contact & Representative Account */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="border-b border-[#E1E4E7] pb-3">
            <h3 className="text-sm font-bold font-mono uppercase text-[#0D0D0D]">
              Step 3: Designated Representative Account Setup
            </h3>
            <p className="text-xs font-mono text-[#6B7280] mt-0.5">
              AUTHORIZED FACTORY DESK OPERATOR FOR SOURCING RFQS AND TECH PACK MANAGEMENT
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Representative Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="e.g. Ramesh Karki (Managing Director)"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Primary Contact Telephone *
              </label>
              <input
                type="text"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+977-1-4350123"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Official Corporate Email (Login ID) *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="director@factory.com.np"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
                Secure Account Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono rounded-none focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F6F7F8] border border-[#1E3A52] text-xs font-mono text-[#0D0D0D] space-y-1">
            <div className="font-bold flex items-center text-[10px] uppercase">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#1E3A52]" />
              Accreditation Protocol:
            </div>
            <p className="text-[11px] text-[#6B7280] font-sans">
              Applications are reviewed by the GAN Secretariat Trade Desk within 2 business days. Physical mill inspections or IRD tax certificates may be requested.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E1E4E7]">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D] border border-[#E1E4E7] hover:bg-[#F6F7F8] rounded-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              BACK
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-6 py-2.5 bg-[#1E3A52] text-white rounded-none text-xs font-mono font-medium hover:bg-[#0D0D0D] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  SUBMITTING DOSSIER...
                </>
              ) : (
                <>
                  <span>SUBMIT ACCREDITATION DOSSIER</span>
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
