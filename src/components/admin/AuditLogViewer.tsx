"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  ChevronDown,
  ChevronRight,
  Database,
  Building2,
  Package,
  Inbox,
  FileCheck,
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
    if (action.includes("APPROVED") || action.includes("CREATED")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (action.includes("REJECTED") || action.includes("DELETED") || action.includes("SUSPENDED")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (action.includes("IMPORT")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "enterprise":
        return <Building2 className="w-3.5 h-3.5" />;
      case "product":
        return <Package className="w-3.5 h-3.5" />;
      case "leadinquiry":
        return <Inbox className="w-3.5 h-3.5" />;
      case "certification":
        return <FileCheck className="w-3.5 h-3.5" />;
      default:
        return <Database className="w-3.5 h-3.5" />;
    }
  };

  const uniqueActions = Array.from(new Set(initialLogs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user, or entity ID..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-700 font-semibold shrink-0">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-8"></th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Initiator</th>
                <th className="p-3.5">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-700">
                    No matching audit log records found.
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
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 text-slate-700">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-700" />
                          )}
                        </td>
                        <td className="p-3.5 text-slate-700 whitespace-nowrap font-mono">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center space-x-1.5 font-medium text-slate-700">
                            {getEntityIcon(log.entityType)}
                            <span>{log.entityType}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {log.user ? (
                            <div className="flex items-center space-x-1.5">
                              <User className="w-3.5 h-3.5 text-slate-700" />
                              <span className="font-semibold text-slate-900">
                                {log.user.name || log.user.email}
                              </span>
                              <span className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                {log.user.role}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-700 italic">System Event</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700 text-[11px] truncate max-w-xs">
                          {log.entityId}
                        </td>
                      </tr>

                      {/* Expanded JSON inspector */}
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="p-4 pl-12">
                            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[11px] overflow-x-auto space-y-2">
                              <div className="text-slate-400 font-sans text-xs font-semibold">
                                Metadata Context Payload:
                              </div>
                              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">
                                {parsedMeta ? JSON.stringify(parsedMeta, null, 2) : "No context metadata recorded."}
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
