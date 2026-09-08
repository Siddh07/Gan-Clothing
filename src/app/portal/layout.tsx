import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Package,
  Inbox,
  ShieldCheck,
  ExternalLink,
  LogOut,
  User,
  Layers,
} from "lucide-react";
import { PortalNav } from "@/components/portal/PortalNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const role = (session.user as any).role;
  const enterpriseId = (session.user as any).enterpriseId;

  if (role !== "FACTORY_REP" && role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  let enterprise = null;
  if (enterpriseId) {
    enterprise = await prisma.enterprise.findUnique({
      where: { id: enterpriseId },
      select: { id: true, name: true, slug: true, isVerified: true, status: true },
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-sm">
                GAN
              </div>
              <div className="truncate">
                <h2 className="font-outfit font-bold text-white text-sm truncate">
                  {enterprise?.name || "Factory Portal"}
                </h2>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                  <span>Factory Workspace</span>
                  {enterprise?.isVerified && <span>• Verified</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <PortalNav enterpriseSlug={enterprise?.slug} />
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {enterprise?.slug && (
            <Link
              href={`/directory/${enterprise.slug}`}
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center">
                <ExternalLink className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                View Public Profile
              </span>
            </Link>
          )}

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <div className="font-semibold text-white truncate">
                  {session.user.name || "Factory Rep"}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium truncate">
                  {session.user.email}
                </div>
              </div>
            </div>

            <Link
              href="/api/auth/signout"
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
