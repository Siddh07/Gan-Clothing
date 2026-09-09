"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth-reset";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Key } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await resetPassword(token, password);
      if (res.success) {
        setMessage(res.message || null);
      } else {
        setError(res.error || "Failed to reset password.");
      }
    });
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold font-mono text-[#0D0D0D] uppercase tracking-wider">
          Missing Verification Token
        </h3>
        <p className="text-xs font-mono text-[#6B7280]">
          The accessed URL lacks an active verification token or it has expired.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center text-xs font-mono text-[#1E3A52] hover:underline"
        >
          REQUEST NEW VERIFICATION
        </Link>
      </div>
    );
  }

  return (
    <div>
      {message ? (
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border border-[#E1E4E7] text-[#1E3A52] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold font-mono text-[#0D0D0D] uppercase tracking-wider">
            Credentials Synchronized
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed font-sans">{message}</p>
          <div className="pt-4 border-t border-[#E1E4E7]">
            <Link
              href="/admin/login"
              className="inline-flex items-center px-4 py-2 bg-[#1E3A52] text-white rounded-none text-xs font-mono font-medium hover:bg-[#0D0D0D] transition-colors"
            >
              AUTHENTICATE WITH NEW CREDENTIALS
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#F6F7F8] border border-red-600 flex items-start gap-2 text-red-600 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
              New Master Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono text-[#0D0D0D] rounded-none focus:outline-none"
              />
            </div>
            <span className="text-[10px] font-mono text-[#6B7280] mt-1 block">
              MINIMUM 8 CHARACTERS REQUIRED
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#6B7280] mb-1">
              Re-enter New Password
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono text-[#0D0D0D] rounded-none focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-[#1E3A52] hover:bg-[#0D0D0D] text-white text-xs font-mono font-medium rounded-none transition-colors disabled:opacity-50 inline-flex items-center justify-center mt-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                COMMITTING CREDENTIALS...
              </>
            ) : (
              "COMMIT NEW CREDENTIALS"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#0D0D0D]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-[#0D0D0D] text-white font-mono font-bold flex items-center justify-center text-sm">
            GAN
          </div>
        </div>
        <h2 className="mt-4 text-center text-lg font-bold text-[#0D0D0D] tracking-tight">
          Credential Key Replacement
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-[#6B7280]">
          AUTHORIZATION RE-ENROLLMENT
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white p-8 border border-[#E1E4E7]">
          <Suspense fallback={<div className="text-center text-xs font-mono text-[#6B7280] py-8">INITIALIZING SESSION...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
