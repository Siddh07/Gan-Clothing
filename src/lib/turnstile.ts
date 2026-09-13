/**
 * src/lib/turnstile.ts
 *
 * Server-side Cloudflare Turnstile CAPTCHA verification helper.
 * This module MUST remain server-only — never import in Client Components.
 */
import "server-only";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Cloudflare Turnstile challenge token server-side.
 *
 * @param token  The token from `cf-turnstile-response` submitted with the form.
 * @param ip     Optional client IP for extra binding validation.
 * @returns      `{ success: true }` or `{ success: false, errors: string[] }`
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string
): Promise<{ success: boolean; errors?: string[] }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key is configured (dev/staging), skip verification gracefully.
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[Turnstile] TURNSTILE_SECRET_KEY not set in production — rejecting."
      );
      return { success: false, errors: ["CAPTCHA misconfigured"] };
    }
    // Development / test: allow through without a token.
    return { success: true };
  }

  if (!token || token.trim() === "") {
    return { success: false, errors: ["Missing CAPTCHA token"] };
  }

  try {
    const body = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      // Hard timeout — Turnstile API is usually <200ms
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { success: false, errors: ["CAPTCHA verification service error"] };
    }

    const data: TurnstileVerifyResponse = await res.json();

    if (!data.success) {
      return {
        success: false,
        errors: data["error-codes"] ?? ["CAPTCHA verification failed"],
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[Turnstile] Verification error:", err);
    return { success: false, errors: ["CAPTCHA service unavailable"] };
  }
}
