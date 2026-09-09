import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FactoryProfileForm } from "@/components/portal/FactoryProfileForm";
import { ShieldCheck, Building2, TrendingUp, Users, Package, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);
  const enterpriseId = (session?.user as any)?.enterpriseId;

  if (!enterpriseId) {
    return (
      <div className="bg-white border border-[#E1E4E7] p-8 text-center space-y-3">
        <div className="w-10 h-10 border border-[#E1E4E7] text-[#6B7280] flex items-center justify-center mx-auto">
          <Building2 className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-bold text-[#0D0D0D]">
          Unassigned Facility Accreditation
        </h2>
        <p className="text-xs font-mono text-[#6B7280] max-w-md mx-auto">
          Your credentials are authenticated as a manufacturer representative, but this account has not yet been linked to an active mill dossier by the GAN Secretariat.
        </p>
      </div>
    );
  }

  const [enterprise, productCount, inquiryCount] = await Promise.all([
    prisma.enterprise.findUnique({
      where: { id: enterpriseId },
      include: {
        certifications: true,
      },
    }),
    prisma.product.count({ where: { enterpriseId } }),
    prisma.leadInquiryItem.count({ where: { enterpriseId } }),
  ]);

  if (!enterprise) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Technical Dossier Header */}
      <div className="border-b border-[#E1E4E7] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0D0D0D] tracking-tight">
              {enterprise.name}
            </h1>
            {enterprise.isVerified ? (
              <span className="tag-approved">
                ACCREDITED MILL
              </span>
            ) : (
              <span className="tag-pending">
                PENDING VERIFICATION
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-[#6B7280] mt-1 space-x-3">
            <span>STATUS: <strong className="text-[#0D0D0D]">{enterprise.status}</strong></span>
            <span>PAN: <strong className="text-[#0D0D0D]">{enterprise.panNumber}</strong></span>
            <span>REG: <strong className="text-[#0D0D0D]">{enterprise.registrationNumber}</strong></span>
          </div>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white border border-[#E1E4E7] divide-x divide-y md:divide-y-0 divide-[#E1E4E7]">
        <div className="p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
            Monthly Capacity
          </div>
          <div className="text-xl font-bold font-mono text-[#0D0D0D] mt-1">
            {enterprise.monthlyCapacityPcs.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">pcs</span>
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
            {enterprise.employeeCount} active craftspeople
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
            Showroom Samples
          </div>
          <div className="text-xl font-bold font-mono text-[#0D0D0D] mt-1">
            {productCount} <span className="text-xs font-normal text-[#6B7280]">styles</span>
          </div>
          <div className="text-[10px] font-mono text-[#1E3A52] mt-0.5">
            Active in catalog
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
            Routed RFQs
          </div>
          <div className="text-xl font-bold font-mono text-[#0D0D0D] mt-1">
            {inquiryCount} <span className="text-xs font-normal text-[#6B7280]">leads</span>
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
            GAN Trade Desk
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] font-mono uppercase text-[#6B7280] tracking-wider">
            Active Audits
          </div>
          <div className="text-xl font-bold font-mono text-[#0D0D0D] mt-1">
            {enterprise.certifications?.length || 0} <span className="text-xs font-normal text-[#6B7280]">certs</span>
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
            Verified compliance
          </div>
        </div>
      </div>

      {/* Profile Editor Form */}
      <div className="bg-white border border-[#E1E4E7]">
        <div className="px-5 py-3 border-b border-[#E1E4E7] bg-[#F6F7F8] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0D0D0D]">
            Plant Technical Specification & Commercial Dossier
          </h2>
          <span className="text-[10px] font-mono text-[#6B7280]">
            SYNCED TO DIRECTORY
          </span>
        </div>
        <div className="p-6">
          <FactoryProfileForm enterprise={enterprise} />
        </div>
      </div>
    </div>
  );
}
