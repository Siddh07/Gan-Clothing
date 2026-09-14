import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeHandler } from "@/lib/safe-handler";
import { logUnauthorizedAccess } from "@/lib/logger";

// CORS: Internal only — no cross-origin access

/**
 * GET /api/export-csv
 *
 * Exports RFQ inquiries as a CSV file for admin download.
 */
export const GET = safeHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN_EDITOR"].includes((session.user as any).role)) {
    logUnauthorizedAccess({
      route: "/api/export-csv",
      userId: (session?.user as any)?.id,
      reason: "Unauthorized attempt to export CSV data",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await prisma.leadInquiry.findMany({
    select: {
      id: true,
      inquiryNumber: true,
      createdAt: true,
      buyerName: true,
      buyerEmail: true,
      buyerCompany: true,
      buyerCountry: true,
      targetDeliveryDate: true,
      status: true,
      generalMessage: true,
      items: {
        select: {
          requestedQuantity: true,
          enterprise: {
            // Explicit select — prevents leaking panNumber, passwordHash,
            // registrationNumber, adminNotes, and other internal fields
            select: {
              name: true,
              city: true,
            },
          },
          product: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "RFQ Number",
    "Date",
    "Buyer Name",
    "Buyer Email",
    "Buyer Company",
    "Buyer Country",
    "Target Delivery Date",
    "Target Factories",
    "Item Count",
    "Total Quantity (pcs)",
    "Status",
    "General Message",
  ];

  const rows = inquiries.map((item) => {
    const factoryNames = Array.from(
      new Set(item.items.map((i) => i.enterprise.name))
    ).join("; ");
    const totalQty = item.items.reduce((acc, i) => acc + i.requestedQuantity, 0);

    return [
      item.inquiryNumber || item.id,
      new Date(item.createdAt).toISOString().split("T")[0],
      `"${(item.buyerName || "").replace(/"/g, '""')}"`,
      `"${(item.buyerEmail || "").replace(/"/g, '""')}"`,
      `"${(item.buyerCompany || "").replace(/"/g, '""')}"`,
      `"${(item.buyerCountry || "").replace(/"/g, '""')}"`,
      item.targetDeliveryDate
        ? new Date(item.targetDeliveryDate).toISOString().split("T")[0]
        : "Open",
      `"${factoryNames.replace(/"/g, '""')}"`,
      item.items.length,
      totalQty,
      item.status,
      `"${(item.generalMessage || "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gan-rfq-export-${new Date().toISOString().split("T")[0]}.csv"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
});
