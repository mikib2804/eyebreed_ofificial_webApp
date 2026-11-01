"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Gift, X } from "lucide-react";
import type { StoreProduct } from "@/lib/catalog";
import { copy, type Currency, type Locale } from "@/lib/i18n";
import { campaignProducts, campaignProductToStoreProduct } from "@/lib/campaign-catalog";
import { useSession } from "next-auth/react";
import { useRef } from "react";

type CartLine = StoreProduct & { quantity: number; selectedSize: string; isGift?: boolean };
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
const HAT_SLUG = "vision-logo-beanie";
const ZIP_SLUG = "vision-washed-zip-hoodie";
const POLO_SLUG = "vision-25-layered-jersey";
const hatCatalogItem = campaignProducts.find((product) => product.slug === HAT_SLUG)!;
const freeHatProduct: StoreProduct = {
  ...campaignProductToStoreProduct(hatCatalogItem),
  id: "promotion-free-vision-hat",
  prices: { USD: 0, ILS: 0, EUR: 0 },
  compareAtPrices: undefined,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const syncedUserCart = useRef(false);
  const [locale, setLocale] = useState<Locale>("he");
  const [currency, setCurrency] = useState<Currency>("ILS");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { try { const saved = localStorage.getItem("eyebreed.cart.v1"); if (saved) setCart(JSON.parse(saved)); } catch {} finally { setHydrated(true); } }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("eyebreed.cart.v1", JSON.stringify(cart.filter(i => !i.isGift))); }, [cart, hydrated]);
  useEffect(() => {
    if (!hydrated || status !== "authenticated" || syncedUserCart.current) return;
    syncedUserCart.current = true;
    void (async () => {
      const response = await fetch("/api/account/cart"); if (!response.ok) return;
      const remote = await response.json() as Array<{productId:string;quantity:number;size:string|null;product:{id:string;slug:string;name:string;nameHe:string|null;material:string|null;images:string[];description:string;descriptionHe:string|null;story:string|null;storyHe:string|null;inventory:number;priceUsd:string;priceIls:string;priceEur:string;variants:Array<{size:string;inventory:number}>}}>; 
      const incoming: CartLine[] = remote.map(({productId,quantity,size,product}) => ({id:productId,slug:product.slug,name:product.name,nameHe:product.nameHe??product.name,material:product.material??"",image:product.images[0]??"",images:product.images,description:product.description,descriptionHe:product.descriptionHe??product.description,story:product.story??"",storyHe:product.storyHe??product.story??"",inventory:product.inventory,sizes:product.variants.map(v=>({size:v.size,inventory:v.inventory})),prices:{USD:Number(product.priceUsd),ILS:Number(product.priceIls),EUR:Number(product.priceEur)},quantity,selectedSize:size??"ONE SIZE"}));
      const merged = [...cart]; for (const line of incoming) { const found=merged.find(i=>i.id===line.id&&i.selectedSize===line.selectedSize); if(found) found.quantity=Math.max(found.quantity,line.quantity); else merged.push(line); }
      setCart(merged);
      await fetch("/api/account/cart",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:merged.filter(i=>!i.isGift).map(i=>({productId:i.id,quantity:i.quantity,size:i.selectedSize,color:null}))})});
    })();
  }, [hydrated, status]);
  useEffect(() => {
    if (!syncedUserCart.current || status !== "authenticated") return;
    const timer = window.setTimeout(() => { void fetch("/api/account/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart.filter(i => !i.isGift).map(i => ({ productId: i.id, quantity: i.quantity, size: i.selectedSize, color: null })) }) }); }, 400);
    return () => window.clearTimeout(timer);
  }, [cart, status]);

  useEffect(() => {
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const paidItemCount = cart.reduce((sum, item) => sum + (item.isGift ? 0 : item.quantity), 0);
    const hasGift = cart.some((item) => item.isGift);

    if (paidItemCount >= 3 && !hasGift) {
      const selectedSize = freeHatProduct.sizes.find((size) => size.inventory > 0)?.size ?? "M";
      setCart((current) => [...current, { ...freeHatProduct, quantity: 1, selectedSize, isGift: true }]);
    } else if (paidItemCount < 3 && hasGift) {
      setCart((current) => current.filter((item) => !item.isGift));
    }
  }, [cart]);

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

  return (
    <StoreContext.Provider value={value}>
      {children}
      <PromotionReminder />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}

function PromotionReminder() {
  const { cart, locale } = useStore();
  const paidItems = cart.filter((item) => !item.isGift);
  const paidItemCount = paidItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasZip = paidItems.some((item) => item.slug === ZIP_SLUG);
  const hasPolo = paidItems.some((item) => item.slug === POLO_SLUG);
  const signature = paidItems.map((item) => `${item.id}:${item.selectedSize}:${item.quantity}`).sort().join("|");
  const [dismissedFor, setDismissedFor] = useState("");

  useEffect(() => setDismissedFor(""), [signature]);

  let message = "";
  if (paidItemCount === 2) {
    message = locale === "he" ? "עוד פריט אחד למשלוח חינם + כובע מתנה" : "Add 1 more item for free shipping + a free hat";
  } else if (hasZip && !hasPolo) {
    message = locale === "he" ? "הוסיפו פולו לזיפ אפ וקבלו משלוח חינם" : "Add the Polo to your Zip Up for free shipping";
  } else if (hasPolo && !hasZip) {
    message = locale === "he" ? "הוסיפו זיפ אפ לפולו וקבלו משלוח חינם" : "Add the Zip Up to your Polo for free shipping";
  }

  if (!message || dismissedFor === signature) return null;

  return (
    <aside className="fixed bottom-5 start-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rtl:translate-x-1/2" aria-live="polite">
      <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-ink px-5 py-4 text-white shadow-[0_18px_60px_rgba(0,0,0,.35)]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600"><Gift size={18} /></span>
        <p className="flex-1 text-xs leading-6 sm:text-sm">{message}</p>
        <button type="button" onClick={() => setDismissedFor(signature)} aria-label={locale === "he" ? "סגירה" : "Close"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 transition hover:bg-white hover:text-ink"><X size={15} /></button>
      </div>
    </aside>
  );
}
