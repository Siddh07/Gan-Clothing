import React from "react";
import { prisma } from "@/lib/prisma";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [
    totalEvents,
    eventsByCountryRaw,
    topEnterprisesRaw,
    inquiries,
    recentEventsRaw,
  ] = await Promise.all([
    prisma.analyticsEvent.count(),
    prisma.analyticsEvent.groupBy({
      by: ["countryCode"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.enterprise.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        _count: {
          select: {
            pageViews: true,
            inquiries: true,
          },
        },
      },
      orderBy: {
        pageViews: { _count: "desc" },
      },
      take: 6,
    }),
    prisma.leadInquiry.findMany({
      select: {
        id: true,
        buyerCountry: true,
        createdAt: true,
        items: {
          select: {
            requestedQuantity: true,
            product: {
              select: {
                category: { select: { name: true } },
                fabricType: true,
              },
            },
          },
        },
      },
    }),
    prisma.analyticsEvent.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        enterprise: { select: { name: true } },
      },
    }),
  ]);

  // Aggregate Category Demand from Inquiries
  const categoryCountMap: Record<string, { count: number; volume: number }> = {};
  const countryInquiryMap: Record<string, number> = {};

  inquiries.forEach((inq) => {
    countryInquiryMap[inq.buyerCountry] = (countryInquiryMap[inq.buyerCountry] || 0) + 1;

    inq.items.forEach((item) => {
      const catName = item.product?.category?.name || "General Apparel";
      if (!categoryCountMap[catName]) {
        categoryCountMap[catName] = { count: 0, volume: 0 };
      }
      categoryCountMap[catName].count += 1;
      categoryCountMap[catName].volume += item.requestedQuantity;
    });
  });

  const topCategories = Object.entries(categoryCountMap)
    .map(([name, data]) => ({ name, count: data.count, volume: data.volume }))
    .sort((a, b) => b.volume - a.volume);

  const countryStats = eventsByCountryRaw.map((c) => ({
    countryCode: c.countryCode || "Global",
    views: c._count.id,
    rfqs: countryInquiryMap[c.countryCode || ""] || 0,
  }));

  const recentEvents = recentEventsRaw.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    countryCode: e.countryCode || "Global",
    enterpriseName: e.enterprise?.name || "Directory General",
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-black text-slate-900">
          International Buyer Intent & Sourcing Analytics
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Geo-attribution telemetry, market demand for Nepalese garment categories, and member enterprise lead conversion analytics.
        </p>
      </div>

      <AnalyticsDashboard
        totalEvents={totalEvents}
        totalRFQs={inquiries.length}
        countryStats={countryStats}
        topEnterprises={topEnterprisesRaw}
        topCategories={topCategories}
        recentEvents={recentEvents}
      />
    </div>
  );
}
