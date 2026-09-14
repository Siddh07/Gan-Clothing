"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log obfuscated error reference for debugging without exposing stack trace to client
    if (error.digest) {
      console.error("[System Error] Reference Digest:", error.digest);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full text-center p-8 bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          An Unexpected Error Occurred
        </h1>

        <p className="text-sm text-slate-400 mb-6">
          The operation could not be completed. Our security monitoring systems have recorded this event.
        </p>

        {error.digest && (
          <div className="mb-6 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 select-all">
            Incident Reference: <span className="text-emerald-400">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
