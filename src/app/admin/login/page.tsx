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
        setError("Invalid email or password. Please try again.");
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-[#3B5BDB] rounded flex items-center justify-center">
              <span className="text-white text-[11px] font-semibold leading-none">G</span>
            </div>
            <span className="text-[15px] font-semibold text-[#1A1A1A]">GAN Trade Platform</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">Garment Association of Nepal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-[#D1D5DB] p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1A1A1A]">Sign in to your workspace</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Enter your credentials to access the admin console.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-sm text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-sm text-[#1A1A1A] bg-white placeholder:text-[#6B7280] focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-[#1A1A1A]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#3B5BDB] hover:text-[#3451C7]"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-sm text-[#1A1A1A] bg-white placeholder:text-[#6B7280] focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#3B5BDB] hover:bg-[#3451C7] text-white text-sm font-medium rounded transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Dev credentials helper */}
          <div className="mt-5 pt-4 border-t border-[#F3F4F6]">
            <p className="text-xs font-medium text-[#6B7280] mb-2">Development credentials</p>
            <div className="bg-[#F8F8F6] rounded border border-[#D1D5DB] p-3 text-xs font-mono space-y-1 text-[#1A1A1A]">
              <div className="flex gap-2">
                <span className="text-[#6B7280] w-14 shrink-0">Email</span>
                <span>admin@ganepal.org</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#6B7280] w-14 shrink-0">Password</span>
                <span>Admin@GAN2024!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-[#6B7280] hover:text-[#1A1A1A] transition">
            Back to public directory
          </Link>
        </div>
      </div>
    </div>
  );
}
