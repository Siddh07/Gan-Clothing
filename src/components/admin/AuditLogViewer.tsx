"use client";

import React, { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
  user: { name: string | null; email: string; role: string } | null;
}

const ACTION_OPTIONS = ["ALL", "CREATED", "APPROVED", "REJECTED", "VERIFIED", "DELETED", "UPDATED"];

function actionBadge(action: string) {
  if (action.includes("APPROVED") || action.includes("CREATED") || action.includes("VERIFIED")) {
    return <span className="badge badge-success">{action.replace(/_/g, " ")}</span>;
  }
  if (action.includes("REJECTED") || action.includes("DELETED") || action.includes("REVOKED")) {
    return <span className="badge badge-error">{action.replace(/_/g, " ")}</span>;
  }
  return <span className="badge badge-neutral">{action.replace(/_/g, " ")}</span>;
}

export function AuditLogViewer({ initialLogs }: { initialLogs: AuditLogItem[] }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = initialLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase())) ||
      (log.user?.name && log.user.name.toLowerCase().includes(search.toLowerCase()));
    const matchesAction = actionFilter === "ALL" || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, entities, users…"
            className="pl-8 pr-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none w-64"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-[#D1D5DB] rounded text-sm bg-white text-[#1A1A1A] focus:border-[#3B5BDB] focus:outline-none"
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "ALL" ? "All actions" : o.charAt(0) + o.slice(1).toLowerCase()}</option>
          ))}
        </select>

        <span className="text-sm text-[#6B7280] sm:ml-auto">
          {filtered.length} of {initialLogs.length} events
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Action</th>
                <th>Entity</th>
                <th>Operator</th>
                <th>Role</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#6B7280]">
                    No audit events match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <td className="px-3">
                        {expandedId === log.id
                          ? <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                          : <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        }
                      </td>
                      <td>{actionBadge(log.action)}</td>
                      <td>
                        <div className="text-sm text-[#1A1A1A] font-medium">{log.entityType}</div>
                        <div className="text-xs font-mono text-[#6B7280]">#{log.entityId.slice(-8).toUpperCase()}</div>
                      </td>
                      <td>
                        <div className="text-sm text-[#1A1A1A]">{log.user?.name || "—"}</div>
                        <div className="text-xs text-[#6B7280]">{log.user?.email || "System"}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{log.user?.role || "system"}</span>
                      </td>
                      <td className="text-sm text-[#6B7280] tabular-nums">
                        {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        <span className="text-xs ml-1">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded metadata */}
                    {expandedId === log.id && log.metadata && (
                      <tr>
                        <td colSpan={6} className="px-6 py-3 bg-[#F8F8F6] border-b border-[#D1D5DB]">
                          <p className="text-xs font-semibold text-[#6B7280] mb-1.5">Metadata</p>
                          <pre className="text-xs font-mono text-[#1A1A1A] bg-white rounded border border-[#D1D5DB] p-3 overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.metadata || "{}"), null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
