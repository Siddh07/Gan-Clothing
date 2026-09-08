import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { OnboardingWizard } from "@/components/public/OnboardingWizard";
import { ShieldCheck, Building2, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply for Exporter Accreditation | Garment Association of Nepal",
  description:
    "Register your Nepalese garment manufacturing factory for official GAN accreditation, bilateral trade preferences, and inclusion in the B2B Export Directory.",
};

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner */}
        <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>Exporter Onboarding & Accreditation Funnel</span>
              </div>
              <h1 className="font-outfit text-3xl sm:text-4xl font-black">
                Apply for GAN Member Accreditation
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Join Nepal's premier apex trade body. Gain international market access, duty-free certification routing (US Trade Preference Act / EU EBA), and direct exposure to global apparel buyers.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <OnboardingWizard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
