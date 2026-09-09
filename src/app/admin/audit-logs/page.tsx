import React from "react";
import { prisma } from "@/lib/prisma";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const rawLogs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  const logs = rawLogs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E1E4E7]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
          Governance & Compliance Ledger · Immutable Audit Trail
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
          Secretariat Action Logs & Security Audit Trail
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Timestamped chronological record of mill accreditations, catalog alterations, trade inquiry re-routings, and administrative determinations.
        </p>
      </div>

      <AuditLogViewer initialLogs={logs} />
    </div>
  );
}
