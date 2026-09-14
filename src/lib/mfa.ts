import "server-only";
import { generateSecret, verifySync } from "otplib";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";

// Encryption helpers for storing TOTP secret safely at rest (AES-256-GCM)
function getMfaKey(): Buffer {
  const secretKey =
    process.env.MFA_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    "fallback-dev-insecure-encryption-key-32-chars!!";
  return crypto.createHash("sha256").update(secretKey).digest();
}

export function encryptSecret(plainSecret: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getMfaKey(), iv);
  let encrypted = cipher.update(plainSecret, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptSecret(encryptedPayload: string): string {
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    // Return as-is if unencrypted legacy
    return encryptedPayload;
  }
  const [ivHex, authTagHex, encryptedData] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getMfaKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Generates a new base32 TOTP secret key
 */
export function generateTotpSecret(): string {
  return generateSecret();
}

/**
 * Verifies a 6-digit TOTP code against a base32 secret
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    const rawSecret = secret.includes(":") ? decryptSecret(secret) : secret;
    const result = verifySync({ token: token.trim(), secret: rawSecret });
    return Boolean(result && result.valid);
  } catch {
    return false;
  }
}

/**
 * Generates 8 random 10-character alphanumeric backup codes
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Base32-like, unambiguous
  for (let i = 0; i < 8; i++) {
    let code = "";
    const bytes = crypto.randomBytes(10);
    for (let j = 0; j < 10; j++) {
      code += chars[bytes[j] % chars.length];
    }
    // format as 5-5 with hyphen e.g. ABCDE-FGHIJ
    const formatted = `${code.slice(0, 5)}-${code.slice(5)}`;
    codes.push(formatted);
  }
  return codes;
}

/**
 * Hashes a backup code with bcrypt for secure storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return bcrypt.hash(normalized, 10);
}

/**
 * Verifies a backup code against an array of bcrypt hashes
 */
export async function verifyBackupCode(
  code: string,
  hashes: string[]
): Promise<{ valid: boolean; matchingIndex: number }> {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let i = 0; i < hashes.length; i++) {
    const isMatch = await bcrypt.compare(normalized, hashes[i]);
    if (isMatch) {
      return { valid: true, matchingIndex: i };
    }
  }
  return { valid: false, matchingIndex: -1 };
}
