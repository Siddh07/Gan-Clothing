import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken, verifyBackupCode } from "@/lib/mfa";
import { getClientIp } from "@/lib/rate-limit";
import { logAuthFailure, logAuthSuccess } from "@/lib/logger";
import { safeHandler } from "@/lib/safe-handler";

// CORS: Internal only — no cross-origin access
export const POST = safeHandler(async (req: NextRequest) => {
  const ip = getClientIp(req);
  const session = await getServerSession(authOptions);
  const body = await req.json().catch(() => ({}));
  const code = (body.code || "").trim();

  const userId = (session?.user as any)?.id || body.userId;
  const userEmail = session?.user?.email || body.email;

  if (!userId && !userEmail) {
    logAuthFailure({ ip, reason: "mfa_failed" });
    return NextResponse.json({ error: "Unauthorized session." }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: userId ? { id: userId } : { email: userEmail },
  });

  if (!user || !user.mfaEnabled || !user.mfaTotpSecret) {
    logAuthFailure({ ip, email: userEmail, reason: "mfa_failed" });
    return NextResponse.json({ error: "MFA is not configured for this account." }, { status: 400 });
  }

  if (user.lockedUntil && new Date() < user.lockedUntil) {
    logAuthFailure({ ip, email: user.email, reason: "account_locked" });
    return NextResponse.json(
      { error: "Account temporarily locked. Please try again later." },
      { status: 423 }
    );
  }

  if (!code) {
    return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
  }

  let isValid = false;
  let backupUsedIndex = -1;

  if (/^\d{6}$/.test(code)) {
    isValid = verifyTotpToken(user.mfaTotpSecret, code);
  } else {
    let storedHashes: string[] = [];
    try {
      storedHashes = JSON.parse(user.mfaBackupCodes || "[]");
    } catch {
      storedHashes = [];
    }

    const backupCheck = await verifyBackupCode(code, storedHashes);
    if (backupCheck.valid) {
      isValid = true;
      backupUsedIndex = backupCheck.matchingIndex;
    }
  }

  if (!isValid) {
    const nextAttempts = (user.failedLoginAttempts || 0) + 1;
    if (nextAttempts >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: nextAttempts },
      });
    }

    logAuthFailure({ ip, email: user.email, reason: "mfa_failed" });
    return NextResponse.json(
      { error: "Invalid verification code. Please try again." },
      { status: 400 }
    );
  }

  let updatedBackupCodes = user.mfaBackupCodes;
  if (backupUsedIndex >= 0) {
    const hashes: string[] = JSON.parse(user.mfaBackupCodes || "[]");
    hashes.splice(backupUsedIndex, 1);
    updatedBackupCodes = JSON.stringify(hashes);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      mfaBackupCodes: updatedBackupCodes,
    },
  });

  logAuthSuccess({
    ip,
    userId: user.id,
    role: user.role,
  });

  return NextResponse.json({
    success: true,
    message: "MFA verified successfully.",
    mfaVerified: true,
  });
});
