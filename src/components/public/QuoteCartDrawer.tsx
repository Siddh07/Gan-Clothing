"use client";

import React from "react";
import Link from "next/link";
import { useQuoteCart } from "@/context/QuoteCartContext";
import {
  ShoppingBag,
  X,
  Trash2,
  Building2,
  ArrowRight,
  Package,
  Layers,
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
          className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-5 py-3.5 rounded-full shadow-2xl border-2 border-emerald-500/80 flex items-center space-x-3 hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4 group cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-tight">RFQ Basket</div>
            <div className="text-[10px] text-slate-300 font-medium">
              {itemCount.toLocaleString()} pcs targeted
            </div>
          </div>
        </button>
      )}

      {/* Slide-over Drawer Backdrop & Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit text-lg font-bold">B2B RFQ Basket</h3>
                    <p className="text-xs text-slate-300">
                      {items.length} line-item{items.length === 1 ? "" : "s"} across Nepalese mills
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
                {items.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Your RFQ basket is empty
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Explore export products or verified factories to add sourcing line-items.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/products"
                        onClick={() => setIsDrawerOpen(false)}
                        className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Explore Product Catalog →
                      </Link>
                    </div>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productTitle || "Garment"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-outfit text-sm font-bold text-slate-900 leading-tight">
                              {item.productTitle || "General Sourcing Requirement"}
                            </h4>
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center mt-0.5">
                              <Building2 className="w-3 h-3 mr-1" />
                              {item.enterpriseName}
                            </span>
                            {item.fabricType && (
                              <span className="text-[10px] text-slate-500 block">
                                Fabric: {item.fabricType}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity and specifications */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Target Quantity (pcs)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Colorway / Custom Notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Pantone 19-4052, custom labels"
                            value={item.customSpecifications || ""}
                            onChange={(e) => updateSpecifications(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Total Target Volume:</span>
                    <strong className="text-slate-900">{itemCount.toLocaleString()} pcs</strong>
                  </div>

                  <Link
                    href="/rfq"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all group"
                  >
                    <span>Proceed to Unified B2B RFQ</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
