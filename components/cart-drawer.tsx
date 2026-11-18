"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Gift, Minus, Plus, Tag, Truck, X } from "lucide-react";
import { money } from "@/lib/i18n";
import { isPromotionGiftLine } from "@/lib/cart-promotion";
import { useStore } from "@/components/store-provider";
import { usePreOrder } from "@/components/pre-order-provider";

type CartQuote = {
  currency: "USD" | "ILS" | "EUR";
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  shippingEnabled: boolean;
  freeShipping: boolean;
  freeShippingThreshold: number | null;
  freeShippingRemaining: number | null;
  discountCode: string | null;
  promotion: { source: "AUTOMATIC" | "BUNDLE" | "CODE"; label: string; percentage: number } | null;
  codeMessage: string | null;
};

function quoteFailureMessage(code: unknown, serverMessage: unknown, locale: "en" | "he") {
  if (locale === "en" && typeof serverMessage === "string") return serverMessage;
  if (locale === "he") {
    if (code === "PRODUCT_UNAVAILABLE") return "אחד המוצרים בסל אינו זמין יותר. הסירו אותו והוסיפו אותו מחדש.";
    if (code === "VARIANT_UNAVAILABLE") return "המידה שנבחרה אינה זמינה יותר. בחרו מידה אחרת.";
    if (code === "INSUFFICIENT_STOCK") return "אין מספיק מלאי עבור אחד המוצרים בסל.";
    if (code === "RATE_LIMITED") return "נשלחו יותר מדי בקשות. נסו שוב בעוד דקה.";
  }
  return locale === "he"
    ? "לא ניתן לאמת את המחיר מול קטלוג המוצרים. נסו לרענן את העמוד."
    : "The price could not be verified against the product database. Refresh and try again.";
}

