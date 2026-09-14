import { NextRequest, NextResponse } from "next/server";
import { submitInquiry } from "@/actions/inquiry";
import { safeHandler } from "@/lib/safe-handler";
import { applyCorsHeaders, handlePreflight } from "@/lib/cors";
import { logValidationRejection } from "@/lib/logger";
import { getClientIp } from "@/lib/rate-limit";

// CORS: Allowed for configured origins (see CORS_ALLOWED_ORIGINS)

export const OPTIONS = async (req: NextRequest) => {
  const preflight = handlePreflight(req);
  return preflight ?? new NextResponse(null, { status: 204 });
};

/**
 * CSRF protection: verify Origin/Referer header matches our site URL or configured allowed origins.
 */
function verifyCsrfOrigin(req: NextRequest): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np";
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  let siteHost: string;
  try {
    siteHost = new URL(siteUrl).host;
  } catch {
    siteHost = "ganb2b.org.np";
  }

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === siteHost || allowedOrigins.includes(origin)) {
        return true;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === siteHost) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export const POST = safeHandler(async (req: NextRequest) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const ip = getClientIp(req);

  // CSRF check
  if (!verifyCsrfOrigin(req)) {
    return applyCorsHeaders(
      req,
      NextResponse.json(
        { error: "Forbidden: Invalid request origin" },
        { status: 403 }
      )
    );
  }

  const body = await req.json();
  const result = await submitInquiry(body);

  if (!result.success) {
    logValidationRejection({
      route: "/api/inquiry",
      ip,
      errors: result.error,
    });
    return applyCorsHeaders(
      req,
      NextResponse.json({ error: result.error }, { status: 400 })
    );
  }

  return applyCorsHeaders(
    req,
    NextResponse.json(result, { status: 201 })
  );
});
