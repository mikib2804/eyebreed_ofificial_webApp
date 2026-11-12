"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, LockKeyhole, MapPin, Plus } from "lucide-react";
import { isPromotionGiftLine } from "@/lib/cart-promotion";
import { money } from "@/lib/i18n";
import PaymentSupport from "@/components/PaymentSupport";
import { useStore } from "@/components/store-provider";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

type CartQuote = {
  currency: "USD" | "ILS" | "EUR";
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  freeShipping: boolean;
  promotion: { label: string };
};

const fieldClass = "mt-2 min-h-12 w-full border border-black/20 bg-white px-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black";

export function CheckoutFlow({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { cart, currency, locale } = useStore();
  const hebrew = locale === "he";
  const paidItems = useMemo(() => cart.filter((item) => !isPromotionGiftLine(item)), [cart]);
  const quoteItems = useMemo(() => paidItems.map((item) => ({ productId: item.id, slug: item.slug, quantity: item.quantity, size: item.selectedSize, color: null })), [paidItems]);
  const preferredAddress = addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "";
  const [selectedAddressId, setSelectedAddressId] = useState(preferredAddress);
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [addressPending, setAddressPending] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    setMounted(true);
    setCode(sessionStorage.getItem("eyebreed.checkout.code"));
  }, []);

  useEffect(() => {
    if (!addresses.length) return;
    setSelectedAddressId((current) => addresses.some((address) => address.id === current) ? current : preferredAddress);
    setShowAddressForm(false);
  }, [addresses, preferredAddress]);

  useEffect(() => {
    if (!quoteItems.length) { setQuote(null); setQuoteError(""); return; }
    const controller = new AbortController();
    setQuotePending(true); setQuoteError("");
    void fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: quoteItems, currency, code }),
      signal: controller.signal,
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setQuote(null); setQuoteError(result.error ?? (hebrew ? "לא ניתן לאמת את ההזמנה." : "Could not verify this order.")); return; }
      setQuote(result as CartQuote);
    }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setQuoteError(hebrew ? "לא ניתן לאמת את ההזמנה." : "Could not verify this order.");
    }).finally(() => { if (!controller.signal.aborted) setQuotePending(false); });
    return () => controller.abort();
  }, [code, currency, hebrew, quoteItems]);

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAddressPending(true); setAddressMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(form), isDefault: addresses.length === 0 || form.get("isDefault") === "on" }),
    });
    const result = await response.json().catch(() => ({}));
    setAddressPending(false);
    if (!response.ok) { setAddressMessage(result.error ?? (hebrew ? "לא ניתן לשמור את הכתובת." : "Could not save the address.")); return; }
    formElement.reset();
    setAddressMessage(hebrew ? "הכתובת נשמרה." : "Address saved.");
    router.refresh();
  }

  async function continueToPayment() {
    if (!selectedAddressId || !quote) return;
    setPaymentPending(true); setPaymentError("");
    const response = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: quoteItems, currency, code, addressId: selectedAddressId }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.url !== "string") {
      setPaymentPending(false);
      setPaymentError(result.error ?? (hebrew ? "לא ניתן לעבור לתשלום." : "Could not continue to payment."));
      return;
    }
    try {
      const destination = new URL(result.url);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") throw new Error("Unexpected checkout URL");
      window.location.assign(destination.toString());
    } catch {
      setPaymentPending(false);
      setPaymentError(hebrew ? "כתובת התשלום שהתקבלה אינה תקינה." : "The payment destination was invalid.");
    }
  }

  if (!mounted) return <main className="min-h-[70vh] bg-cream px-5 py-24"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-16 w-72 bg-black/10" /></div></main>;

  if (!paidItems.length) return <main className="grid min-h-[70vh] place-items-center bg-cream px-6 text-center text-ink"><div><h1 className="font-display text-6xl">{hebrew ? "הסל ריק" : "Your bag is empty"}</h1><Link href="/#products" className="mt-8 inline-flex min-h-12 items-center bg-ink px-7 text-[10px] tracking-luxury !text-white">{hebrew ? "חזרה לחנות" : "RETURN TO STORE"}</Link></div></main>;

  return <main className="min-h-screen bg-cream px-5 py-16 text-ink sm:px-8 lg:py-24">
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-[10px] tracking-luxury underline underline-offset-4">{hebrew ? "חזרה לחנות" : "BACK TO STORE"}</Link>
      <div className="mt-8 flex flex-col justify-between gap-6 border-b border-black/20 pb-8 sm:flex-row sm:items-end">
        <div><p className="text-[10px] tracking-luxury">EYEBREED SECURE CHECKOUT</p><h1 className="mt-3 font-display text-6xl sm:text-7xl">{hebrew ? "תשלום" : "Checkout"}</h1></div>
        <ol className="flex gap-6 text-[10px] tracking-wider"><li className="font-semibold">1. {hebrew ? "משלוח" : "SHIPPING"}</li><li className="text-black/45">2. {hebrew ? "תשלום מאובטח" : "SECURE PAYMENT"}</li></ol>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section aria-labelledby="shipping-heading">
          <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] tracking-luxury">STEP 1</p><h2 id="shipping-heading" className="mt-2 font-display text-4xl">{hebrew ? "כתובת למשלוח" : "Shipping address"}</h2></div>{addresses.length > 0 && <button type="button" onClick={() => setShowAddressForm((open) => !open)} className="inline-flex min-h-11 items-center gap-2 border border-black/25 px-4 text-[9px] tracking-wider"><Plus size={14} />{hebrew ? "כתובת חדשה" : "NEW ADDRESS"}</button>}</div>

          {addresses.length > 0 && <div className="mt-6 grid gap-4 sm:grid-cols-2">{addresses.map((address) => {
            const selected = selectedAddressId === address.id;
            return <label key={address.id} className={`relative cursor-pointer border p-5 transition ${selected ? "border-black bg-white shadow-sm" : "border-black/15 bg-white/40 hover:border-black/40"}`}>
              <input type="radio" name="shippingAddress" value={address.id} checked={selected} onChange={() => setSelectedAddressId(address.id)} className="sr-only" />
              <span className="flex items-start justify-between gap-3"><span><span className="text-[9px] font-semibold tracking-luxury">{address.label}</span>{address.isDefault && <span className="ms-2 text-[8px] text-black/45">{hebrew ? "ברירת מחדל" : "DEFAULT"}</span>}</span><span className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? "border-black bg-black text-white" : "border-black/25"}`}>{selected && <Check size={13} />}</span></span>
              <span className="mt-4 block text-sm leading-6"><b>{address.fullName}</b><br />{address.line1}{address.line2 && <><br />{address.line2}</>}<br />{address.city} {address.postalCode}<br />{address.country}{address.phone && <><br />{address.phone}</>}</span>
            </label>;
          })}</div>}

          {showAddressForm && <form onSubmit={addAddress} className="mt-6 grid gap-5 border border-black/15 bg-white/55 p-5 sm:grid-cols-2 sm:p-7">
            <div className="sm:col-span-2 flex items-center gap-3 border-b border-black/10 pb-4"><MapPin size={18} /><h3 className="font-display text-3xl">{hebrew ? "הוספת כתובת" : "Add an address"}</h3></div>
            <Field name="label" label={hebrew ? "תווית" : "LABEL"} defaultValue={hebrew ? "בית" : "Home"} />
            <Field name="fullName" label={hebrew ? "שם מלא" : "FULL NAME"} autoComplete="name" required />
            <Field name="phone" label={hebrew ? "טלפון" : "PHONE"} autoComplete="tel" />
            <Field name="line1" label={hebrew ? "כתובת" : "ADDRESS"} autoComplete="address-line1" required />
            <Field name="line2" label={hebrew ? "דירה / יחידה" : "APARTMENT / UNIT"} autoComplete="address-line2" />
            <Field name="city" label={hebrew ? "עיר" : "CITY"} autoComplete="address-level2" required />
            <Field name="postalCode" label={hebrew ? "מיקוד" : "POSTAL CODE"} autoComplete="postal-code" />
            <Field name="country" label={hebrew ? "מדינה" : "COUNTRY"} defaultValue="Israel" autoComplete="country-name" required />
            {addresses.length > 0 && <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isDefault" />{hebrew ? "הגדרה כברירת מחדל" : "Set as default"}</label>}
            <div className="sm:col-span-2">{addressMessage && <p role="status" className={`mb-3 text-xs ${addressMessage.includes("נשמרה") || addressMessage.includes("saved") ? "text-green-800" : "text-red-700"}`}>{addressMessage}</p>}<button disabled={addressPending} className="min-h-12 bg-ink px-7 text-[10px] tracking-luxury text-white disabled:opacity-40">{addressPending ? (hebrew ? "שומר…" : "SAVING…") : (hebrew ? "שמירת כתובת" : "SAVE ADDRESS")}</button></div>
          </form>}
        </section>

        <aside className="h-fit border border-black/15 bg-white p-6 lg:sticky lg:top-8" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="font-display text-4xl">{hebrew ? "סיכום הזמנה" : "Order summary"}</h2>
          <div className="mt-6 space-y-5">{paidItems.map((item) => <div key={`${item.id}:${item.selectedSize}`} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-black/10 pb-5"><div className="relative aspect-[4/5] bg-cream"><Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" /></div><div><p className="text-xs">{hebrew ? item.nameHe : item.name}</p><p className="mt-2 text-[9px] text-black/55">{hebrew ? "מידה" : "SIZE"} {item.selectedSize} · {hebrew ? "כמות" : "QTY"} {item.quantity}</p></div><p className="text-xs">{money(item.prices[currency] * item.quantity, currency, locale)}</p></div>)}</div>
          {quotePending && <p role="status" className="mt-5 text-xs text-black/55">{hebrew ? "מאמת מחיר ומלאי…" : "Verifying price and inventory…"}</p>}
          {quoteError && <p role="alert" className="mt-5 text-xs text-red-700">{quoteError}</p>}
          <dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><dt>{hebrew ? "סכום ביניים" : "Subtotal"}</dt><dd>{quote ? money(quote.subtotal, currency, locale) : "—"}</dd></div>{quote && <div className="flex justify-between text-green-800"><dt>{quote.promotion.label}</dt><dd>−{money(quote.discountAmount, currency, locale)}</dd></div>}<div className="flex justify-between"><dt>{hebrew ? "משלוח" : "Shipping"}</dt><dd>{quote ? (quote.freeShipping ? (hebrew ? "חינם" : "FREE") : money(quote.shippingAmount, currency, locale)) : "—"}</dd></div><div className="flex justify-between border-t border-black/15 pt-4 text-base font-semibold"><dt>{hebrew ? "סה״כ" : "Total"}</dt><dd>{quote ? money(quote.total, currency, locale) : "—"}</dd></div></dl>
          <div className="mt-6 flex gap-3 bg-cream p-4 text-xs leading-5 text-black/65"><LockKeyhole size={18} className="mt-0.5 shrink-0" /><p>{hebrew ? "פרטי הכרטיס מוזנים באופן מאובטח בעמוד התשלום של Stripe בשלב הבא. האתר אינו שומר פרטי כרטיס." : "Card details are entered securely on Stripe in the next step. This store does not save card details."}</p></div>
          {paymentError && <p role="alert" className="mt-4 text-xs leading-5 text-red-700">{paymentError}</p>}
          {!selectedAddressId && <p role="status" className="mt-4 text-xs text-amber-800">{hebrew ? "שמרו כתובת למשלוח כדי להמשיך." : "Save a shipping address to continue."}</p>}
          <button type="button" onClick={continueToPayment} disabled={!selectedAddressId || !quote || quotePending || paymentPending} className="mt-5 w-full bg-ink py-5 text-[10px] tracking-luxury text-white disabled:opacity-40">{paymentPending ? (hebrew ? "מעביר ל-Stripe…" : "OPENING STRIPE…") : (hebrew ? "המשך לתשלום מאובטח" : "CONTINUE TO SECURE PAYMENT")}</button>
          <PaymentSupport variant="checkout" />
        </aside>
      </div>
    </div>
  </main>;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-[9px] tracking-[.14em] text-black/60">{label}<input {...props} className={fieldClass} /></label>;
}
