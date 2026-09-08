"use client";

import React, { useState } from "react";
import {
  Globe,
  TrendingUp,
  Inbox,
  Eye,
  Building2,
  Package,
  Activity,
  ArrowUpRight,
  Download,
  Filter,
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase">Platform Sessions</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-outfit">
            {totalEvents.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +18.4% international reach
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase">Total Leads (RFQs)</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-outfit">
            {totalRFQs}
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            Multi-item quote requests
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase">Top Sourcing Market</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-outfit">
            {topCountry}
          </div>
          <div className="text-[11px] text-slate-700 font-medium">
            Leading international buyer origin
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase">Demand Volume</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-outfit">
            {(totalVolume / 1000).toFixed(0)}k <span className="text-sm font-semibold text-slate-700">pcs</span>
          </div>
          <div className="text-[11px] text-purple-800 font-medium">
            Requested production units
          </div>
        </div>
      </div>

      {/* Country Distribution & Category Demand Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Top Sourcing Markets by Intent
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                Combined profile page views and dispatched RFQs by buyer country.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {countryStats.map((item) => {
              const percent = Math.round((item.views / maxViews) * 100);
              return (
                <div key={item.countryCode} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.countryCode}</span>
                    <span className="text-slate-700 font-mono">
                      {item.views} views • {item.rfqs} RFQs
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Queried Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Garment Category Demand
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                Aggregate order quantities requested in incoming RFQ baskets.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {topCategories.length === 0 ? (
              <p className="text-xs text-slate-700 italic py-4">No category quote data yet.</p>
            ) : (
              topCategories.map((cat) => {
                const maxVol = Math.max(...topCategories.map((c) => c.volume), 1);
                const percent = Math.round((cat.volume / maxVol) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="text-slate-700 font-mono font-semibold">
                        {cat.volume.toLocaleString()} pcs ({cat.count} inquiries)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Member Enterprise Engagement & Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Factories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Most Viewed Member Enterprises
          </h3>

          <div className="divide-y divide-slate-100">
            {topEnterprises.map((factory, idx) => (
              <div
                key={factory.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[11px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{factory.name}</div>
                    <div className="text-slate-700 text-[11px]">{factory.city}, Nepal</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-800 font-mono">
                    {factory._count.pageViews} views
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium">
                    {factory._count.inquiries} leads received
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Real-Time Platform Event Stream
            </h3>

            <div className="flex items-center space-x-1 text-xs">
              {["ALL", "PAGE_VIEW", "RFQ_SENT"].map((ev) => (
                <button
                  key={ev}
                  onClick={() => setFilterEvent(ev)}
                  className={`px-2 py-0.5 rounded-lg font-semibold text-[11px] transition-colors ${
                    filterEvent === ev
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-slate-700 italic py-4 text-center">
                No telemetry events logged.
              </p>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        event.eventType === "RFQ_SENT"
                          ? "bg-amber-100 text-amber-800"
                          : event.eventType === "CATALOG_DOWNLOAD"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.eventType}
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-xs">
                      {event.enterpriseName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-700 text-[11px] shrink-0 font-mono">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">
                      {event.countryCode}
                    </span>
                    <span>
                      {new Date(event.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
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
