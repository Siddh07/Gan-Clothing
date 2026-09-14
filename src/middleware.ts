import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = (token?.role as string) || "";
    const mfaPending = Boolean(token?.mfaPending);
    const mfaEnabled = Boolean(token?.mfaEnabled);

    // Bypass login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // [TEMPORARILY COMMENTED OUT: TWO-FACTOR AUTHENTICATION]
    // if (mfaPending && pathname !== "/auth/mfa-verify") {
    //   return NextResponse.redirect(new URL("/auth/mfa-verify", req.url));
    // }

    // Enforce mandatory MFA enrollment for ADMIN roles
    // const allowDevBypass =
    //   process.env.NODE_ENV !== "production" &&
    //   req.nextUrl.searchParams.get("skip_mfa") === "true";
    // if (isAdmin && !mfaEnabled && pathname !== "/auth/mfa-setup" && !allowDevBypass) {
    //   return NextResponse.redirect(new URL("/auth/mfa-setup", req.url));
    // }
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN_EDITOR";

    // 1. Guard /admin routes: Only SUPER_ADMIN and ADMIN_EDITOR allowed
    if (pathname.startsWith("/admin")) {
      if (role === "FACTORY_REP") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // 2. Guard /portal routes: FACTORY_REP and SUPER_ADMIN allowed
    if (pathname.startsWith("/portal")) {
      if (role !== "FACTORY_REP" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname === "/admin/login") return true;
        // Require active token for protected paths
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/portal",
    "/portal/:path*",
    "/auth/mfa-verify",
    "/auth/mfa-setup",
  ],
};
