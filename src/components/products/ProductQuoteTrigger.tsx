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
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-emerald-300 hover:bg-emerald-400 transition-all shadow-sm cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-950" />
              <span>Added to RFQ Basket!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Add to RFQ Basket</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4 mr-2 text-emerald-400" />
          <span>Direct Quick RFQ</span>
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
