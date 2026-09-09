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
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col md:flex-row text-[#0D0D0D]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E1E4E7] flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#E1E4E7]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#0D0D0D] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                GAN
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-sm text-[#0D0D0D] leading-tight truncate">
                  {enterprise?.name || "Factory Portal"}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6B7280] mt-0.5">
                  <span>PLANT TERMINAL</span>
                  {enterprise?.isVerified && (
                    <span className="tag-approved text-[9px] py-0 px-1">ACCREDITED</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-2">
            <div className="px-4 py-1.5 text-[10px] font-mono uppercase text-[#6B7280]">
              Facility Operations
            </div>
            <PortalNav enterpriseSlug={enterprise?.slug} />
          </div>
        </div>

        {/* User profile & Public Link */}
        <div className="p-3 border-t border-[#E1E4E7] space-y-2 bg-[#F6F7F8]/50">
          {enterprise?.slug && (
            <Link
              href={`/directory/${enterprise.slug}`}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D] hover:bg-white border border-transparent hover:border-[#E1E4E7] transition-colors"
            >
              <span className="flex items-center">
                <ExternalLink className="w-3.5 h-3.5 mr-2 text-[#1E3A52]" />
                Public Directory Entry
              </span>
            </Link>
          )}

          <div className="p-2.5 bg-white border border-[#E1E4E7] flex items-center justify-between">
            <div className="truncate text-xs">
              <div className="font-bold text-[#0D0D0D] truncate">
                {session.user.name || "Factory Representative"}
              </div>
              <div className="text-[10px] font-mono text-[#6B7280] truncate">
                {session.user.email}
              </div>
            </div>

            <Link
              href="/api/auth/signout"
              title="Sign Out"
              className="p-1.5 text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F6F7F8] border border-transparent hover:border-[#E1E4E7] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
