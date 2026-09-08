"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";

async function getFactoryRepSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized: Active session required");
  }
  const role = (session.user as any).role;
  const enterpriseId = (session.user as any).enterpriseId;

  if (role !== "FACTORY_REP" && role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Factory Representative or Super Admin required");
  }

  return { session, role, enterpriseId };
}

export async function updateFactoryProfile(data: {
  enterpriseId: string;
  name: string;
  description: string;
  monthlyCapacityPcs: number;
  employeeCount: number;
  address: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  coverImageUrl?: string;
  exportMarkets: string;
}) {
  const { session, role, enterpriseId: userEntId } = await getFactoryRepSession();

  // Scoping check: Factory Rep can only update their own linked factory
  const targetId = role === "SUPER_ADMIN" ? data.enterpriseId : userEntId;
  if (!targetId) {
    throw new Error("No linked factory found for representative");
  }

  const updated = await prisma.enterprise.update({
    where: { id: targetId },
    data: {
      name: data.name,
      description: data.description,
      monthlyCapacityPcs: Number(data.monthlyCapacityPcs),
      employeeCount: Number(data.employeeCount),
      address: data.address,
      city: data.city,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      websiteUrl: data.websiteUrl || null,
      coverImageUrl: data.coverImageUrl || null,
      exportMarkets: data.exportMarkets,
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

export async function addFactoryCertification(data: {
  name: string;
  issuer: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  certificateFileUrl?: string;
}) {
  const { session, enterpriseId } = await getFactoryRepSession();
  if (!enterpriseId) throw new Error("Unauthorized");

  const cert = await prisma.certification.create({
    data: {
      name: data.name,
      issuer: data.issuer,
      certificateNumber: data.certificateNumber || null,
      issueDate: data.issueDate ? new Date(data.issueDate) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      certificateFileUrl: data.certificateFileUrl || null,
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

export async function addInquiryNote(inquiryId: string, content: string) {
  const { session } = await getFactoryRepSession();
  const authorName = (session.user as any).name || "Representative";

  const note = await prisma.inquiryNote.create({
    data: {
      inquiryId,
      author: authorName,
      content,
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
  await getFactoryRepSession();

  await prisma.leadInquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  revalidatePath("/portal/inquiries");
  revalidatePath("/admin/inquiries");
  return { success: true };
}
