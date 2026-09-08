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
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="font-outfit text-xl font-bold text-slate-900">
          No Linked Factory Profile
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Your account is registered as a representative, but has not yet been linked to an active factory profile by the GAN Secretariat.
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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-outfit text-3xl font-black text-slate-900">
              {enterprise.name}
            </h1>
            {enterprise.isVerified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Verified Mill
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Status: <strong className="text-slate-900">{enterprise.status}</strong> • PAN: {enterprise.panNumber} • Reg: {enterprise.registrationNumber}
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Capacity
          </span>
          <div className="font-outfit text-2xl font-black text-slate-900">
            {enterprise.monthlyCapacityPcs.toLocaleString()} pcs
          </div>
          <div className="text-[11px] text-slate-500">
            {enterprise.employeeCount} active craftspeople
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Showroom Samples
          </span>
          <div className="font-outfit text-2xl font-black text-slate-900">
            {productCount} Styles
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Live in Export Catalog
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Buyer Inquiries Logged
          </span>
          <div className="font-outfit text-2xl font-black text-slate-900">
            {inquiryCount} Leads
          </div>
          <div className="text-[11px] text-slate-500">
            Dispatched by GAN Trade Desk
          </div>
        </div>
      </div>

      {/* Profile Editor Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="font-outfit text-xl font-bold text-slate-900 mb-6">
          Factory Information & Technical Capabilities
        </h2>
        <FactoryProfileForm enterprise={enterprise} />
      </div>
    </div>
  );
}