export function CartDrawer() {
  const router = useRouter();
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, currency, locale, t } = useStore();
  const { enabled: preOrderMode } = usePreOrder();
  const paidItems = useMemo(() => cart.filter((item) => !isPromotionGiftLine(item)), [cart]);
  const localSubtotal = paidItems.reduce((sum, item) => sum + item.prices[currency] * item.quantity, 0);
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [codeError, setCodeError] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setCartOpen(false); return; }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    const originalOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = originalOverflow; previous?.focus(); };
  }, [cartOpen, setCartOpen]);

  const quoteItems = useMemo(() => paidItems.map((item) => ({ productId: item.id, slug: item.slug, quantity: item.quantity, size: item.sizes.length ? item.selectedSize : null, color: null })), [paidItems]);

  useEffect(() => {
    if (!quoteItems.length) { setQuote(null); setQuoteError(""); return; }
    const controller = new AbortController();
    setQuotePending(true);
    setQuoteError("");
    void fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: quoteItems, currency, code: appliedCode }),
      signal: controller.signal,
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setQuote(null);
        setQuoteError(quoteFailureMessage(result.code, result.error, locale));
        if (appliedCode) { setCodeError(true); setCodeMessage(result.error ?? "Discount code could not be applied."); }
        return;
      }
      setQuote(result as CartQuote);
      setQuoteError("");
      if (appliedCode) { setCodeError(false); setCodeMessage((result as CartQuote).codeMessage ?? "Discount code applied."); }
    }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setQuote(null);
        setQuoteError(quoteFailureMessage("NETWORK_ERROR", null, locale));
      }
    }).finally(() => { if (!controller.signal.aborted) setQuotePending(false); });
    return () => controller.abort();
  }, [appliedCode, currency, locale, quoteItems]);

  async function applyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = codeInput.trim().toUpperCase();
    if (!normalized) return;
    setCodeMessage("");
    setCodeError(false);
    setAppliedCode(normalized);
  }

  function removeCode() {
    setAppliedCode(null);
    setCodeInput("");
    setCodeMessage(locale === "he" ? "קוד ההנחה הוסר." : "Discount code removed.");
    setCodeError(false);
  }

  function beginCheckout() {
    if (appliedCode) sessionStorage.setItem("eyebreed.checkout.code", appliedCode);
    else sessionStorage.removeItem("eyebreed.checkout.code");
    setCartOpen(false);
    router.push("/checkout");
  }

  const trustedQuoteReady = Boolean(quote && quote.currency === currency);

  return <>
    <button tabIndex={cartOpen ? 0 : -1} aria-hidden={!cartOpen} aria-label={locale === "he" ? "סגירת הסל" : "Close cart"} onClick={() => setCartOpen(false)} className={`fixed inset-0 z-40 bg-black/60 transition duration-500 ${cartOpen ? "visible opacity-100" : "invisible opacity-0"}`} />
    <aside ref={dialogRef} id="cart-dialog" role="dialog" aria-modal="true" aria-labelledby="cart-title" inert={!cartOpen} className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl transition-transform duration-500 ease-luxury ${cartOpen ? "translate-x-0" : "pointer-events-none translate-x-full rtl:-translate-x-full"}`} aria-hidden={!cartOpen}>
      <div className="sticky top-0 z-10 flex flex-col border-b border-black/20 bg-cream px-6 pb-7 pt-4"><button ref={closeRef} type="button" onClick={() => setCartOpen(false)} aria-label={locale === "he" ? "סגירת הסל" : "Close cart"} className="grid h-11 w-11 self-start place-items-center rounded-full border border-black/30 bg-white text-ink transition hover:border-black hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><X size={20} strokeWidth={1.6} aria-hidden="true" /></button><h2 id="cart-title" className="mt-3 font-display text-4xl">{t.cart}</h2></div>
      <div className="flex-1 overflow-y-auto px-6">
        {cart.length === 0 ? <p className="py-16 text-center text-sm text-black/75">{t.empty}</p> : cart.map((item) => {
          const lineId = `${item.id}:${item.selectedSize}`;
          const isGift = isPromotionGiftLine(item);
          return <div key={lineId} className="grid grid-cols-[90px_1fr_auto] gap-4 border-b border-black/15 py-6">
            <div className="relative aspect-[4/5] bg-white"><Image src={item.image} alt={item.name} fill className="object-cover" sizes="90px" />{preOrderMode && !isGift && <span className="absolute inset-x-0 bottom-0 bg-[#76513f] px-1 py-1 text-center text-[6px] font-semibold tracking-wider text-white">הזמנה מוקדמת</span>}</div>
            <div><h3 className="text-xs uppercase tracking-wider">{locale === "he" ? `${item.nameHe}${isGift ? " (מתנה)" : ""}` : `${item.name}${isGift ? " (GIFT)" : ""}`}</h3>
              {isGift ? <p className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold tracking-wider text-red-700"><Gift size={13} />{locale === "he" ? "כובע מתנה · חינם" : "FREE GIFT HAT"}</p> : <div className="mt-2 flex items-center gap-2 text-xs"><span className={item.compareAtPrices ? "font-semibold text-red-700" : "text-black/75"}>{money(item.prices[currency], currency, locale)}</span>{item.compareAtPrices && <span className="text-[10px] text-black/40 line-through">{money(item.compareAtPrices[currency], currency, locale)}</span>}</div>}
              {item.sizes.length > 0 && <p className="mt-2 text-[10px] tracking-wider text-black/75">{locale === "he" ? "מידה" : "SIZE"} {item.selectedSize}</p>}
              {!isGift && <div className="mt-5 flex w-fit items-center border border-black/30"><button onClick={() => updateQuantity(lineId, item.quantity - 1)} aria-label={locale === "he" ? `הפחתת כמות ${item.nameHe}` : `Decrease ${item.name} quantity`} className="grid h-10 w-10 place-items-center"><Minus size={12} /></button><span className="min-w-7 text-center text-xs" aria-live="polite">{item.quantity}</span><button onClick={() => updateQuantity(lineId, item.quantity + 1)} aria-label={locale === "he" ? `הגדלת כמות ${item.nameHe}` : `Increase ${item.name} quantity`} className="grid h-10 w-10 place-items-center"><Plus size={12} /></button></div>}
            </div>
            <button type="button" onClick={() => removeFromCart(lineId)} aria-label={isGift ? (locale === "he" ? "הסרת כובע המתנה" : "Remove free gift hat") : (locale === "he" ? `הסרת ${item.nameHe}` : `Remove ${item.name}`)} className="self-start text-[10px] uppercase underline">{isGift ? (locale === "he" ? "הסרת מתנה" : "Remove gift") : (locale === "he" ? "הסרה" : "Remove")}</button>
          </div>;
        })}
      </div>
      <div className="border-t border-black/20 p-6">
        {quote?.shippingEnabled && (quote.freeShipping || quote.freeShippingRemaining !== null) && <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-xs ${quote.freeShipping ? "bg-green-100 text-green-900" : "bg-white text-black/65"}`}><Truck size={17} className="shrink-0" /><span>{quote.freeShipping ? (locale === "he" ? "משלוח חינם הופעל להזמנה" : "Free shipping unlocked") : (locale === "he" ? `עוד ${money(quote.freeShippingRemaining ?? 0, currency, locale)} למשלוח חינם` : `${money(quote.freeShippingRemaining ?? 0, currency, locale)} until free shipping`)}</span></div>}
        {paidItems.length > 0 && <form onSubmit={applyCode} className="mb-5"><label htmlFor="discount-code" className="text-[9px] tracking-wider">{locale === "he" ? "קוד הנחה" : "DISCOUNT CODE"}</label><div className="mt-2 flex gap-2"><div className="relative flex-1"><Tag aria-hidden="true" size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-black/45" /><input id="discount-code" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} disabled={Boolean(appliedCode)} autoComplete="off" maxLength={64} className="min-h-11 w-full border border-black/20 bg-white ps-10 pe-3 text-sm uppercase outline-none focus:border-black" /></div>{appliedCode ? <button type="button" onClick={removeCode} className="min-h-11 border border-black/30 px-4 text-[9px] tracking-wider">{locale === "he" ? "הסרה" : "REMOVE"}</button> : <button disabled={!codeInput.trim() || quotePending} className="min-h-11 bg-ink px-4 text-[9px] tracking-wider text-white disabled:opacity-40">{quotePending ? "…" : locale === "he" ? "החלה" : "APPLY"}</button>}</div>{codeMessage && <p role={codeError ? "alert" : "status"} className={`mt-2 text-xs ${codeError ? "text-red-700" : "text-green-800"}`}>{codeMessage}</p>}</form>}
        <dl className="mb-6 space-y-2 text-sm"><div className="flex justify-between"><dt>{t.subtotal}</dt><dd>{money(quote?.subtotal ?? localSubtotal, currency, locale)}</dd></div>{quote && quote.discountAmount > 0 && quote.promotion && <div className="flex justify-between text-green-800"><dt>{quote.promotion.label}{quote.promotion.percentage > 0 ? ` (${quote.promotion.percentage}%)` : ""}</dt><dd>−{money(quote.discountAmount, currency, locale)}</dd></div>}{quote && <div className="flex justify-between"><dt>{locale === "he" ? "משלוח" : "SHIPPING"}</dt><dd>{!quote.shippingEnabled ? (locale === "he" ? "ללא חיוב" : "NO CHARGE") : quote.freeShipping ? (locale === "he" ? "חינם" : "FREE") : money(quote.shippingAmount, currency, locale)}</dd></div>}<div className="flex justify-between border-t border-black/15 pt-3 font-semibold"><dt>{locale === "he" ? "סה״כ" : "TOTAL"}</dt><dd>{money(quote?.total ?? localSubtotal, currency, locale)}</dd></div></dl>
        {!trustedQuoteReady && !quoteError && paidItems.length > 0 && <p role="status" className="mb-3 text-xs leading-5 text-black/60">{locale === "he" ? "מאמת מחיר ומלאי…" : "Verifying price and inventory…"}</p>}
        {!quotePending && !trustedQuoteReady && quoteError && paidItems.length > 0 && <p role="alert" className="mb-3 text-xs leading-5 text-amber-800">{quoteError}</p>}
        <button type="button" onClick={beginCheckout} disabled={!paidItems.length || !trustedQuoteReady || quotePending} className="w-full bg-ink py-5 text-[10px] tracking-luxury text-white disabled:opacity-40">{locale === "he" ? "מעבר לפרטי משלוח" : "CONTINUE TO SHIPPING"}</button>
      </div>
    </aside>
  </>;
}
