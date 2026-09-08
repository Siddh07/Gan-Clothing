import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Package,
  Inbox,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Download,
  Plus,
  Clock,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalEnterprises,
    verifiedEnterprises,
    totalProducts,
    totalInquiries,
    newInquiries,
    recentInquiries,
    capacityAggregate,
  ] = await Promise.all([
    prisma.enterprise.count(),
    prisma.enterprise.count({ where: { isVerified: true } }),
    prisma.product.count(),
    prisma.leadInquiry.count(),
    prisma.leadInquiry.count({ where: { status: "NEW" } }),
    prisma.leadInquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        enterprise: { select: { name: true } },
        product: { select: { title: true } },
      },
    }),
    prisma.enterprise.aggregate({
      _sum: { monthlyCapacityPcs: true },
    }),
  ]);

  const verifiedPercent = totalEnterprises > 0
    ? Math.round((verifiedEnterprises / totalEnterprises) * 100)
    : 100;

  const totalCapacity = capacityAggregate._sum.monthlyCapacityPcs || 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-black text-slate-900">
            GAN Secretariat CMS Dashboard
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Real-time export directory telemetry, compliance verifications, and international trade inquiries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/export-csv"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Export Inquiries CSV
          </a>
          <Link
            href="/admin/enterprises"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Manage Members
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Enterprises */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Exporters
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-black text-slate-900">
            {totalEnterprises}
          </div>
          <div className="flex items-center text-xs text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {verifiedPercent}% Verified Status
          </div>
        </div>

        {/* Live Products */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Catalog Products
            </span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-black text-slate-900">
            {totalProducts}
          </div>
          <div className="text-xs text-slate-700 font-medium">
            Active pre-production sample styles
          </div>
        </div>

        {/* Inquiries Logged */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Trade Leads (RFQs)
            </span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-black text-slate-900">
            {totalInquiries}
          </div>
          <div className="text-xs text-amber-800 font-medium flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {newInquiries} Pending Triage
          </div>
        </div>

        {/* Capacity Pcs */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Monthly Capacity
            </span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-black text-slate-900">
            {(totalCapacity / 1000).toFixed(0)}k <span className="text-sm font-semibold text-slate-700">pcs</span>
          </div>
          <div className="text-xs text-slate-700 font-medium">
            Aggregated member monthly volume
          </div>
        </div>
      </div>

      {/* Recent Inquiries Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-outfit text-lg font-bold text-slate-900">
              Recent Incoming Trade Inquiries (RFQs)
            </h2>
            <p className="text-xs text-slate-700">
              International buyer sourcing requests logged from North America, Europe, and Asia.
            </p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center"
          >
            View All Inquiries
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentInquiries.map((inquiry) => (
            <div key={inquiry.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {inquiry.buyerCompany}
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-600 font-medium">
                    {inquiry.buyerName} ({inquiry.buyerCountry})
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inquiry.status === "NEW"
                        ? "bg-amber-100 text-amber-800"
                        : inquiry.status === "FORWARDED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <div className="text-slate-700">
                  Target: <strong>{inquiry.enterprise?.name || "General GAN Trade Desk"}</strong>
                  {inquiry.product && ` • Item: ${inquiry.product.title}`} • Volume: {inquiry.orderQuantityTarget.toLocaleString()} pcs
                </div>
                <p className="text-slate-600 italic line-clamp-1 max-w-2xl">
                  "{inquiry.message}"
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/admin/inquiries"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Manage Lead
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
