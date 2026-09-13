/**
 * src/lib/rate-limit.ts
 *
 * Dual-mode rate limiter:
 *  - Production: Upstash Redis (@upstash/ratelimit) — survives cold starts,
 *    works across serverless instances, keyed by IP.
 *  - Development / fallback: In-memory sliding-window Map — zero infrastructure,
 *    resets on process restart (acceptable for local dev only).
 *
 * Threat mitigated: Brute-force submissions, RFQ spam, application flooding.
 *
 * Usage:
 *   const { success } = await checkRateLimit(ip, 'rfq', 5, '10 m');
 *   if (!success) return { error: 'Too many requests' };
 */
import "server-only";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Upstash (production)
// ---------------------------------------------------------------------------

let upstashRatelimit: any = null;
let upstashRedis: any = null;

async function initUpstash() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);

    if (!upstashRedis) {
      upstashRedis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }

    return { Ratelimit, redis: upstashRedis };
  } catch {
    // Package not installed — graceful fallback
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback (development / missing env vars)
// ---------------------------------------------------------------------------

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, RateLimitRecord>();

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const existing = inMemoryStore.get(key);

  if (!existing || now > existing.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, reset: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    reset: existing.resetAt,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Checks rate limit for a given key.
 *
 * @param key       Unique identifier — should be IP-based for unauthenticated routes.
 * @param prefix    Action prefix to namespace keys (e.g. 'rfq', 'apply').
 * @param limit     Max requests in the window.
 * @param windowMs  Window in milliseconds (default: 10 minutes = 600_000).
 */
export async function checkRateLimit(
  key: string,
  prefix = "default",
  limit = 5,
  windowMs = 600_000
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const namespaced = `${prefix}:${key}`;

  const upstash = await initUpstash();

  if (upstash) {
    try {
      const { Ratelimit, redis } = upstash;
      const limiter = new Ratelimit.Ratelimit({
        redis,
        limiter: Ratelimit.Ratelimit.slidingWindow(limit, `${Math.round(windowMs / 1000)} s`),
        prefix: `gan:rl:${prefix}`,
      });

      const result = await limiter.limit(key);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (err) {
      console.error("[RateLimit] Upstash error, falling back to in-memory:", err);
    }
  }

  return inMemoryRateLimit(namespaced, limit, windowMs);
}

/**
 * Extracts a real client IP from Next.js request headers.
 * Handles Cloudflare (CF-Connecting-IP), proxies (X-Forwarded-For), and direct connections.
 */
export function getClientIp(req: NextRequest): string {
  // Cloudflare provides the most reliable header
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Standard proxy header — take the first (leftmost = client)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  // Real-IP header (nginx)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
