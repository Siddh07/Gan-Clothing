"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateTotpSecret,
  verifyTotpToken,
  generateBackupCodes,
  hashBackupCode,
  encryptSecret,
} from "@/lib/mfa";
import { logUnauthorizedAccess } from "@/lib/logger";
import { logAuditAction } from "@/lib/audit";

export async function generateMfaSetup() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    logUnauthorizedAccess({ route: "mfa.generateSetup", reason: "Unauthenticated" });
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, mfaEnabled: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const secret = generateTotpSecret();
  const backupCodes = generateBackupCodes();
  const otpAuthUrl = `otpauth://totp/GAN%20Export%20Platform:${encodeURIComponent(
    user.email
  )}?secret=${secret}&issuer=GAN%20Export%20Platform`;

  // Encrypt secret for storage
  const encryptedSecret = encryptSecret(secret);

  // Save pending secret temporarily
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaTotpSecret: encryptedSecret,
    },
  });

  return {
    secret,
    otpAuthUrl,
    backupCodes,
  };
}

export async function confirmMfaSetup(code: string, backupCodes: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    logUnauthorizedAccess({ route: "mfa.confirmSetup", reason: "Unauthenticated" });
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, mfaTotpSecret: true, email: true },
  });

  if (!user || !user.mfaTotpSecret) {
    return { success: false, error: "MFA setup has not been initiated." };
  }

  const isValid = verifyTotpToken(user.mfaTotpSecret, code);
  if (!isValid) {
    return { success: false, error: "Invalid verification code. Please check your authenticator app." };
  }

  // Hash all backup codes with bcrypt
  const hashedBackupCodes = await Promise.all(
    backupCodes.map((c) => hashBackupCode(c))
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaBackupCodes: JSON.stringify(hashedBackupCodes),
    },
  });

  await logAuditAction({
    userId,
    action: "MFA_ENABLED",
    entityType: "User",
    entityId: userId,
  });

  return {
    success: true,
    message: "Two-factor authentication has been successfully enabled.",
  };
}
