"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/database";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  totalCount: number;
  subtotal: number;
  bumpVersion: number;
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [bumpVersion, setBumpVersion] = useState(0);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const i = prev.findIndex((l) => l.product.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setBumpVersion((v) => v + 1);
  }, []);

  const removeLine = useCallback((productId: string) => {
    setItems((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeLine(productId);
      return;
    }
    setItems((prev) =>
      prev.map((l) =>
        l.product.id === productId ? { ...l, quantity } : l
      )
    );
  }, [removeLine]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { totalCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const line of items) {
      count += line.quantity;
      sum += Number(line.product.price) * line.quantity;
    }
    return { totalCount: count, subtotal: sum };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      totalCount,
      subtotal,
      bumpVersion,
      isOpen,
      addItem,
      removeLine,
      setQuantity,
      openCart,
      closeCart,
    }),
    [
      items,
      totalCount,
      subtotal,
      bumpVersion,
      isOpen,
      addItem,
      removeLine,
      setQuantity,
      openCart,
      closeCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return ctx;
}
