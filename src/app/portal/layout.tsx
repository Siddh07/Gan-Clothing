import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLink, LogOut } from "lucide-react";
import { PortalNav } from "@/components/portal/PortalNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/admin/login");

  const role = (session.user as any).role;
  const enterpriseId = (session.user as any).enterpriseId;

  if (role !== "FACTORY_REP" && role !== "SUPER_ADMIN") redirect("/admin");

  let enterprise = null;
  if (enterpriseId) {
    enterprise = await prisma.enterprise.findUnique({
      where: { id: enterpriseId },
      select: { id: true, name: true, slug: true, isVerified: true, status: true },
    });
  }

  const userInitials = session.user.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "FR";

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#F7F8FA] border-r border-[#E4E4E7] flex flex-col fixed inset-y-0 left-0">
        {/* Brand zone */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[#E4E4E7] bg-white shrink-0">
          <div className="w-6 h-6 bg-[#2D5BE3] rounded flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-semibold">G</span>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#1A1A1A] leading-tight truncate">
              {enterprise?.name || "Factory portal"}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span>Supplier portal</span>
              {enterprise?.isVerified && (
                <span className="badge badge-success py-0 text-[10px]">Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="px-3 mb-1 text-[11px] font-medium text-[#71717A]">Facility</div>
          <PortalNav enterpriseSlug={enterprise?.slug} />
        </nav>

        {/* User zone */}
        <div className="border-t border-[#E4E4E7] p-4 space-y-2 shrink-0">
          {enterprise?.slug && (
            <Link
              href={`/directory/${enterprise.slug}`}
              target="_blank"
              className="flex items-center justify-between text-xs text-[#6B7280] hover:text-[#1A1A1A] transition-colors py-1"
            >
              <span>Public profile</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-7 h-7 rounded-full bg-[#2D5BE3] flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-semibold">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#1A1A1A] truncate">{session.user.name || "Factory rep"}</div>
              <div className="text-[11px] text-[#6B7280] truncate">{session.user.email}</div>
            </div>
            <Link
              href="/api/auth/signout"
              title="Sign out"
              className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

        <div className="flex-1 ml-60 min-w-0 overflow-y-auto">
        <main className="max-w-[1280px] w-full mx-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
