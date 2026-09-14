import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "gan-export-platform", env: process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Security event helpers with consistent schema
export function logAuthFailure(context: {
  ip: string;
  email?: string;
  reason: "invalid_password" | "account_locked" | "mfa_failed" | "rate_limited";
}) {
  logger.warn({ event: "auth.failure", ...context });
}

export function logAuthSuccess(context: {
  ip: string;
  userId: string;
  role: string;
}) {
  logger.info({ event: "auth.success", ...context });
}

export function logValidationRejection(context: {
  route: string;
  ip: string;
  errors: unknown;
}) {
  logger.warn({ event: "validation.rejection", ...context });
}

export function logRateLimitHit(context: { route: string; ip: string }) {
  logger.warn({ event: "rate_limit.hit", ...context });
}

export function logUnauthorizedAccess(context: {
  route: string;
  userId?: string;
  reason: string;
}) {
  logger.error({ event: "authz.unauthorized", ...context });
}

export function logFileUploadRejection(context: {
  ip: string;
  fileName: string;
  reason: "mime_mismatch" | "size_exceeded" | "magic_bytes_failed";
}) {
  logger.warn({ event: "upload.rejected", ...context });
}
