"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { slug: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  add: (slug: string, qty: number, available: number) => boolean;
  setQty: (slug: string, qty: number, available: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "badezimmer-cart";

function sanitize(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as CartItem;
      return typeof candidate.slug === "string" && Number.isInteger(candidate.qty) && candidate.qty > 0;
    })
    .slice(0, 4);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")));
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((slug: string, qty: number, available: number) => {
    let added = false;
    setItems((prev) => {
      const current = prev.find((item) => item.slug === slug)?.qty ?? 0;
      if (qty < 1 || current + qty > available) return prev;
      added = true;
      const existing = prev.find((item) => item.slug === slug);
      if (!existing) return [...prev, { slug, qty }];
      return prev.map((item) => (item.slug === slug ? { ...item, qty: item.qty + qty } : item));
    });
    // Counted for the add-to-cart numbers in /admin. A failed count never blocks the cart.
    if (added) {
      void fetch("/api/cart-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        keepalive: true,
      }).catch(() => undefined);
    }
    return added;
  }, []);

  const setQty = useCallback((slug: string, qty: number, available: number) => {
    if (!Number.isFinite(qty)) return;
    const next = Math.max(0, Math.min(available, Math.floor(qty)));
    setItems((prev) => {
      if (next === 0) return prev.filter((item) => item.slug !== slug);
      return prev.map((item) => (item.slug === slug ? { ...item, qty: next } : item));
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [add, clear, items, ready, remove, setQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart muss innerhalb von CartProvider stehen.");
  return value;
}
