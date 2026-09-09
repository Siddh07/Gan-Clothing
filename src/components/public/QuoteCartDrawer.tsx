"use client";

import React from "react";
import Link from "next/link";
import { useQuoteCart } from "@/context/QuoteCartContext";
import {
  ShoppingBag,
  X,
  Trash2,
  Building2,
  Package,
} from "lucide-react";

export function QuoteCartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    updateSpecifications,
    isDrawerOpen,
    setIsDrawerOpen,
    itemCount,
  } = useQuoteCart();

  return (
    <>
      {/* Floating Indicator Trigger Button */}
      {items.length > 0 && !isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0D0D0D] text-white px-5 py-3 rounded-none shadow-xl border border-[#0D0D0D] flex items-center space-x-3 hover:bg-[#1E3A52] transition-colors group cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="absolute -top-2.5 -right-2.5 bg-[#1E3A52] text-white font-mono text-[9px] font-bold w-4 h-4 rounded-none flex items-center justify-center border border-white">
              {items.length}
            </span>
          </div>
          <div className="text-left font-mono">
            <div className="text-xs uppercase tracking-wider font-bold">RFQ Basket</div>
            <div className="text-[10px] text-[#E1E4E7]">
              {itemCount.toLocaleString()} pcs targeted
            </div>
          </div>
        </button>
      )}

      {/* Slide-over Drawer Backdrop & Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-[#0D0D0D]/60 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#0D0D0D] animate-in slide-in-from-right duration-150">
              {/* Drawer Header */}
              <div className="p-6 bg-[#0D0D0D] text-white flex items-center justify-between border-b border-[#0D0D0D]">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#E1E4E7]">
                    Active Procurement Ledger
                  </div>
                  <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-white mt-0.5">
                    B2B Requisition Docket
                  </h3>
                  <p className="font-mono text-[11px] text-[#E1E4E7] mt-0.5">
                    {items.length} line-item{items.length === 1 ? "" : "s"} designated
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-[#E1E4E7] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#E1E4E7]">
                {items.length === 0 ? (
                  <div className="text-center py-16 space-y-3 font-mono">
                    <div className="w-10 h-10 border border-[#E1E4E7] text-[#6B7280] flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-xs uppercase tracking-wider font-bold text-[#0D0D0D]">
                      RFQ Docket Empty
                    </p>
                    <p className="text-xs text-[#6B7280] max-w-xs mx-auto font-sans">
                      Select specimens from the product showroom or verified mills to compile an RFQ.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/products"
                        onClick={() => setIsDrawerOpen(false)}
                        className="inline-block px-4 py-2 border border-[#0D0D0D] text-xs font-mono uppercase tracking-wider font-bold text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors"
                      >
                        Explore Product Catalog
                      </Link>
                    </div>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-none bg-[#F6F7F8] shrink-0 overflow-hidden border border-[#E1E4E7]">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productTitle || "Garment"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-mono text-xs font-bold text-[#0D0D0D] uppercase leading-snug">
                              {item.productTitle || "General Sourcing Line-Item"}
                            </h4>
                            <span className="font-mono text-[10px] text-[#1E3A52] flex items-center mt-0.5">
                              <Building2 className="w-3 h-3 mr-1" />
                              {item.enterpriseName}
                            </span>
                            {item.fabricType && (
                              <span className="font-mono text-[10px] text-[#6B7280] block">
                                Fiber: {item.fabricType}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(idx)}
                          className="text-[#6B7280] hover:text-[#0D0D0D] p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity and specifications */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block font-mono text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                            Target Quantity (pcs)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-none border border-[#E1E4E7] font-mono text-xs text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                            Colorway / Tech Notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Pantone 19-4052, custom labels"
                            value={item.customSpecifications || ""}
                            onChange={(e) => updateSpecifications(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-none border border-[#E1E4E7] font-mono text-xs text-[#0D0D0D] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D0D0D]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-6 bg-[#F6F7F8] border-t border-[#E1E4E7] space-y-3 font-mono">
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span className="uppercase tracking-wider">Total Target Volume:</span>
                    <strong className="text-[#0D0D0D]">{itemCount.toLocaleString()} pcs</strong>
                  </div>

                  <Link
                    href="/rfq"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-none text-xs font-mono uppercase tracking-wider font-bold text-white bg-[#0D0D0D] hover:bg-[#1E3A52] transition-colors"
                  >
                    Proceed to Commercial RFQ Desk
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
