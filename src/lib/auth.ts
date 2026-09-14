import "server-only";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  checkAuthRateLimit,
  recordAuthFailure,
  resetAuthFailures,
  getClientIpFromHeaders,
} from "@/lib/rate-limit";
import { logAuthFailure, logAuthSuccess } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (28,800 seconds) - limits stolen token lifespan
    updateAge: 60 * 60, // 1 hour (3,600 seconds) - refresh session token if > 1h old
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@ganepal.org" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = getClientIpFromHeaders(req?.headers);

        if (!credentials?.email || !credentials?.password) {
          logAuthFailure({ ip, reason: "invalid_password" });
          throw new Error("Please enter both email and password");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1. IP-level Rate Limiting: 10 failed attempts per 15-minute sliding window
        const ipRate = await checkAuthRateLimit(ip);
        if (!ipRate.allowed) {
          logAuthFailure({
            ip,
            email: normalizedEmail,
            reason: "rate_limited",
          });
          throw new Error("Too many login attempts. Please try again in 15 minutes.");
        }

        // 2. Fetch User Record
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: {
            enterprise: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        });

        // 3. Account-level Lockout Check
        if (user && user.lockedUntil) {
          if (new Date() < user.lockedUntil) {
            logAuthFailure({
              ip,
              email: normalizedEmail,
              reason: "account_locked",
            });
            // Do NOT increment IP counter further if account is already locked
            throw new Error("Account temporarily locked. Please try again in 30 minutes.");
          }
        }

        // 4. Verify Credentials
        const isPasswordValid =
          user && user.passwordHash
            ? await bcrypt.compare(credentials.password, user.passwordHash)
            : false;

        if (!user || !isPasswordValid) {
          // Increment IP-level failed attempts
          await recordAuthFailure(ip);

          // Handle Account-level Lockout Counter
          if (user) {
            const nextAttempts = (user.failedLoginAttempts || 0) + 1;
            if (nextAttempts >= 5) {
              // Lock for 30 minutes and reset failed attempts
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: 0,
                  lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
                },
              });
            } else {
              await prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: nextAttempts },
              });
            }
          }

          logAuthFailure({
            ip,
            email: normalizedEmail,
            reason: "invalid_password",
          });

          // Generic message regardless of whether user exists
          throw new Error("Invalid credentials");
        }

        // 5. Successful Password Verification
        await resetAuthFailures(ip);

        // [TEMPORARILY COMMENTED OUT: TWO-FACTOR AUTHENTICATION]
        // if (user.mfaEnabled) {
        //   return {
        //     id: user.id,
        //     email: user.email,
        //     name: user.name || "GAN Member",
        //     role: user.role,
        //     enterpriseId: user.enterpriseId || null,
        //     enterpriseName: user.enterprise?.name || null,
        //     enterpriseSlug: user.enterprise?.slug || null,
        //     mfaEnabled: true,
        //     mfaPending: true,
        //   } as any;
        // }

        // Clear any lockout counters on complete success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        logAuthSuccess({
          ip,
          userId: user.id,
          role: user.role,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || "GAN Member",
          role: user.role,
          enterpriseId: user.enterpriseId || null,
          enterpriseName: user.enterprise?.name || null,
          enterpriseSlug: user.enterprise?.slug || null,
          mfaEnabled: false,
          mfaPending: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.enterpriseId = (user as any).enterpriseId;
        token.enterpriseName = (user as any).enterpriseName;
        token.enterpriseSlug = (user as any).enterpriseSlug;
        token.mfaEnabled = (user as any).mfaEnabled ?? false;
        token.mfaPending = (user as any).mfaPending ?? false;
      }

      // Handle session token updates and MFA upgrade
      if (trigger === "update" && session) {
        if (session.mfaVerified === true) {
          token.mfaPending = false;
        }
        if (session.mfaEnabled !== undefined) {
          token.mfaEnabled = session.mfaEnabled;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).enterpriseId = (token.enterpriseId as string) || null;
        (session.user as any).enterpriseName = (token.enterpriseName as string) || null;
        (session.user as any).enterpriseSlug = (token.enterpriseSlug as string) || null;
        (session.user as any).mfaEnabled = (token.mfaEnabled as boolean) ?? false;
        (session.user as any).mfaPending = (token.mfaPending as boolean) ?? false;
      }
      return session;
    },
  },
};
