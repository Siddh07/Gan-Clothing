"use client";

import React, { useState } from "react";
import { Globe, Inbox, Eye, Building2, Package, Activity, TrendingUp } from "lucide-react";

interface CountryStat { countryCode: string; views: number; rfqs: number; }
interface TopEnterprise { id: string; name: string; city: string; _count: { pageViews: number; inquiries: number }; }
interface TopCategory { name: string; count: number; volume: number; }
interface RecentEvent { id: string; eventType: string; countryCode: string; enterpriseName: string; createdAt: string; }

export function AnalyticsDashboard({
  totalEvents, totalRFQs, countryStats, topEnterprises, topCategories, recentEvents,
}: {
  totalEvents: number;
  totalRFQs: number;
  countryStats: CountryStat[];
  topEnterprises: TopEnterprise[];
  topCategories: TopCategory[];
  recentEvents: RecentEvent[];
}) {
  const [filterEvent, setFilterEvent] = useState("ALL");
  const totalVolume = topCategories.reduce((acc, c) => acc + c.volume, 0);
  const maxViews = Math.max(...countryStats.map((c) => c.views), 1);
  const topCountry = countryStats[0]?.countryCode || "—";

  const filteredEvents = recentEvents.filter((e) =>
    filterEvent === "ALL" ? true : e.eventType === filterEvent
  );

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: "Platform sessions", value: totalEvents.toLocaleString(), sub: "All time" },
          { icon: Inbox, label: "RFQs received", value: totalRFQs.toLocaleString(), sub: "Trade inquiries" },
          { icon: Globe, label: "Top source market", value: topCountry, sub: countryStats[0]?.views ? `${countryStats[0].views.toLocaleString()} views` : "—" },
          { icon: Package, label: "Demand volume", value: `${(totalVolume / 1000).toFixed(0)}k pcs`, sub: "Across RFQ items" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white rounded-lg border border-[#D1D5DB] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-[#1A1A1A]">{value}</p>
            <p className="text-xs text-[#6B7280] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country breakdown */}
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#D1D5DB]">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Buyer market breakdown</h2>
          </div>
          <div className="p-5 space-y-3">
            {countryStats.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No country data available.</p>
            ) : (
              countryStats.slice(0, 8).map((c) => (
                <div key={c.countryCode}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-[#1A1A1A]">{c.countryCode}</span>
                    <span className="text-[#6B7280] tabular-nums">{c.views.toLocaleString()} views · {c.rfqs} RFQs</span>
                  </div>
                  <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3B5BDB] rounded-full"
                      style={{ width: `${(c.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top mills */}
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#D1D5DB]">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Most viewed mills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mill</th>
                  <th className="text-right">Views</th>
                  <th className="text-right">Inquiries</th>
                </tr>
              </thead>
              <tbody>
                {topEnterprises.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-sm text-[#6B7280]">No data yet.</td></tr>
                ) : (
                  topEnterprises.slice(0, 6).map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div className="font-medium text-[#1A1A1A] text-sm">{e.name}</div>
                        <div className="text-xs text-[#6B7280]">{e.city}</div>
                      </td>
                      <td className="text-right text-sm font-medium tabular-nums">{e._count.pageViews.toLocaleString()}</td>
                      <td className="text-right text-sm tabular-nums">{e._count.inquiries}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#D1D5DB]">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Top categories by demand</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Items</th>
                  <th className="text-right">Volume</th>
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-[#6B7280]">No data yet.</td></tr>
                ) : (
                  topCategories.map((c) => (
                    <tr key={c.name}>
                      <td className="font-medium text-sm text-[#1A1A1A]">{c.name}</td>
                      <td className="text-right text-sm tabular-nums">{c.count}</td>
                      <td className="text-right text-sm font-medium tabular-nums">{c.volume.toLocaleString()} pcs</td>
                      <td className="text-right text-sm text-[#6B7280] tabular-nums">
                        {totalVolume > 0 ? `${Math.round((c.volume / totalVolume) * 100)}%` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent events */}
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D1D5DB]">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Recent events</h2>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="px-2 py-1 border border-[#D1D5DB] rounded text-xs bg-white text-[#1A1A1A] focus:outline-none"
            >
              <option value="ALL">All events</option>
              <option value="PAGE_VIEW">Page views</option>
              <option value="RFQ_SUBMITTED">RFQ submitted</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Mill</th>
                  <th>Country</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-[#6B7280]">No events.</td></tr>
                ) : (
                  filteredEvents.slice(0, 8).map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className={`badge ${e.eventType === "RFQ_SUBMITTED" ? "badge-accent" : "badge-neutral"}`}>
                          {e.eventType === "RFQ_SUBMITTED" ? "RFQ" : "View"}
                        </span>
                      </td>
                      <td className="text-sm text-[#1A1A1A] max-w-[140px] truncate">{e.enterpriseName || "—"}</td>
                      <td className="text-sm text-[#6B7280]">{e.countryCode || "—"}</td>
                      <td className="text-xs text-[#6B7280] tabular-nums">
                        {new Date(e.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
