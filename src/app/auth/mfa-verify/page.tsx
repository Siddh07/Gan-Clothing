"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, Key, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function MfaVerifyPage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/auth/mfa-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid verification code. Please try again.");
        setSubmitting(false);
        return;
      }

      // Upgrade session token
      await update({ mfaVerified: true });

      const role = (session?.user as any)?.role;
      if (role === "SUPER_ADMIN" || role === "ADMIN_EDITOR") {
        router.push("/admin");
      } else {
        router.push("/portal");
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during verification.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Two-Factor Authentication</h1>
          <p className="text-xs text-slate-400">
            {useBackupCode
              ? "Enter one of your 10-character emergency backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {useBackupCode ? "Emergency Backup Code" : "Security Code"}
            </label>
            <input
              type="text"
              maxLength={useBackupCode ? 12 : 6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={useBackupCode ? "XXXXX-XXXXX" : "000000"}
              className={`w-full text-center font-mono py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none text-white ${
                useBackupCode ? "text-lg tracking-widest" : "text-2xl tracking-[0.4em]"
              }`}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !code}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode("");
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              {useBackupCode ? "Use standard 6-digit authenticator code" : "Lost authenticator? Use an emergency backup code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
