"use server";

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import { factoryApplicationSchema } from "@/lib/schemas";
import { logValidationRejection } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "trade-desk@ganepal.org";

// ---------------------------------------------------------------------------
// Public action — factory membership application
// ---------------------------------------------------------------------------

export async function submitFactoryApplication(data: unknown) {
  // 1. Honeypot — check before Zod parse so bots get a fast silent exit
  const raw = data as Record<string, unknown>;
  if (raw?.honeypot && String(raw.honeypot).trim().length > 0) {
    console.warn("[Security] Honeypot triggered on factory application — silent rejection");
    return { success: true, message: "Application submitted for GAN Secretariat review." };
  }

  // 2. Zod validation — strict types and bounds on all fields
  const parsed = factoryApplicationSchema.safeParse(data);
  if (!parsed.success) {
    logValidationRejection({
      route: "action.submitFactoryApplication",
      ip: "server-action",
      errors: parsed.error.issues,
    });
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid application data. Please check your inputs.",
    };
  }

  const input = parsed.data;

  try {
    // 3. Check for duplicate PAN or email
    const existingPan = await prisma.enterprise.findFirst({
      where: { panNumber: input.panNumber },
      select: { id: true },
    });
    if (existingPan) {
      return { success: false, error: "An enterprise with this PAN number is already registered." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.contactEmail },
      select: { id: true },
    });
    if (existingUser) {
      return { success: false, error: "An account with this contact email already exists." };
    }

    // 4. Hash representative password
    const salt = await bcrypt.genSalt(12); // cost factor 12 (stronger than original 10)
    const passwordHash = await bcrypt.hash(input.password, salt);

    // 5. Create Enterprise in PENDING_REVIEW status and linked FACTORY_REP user
    const slug = slugify(input.companyName) + "-" + Math.floor(1000 + Math.random() * 9000);

    const enterprise = await prisma.enterprise.create({
      data: {
        name: input.companyName,
        slug,
        status: "PENDING_REVIEW",
        registrationNumber: input.registrationNumber,
        panNumber: input.panNumber,
        address: input.address,
        city: input.city,
        yearEstablished: Number(input.yearEstablished) || 2020,
        monthlyCapacityPcs: Number(input.monthlyCapacityPcs),
        employeeCount: Number(input.employeeCount),
        description: input.description,
        exportMarkets: input.exportMarkets || "USA, EU, UK, Japan",
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        isVerified: false,
        coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
        users: {
          create: {
            email: input.contactEmail,
            name: input.contactName,
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
        html: `<p>New factory membership submitted. Check the <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np"}/admin/applications">Admin Review Queue</a>.</p>`,
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

// ---------------------------------------------------------------------------
// Admin-only actions — explicitly allowlisted roles
// ---------------------------------------------------------------------------

const ADMIN_ALLOWLIST = ["SUPER_ADMIN", "ADMIN_EDITOR"] as const;

async function verifyAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const role = (session.user as any).role as string;
  if (!ADMIN_ALLOWLIST.includes(role as (typeof ADMIN_ALLOWLIST)[number])) {
    console.warn(`[Security] Non-admin role="${role}" attempted admin action — denied.`);
    throw new Error("Forbidden: Admin privileges required");
  }
  return session;
}

export async function approveFactoryApplication(enterpriseId: string) {
  const session = await verifyAdminSession();

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
          <p>You may now sign in to the <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np"}/admin/login">GAN Member Portal</a> to manage your showroom samples, update machine specifications, and review international buyer RFQs.</p>
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
  const session = await verifyAdminSession();

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
