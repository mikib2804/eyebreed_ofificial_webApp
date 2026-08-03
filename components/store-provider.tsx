"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/catalog";
import { copy, type Currency, type Locale } from "@/lib/i18n";

type CartLine = StoreProduct & { quantity: number; selectedSize: string };
type StoreState = {
  locale: Locale;
  currency: Currency;
  cart: CartLine[];
  cartOpen: boolean;
  t: (typeof copy)[Locale];
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: StoreProduct, size?: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
};

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const addToCart = (product: StoreProduct, size?: string) => {
    const selectedSize = size ?? product.sizes.find((variant) => variant.inventory > 0)?.size ?? "ONE SIZE";
    const lineId = `${product.id}:${selectedSize}`;
    setCart((current) => {
      const existing = current.find((item) => `${item.id}:${item.selectedSize}` === lineId);
      return existing
        ? current.map((item) => `${item.id}:${item.selectedSize}` === lineId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, selectedSize, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const value = useMemo(() => ({
    locale, currency, cart, cartOpen, t: copy[locale],
    setLocale, setCurrency, setCartOpen, addToCart,
    updateQuantity: (lineId: string, quantity: number) =>
      setCart((current) => quantity < 1 ? current.filter((i) => `${i.id}:${i.selectedSize}` !== lineId) : current.map((i) => `${i.id}:${i.selectedSize}` === lineId ? { ...i, quantity } : i)),
    removeFromCart: (lineId: string) => setCart((current) => current.filter((i) => `${i.id}:${i.selectedSize}` !== lineId))
  }), [locale, currency, cart, cartOpen]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
