"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import {
  enterpriseProfileUpdateSchema,
  certificationSchema,
  inquiryNoteSchema,
} from "@/lib/schemas";

// ---------------------------------------------------------------------------
// Auth guard — FACTORY_REP or SUPER_ADMIN only
// ---------------------------------------------------------------------------

import { logUnauthorizedAccess, logValidationRejection } from "@/lib/logger";

async function getFactoryRepSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    logUnauthorizedAccess({ route: "portal.action", reason: "Active session required" });
    throw new Error("Unauthorized: Active session required");
  }
  const role = (session.user as any).role;
  const enterpriseId = (session.user as any).enterpriseId;

  if (role !== "FACTORY_REP" && role !== "SUPER_ADMIN") {
    logUnauthorizedAccess({
      route: "portal.action",
      userId: (session.user as any).id,
      reason: `Forbidden role: ${role}`,
    });
    throw new Error("Forbidden: Factory Representative or Super Admin required");
  }

  return { session, role, enterpriseId };
}

// ---------------------------------------------------------------------------
// Enterprise profile update
// ---------------------------------------------------------------------------

export async function updateFactoryProfile(data: unknown) {
  const { session, role, enterpriseId: userEntId } = await getFactoryRepSession();

  // Zod validation on all inputs
  const parsed = enterpriseProfileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid profile data",
    };
  }

  const input = parsed.data;

  // ABAC: FACTORY_REP can only update their own linked factory
  const targetId = role === "SUPER_ADMIN" ? input.enterpriseId : userEntId;
  if (!targetId) {
    throw new Error("No linked factory found for representative");
  }

  // Prevent IDOR: verify targetId matches the authenticated user's enterprise
  if (role === "FACTORY_REP" && targetId !== input.enterpriseId) {
    console.warn(
      `[Security] IDOR attempt: user enterpriseId="${userEntId}" tried to update "${input.enterpriseId}"`
    );
    throw new Error("Forbidden: Cannot update another factory's profile");
  }

  const updated = await prisma.enterprise.update({
    where: { id: targetId },
    data: {
      name: input.name,
      description: input.description,
      monthlyCapacityPcs: input.monthlyCapacityPcs,
      employeeCount: input.employeeCount,
      address: input.address,
      city: input.city,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      websiteUrl: input.websiteUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      exportMarkets: input.exportMarkets,
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "FACTORY_PROFILE_UPDATED",
    entityType: "Enterprise",
    entityId: targetId,
    metadata: { name: updated.name },
  });

  revalidatePath("/portal");
  revalidatePath(`/directory/${updated.slug}`);
  revalidatePath("/directory");

  return { success: true, enterprise: updated };
}

// ---------------------------------------------------------------------------
// Factory product management
// ---------------------------------------------------------------------------

export async function addFactoryProduct(data: {
  title: string;
  categoryId: string;
  fabricType: string;
  gsmWeight?: number;
  moq: number;
  targetGender: string;
  description: string;
  imageUrl: string;
  isFeatured?: boolean;
}) {
  const { session, enterpriseId } = await getFactoryRepSession();
  if (!enterpriseId) {
    throw new Error("No factory linked to this representative");
  }

  const slug = slugify(data.title) + "-" + Math.floor(1000 + Math.random() * 9000);

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug,
      enterpriseId,
      categoryId: data.categoryId,
      fabricType: data.fabricType,
      gsmWeight: data.gsmWeight ? Number(data.gsmWeight) : null,
      moq: Number(data.moq) || 500,
      targetGender: data.targetGender || "Unisex",
      description: data.description,
      images: JSON.stringify([data.imageUrl]),
      isFeatured: Boolean(data.isFeatured),
    },
    include: {
      category: { select: { name: true } },
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "FACTORY_PRODUCT_ADDED",
    entityType: "Product",
    entityId: product.id,
    metadata: { title: product.title },
  });

  revalidatePath("/portal/products");
  revalidatePath("/products");
  return { success: true, product };
}

