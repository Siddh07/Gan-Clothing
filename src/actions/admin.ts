"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function verifyAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}

export async function toggleEnterpriseVerification(id: string, currentStatus: boolean) {
  await verifyAuth();
  await prisma.enterprise.update({
    where: { id },
    data: { isVerified: !currentStatus },
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
  await verifyAuth();

  const slug = slugify(data.name) + "-" + Math.floor(1000 + Math.random() * 9000);

  const enterprise = await prisma.enterprise.create({
    data: {
      name: data.name,
      slug,
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
  });

  revalidatePath("/admin/enterprises");
  revalidatePath("/directory");
  return { success: true, enterprise };
}

export async function deleteEnterprise(id: string) {
  await verifyAuth();
  await prisma.enterprise.delete({
    where: { id },
  });
  revalidatePath("/admin/enterprises");
  revalidatePath("/directory");
  return { success: true };
}

export async function toggleProductFeatured(id: string, currentStatus: boolean) {
  await verifyAuth();
  await prisma.product.update({
    where: { id },
    data: { isFeatured: !currentStatus },
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
  await verifyAuth();

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
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, product };
}

export async function deleteProduct(id: string) {
  await verifyAuth();
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function updateInquiryStatus(id: string, status: "NEW" | "FORWARDED" | "CLOSED") {
  await verifyAuth();
  await prisma.leadInquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  return { success: true };
}
