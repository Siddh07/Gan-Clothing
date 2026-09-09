"use client";

import React, { useState } from "react";
import { Send, ShoppingBag, Check } from "lucide-react";
import { QuoteModal } from "@/components/public/QuoteModal";
import { useQuoteCart } from "@/context/QuoteCartContext";

interface ProductQuoteTriggerProps {
  productId: string;
  productTitle: string;
  productImage?: string;
  fabricType?: string;
  enterpriseId: string;
  enterpriseName: string;
  defaultMoq: number;
}

export function ProductQuoteTrigger({
  productId,
  productTitle,
  productImage,
  fabricType,
  enterpriseId,
  enterpriseName,
  defaultMoq,
}: ProductQuoteTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useQuoteCart();

  const handleAddToCart = () => {
    addItem({
      productId,
      productTitle,
      productImage,
      fabricType,
      enterpriseId,
      enterpriseName,
      requestedQuantity: defaultMoq || 500,
      customSpecifications: `Sourcing sample inquiry for ${productTitle}`,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <button
          onClick={handleAddToCart}
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-none uppercase tracking-wider font-bold text-[#0D0D0D] bg-white border border-[#0D0D0D] hover:bg-[#F6F7F8] transition-colors cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 mr-2 text-[#1E3A52]" />
              <span>Added to RFQ Docket</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2 text-[#0D0D0D]" />
              <span>Add to Requisition Docket</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-none uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4 mr-2 text-white" />
          <span>Launch Direct RFQ</span>
        </button>
      </div>

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
