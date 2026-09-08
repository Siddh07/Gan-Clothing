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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-md">
            GAN
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-slate-900 font-outfit">
          Account Password Recovery
        </h2>
        <p className="mt-1 text-center text-xs text-slate-700">
          Enter your registered work email to receive a password reset verification link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {message ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Check Your Inbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

              {debugLink && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 mt-4">
                  <div className="font-bold mb-1">Development Preview Link:</div>
                  <a
                    href={debugLink}
                    className="text-emerald-700 hover:underline break-all font-mono text-[11px]"
                  >
                    {debugLink}
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rep@yourfactory.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 inline-flex items-center justify-center"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Send Password Reset Link
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
