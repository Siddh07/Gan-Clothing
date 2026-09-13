import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/export-csv
 *
 * Exports RFQ inquiries as a CSV file for admin download.
 *
 * Security: explicit `select` blocks on all Prisma queries prevent leaking
 * internal enterprise fields (passwordHash, adminNotes, panNumber, etc.)
 * that are not needed in the buyer-facing export.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN_EDITOR"].includes((session.user as any).role)) {
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
      `"${(item.generalMessage || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gan-trade-rfqs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
