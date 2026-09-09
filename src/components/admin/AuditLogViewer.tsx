"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Database,
  Building2,
  Package,
  Inbox,
  FileCheck,
  User,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export function AuditLogViewer({
  initialLogs,
}: {
  initialLogs: AuditLogItem[];
}) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = initialLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase())) ||
      (log.user?.name && log.user.name.toLowerCase().includes(search.toLowerCase()));

    const matchesAction =
      actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVED") || action.includes("CREATED") || action.includes("VERIFIED")) {
      return "tag-approved";
    }
    if (action.includes("REJECTED") || action.includes("DELETED") || action.includes("REVOKED")) {
      return "tag-pending";
    }
    return "tag-neutral";
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "enterprise":
        return <Building2 className="w-3.5 h-3.5 text-[#0D0D0D]" />;
      case "product":
        return <Package className="w-3.5 h-3.5 text-[#0D0D0D]" />;
      case "leadinquiry":
        return <Inbox className="w-3.5 h-3.5 text-[#0D0D0D]" />;
      case "certification":
        return <FileCheck className="w-3.5 h-3.5 text-[#0D0D0D]" />;
      default:
        return <Database className="w-3.5 h-3.5 text-[#0D0D0D]" />;
    }
  };

  const uniqueActions = Array.from(new Set(initialLogs.map((l) => l.action)));

  return (
    <div className="space-y-4">
      {/* Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-[#E1E4E7]">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, operator, or entity ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F7F8] border border-[#E1E4E7] text-xs font-mono placeholder:font-sans placeholder:text-[#6B7280] focus:border-[#0D0D0D] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#6B7280]">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#F6F7F8] border border-[#E1E4E7] px-2.5 py-1.5 text-xs font-mono focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="ALL">All Actions ({initialLogs.length})</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-[#E1E4E7] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-ledger">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Timestamp</th>
                <th>Action Recorded</th>
                <th>Entity Class</th>
                <th>Operator</th>
                <th>Entity Identifier</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                    No matching audit trail records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  let parsedMeta: any = null;
                  if (log.metadata) {
                    try {
                      parsedMeta = JSON.parse(log.metadata);
                    } catch {
                      parsedMeta = log.metadata;
                    }
                  }

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="hover:bg-[#F6F7F8] cursor-pointer transition-colors"
                      >
                        <td className="text-center text-[#6B7280]">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#0D0D0D]" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </td>
                        <td className="font-mono text-[11px] text-[#6B7280] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td>
                          <span className={getActionBadge(log.action)}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 font-medium text-[#0D0D0D]">
                            {getEntityIcon(log.entityType)}
                            <span>{log.entityType}</span>
                          </div>
                        </td>
                        <td>
                          {log.user ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-[#0D0D0D]">
                                {log.user.name || log.user.email}
                              </span>
                              <span className="font-mono text-[10px] text-[#6B7280]">
                                ({log.user.role})
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-[10px] text-[#6B7280] italic">
                              SYSTEM DISPATCH
                            </span>
                          )}
                        </td>
                        <td className="font-mono text-[11px] text-[#6B7280] truncate max-w-xs">
                          {log.entityId}
                        </td>
                      </tr>

                      {/* Expanded JSON inspector */}
                      {isExpanded && (
                        <tr className="bg-[#F6F7F8]">
                          <td colSpan={6} className="p-4 pl-10">
                            <div className="bg-[#0D0D0D] text-slate-100 p-4 font-mono text-[11px] overflow-x-auto space-y-1.5 border border-[#0D0D0D]">
                              <div className="font-sans text-[11px] text-slate-400 font-semibold uppercase">
                                Action Context & Telemetry Payload:
                              </div>
                              <pre className="whitespace-pre-wrap leading-relaxed text-slate-200">
                                {parsedMeta
                                  ? JSON.stringify(parsedMeta, null, 2)
                                  : "No auxiliary context payload attached."}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