export async function deleteFactoryProduct(productId: string) {
  const { session, enterpriseId } = await getFactoryRepSession();
  if (!enterpriseId) throw new Error("Unauthorized");

  // ABAC: verify this product belongs to the rep's enterprise
  const product = await prisma.product.findFirst({
    where: { id: productId, enterpriseId },
  });

  if (!product) throw new Error("Product not found or unauthorized");

  await prisma.product.delete({ where: { id: productId } });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "FACTORY_PRODUCT_DELETED",
    entityType: "Product",
    entityId: productId,
    metadata: { title: product.title },
  });

  revalidatePath("/portal/products");
  revalidatePath("/products");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Certification management
// ---------------------------------------------------------------------------

export async function addFactoryCertification(data: unknown) {
  const { session, enterpriseId } = await getFactoryRepSession();
  if (!enterpriseId) throw new Error("Unauthorized");

  // Zod validation
  const parsed = certificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid certification data",
    };
  }

  const input = parsed.data;

  const cert = await prisma.certification.create({
    data: {
      name: input.name,
      issuer: input.issuer,
      certificateNumber: input.certificateNumber || null,
      issueDate: input.issueDate ? new Date(input.issueDate) : null,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      certificateFileUrl: input.certificateFileUrl || null,
      enterpriseId,
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "CERTIFICATION_SUBMITTED",
    entityType: "Certification",
    entityId: cert.id,
    metadata: { name: cert.name, issuer: cert.issuer },
  });

  revalidatePath("/portal/certifications");
  revalidatePath("/directory");
  return { success: true, certification: cert };
}

// ---------------------------------------------------------------------------
// Inquiry management — scoped to enterprise's own inquiries (IDOR fix)
// ---------------------------------------------------------------------------

export async function addInquiryNote(inquiryId: string, content: string) {
  const { session, enterpriseId } = await getFactoryRepSession();

  // Zod validation
  const parsed = inquiryNoteSchema.safeParse({ inquiryId, content });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  // ABAC: verify this inquiry is directed at the rep's enterprise
  // SUPER_ADMIN bypass allowed
  if ((session.user as any).role === "FACTORY_REP") {
    const targetInquiry = await prisma.leadInquiryItem.findFirst({
      where: {
        inquiryId,
        enterpriseId: enterpriseId!,
      },
      select: { id: true },
    });

    if (!targetInquiry) {
      console.warn(
        `[Security] IDOR attempt: enterpriseId="${enterpriseId}" tried to note inquiryId="${inquiryId}" not addressed to them.`
      );
      throw new Error("Forbidden: This inquiry is not addressed to your factory");
    }
  }

  const authorName = (session.user as any).name || "Representative";

  const note = await prisma.inquiryNote.create({
    data: {
      inquiryId,
      author: authorName,
      content: parsed.data.content,
    },
  });

  revalidatePath("/portal/inquiries");
  revalidatePath("/admin/inquiries");
  return { success: true, note };
}

export async function updateFactoryInquiryStatus(
  inquiryId: string,
  status: "VIEWED" | "RESPONDED" | "CLOSED"
) {
  const { session, enterpriseId } = await getFactoryRepSession();

  // ABAC: FACTORY_REP can only update status of inquiries addressed to their enterprise
  if ((session.user as any).role === "FACTORY_REP") {
    const targetInquiry = await prisma.leadInquiryItem.findFirst({
      where: {
        inquiryId,
        enterpriseId: enterpriseId!,
      },
      select: { id: true },
    });

    if (!targetInquiry) {
      console.warn(
        `[Security] IDOR attempt: enterpriseId="${enterpriseId}" tried to update inquiryId="${inquiryId}" status.`
      );
      throw new Error("Forbidden: This inquiry is not addressed to your factory");
    }
  }

  await prisma.leadInquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  revalidatePath("/portal/inquiries");
  revalidatePath("/admin/inquiries");
  return { success: true };
}
