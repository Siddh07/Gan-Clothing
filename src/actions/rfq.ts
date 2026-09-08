"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "trade-desk@ganepal.org";
const ARCHIVE_EMAIL = process.env.GAN_ARCHIVE_EMAIL || "leads@ganepal.org";

export interface SubmitRFQInput {
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  buyerCountry: string;
  targetFobPort?: string;
  targetDeliveryDate?: string;
  generalMessage: string;
  honeypot?: string;
  items: {
    enterpriseId: string;
    enterpriseName: string;
    productId?: string;
    productTitle?: string;
    requestedQuantity: number;
    customSpecifications?: string;
  }[];
}

export async function submitMultiItemRFQ(input: SubmitRFQInput) {
  // 1. Anti-bot honeypot check
  if (input.honeypot && input.honeypot.trim().length > 0) {
    console.warn("🛡️ Honeypot triggered, silent bot rejection");
    return { success: true, message: "Inquiry received." };
  }

  // 2. Rate limiting check (e.g. 5 RFQs per 5 minutes per email)
  const rateLimit = checkRateLimit(`rfq:${input.buyerEmail.toLowerCase().trim()}`, 10, 300000);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Rate limit exceeded. Please wait a few minutes before submitting another RFQ.",
    };
  }

  if (!input.buyerName || !input.buyerEmail || !input.buyerCompany || !input.buyerCountry) {
    return {
      success: false,
      error: "Please complete all required buyer identity fields.",
    };
  }

  if (!input.items || input.items.length === 0) {
    return {
      success: false,
      error: "Your RFQ basket must contain at least one factory or product line item.",
    };
  }

  try {
    // 3. Generate unique reference code: GAN-RFQ-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.leadInquiry.count();
    const sequence = String(count + 1).padStart(4, "0");
    const inquiryNumber = `GAN-RFQ-${year}-${sequence}`;

    const deliveryDate = input.targetDeliveryDate
      ? new Date(input.targetDeliveryDate)
      : null;

    // 4. Create LeadInquiry & Line Items in a transaction
    const leadInquiry = await prisma.leadInquiry.create({
      data: {
        inquiryNumber,
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        buyerCompany: input.buyerCompany,
        buyerCountry: input.buyerCountry,
        generalMessage: input.generalMessage || "Standard quotation request.",
        status: "NEW",
        targetDeliveryDate: deliveryDate,
        items: {
          create: input.items.map((item) => ({
            enterpriseId: item.enterpriseId,
            productId: item.productId || null,
            requestedQuantity: item.requestedQuantity || 500,
            customSpecifications: item.customSpecifications || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            enterprise: true,
            product: true,
          },
        },
      },
    });

    // 5. Track Analytics Event for each targeted enterprise
    const uniqueEnterpriseIds = Array.from(
      new Set(input.items.map((i) => i.enterpriseId))
    );

    for (const entId of uniqueEnterpriseIds) {
      await prisma.analyticsEvent.create({
        data: {
          eventType: "RFQ_SENT",
          enterpriseId: entId,
          countryCode: input.buyerCountry.slice(0, 2).toUpperCase(),
        },
      });
    }

    // 6. Log Console Transmission
    console.log(`\n======================================================`);
    console.log(`📬 [UNIFIED B2B RFQ] ${inquiryNumber}`);
    console.log(`Buyer: ${input.buyerName} (${input.buyerCompany}, ${input.buyerCountry})`);
    console.log(`Target Mills: ${input.items.map((i) => i.enterpriseName).join(", ")}`);
    console.log(`Total Line Items: ${input.items.length}`);
    console.log(`======================================================\n`);

    // 7. Dispatch Parallel Emails via Resend (or console mock)
    if (resend) {
      // (a) Single summary email to international buyer
      const itemsHtml = input.items
        .map(
          (i) =>
            `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>${i.enterpriseName}</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.productTitle || "General Sourcing Requirement"}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.requestedQuantity.toLocaleString()} pcs</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.customSpecifications || "-"}</td>
            </tr>`
        )
        .join("");

      await resend.emails.send({
        from: `Garment Association of Nepal <${FROM_EMAIL}>`,
        to: [input.buyerEmail],
        subject: `RFQ Received: ${inquiryNumber} - Garment Association of Nepal`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0;">Garment Association of Nepal (GAN)</h2>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">B2B Trade Desk • Official RFQ Acknowledgment</p>
            </div>
            <p>Dear <strong>${input.buyerName}</strong>,</p>
            <p>Thank you for submitting your apparel sourcing inquiry. Your multi-item request has been authenticated under reference <strong>${inquiryNumber}</strong> and routed to the designated mill representatives.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8fafc; text-align: left;">
                  <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Target Mill</th>
                  <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Product/Requirement</th>
                  <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Quantity</th>
                  <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Specs</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <p><strong>General Notes:</strong> ${input.generalMessage}</p>
            <p style="font-size: 13px; color: #64748b;">The factory merchandising representatives will review your tech-packs and provide FOB/CIF quotations within 24 to 48 hours.</p>
          </div>
        `,
      });

      // (b) Enterprise-specific alerts routed only to the relevant mills
      for (const entId of uniqueEnterpriseIds) {
        const ent = await prisma.enterprise.findUnique({ where: { id: entId } });
        if (ent && ent.contactEmail) {
          const entItems = input.items.filter((i) => i.enterpriseId === entId);
          await resend.emails.send({
            from: `GAN Trade Portal <${FROM_EMAIL}>`,
            to: [ent.contactEmail],
            subject: `🚨 NEW B2B TRADE LEAD: ${inquiryNumber} from ${input.buyerCompany} (${input.buyerCountry})`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #bae6fd; border-radius: 8px;">
                <h3 style="color: #0369a1; margin-top: 0;">Verified Trade Lead from GAN Secretariat</h3>
                <p>Attention Merchandising Team of <strong>${ent.name}</strong>,</p>
                <p>A new buyer RFQ has been allocated to your mill:</p>
                <ul>
                  <li><strong>Buyer:</strong> ${input.buyerName} (${input.buyerCompany}, ${input.buyerCountry})</li>
                  <li><strong>Email:</strong> ${input.buyerEmail}</li>
                  <li><strong>Target Items:</strong> ${entItems.map((i) => `${i.productTitle || "General"} (${i.requestedQuantity} pcs)`).join(", ")}</li>
                </ul>
                <p>Please log in to the <a href="http://localhost:3000/portal/inquiries">Factory Rep Portal</a> to view the complete tech-pack notes and update your lead status.</p>
              </div>
            `,
          });
        }
      }

      // (c) Archival copy to GAN Trade Desk
      await resend.emails.send({
        from: `GAN Trade Portal <${FROM_EMAIL}>`,
        to: [ARCHIVE_EMAIL],
        subject: `[GAN ARCHIVE] ${inquiryNumber}: ${input.buyerCompany} -> ${uniqueEnterpriseIds.length} Mills`,
        html: `<p>New multi-item RFQ logged. Reference: ${inquiryNumber}. Total Mills: ${uniqueEnterpriseIds.length}.</p>`,
      });
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/portal/inquiries");

    return {
      success: true,
      inquiryNumber,
      inquiryId: leadInquiry.id,
      message: `Your trade inquiry ${inquiryNumber} has been successfully recorded and routed.`,
    };
  } catch (error: any) {
    console.error("Multi-item RFQ error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while processing your RFQ. Please try again.",
    };
  }
}
