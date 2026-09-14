import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function applyCorsHeaders(
  req: Request,
  res: NextResponse
): NextResponse {
  const origin = req.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  if (isAllowed) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin"); // Critical: prevents CDN caching the wrong origin's response
  }
  // Do NOT set Access-Control-Allow-Origin: * on any authenticated route

  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Max-Age", "86400"); // Cache preflight 24h

  return res;
}

export function handlePreflight(req: Request): NextResponse | null {
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(req, res);
  }
  return null;
}
