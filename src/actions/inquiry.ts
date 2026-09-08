"use server";

import { prisma } from "@/lib/prisma";
import { inquirySchema, type InquiryInput } from "@/types/inquiry";
import { dispatchRFQEmails } from "@/lib/email";

export async function submitInquiry(rawInput: InquiryInput) {
  // 1. Honeypot check
  if (rawInput.honeypot && rawInput.honeypot.trim().length > 0) {
    console.warn("🛡️ Honeypot triggered, silent bot rejection");
    return { success: true, message: "Inquiry received." };
  }

  // 2. Validate input
  const parseResult = inquirySchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid input data",
    };
  }

  const {
    buyerName,
    buyerEmail,
    buyerCompany,
    buyerCountry,
    orderQuantityTarget,
    message,
    enterpriseId,
    productId,
  } = parseResult.data;

  try {
    // 3. Resolve targeted enterprise and product
    let enterprise = null;
    if (enterpriseId) {
      enterprise = await prisma.enterprise.findUnique({
        where: { id: enterpriseId },
      });
    }

    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
        include: { enterprise: true },
      });
      if (!enterprise && product?.enterprise) {
        enterprise = product.enterprise;
      }
    }

    // 4. Record lead in database
    const lead = await prisma.leadInquiry.create({
      data: {
        buyerName,
        buyerEmail,
        buyerCompany,
        buyerCountry,
        orderQuantityTarget,
        message,
        enterpriseId: enterprise?.id || null,
        productId: product?.id || null,
        status: "NEW",
      },
    });

    // 5. Dispatch multi-channel transactional emails
    await dispatchRFQEmails({
      buyerName,
      buyerEmail,
      buyerCompany,
      buyerCountry,
      orderQuantityTarget,
      message,
      factoryName: enterprise?.name,
      factoryEmail: enterprise?.contactEmail,
      productTitle: product?.title,
      inquiryId: lead.id,
    });

    return {
      success: true,
      inquiryId: lead.id,
      message: "Your trade inquiry has been submitted and transmitted to the trade desk.",
    };
  } catch (error: any) {
    console.error("RFQ submission error:", error);
    return {
      success: false,
      error: "An error occurred while submitting your RFQ. Please try again or contact GAN directly.",
    };
  }
}
