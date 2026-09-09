import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Download,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";

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
      take: 6,
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
      take: 6,
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

  return (
    <div className="space-y-6">
      {/* Editorial Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E1E4E7]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
            Central Trade Desk · Operational Nerve Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
            Export Operations & Production Telemetry
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Real-time export directory telemetry, factory capacity audits, and international buyer purchase requisition workflows.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <a
            href="/api/export-csv"
            className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-[#0D0D0D] bg-white border border-[#E1E4E7] hover:border-[#0D0D0D] transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#6B7280]" />
            Export Manifest (CSV)
          </a>
          <Link
            href="/admin/products"
            className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Issue Style
          </Link>
        </div>
      </div>

      {/* Urgent Operational Anchor / Triage Notice */}
      {(newInquiries > 0 || pendingEnterprises > 0) && (
        <div className="border border-[#1E3A52] bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#1E3A52] text-white shrink-0">
              ACTION REQUIRED
            </span>
            <span className="text-[#0D0D0D] font-medium">
              {newInquiries > 0 && `${newInquiries} international buyer RFQ(s) awaiting secretariat triage.`}
              {newInquiries > 0 && pendingEnterprises > 0 && " "}
              {pendingEnterprises > 0 && `${pendingEnterprises} mill accreditation application(s) awaiting compliance audit.`}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {newInquiries > 0 && (
              <Link
                href="/admin/inquiries"
                className="font-mono text-[11px] font-semibold text-[#1E3A52] hover:underline"
              >
                Review Inquiries
              </Link>
            )}
            {pendingEnterprises > 0 && (
              <Link
                href="/admin/enterprises"
                className="font-mono text-[11px] font-semibold text-[#1E3A52] hover:underline pl-2 border-l border-[#E1E4E7]"
              >
                Audit Mills
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Metric Summary Row - Seamless hairline border strip, no floating widget cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 border border-[#E1E4E7] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7]">
        {/* Metric 1: Active Styles */}
        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Catalog Styles
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {totalProducts}
            </span>
            <span className="font-mono text-[10px] text-[#6B7280]">SKUs</span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            Active export tech packs
          </div>
        </div>

        {/* Metric 2: Pending Inquiries */}
        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Trade Leads / RFQs
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {totalInquiries}
            </span>
            {newInquiries > 0 && (
              <span className="font-mono text-[10px] text-[#1E3A52] font-semibold">
                ({newInquiries} pending)
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            International sourcing requisitions
          </div>
        </div>

        {/* Metric 3: Accredited Mills */}
        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Member Manufacturers
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {totalEnterprises}
            </span>
            <span className="font-mono text-[10px] text-[#1E3A52] font-semibold">
              {verifiedPercent}% verified
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            PAN & compliance audited
          </div>
        </div>

        {/* Metric 4: Capacity */}
        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Monthly Capacity
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {(totalCapacity / 1000).toFixed(0)}k
            </span>
            <span className="font-mono text-[10px] text-[#6B7280]">pcs/mo</span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            Aggregated factory output
          </div>
        </div>

        {/* Metric 5: Export Corridors */}
        <div className="p-4 col-span-2 md:col-span-4 lg:col-span-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Active Export Corridors
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-[#0D0D0D] truncate">
            USA · EU · UK · JP
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            Primary duty-free regimes
          </div>
        </div>
      </div>

      {/* Main Grid: Requisition Ledger (8 cols) + Dispatch Activity Log (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Requisition Status Table (8 cols) */}
        <div className="lg:col-span-8 border border-[#E1E4E7] bg-white">
          <div className="p-4 border-b border-[#E1E4E7] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
                Recent Purchase Requisitions (RFQs)
              </h2>
              <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
                Incoming export orders logged across North America, Europe, and Asia
              </p>
            </div>
            <Link
              href="/admin/inquiries"
              className="font-mono text-xs text-[#1E3A52] hover:underline font-semibold"
            >
              All Inquiries
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead>
                <tr>
                  <th>PO / RFQ Ref</th>
                  <th>Buyer & Market</th>
                  <th>Target Mill</th>
                  <th className="text-right">Volume</th>
                  <th>Stage / Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#6B7280]">
                      No active purchase requisitions logged in current cycle.
                    </td>
                  </tr>
                ) : (
                  recentInquiries.map((inquiry) => {
                    const totalVolume = inquiry.items.reduce(
                      (acc, i) => acc + i.requestedQuantity,
                      0
                    );
                    const millNames = Array.from(
                      new Set(inquiry.items.map((i) => i.enterprise.name))
                    ).join(", ") || "Central Secretariat";

                    return (
                      <tr key={inquiry.id}>
                        <td>
                          <span className="font-mono text-[11px] font-bold text-[#0D0D0D]">
                            {inquiry.inquiryNumber || "GAN-RFQ"}
                          </span>
                        </td>
                        <td>
                          <div className="font-semibold text-[#0D0D0D]">
                            {inquiry.buyerCompany}
                          </div>
                          <div className="font-mono text-[10px] text-[#6B7280]">
                            {inquiry.buyerName} ({inquiry.buyerCountry})
                          </div>
                        </td>
                        <td>
                          <div className="text-[#0D0D0D] line-clamp-1 max-w-[180px]">
                            {millNames}
                          </div>
                          <div className="font-mono text-[10px] text-[#6B7280]">
                            {inquiry.items.length} style item(s)
                          </div>
                        </td>
                        <td className="text-right font-mono font-semibold text-[#0D0D0D]">
                          {totalVolume.toLocaleString()} pcs
                        </td>
                        <td>
                          <span
                            className={
                              inquiry.status === "NEW"
                                ? "tag-pending"
                                : inquiry.status === "CLOSED" || inquiry.status === "RESPONDED"
                                ? "tag-approved"
                                : "tag-neutral"
                            }
                          >
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            href="/admin/inquiries"
                            className="font-mono text-[11px] text-[#1E3A52] hover:underline font-semibold"
                          >
                            Inspect
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

        {/* Right: Operational Activity Log / Dispatch Sheet (4 cols) */}
        <div className="lg:col-span-4 border border-[#E1E4E7] bg-white flex flex-col">
          <div className="p-4 border-b border-[#E1E4E7]">
            <h2 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
              Activity Ledger
            </h2>
            <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
              Chronological secretariat audit stream
            </p>
          </div>

          <div className="divide-y divide-[#E1E4E7] flex-1 overflow-y-auto max-h-[420px]">
            {recentAuditLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B7280] font-mono">
                No telemetry events recorded.
              </div>
            ) : (
              recentAuditLogs.map((log) => {
                const date = new Date(log.createdAt);
                const timeStr = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = date.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div key={log.id} className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-[#0D0D0D]">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[#6B7280]">
                        {dateStr} {timeStr}
                      </span>
                    </div>
                    <div className="text-xs text-[#0D0D0D]">
                      Entity: <span className="font-mono font-medium">{log.entityType} #{log.entityId.slice(-6)}</span>
                    </div>
                    {log.user && (
                      <div className="font-mono text-[10px] text-[#6B7280]">
                        Operator: {log.user.name || log.user.email}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-[#F6F7F8] border-t border-[#E1E4E7] text-right">
            <Link
              href="/admin/audit-logs"
              className="font-mono text-[11px] text-[#1E3A52] hover:underline font-semibold"
            >
              Full Dispatch Logs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

