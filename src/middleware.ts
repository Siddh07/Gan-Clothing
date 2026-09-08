import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = (token?.role as string) || "";

    // 1. Guard /admin routes: Only SUPER_ADMIN and ADMIN_EDITOR allowed
    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin/login") {
        return NextResponse.next();
      }

      if (role === "FACTORY_REP") {
        // Factory representative trying to access secretariat admin -> redirect to factory portal
        return NextResponse.redirect(new URL("/portal", req.url));
      }

      if (role !== "SUPER_ADMIN" && role !== "ADMIN_EDITOR") {
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
  matcher: ["/admin/((?!login).*)", "/portal/:path*"],
};
