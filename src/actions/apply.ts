"use server";

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "trade-desk@ganepal.org";

export async function submitFactoryApplication(data: {
  companyName: string;
  panNumber: string;
  registrationNumber: string;
  address: string;
  city: string;
  monthlyCapacityPcs: number;
  employeeCount: number;
  description: string;
  yearEstablished?: number;
  exportMarkets: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  password: string;
}) {
  try {
    // 1. Check for duplicate PAN or email
    const existingPan = await prisma.enterprise.findFirst({
      where: { panNumber: data.panNumber.trim() },
    });
    if (existingPan) {
      return { success: false, error: "An enterprise with this PAN number is already registered." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.contactEmail.toLowerCase().trim() },
    });
    if (existingUser) {
      return { success: false, error: "An account with this contact email already exists." };
    }

    // 2. Hash representative password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 3. Create Enterprise in PENDING_REVIEW status and linked FACTORY_REP user
    const slug = slugify(data.companyName) + "-" + Math.floor(1000 + Math.random() * 9000);

    const enterprise = await prisma.enterprise.create({
      data: {
        name: data.companyName,
        slug,
        status: "PENDING_REVIEW",
        registrationNumber: data.registrationNumber,
        panNumber: data.panNumber,
        address: data.address,
        city: data.city,
        yearEstablished: Number(data.yearEstablished) || 2020,
        monthlyCapacityPcs: Number(data.monthlyCapacityPcs),
        employeeCount: Number(data.employeeCount),
        description: data.description,
        exportMarkets: data.exportMarkets || "USA, EU, UK, Japan",
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        isVerified: false,
        coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
        users: {
          create: {
            email: data.contactEmail.toLowerCase().trim(),
            name: data.contactName,
            passwordHash,
            role: "FACTORY_REP",
          },
        },
      },
    });

    await logAuditAction({
      action: "FACTORY_APPLICATION_SUBMITTED",
      entityType: "Enterprise",
      entityId: enterprise.id,
      metadata: { name: enterprise.name, pan: enterprise.panNumber },
    });

    // Notify GAN secretariat
    if (resend) {
      await resend.emails.send({
        from: `GAN Secretariat <${FROM_EMAIL}>`,
        to: [process.env.GAN_ARCHIVE_EMAIL || "leads@ganepal.org"],
        subject: `[GAN MEMBERSHIP] New Application: ${enterprise.name} (PAN: ${enterprise.panNumber})`,
        html: `<p>New factory membership submitted. Check <a href="http://localhost:3000/admin/applications">Admin Review Queue</a>.</p>`,
      });
    }

    revalidatePath("/admin/applications");

    return {
      success: true,
      enterpriseId: enterprise.id,
      message: "Application submitted for GAN Secretariat review.",
    };
  } catch (error: any) {
    console.error("Factory application error:", error);
    return {
      success: false,
      error: error?.message || "Failed to submit application. Please verify your details.",
    };
  }
}

export async function approveFactoryApplication(enterpriseId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === "FACTORY_REP") {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.enterprise.update({
    where: { id: enterpriseId },
    data: {
      status: "APPROVED",
      isVerified: true,
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "ENTERPRISE_APPROVED",
    entityType: "Enterprise",
    entityId: enterpriseId,
    metadata: { name: updated.name },
  });

  // Dispatch welcome email
  if (resend && updated.contactEmail) {
    await resend.emails.send({
      from: `Garment Association of Nepal <${FROM_EMAIL}>`,
      to: [updated.contactEmail],
      subject: `Accreditation Approved: Welcome to Garment Association of Nepal Directory`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #065f46;">Accreditation Approved!</h2>
          <p>Congratulations, <strong>${updated.name}</strong> is now an accredited member of the Garment Association of Nepal B2B Export Directory.</p>
          <p>You may now sign in to the <a href="http://localhost:3000/admin/login">GAN Member Portal</a> to manage your showroom samples, update machine specifications, and review international buyer RFQs.</p>
        </div>
      `,
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin/enterprises");
  revalidatePath("/directory");
  return { success: true };
}

export async function rejectFactoryApplication(enterpriseId: string, reason?: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === "FACTORY_REP") {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.enterprise.update({
    where: { id: enterpriseId },
    data: {
      status: "REJECTED",
      isVerified: false,
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    action: "ENTERPRISE_REJECTED",
    entityType: "Enterprise",
    entityId: enterpriseId,
    metadata: { name: updated.name, reason: reason || "Does not meet criteria" },
  });

  revalidatePath("/admin/applications");
  revalidatePath("/admin/enterprises");
  return { success: true };
}
