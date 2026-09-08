import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      enterpriseId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    enterpriseId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    enterpriseId?: string | null;
  }
}
