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
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${Math.round(windowMs / 1000)} s`),
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
 * Authentication Route Rate Limiting:
 * 10 failed attempts per 15-minute sliding window per IP.
 */
const AUTH_LIMIT = 10;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function checkAuthRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}> {
  const key = `auth:fail:${ip}`;
  const record = inMemoryStore.get(key);
  const now = Date.now();

  if (!record || now > record.resetAt) {
    return { allowed: true, remaining: AUTH_LIMIT, retryAfterSeconds: 0 };
  }

  if (record.count >= AUTH_LIMIT) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remaining: AUTH_LIMIT - record.count,
    retryAfterSeconds: 0,
  };
}

export async function recordAuthFailure(ip: string): Promise<number> {
  const key = `auth:fail:${ip}`;
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || now > record.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return 1;
  }

  record.count += 1;
  return record.count;
}

export async function resetAuthFailures(ip: string): Promise<void> {
  const key = `auth:fail:${ip}`;
  inMemoryStore.delete(key);
}

/**
 * Extracts a real client IP from headers or NextRequest
 */
export function getClientIpFromHeaders(headers: any): string {
  if (!headers) return "unknown";

  const getHeader = (name: string): string | null => {
    if (typeof headers.get === "function") {
      return headers.get(name);
    }
    return headers[name.toLowerCase()] || headers[name] || null;
  };

  const cfIp = getHeader("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = getHeader("x-forwarded-for");
  if (forwarded) {
    const first = String(forwarded).split(",")[0].trim();
    if (first) return first;
  }

  const realIp = getHeader("x-real-ip");
  if (realIp) return String(realIp).trim();

  return "127.0.0.1";
}

/**
 * Extracts a real client IP from Next.js request headers.
 */
export function getClientIp(req: NextRequest): string {
  return getClientIpFromHeaders(req.headers);
}

