"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, currency, locale, t } = useStore();
  const total = cart.reduce((sum, item) => sum + item.prices[currency] * item.quantity, 0);

  return (
    <>
      <button aria-label="Close cart" onClick={() => setCartOpen(false)} className={`fixed inset-0 z-40 bg-black/60 transition duration-500 ${cartOpen ? "visible opacity-100" : "invisible opacity-0"}`} />
      <aside className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl transition-transform duration-500 ease-luxury ${cartOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"}`} aria-hidden={!cartOpen}>
        <div className="flex items-center justify-between border-b border-black/20 px-6 py-7">
          <h2 className="font-display text-4xl">{t.cart}</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close"><X strokeWidth={1.3} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {cart.length === 0 ? <p className="py-16 text-center text-sm text-black/60">{t.empty}</p> : cart.map((item) => (
            <div key={item.id} className="grid grid-cols-[90px_1fr_auto] gap-4 border-b border-black/15 py-6">
              <div className="relative aspect-[4/5] bg-white"><Image src={item.image} alt={item.name} fill className="object-cover" sizes="90px" /></div>
              <div>
                <h3 className="text-xs uppercase tracking-wider">{locale === "he" ? item.nameHe : item.name}</h3>
                <p className="mt-2 text-xs text-black/55">{money(item.prices[currency], currency, locale)}</p>
                <div className="mt-5 flex w-fit items-center border border-black/30">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2"><Minus size={12} /></button>
                  <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2"><Plus size={12} /></button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="self-start text-[10px] uppercase underline">Remove</button>
            </div>
          ))}
        </div>
        <div className="border-t border-black/20 p-6">
          <div className="mb-6 flex justify-between text-sm tracking-wider"><span>{t.subtotal}</span><strong>{money(total, currency, locale)}</strong></div>
          <button disabled={!cart.length} className="w-full bg-ink py-5 text-[10px] tracking-luxury text-white disabled:opacity-40">{t.checkout}</button>
        </div>
      </aside>
    </>
  );
}
