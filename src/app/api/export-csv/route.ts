import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await prisma.leadInquiry.findMany({
    include: {
      enterprise: true,
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Inquiry ID",
    "Date",
    "Buyer Name",
    "Buyer Email",
    "Buyer Company",
    "Buyer Country",
    "Target Factory",
    "Target Product",
    "Order Target (pcs)",
    "Status",
    "Message",
  ];

  const rows = inquiries.map((item) => [
    item.id,
    new Date(item.createdAt).toISOString().split("T")[0],
    `"${(item.buyerName || "").replace(/"/g, '""')}"`,
    `"${(item.buyerEmail || "").replace(/"/g, '""')}"`,
    `"${(item.buyerCompany || "").replace(/"/g, '""')}"`,
    `"${(item.buyerCountry || "").replace(/"/g, '""')}"`,
    `"${(item.enterprise?.name || "General GAN Trade Desk").replace(/"/g, '""')}"`,
    `"${(item.product?.title || "Custom RFQ").replace(/"/g, '""')}"`,
    item.orderQuantityTarget,
    item.status,
    `"${(item.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gan-trade-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
