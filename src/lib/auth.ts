import "server-only";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            enterprise: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || "GAN Member",
          role: user.role,
          enterpriseId: user.enterpriseId || null,
          enterpriseName: user.enterprise?.name || null,
          enterpriseSlug: user.enterprise?.slug || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.enterpriseId = (user as any).enterpriseId;
        token.enterpriseName = (user as any).enterpriseName;
        token.enterpriseSlug = (user as any).enterpriseSlug;
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
      }
      return session;
    },
  },
};
