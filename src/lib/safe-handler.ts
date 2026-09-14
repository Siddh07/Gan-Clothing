import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";
import { ZodError } from "zod";

type Handler = (req: NextRequest, ctx?: any) => Promise<NextResponse>;

export function safeHandler(handler: Handler): Handler {
  return async (req: NextRequest, ctx?: any) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      // Log the full error internally with stack trace
      logger.error({
        event: "unhandled_error",
        route: req.nextUrl.pathname,
        method: req.method,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : String(error),
      });

      // Never expose internal error details to the client
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid request payload." },
          { status: 400 }
        );
      }

      if (
        error instanceof Error &&
        (error.message === "Unauthorized" ||
          error.message.startsWith("Unauthorized:"))
      ) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      if (
        error instanceof Error &&
        (error.message === "Forbidden" ||
          error.message.startsWith("Forbidden:"))
      ) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }

      // Generic 500 — no stack trace, no internal detail
      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again." },
        { status: 500 }
      );
    }
  };
}
