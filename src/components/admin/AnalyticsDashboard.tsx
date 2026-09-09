"use client";

import React, { useState } from "react";
import {
  Globe,
  Inbox,
  Eye,
  Building2,
  Package,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface CountryStat {
  countryCode: string;
  views: number;
  rfqs: number;
}

interface TopEnterprise {
  id: string;
  name: string;
  city: string;
  _count: {
    pageViews: number;
    inquiries: number;
  };
}

interface TopCategory {
  name: string;
  count: number;
  volume: number;
}

interface RecentEvent {
  id: string;
  eventType: string;
  countryCode: string;
  enterpriseName: string;
  createdAt: string;
}

export function AnalyticsDashboard({
  totalEvents,
  totalRFQs,
  countryStats,
  topEnterprises,
  topCategories,
  recentEvents,
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
  const topCountry = countryStats[0]?.countryCode || "USA";

  const filteredEvents = recentEvents.filter((e) =>
    filterEvent === "ALL" ? true : e.eventType === filterEvent
  );

  return (
    <div className="space-y-6">
      {/* Metric Summary Strip (Integrated hairline border strip) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E1E4E7] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E1E4E7]">
        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Platform Sessions
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {totalEvents.toLocaleString()}
            </span>
            <span className="font-mono text-[10px] text-[#1E3A52] font-semibold">
              +18.4%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            International buyer touchpoints
          </div>
        </div>

        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Trade Leads / RFQs
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {totalRFQs}
            </span>
            <span className="font-mono text-[10px] text-[#6B7280]">leads</span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            Dispatched buyer baskets
          </div>
        </div>

        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Top Sourcing Corridor
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {topCountry}
            </span>
            <span className="font-mono text-[10px] text-[#6B7280]">market</span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            Highest inquiry density
          </div>
        </div>

        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
            Aggregate Demand
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0D0D0D]">
              {(totalVolume / 1000).toFixed(0)}k
            </span>
            <span className="font-mono text-[10px] text-[#6B7280]">pcs</span>
          </div>
          <div className="mt-1 text-[11px] text-[#6B7280]">
            Requested apparel units
          </div>
        </div>
      </div>

      {/* Row 2: Country Sourcing Corridors & Garment Category Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Breakdown Table */}
        <div className="border border-[#E1E4E7] bg-white">
          <div className="p-4 border-b border-[#E1E4E7]">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
              Sourcing Markets by Intent & Inquiries
            </h3>
            <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
              Profile views and purchase requisitions logged by buyer jurisdiction
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead>
                <tr>
                  <th>Jurisdiction</th>
                  <th className="text-right">Catalog Views</th>
                  <th className="text-right">RFQs Issued</th>
                  <th className="w-28 text-right">Traffic Share</th>
                </tr>
              </thead>
              <tbody>
                {countryStats.map((item) => {
                  const percent = Math.round((item.views / maxViews) * 100);
                  return (
                    <tr key={item.countryCode}>
                      <td>
                        <span className="font-mono font-bold text-[#0D0D0D]">
                          {item.countryCode}
                        </span>
                      </td>
                      <td className="text-right font-mono font-semibold text-[#0D0D0D]">
                        {item.views}
                      </td>
                      <td className="text-right font-mono font-bold text-[#1E3A52]">
                        {item.rfqs}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono text-[10px] text-[#6B7280]">{percent}%</span>
                          <div className="w-12 h-1.5 bg-[#E1E4E7] overflow-hidden">
                            <div
                              className="bg-[#0D0D0D] h-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Demand Table */}
        <div className="border border-[#E1E4E7] bg-white">
          <div className="p-4 border-b border-[#E1E4E7]">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
              Garment Category Demand Breakdown
            </h3>
            <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
              Aggregated procurement quantities requested across apparel classifications
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead>
                <tr>
                  <th>Apparel Category</th>
                  <th className="text-right">Inquiries</th>
                  <th className="text-right">Requested Volume</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#6B7280]">
                      No category procurement data recorded in active cycle.
                    </td>
                  </tr>
                ) : (
                  topCategories.map((cat) => (
                    <tr key={cat.name}>
                      <td className="font-medium text-[#0D0D0D]">
                        {cat.name}
                      </td>
                      <td className="text-right font-mono text-[#6B7280]">
                        {cat.count} RFQs
                      </td>
                      <td className="text-right font-mono font-bold text-[#0D0D0D]">
                        {cat.volume.toLocaleString()} pcs
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Member Enterprise Engagement & Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Member Enterprises */}
        <div className="border border-[#E1E4E7] bg-white">
          <div className="p-4 border-b border-[#E1E4E7]">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
              Member Mill Buyer Engagement
            </h3>
            <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
              Audited facilities receiving the highest export buyer inquiry volume
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-ledger">
              <thead>
                <tr>
                  <th>Mill / Enterprise</th>
                  <th>Location</th>
                  <th className="text-right">Showroom Views</th>
                  <th className="text-right">Dispatched RFQs</th>
                </tr>
              </thead>
              <tbody>
                {topEnterprises.map((factory) => (
                  <tr key={factory.id}>
                    <td className="font-medium text-[#0D0D0D]">
                      {factory.name}
                    </td>
                    <td className="font-mono text-[10px] text-[#6B7280]">
                      {factory.city}
                    </td>
                    <td className="text-right font-mono text-[#0D0D0D]">
                      {factory._count.pageViews}
                    </td>
                    <td className="text-right font-mono font-bold text-[#1E3A52]">
                      {factory._count.inquiries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Telemetry Dispatch Stream */}
        <div className="border border-[#E1E4E7] bg-white flex flex-col">
          <div className="p-4 border-b border-[#E1E4E7] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-[#0D0D0D]">
                Buyer Sourcing Telemetry Log
              </h3>
              <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
                Live international traffic & dispatch events
              </p>
            </div>

            <div className="flex items-center border border-[#E1E4E7]">
              {["ALL", "PAGE_VIEW", "RFQ_SENT"].map((ev) => (
                <button
                  key={ev}
                  onClick={() => setFilterEvent(ev)}
                  className={`px-2 py-0.5 font-mono text-[10px] transition-colors border-r border-[#E1E4E7] last:border-r-0 ${
                    filterEvent === ev
                      ? "bg-[#0D0D0D] text-white font-bold"
                      : "bg-white text-[#6B7280] hover:text-[#0D0D0D]"
                  }`}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#E1E4E7] flex-1 max-h-72 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <p className="p-6 text-xs text-[#6B7280] italic font-mono text-center">
                No telemetry events logged for current filter.
              </p>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        event.eventType === "RFQ_SENT"
                          ? "tag-pending"
                          : "tag-neutral"
                      }
                    >
                      {event.eventType}
                    </span>
                    <span className="font-medium text-[#0D0D0D] truncate max-w-xs">
                      {event.enterpriseName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#6B7280]">
                    <span className="font-bold text-[#0D0D0D]">
                      {event.countryCode}
                    </span>
                    <span>
                      {new Date(event.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

