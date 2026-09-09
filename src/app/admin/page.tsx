import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Download, Plus, AlertCircle, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalEnterprises,
    verifiedEnterprises,
    pendingEnterprises,
    totalProducts,
    totalInquiries,
    newInquiries,
    recentInquiries,
    capacityAggregate,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.enterprise.count(),
    prisma.enterprise.count({ where: { isVerified: true } }),
    prisma.enterprise.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.product.count(),
    prisma.leadInquiry.count(),
    prisma.leadInquiry.count({ where: { status: "NEW" } }),
    prisma.leadInquiry.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            enterprise: { select: { name: true } },
            product: { select: { title: true } },
          },
        },
      },
    }),
    prisma.enterprise.aggregate({
      _sum: { monthlyCapacityPcs: true },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const verifiedPercent = totalEnterprises > 0
    ? Math.round((verifiedEnterprises / totalEnterprises) * 100)
    : 100;

  const totalCapacity = capacityAggregate._sum.monthlyCapacityPcs || 0;

  const statusBadge = (status: string) => {
    if (status === "NEW") return <span className="badge badge-warning">New</span>;
    if (status === "RESPONDED" || status === "CLOSED") return <span className="badge badge-success">Responded</span>;
    if (status === "IN_REVIEW") return <span className="badge badge-accent">In review</span>;
    return <span className="badge badge-neutral">{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Overview</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Platform activity, pending actions, and recent inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export-csv"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#D1D5DB] rounded hover:bg-[#F3F4F6] transition-colors"
          >
            <Download className="w-4 h-4 text-[#6B7280]" />
            Export CSV
          </a>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#3B5BDB] rounded hover:bg-[#3451C7] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add product
          </Link>
        </div>
      </div>

      {/* Action required banner */}
      {(newInquiries > 0 || pendingEnterprises > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="text-[#1A1A1A] font-medium">
              {newInquiries > 0 && `${newInquiries} new RFQ${newInquiries > 1 ? "s" : ""} awaiting review.`}
              {newInquiries > 0 && pendingEnterprises > 0 && " "}
              {pendingEnterprises > 0 && `${pendingEnterprises} accreditation application${pendingEnterprises > 1 ? "s" : ""} pending.`}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {newInquiries > 0 && (
              <Link href="/admin/inquiries" className="text-sm font-medium text-[#3B5BDB] hover:underline">
                Review inquiries
              </Link>
            )}
            {pendingEnterprises > 0 && (
              <Link href="/admin/enterprises" className="text-sm font-medium text-[#3B5BDB] hover:underline">
                Review mills
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Products in catalog",
            value: totalProducts.toLocaleString(),
            sub: "Active SKUs",
            trend: null,
          },
          {
            label: "Total inquiries",
            value: totalInquiries.toLocaleString(),
            sub: `${newInquiries} new`,
            trend: newInquiries > 0 ? "warning" : null,
          },
          {
            label: "Member mills",
            value: totalEnterprises.toLocaleString(),
            sub: `${verifiedPercent}% verified`,
            trend: "ok",
          },
          {
            label: "Monthly capacity",
            value: `${(totalCapacity / 1000).toFixed(0)}k`,
            sub: "pieces/month",
            trend: null,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-[#D1D5DB] p-5">
            <p className="text-sm text-[#6B7280]">{kpi.label}</p>
            <p className="text-3xl font-semibold text-[#1A1A1A] mt-1 leading-none">{kpi.value}</p>
            <p className="text-xs text-[#6B7280] mt-2 flex items-center gap-1">
              {kpi.trend === "ok" && <TrendingUp className="w-3 h-3 text-[#16A34A]" />}
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent RFQs table — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D1D5DB]">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-[#3B5BDB] hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Company</th>
                  <th>Mills targeted</th>
                  <th className="text-right">Volume</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[#6B7280] text-sm">
                      No inquiries yet.
                    </td>
                  </tr>
                ) : (
                  recentInquiries.map((inquiry) => {
                    const totalVolume = inquiry.items.reduce((acc, i) => acc + i.requestedQuantity, 0);
                    const mills = Array.from(new Set(inquiry.items.map((i) => i.enterprise.name)));

                    return (
                      <tr key={inquiry.id}>
                        <td>
                          <div className="font-medium text-[#1A1A1A] text-sm">{inquiry.buyerName}</div>
                          <div className="text-xs text-[#6B7280]">{inquiry.buyerCountry}</div>
                        </td>
                        <td className="text-sm text-[#1A1A1A]">{inquiry.buyerCompany}</td>
                        <td>
                          <div className="text-sm text-[#1A1A1A] truncate max-w-[140px]">
                            {mills[0] || "GAN Secretariat"}
                            {mills.length > 1 && (
                              <span className="text-xs text-[#6B7280] ml-1">+{mills.length - 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right text-sm font-medium text-[#1A1A1A] tabular-nums">
                          {totalVolume.toLocaleString()} pcs
                        </td>
                        <td>{statusBadge(inquiry.status)}</td>
                        <td className="text-right">
                          <Link href="/admin/inquiries" className="text-sm text-[#3B5BDB] hover:underline font-medium">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity log — 1/3 width */}
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D1D5DB]">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Recent activity</h2>
            <Link href="/admin/audit-logs" className="text-sm text-[#3B5BDB] hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6]">
            {recentAuditLogs.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#6B7280]">No activity recorded.</div>
            ) : (
              recentAuditLogs.map((log) => {
                const date = new Date(log.createdAt);
                return (
                  <div key={log.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-[#1A1A1A] font-medium leading-snug">
                        {log.action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                      </p>
                      <time className="text-xs text-[#6B7280] shrink-0 tabular-nums">
                        {date.toLocaleDateString([], { month: "short", day: "numeric" })}
                      </time>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {log.entityType} {log.entityId.slice(-6).toUpperCase()}
                      {log.user && ` · ${log.user.name || log.user.email}`}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
