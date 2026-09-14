"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditAction } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

export async function requestPasswordReset(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  // Rate limit: 5 requests per 15 minutes per email
  const rate = await checkRateLimit(cleanEmail, "reset-req", 5, 15 * 60 * 1000);
  if (!rate.success) {
    return {
      success: false,
      error: "Too many password reset requests. Please wait 15 minutes before trying again.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  // Return generic success if user not found to prevent account enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    };
  }

  // Generate crypto token
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  await logAuditAction({
    userId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "User",
    entityId: user.id,
  });

  // Construct link
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/auth/reset-password?token=${token}`;

  // Send email
  await sendEmail({
    to: user.email,
    subject: "Reset Your GAN Trade Platform Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #065f46; margin-bottom: 16px;">Garment Association of Nepal (GAN)</h2>
        <p>Hello ${user.name || "Member"},</p>
        <p>A password reset request was initiated for your GAN platform account. Click the button below to establish a new password. This secure link expires in 60 minutes.</p>
        <div style="margin: 28px 0;">
          <a href="${resetLink}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this, please disregard this email. Your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px;">Garment Association of Nepal (GAN) Secretariat, Kathmandu, Nepal</p>
      </div>
    `,
  });

  return {
    success: true,
    message: "If an account exists with this email, a password reset link has been dispatched.",
    // In local dev without live email, return the link for convenience
    debugLink: process.env.NODE_ENV !== "production" ? resetLink : undefined,
  };
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || token.length < 16) {
    return { success: false, error: "Invalid or missing password reset token." };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return {
      success: false,
      error: "This password reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  await logAuditAction({
    userId: user.id,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "User",
    entityId: user.id,
  });

  return {
    success: true,
    message: "Your password has been reset successfully. You may now log in.",
  };
}
