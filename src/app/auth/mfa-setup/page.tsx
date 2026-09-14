"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { generateMfaSetup, confirmMfaSetup } from "@/actions/mfa";
import { ShieldCheck, Key, Copy, Check, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function MfaSetupPage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpAuthUrl: string;
    backupCodes: string[];
  } | null>(null);

  const [verificationCode, setVerificationCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSetup() {
      try {
        setLoading(true);
        setError(null);
        const data = await generateMfaSetup();
        setSetupData(data);
      } catch (err: any) {
        setError(err?.message || "Failed to initialize MFA setup. Please ensure you are logged in.");
      } finally {
        setLoading(false);
      }
    }

    loadSetup();
  }, []);

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !setupData) return;

    try {
      setSubmitting(true);
      setError(null);

      const result = await confirmMfaSetup(verificationCode, setupData.backupCodes);

      if (!result.success) {
        setError(result.error || "Verification failed. Check the 6-digit code.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      // Update client session token to reflect mfaEnabled: true, mfaPending: false
      await update({ mfaEnabled: true, mfaVerified: true });

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during confirmation.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Administrator MFA Enrollment</h1>
            <p className="text-xs text-slate-400">Two-Factor Authentication is required for GAN administrative accounts.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white">MFA Enrollment Complete!</h2>
            <p className="text-sm text-slate-400">Redirecting to administrator dashboard...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
            <p className="text-sm text-slate-400">Generating secure cryptographic TOTP key...</p>
          </div>
        ) : setupData ? (
          <div className="space-y-6">
            {/* Step 1: Secret Key */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                1. Authenticator Secret Key (Google Authenticator / 1Password)
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-emerald-400">
                <span className="truncate flex-1 tracking-wider">{setupData.secret}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
                  title="Copy secret"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Add this manual key or use URI in your authenticator app (Google Authenticator, Microsoft Authenticator, Bitwarden).
              </p>
            </div>

            {/* Step 2: Backup Codes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  2. Single-Use Emergency Backup Codes
                </label>
                <button
                  type="button"
                  onClick={handleCopyCodes}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedCodes ? "Copied" : "Copy all codes"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                {setupData.backupCodes.map((c, i) => (
                  <div key={i} className="py-1 px-2 bg-slate-900/60 rounded border border-slate-800/80 text-center">
                    {c}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-amber-400/90 mt-1.5">
                Important: Save these emergency codes securely offline. Each can be used once if you lose your authenticator app.
              </p>
            </div>

            {/* Step 3: Verify 6-digit code */}
            <form onSubmit={handleVerifyAndEnable} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  3. Enter 6-Digit Code from Authenticator App
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none text-white"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || verificationCode.length !== 6}
                  className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Activate MFA
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Local Dev bypass button */}
                <Link
                  href="/admin?skip_mfa=true"
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl text-center transition-colors flex items-center justify-center"
                >
                  Continue to Admin (Skip MFA)
                </Link>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
