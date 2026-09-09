"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center px-4 py-2 bg-[#0D0D0D] hover:bg-[#1E3A52] text-white rounded-none font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5 mr-1.5" />
      Print / Save as PDF
    </button>
  );
}
