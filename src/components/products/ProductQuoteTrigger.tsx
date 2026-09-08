"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { QuoteModal } from "@/components/public/QuoteModal";

interface ProductQuoteTriggerProps {
  productId: string;
  productTitle: string;
  enterpriseId: string;
  enterpriseName: string;
  defaultMoq: number;
}

export function ProductQuoteTrigger({
  productId,
  productTitle,
  enterpriseId,
  enterpriseName,
  defaultMoq,
}: ProductQuoteTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg"
      >
        <Send className="w-5 h-5 mr-2" />
        Request a Quote for this Garment
      </button>

      <QuoteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        enterpriseId={enterpriseId}
        enterpriseName={enterpriseName}
        productId={productId}
        productTitle={productTitle}
        defaultMoq={defaultMoq}
      />
    </>
  );
}
