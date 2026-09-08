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
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          Platform Audit Trail & Security Logs
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Chronological record of secretariat approvals, application determinations, batch CSV ingestions, and compliance verifications.
        </p>
      </div>

      <AuditLogViewer initialLogs={logs} />
    </div>
  );
}
