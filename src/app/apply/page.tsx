import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { OnboardingWizard } from "@/components/public/OnboardingWizard";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply for Exporter Accreditation | Garment Association of Nepal",
  description:
    "Register your Nepalese garment manufacturing factory for official GAN accreditation, bilateral trade preferences, and inclusion in the B2B Export Directory.",
};

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F8] text-[#0D0D0D]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner */}
        <div className="bg-[#0D0D0D] text-white py-10 border-b border-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center space-x-2 font-mono text-[10px] uppercase tracking-widest text-[#E1E4E7]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Exporter Onboarding & Accreditation Protocol</span>
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                Apply for GAN Member Accreditation
              </h1>
              <p className="text-xs text-[#E1E4E7] leading-relaxed font-sans">
                Join Nepal's premier apex apparel body. Gain international market exposure, duty-free preferential tariff routing (Nepal Trade Preference Program / EU EBA), and verified registry credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <OnboardingWizard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
