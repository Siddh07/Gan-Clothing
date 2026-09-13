import { NextRequest, NextResponse } from "next/server";
import { submitInquiry } from "@/actions/inquiry";

/**
 * CSRF protection: verify Origin/Referer header matches our site URL.
 *
 * Threat: State-changing requests from a malicious third-party page
 * that tricks an authenticated user's browser into submitting a form.
 *
 * Note: Next.js Server Actions have built-in CSRF protection via
 * the `Origin` header check. This Route Handler bridges a legacy
 * pattern — adding the same protection explicitly.
 */
function verifyCsrfOrigin(req: NextRequest): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np";

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Extract hostname from NEXT_PUBLIC_SITE_URL for comparison
  let siteHost: string;
  try {
    siteHost = new URL(siteUrl).host;
  } catch {
    siteHost = "ganb2b.org.np";
  }

  // Allow requests from the same host (covers HTTP + HTTPS, www + non-www
  // is handled at the infrastructure level — not here)
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === siteHost;
    } catch {
      return false;
    }
  }

  // Fall back to Referer if Origin is absent (some older browsers / fetch calls)
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === siteHost;
    } catch {
      return false;
    }
  }

  // No Origin or Referer — reject to be safe on state-changing POST
  return false;
}

export async function POST(req: NextRequest) {
  // CSRF check — must come before reading body
  if (!verifyCsrfOrigin(req)) {
    console.warn(
      `[Security] CSRF check failed on /api/inquiry — Origin: ${req.headers.get("origin")}`
    );
    return NextResponse.json(
      { error: "Forbidden: Invalid request origin" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const result = await submitInquiry(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
