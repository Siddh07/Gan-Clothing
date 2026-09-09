"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ganepal.org");
  const [password, setPassword] = useState("Admin@GAN2024!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Please verify official email and key.");
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("An authentication gateway error occurred. Contact the secretariat.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] flex items-center justify-center p-0 sm:p-6 lg:p-12">
      {/* 12-Column Precision Ledger Container */}
      <div className="w-full max-w-5xl bg-[#FFFFFF] border border-[#E1E4E7] grid grid-cols-1 lg:grid-cols-12">
        {/* Left 5 Columns: Institutional Masthead & Protocol Ledger */}
        <div className="lg:col-span-5 bg-[#F6F7F8] p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#E1E4E7] flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-mono text-[#6B7280]">
                Garment Association of Nepal
              </div>
              <h1 className="text-xl font-semibold text-[#0D0D0D] tracking-tight mt-1">
                Procurement & Operations Console
              </h1>
              <p className="text-xs text-[#6B7280] leading-relaxed mt-2">
                Restricted terminal for registered garment manufacturers, certified compliance auditors, and trade secretariat officers.
              </p>
            </div>

            {/* Technical Specification Table */}
            <div className="border-t border-b border-[#E1E4E7] py-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[#6B7280]">Terminal</span>
                <span className="text-[#0D0D0D] font-medium">GAN-B2B-OS / v3.2</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6B7280]">Trade protocol</span>
                <span className="text-[#0D0D0D] font-medium">NTPA P.L. 114-125</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6B7280]">Clearing hub</span>
                <span className="text-[#0D0D0D] font-medium">Chobhar Dry Port (ICD)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6B7280]">Security</span>
                <span className="text-[#0D0D0D] font-medium">Encrypted session</span>
              </div>
            </div>
          </div>

          <div className="pt-6 font-mono text-[11px] text-[#6B7280]">
            Official apex trade body established 1986. Kathmandu, Nepal.
          </div>
        </div>

        {/* Right 7 Columns: Form Entry Stage */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-[#FFFFFF]">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#0D0D0D] tracking-tight">
                Sign in to console
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Enter your administrative credentials to access the secretariat workspace.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
                  Official secretariat email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E1E4E7] text-sm text-[#0D0D0D] font-mono focus:border-[#1E3A52]"
                  placeholder="admin@ganepal.org"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-[#0D0D0D]">
                    Administrative password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#6B7280] hover:text-[#0D0D0D] underline"
                  >
                    Reset password
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E1E4E7] text-sm text-[#0D0D0D] font-mono focus:border-[#1E3A52]"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Seed Specimen Credentials Box */}
              <div className="p-3 bg-[#F6F7F8] border border-[#E1E4E7] font-mono text-[11px] text-[#6B7280] space-y-1">
                <div className="text-[#0D0D0D] font-medium">
                  Seed authentication reference:
                </div>
                <div className="flex justify-between">
                  <span>User:</span>
                  <span className="text-[#0D0D0D]">admin@ganepal.org</span>
                </div>
                <div className="flex justify-between">
                  <span>Key:</span>
                  <span className="text-[#0D0D0D]">Admin@GAN2024!</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#1E3A52] hover:bg-[#152A3B] text-white text-xs font-medium tracking-wide uppercase transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <span>Authenticate session</span>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#E1E4E7] text-left">
              <Link
                href="/"
                className="text-xs text-[#6B7280] hover:text-[#0D0D0D] font-mono"
              >
                Return to public directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
