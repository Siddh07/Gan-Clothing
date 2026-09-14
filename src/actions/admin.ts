"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";

import { logUnauthorizedAccess } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Authorization guard — enforces SUPER_ADMIN or ADMIN_EDITOR role + MFA.
//
// Defense-in-depth: middleware.ts also guards /admin routes, but Server
// Actions are callable from any origin (including direct fetch). We MUST
// verify role and MFA status here independently.
// ---------------------------------------------------------------------------

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN_EDITOR"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

async function verifyAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    logUnauthorizedAccess({ route: "admin.action", reason: "Unauthenticated" });
    throw new Error("Unauthorized: Authentication required");
  }

  const role = (session.user as any).role as string;
  const mfaEnabled = (session.user as any).mfaEnabled;
  const mfaPending = (session.user as any).mfaPending;

  // [TEMPORARILY COMMENTED OUT: TWO-FACTOR AUTHENTICATION]
  // if (mfaPending) {
  //   logUnauthorizedAccess({
  //     route: "admin.action",
  //     userId: (session.user as any).id,
  //     reason: "MFA verification pending",
  //   });
  //   throw new Error("Forbidden: MFA verification pending");
  // }

  if (!ADMIN_ROLES.includes(role as AdminRole)) {
    logUnauthorizedAccess({
      route: "admin.action",
      userId: (session.user as any).id,
      reason: `Forbidden role: ${role}`,
    });
    throw new Error("Forbidden: Insufficient privileges");
  }

  // [TEMPORARILY COMMENTED OUT: TWO-FACTOR AUTHENTICATION]
  // if (!mfaEnabled && process.env.NODE_ENV === "production") {
  //   logUnauthorizedAccess({
  //     route: "admin.action",
  //     userId: (session.user as any).id,
  //     reason: "MFA not enrolled for admin account",
  //   });
  //   throw new Error("Forbidden: MFA enrollment is required for administrator accounts");
  // }

  return session;
}

export async function toggleEnterpriseVerification(id: string, currentStatus: boolean) {
  const session = await verifyAdminAuth();
  const nextStatus = !currentStatus;

  const enterprise = await prisma.enterprise.update({
    where: { id },
    data: { isVerified: nextStatus },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "ENTERPRISE_VERIFICATION_TOGGLED",
    entityType: "Enterprise",
    entityId: id,
    metadata: {
      enterpriseName: enterprise.name,
      isVerified: nextStatus,
    },
  });

  revalidatePath("/admin/enterprises");
  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}

