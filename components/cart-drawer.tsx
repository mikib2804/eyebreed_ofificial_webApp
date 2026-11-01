"use client";

import Image from "next/image";
import { Gift, Minus, Plus, Truck, X } from "lucide-react";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, currency, locale, t } = useStore();
  const total = cart.reduce((sum, item) => sum + item.prices[currency] * item.quantity, 0);
  const paidItems = cart.filter((item) => !item.isGift);
  const paidItemCount = paidItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasZipAndPolo = paidItems.some((item) => item.slug === "vision-washed-zip-hoodie") && paidItems.some((item) => item.slug === "vision-25-layered-jersey");
  const freeShipping = paidItemCount >= 3 || hasZipAndPolo;

  return (
    <>
      <button aria-label="Close cart" onClick={() => setCartOpen(false)} className={`fixed inset-0 z-40 bg-black/60 transition duration-500 ${cartOpen ? "visible opacity-100" : "invisible opacity-0"}`} />
      <aside className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl transition-transform duration-500 ease-luxury ${cartOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"}`} aria-hidden={!cartOpen}>
        <div className="flex items-center justify-between border-b border-black/20 px-6 py-7">
          <h2 className="font-display text-4xl">{t.cart}</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close"><X strokeWidth={1.3} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {cart.length === 0 ? <p className="py-16 text-center text-sm text-black/75">{t.empty}</p> : cart.map((item) => {
            const lineId = `${item.id}:${item.selectedSize}`;
            return (
              <div key={lineId} className="grid grid-cols-[90px_1fr_auto] gap-4 border-b border-black/15 py-6">
                <div className="relative aspect-[4/5] bg-white"><Image src={item.image} alt={item.name} fill className="object-cover" sizes="90px" /></div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider">{locale === "he" ? item.nameHe : item.name}</h3>
                  {item.isGift ? (
                    <p className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold tracking-wider text-red-700"><Gift size={13} />{locale === "he" ? "כובע מתנה · חינם" : "FREE GIFT HAT"}</p>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className={item.compareAtPrices ? "font-semibold text-red-700" : "text-black/75"}>{money(item.prices[currency], currency, locale)}</span>
                      {item.compareAtPrices && <span className="text-[10px] text-black/40 line-through">{money(item.compareAtPrices[currency], currency, locale)}</span>}
                    </div>
                  )}
                  <p className="mt-2 text-[10px] tracking-wider text-black/75">SIZE {item.selectedSize}</p>
                  {!item.isGift && <div className="mt-5 flex w-fit items-center border border-black/30">
                    <button onClick={() => updateQuantity(lineId, item.quantity - 1)} className="p-2"><Minus size={12} /></button>
                    <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(lineId, item.quantity + 1)} className="p-2"><Plus size={12} /></button>
                  </div>}
                </div>
                {!item.isGift && <button onClick={() => removeFromCart(lineId)} className="self-start text-[10px] uppercase underline">{locale === "he" ? "הסרה" : "Remove"}</button>}
              </div>
            );
          })}
        </div>
        <div className="border-t border-black/20 p-6">
          {cart.length > 0 && (
            <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-xs ${freeShipping ? "bg-green-100 text-green-900" : "bg-white text-black/65"}`}>
              <Truck size={17} className="shrink-0" />
              <span>{freeShipping ? (locale === "he" ? "משלוח חינם הופעל להזמנה" : "Free shipping unlocked") : (locale === "he" ? `${Math.max(0, 3 - paidItemCount)} פריטים עד למשלוח חינם + כובע` : `${Math.max(0, 3 - paidItemCount)} items until free shipping + a hat`)}</span>
            </div>
          )}
          <div className="mb-6 flex justify-between text-sm tracking-wider"><span>{t.subtotal}</span><strong>{money(total, currency, locale)}</strong></div>
          <button disabled={!cart.length} className="w-full bg-ink py-5 text-[10px] tracking-luxury text-white disabled:opacity-40">{t.checkout}</button>
        </div>
      </aside>
    </>
  );
}
