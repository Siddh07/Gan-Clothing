"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { QuoteCartItem } from "@/types";

interface QuoteCartContextType {
  items: QuoteCartItem[];
  addItem: (item: QuoteCartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateSpecifications: (index: number, specs: string) => void;
  clearCart: () => void;
  itemCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined);

const STORAGE_KEY = "gan_rfq_cart_items_v2";

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load quote cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save quote cart to localStorage", e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (newItem: QuoteCartItem) => {
    setItems((prev) => {
      // Check if this exact product from this enterprise already exists
      const existingIdx = prev.findIndex(
        (i) => i.enterpriseId === newItem.enterpriseId && i.productId === newItem.productId
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].requestedQuantity += newItem.requestedQuantity;
        if (newItem.customSpecifications) {
          updated[existingIdx].customSpecifications = newItem.customSpecifications;
        }
        return updated;
      }

      return [...prev, newItem];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    setItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].requestedQuantity = Math.max(1, quantity);
      }
      return updated;
    });
  };

  const updateSpecifications = (index: number, specs: string) => {
    setItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].customSpecifications = specs;
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const itemCount = items.reduce((acc, curr) => acc + curr.requestedQuantity, 0);

  return (
    <QuoteCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateSpecifications,
        clearCart,
        itemCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const context = useContext(QuoteCartContext);
  if (!context) {
    throw new Error("useQuoteCart must be used within a QuoteCartProvider");
  }
  return context;
}