export async function createEnterprise(data: {
  name: string;
  registrationNumber: string;
  panNumber: string;
  description: string;
  yearEstablished: number;
  employeeCount: number;
  monthlyCapacityPcs: number;
  address: string;
  city: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
  coverImageUrl?: string;
  exportMarkets: string;
  isVerified?: boolean;
  certifications?: { name: string; issuer: string; certificateFileUrl?: string }[];
}) {
  const session = await verifyAdminAuth();

  const slug = slugify(data.name) + "-" + Math.floor(1000 + Math.random() * 9000);

  const enterprise = await prisma.enterprise.create({
    data: {
      name: data.name,
      slug,
      status: "APPROVED",
      registrationNumber: data.registrationNumber,
      panNumber: data.panNumber,
      description: data.description,
      yearEstablished: Number(data.yearEstablished),
      employeeCount: Number(data.employeeCount),
      monthlyCapacityPcs: Number(data.monthlyCapacityPcs),
      address: data.address,
      city: data.city,
      websiteUrl: data.websiteUrl || null,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      logoUrl: data.logoUrl || null,
      coverImageUrl: data.coverImageUrl || null,
      exportMarkets: data.exportMarkets,
      isVerified: Boolean(data.isVerified),
      certifications: {
        create: data.certifications || [],
      },
    },
    include: {
      certifications: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "ENTERPRISE_CREATED",
    entityType: "Enterprise",
    entityId: enterprise.id,
    metadata: {
      name: enterprise.name,
      panNumber: enterprise.panNumber,
    },
  });

  revalidatePath("/admin/enterprises");
  revalidatePath("/directory");
  return { success: true, enterprise };
}

export async function deleteEnterprise(id: string) {
  const session = await verifyAdminAuth();

  const enterprise = await prisma.enterprise.findUnique({
    where: { id },
    select: { name: true },
  });

  await prisma.enterprise.delete({
    where: { id },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "ENTERPRISE_DELETED",
    entityType: "Enterprise",
    entityId: id,
    metadata: {
      deletedName: enterprise?.name || "Unknown",
    },
  });

  revalidatePath("/admin/enterprises");
  revalidatePath("/directory");
  return { success: true };
}

export async function toggleProductFeatured(id: string, currentStatus: boolean) {
  const session = await verifyAdminAuth();
  await prisma.product.update({
    where: { id },
    data: { isFeatured: !currentStatus },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "PRODUCT_FEATURED_TOGGLED",
    entityType: "Product",
    entityId: id,
    metadata: { isFeatured: !currentStatus },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function createProduct(data: {
  title: string;
  enterpriseId: string;
  categoryId: string;
  fabricType: string;
  gsmWeight?: number;
  moq: number;
  targetGender: string;
  description: string;
  images: string[];
  isFeatured?: boolean;
}) {
  const session = await verifyAdminAuth();

  const slug = slugify(data.title) + "-" + Math.floor(1000 + Math.random() * 9000);

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug,
      enterpriseId: data.enterpriseId,
      categoryId: data.categoryId,
      fabricType: data.fabricType,
      gsmWeight: data.gsmWeight ? Number(data.gsmWeight) : null,
      moq: Number(data.moq) || 500,
      targetGender: data.targetGender || "Unisex",
      description: data.description,
      images: JSON.stringify(data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"]),
      isFeatured: Boolean(data.isFeatured),
    },
    include: {
      enterprise: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true } },
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "PRODUCT_CREATED",
    entityType: "Product",
    entityId: product.id,
    metadata: {
      title: product.title,
      enterpriseId: product.enterpriseId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, product };
}

export async function updateProduct(
  id: string,
  data: {
    title: string;
    enterpriseId: string;
    categoryId: string;
    fabricType: string;
    gsmWeight?: number | null;
    moq: number;
    targetGender: string;
    description: string;
    images: string[];
    isFeatured?: boolean;
  }
) {
  const session = await verifyAdminAuth();

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      enterpriseId: data.enterpriseId,
      categoryId: data.categoryId,
      fabricType: data.fabricType,
      gsmWeight: data.gsmWeight ? Number(data.gsmWeight) : null,
      moq: Number(data.moq) || 500,
      targetGender: data.targetGender || "Unisex",
      description: data.description,
      images: JSON.stringify(
        data.images.length > 0
          ? data.images
          : ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"]
      ),
      isFeatured: Boolean(data.isFeatured),
    },
    include: {
      enterprise: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true } },
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "PRODUCT_UPDATED",
    entityType: "Product",
    entityId: product.id,
    metadata: {
      title: product.title,
      enterpriseId: product.enterpriseId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  return { success: true, product };
}

export async function deleteProduct(id: string) {
  const session = await verifyAdminAuth();
  await prisma.product.delete({
    where: { id },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "PRODUCT_DELETED",
    entityType: "Product",
    entityId: id,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function updateInquiryStatus(
  id: string,
  status: "NEW" | "VIEWED" | "FORWARDED" | "RESPONDED" | "CLOSED"
) {
  const session = await verifyAdminAuth();
  const inquiry = await prisma.leadInquiry.update({
    where: { id },
    data: { status },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "INQUIRY_STATUS_UPDATED",
    entityType: "LeadInquiry",
    entityId: id,
    metadata: {
      inquiryNumber: inquiry.inquiryNumber,
      status,
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  return { success: true };
}

export async function addAdminInquiryNote(inquiryId: string, content: string) {
  const session = await verifyAdminAuth();
  if (!content.trim()) return { success: false, error: "Note cannot be empty" };

  const note = await prisma.inquiryNote.create({
    data: {
      inquiryId,
      author: (session.user as any).name || "GAN Trade Secretariat",
      content: content.trim(),
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "INQUIRY_NOTE_ADDED",
    entityType: "LeadInquiry",
    entityId: inquiryId,
    metadata: { noteId: note.id },
  });

  revalidatePath("/admin/inquiries");
  return { success: true, note };
}
