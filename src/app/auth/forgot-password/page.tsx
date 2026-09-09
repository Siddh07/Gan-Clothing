"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth-reset";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setDebugLink(null);

    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setMessage(res.message || null);
        if (res.debugLink) {
          setDebugLink(res.debugLink);
        }
      } else {
        setError(res.error || "Failed to process request.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#0D0D0D]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-[#0D0D0D] text-white font-mono font-bold flex items-center justify-center text-sm">
            GAN
          </div>
        </div>
        <h2 className="mt-4 text-center text-lg font-bold text-[#0D0D0D] tracking-tight">
          Credential Recovery Protocol
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-[#6B7280]">
          OFFICIAL VERIFICATION LINK FOR RE-AUTHENTICATION
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white p-8 border border-[#E1E4E7]">
          {message ? (
            <div className="space-y-4 text-center">
              <div className="w-10 h-10 border border-[#E1E4E7] text-[#1E3A52] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold font-mono text-[#0D0D0D] uppercase tracking-wider">
                Verification Dispatched
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed font-sans">{message}</p>

              {debugLink && (
                <div className="p-3 bg-[#F6F7F8] border border-[#1E3A52] text-left text-xs font-mono mt-4">
                  <div className="font-bold text-[#0D0D0D] text-[10px] uppercase mb-1">Development Preview Link:</div>
                  <a
                    href={debugLink}
                    className="text-[#1E3A52] hover:underline break-all text-[10px]"
                  >
                    {debugLink}
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-[#E1E4E7]">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-xs font-mono text-[#1E3A52] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  RETURN TO AUTHENTICATION
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
                  Registered Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@tradeassociation.np"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E1E4E7] focus:border-[#0D0D0D] text-xs font-mono text-[#0D0D0D] rounded-none focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-[#1E3A52] hover:bg-[#0D0D0D] text-white text-xs font-mono font-medium rounded-none transition-colors disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    DISPATCHING VERIFICATION...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 mr-2" />
                    TRANSMIT RESET PROTOCOL
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-[#E1E4E7]">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-xs font-mono text-[#6B7280] hover:text-[#0D0D0D]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
