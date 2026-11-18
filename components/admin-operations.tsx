"use client";

import { FormEvent, useState } from "react";
import { UserRound } from "lucide-react";
import { adminStatus, adminText, type AdminLocale } from "@/lib/admin-i18n";
import { phoneInputAttributes, sanitizePhoneInput } from "@/lib/input-constraints";

const pendingAdminMutations = new Map<string, Promise<void>>();

function send(url: string, method: "PATCH" | "POST", body: unknown) {
  const key = `${method}:${url}`;
  const pending = pendingAdminMutations.get(key);
  if (pending) return pending;
  const request = (async () => {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(result.error || "Update failed");
  })();
  pendingAdminMutations.set(key, request);
  const clear = () => window.setTimeout(() => pendingAdminMutations.delete(key), 1_500);
  void request.then(clear, clear);
  return request;
}

const orderStatuses = ["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const shippingStatuses = ["NOT_SHIPPED", "READY", "SHIPPED", "DELIVERED", "RETURNED"];
const dateLocale = (locale: AdminLocale) => locale === "he" ? "he-IL" : "en-US";
const scrollRegion = "max-h-[min(68dvh,42rem)] overflow-y-auto overscroll-contain pe-1 [scrollbar-gutter:stable]";

type Order = {
  id: string; orderNumber: string; customerName: string; customerEmail: string;
  subtotal: number; discountAmount: number; shippingAmount: number; taxAmount: number;
  total: number; currency: string; status: string; paymentStatus: string;
  shippingStatus: string; trackingNumber: string | null; shippingProvider: string | null;
  stripeCheckoutSessionId: string | null; stripePaymentIntentId: string | null; createdAt: string;
  items: Array<{ id: string; productName: string; size: string | null; color: string | null; quantity: number; unitPrice: number }>;
  history: Array<{ id: string; action: string; note: string | null; createdAt: string }>;
};

export function AdminOrders({ orders, locale }: { orders: Order[]; locale: AdminLocale }) {
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const normalized = query.trim().toLowerCase();
  const visible = orders.filter((order) =>
    (status === "ALL" || order.status === status) &&
    (!normalized || order.orderNumber.toLowerCase().includes(normalized) || order.customerName.toLowerCase().includes(normalized) || order.customerEmail.toLowerCase().includes(normalized)),
  );

  async function submit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setMessage(adminText(locale, "saving"));
    try {
      await send(`/api/admin/orders/${id}`, "PATCH", Object.fromEntries(new FormData(event.currentTarget)));
      setMessage(adminText(locale, "orderUpdated"));
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : adminText(locale, "updateFailed"));
    }
  }

  return <div className="min-w-0 space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="admin-field">{adminText(locale, "search")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={adminText(locale, "searchOrders")} /></label>
      <label className="admin-field">{adminText(locale, "status")}<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">{adminStatus(locale, "ALL")}</option>{orderStatuses.map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></label>
    </div>
    {message && <p role="status" className="text-sm">{message}</p>}
    <p className="text-xs text-black/55">{visible.length} {adminText(locale, "ordersCount")}</p>
    <div className={`${scrollRegion} space-y-4`}>{visible.map((order) => <form key={order.id} onSubmit={(event) => submit(event, order.id)} className="grid min-w-0 gap-4 border border-black/10 bg-white p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_1fr_1fr_1fr_auto]">
      <div className="min-w-0">
        <strong className="break-all" dir="ltr">{order.orderNumber}</strong>
        <p className="break-words text-xs text-black/55">{order.customerName} · <span className="break-all" dir="ltr">{order.customerEmail}</span></p>
        <p className="break-words text-xs">{new Intl.NumberFormat(dateLocale(locale), { style: "currency", currency: order.currency }).format(order.total)} · {adminText(locale, "payment")} {adminStatus(locale, order.paymentStatus)}</p>
        <details className="mt-3 min-w-0">
          <summary className="cursor-pointer text-xs underline">{adminText(locale, "pricingHistory")}</summary>
          <dl className="mt-2 grid grid-cols-2 gap-1 text-xs"><dt>{adminText(locale, "subtotal")}</dt><dd>{order.subtotal}</dd><dt>{adminText(locale, "discount")}</dt><dd>{order.discountAmount}</dd><dt>{adminText(locale, "shipping")}</dt><dd>{order.shippingAmount}</dd><dt>{adminText(locale, "tax")}</dt><dd>{order.taxAmount}</dd></dl>
          <ul className="mt-2 break-words text-xs">{order.items.map((item) => <li key={item.id}>{item.quantity}× {item.productName} {item.size ?? ""} {item.color ?? ""}</li>)}</ul>
          <ol className="mt-2 space-y-1 break-words text-xs text-black/60">{order.history.map((item) => <li key={item.id}>{new Date(item.createdAt).toLocaleString(dateLocale(locale))} · {adminStatus(locale, item.action)}{item.note ? ` · ${item.note}` : ""}</li>)}</ol>
          {order.stripePaymentIntentId && <p className="mt-2 break-all text-[10px]" dir="ltr">{adminText(locale, "paymentIntent")}: {order.stripePaymentIntentId}</p>}
        </details>
      </div>
      <label className="admin-field">{adminText(locale, "orderStatus")}<select name="status" defaultValue={order.status}>{orderStatuses.map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></label>
      <label className="admin-field">{adminText(locale, "shippingStatus")}<select name="shippingStatus" defaultValue={order.shippingStatus}>{shippingStatuses.map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></label>
      <div className="grid gap-2"><label className="admin-field">{adminText(locale, "provider")}<input name="shippingProvider" defaultValue={order.shippingProvider ?? ""} /></label><label className="admin-field">{adminText(locale, "tracking")}<input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} /></label></div>
      <button className="min-h-11 w-full self-end bg-black px-4 py-3 text-xs text-white lg:w-auto">{adminText(locale, "save")}</button>
    </form>)}</div>
    {!visible.length && <p>{adminText(locale, "noOrders")}</p>}
  </div>;
}

type Message = { id: string; fullName: string; email: string; message: string; status: string; replyBody: string | null; createdAt: string };

export function AdminMessages({ messages, locale }: { messages: Message[]; locale: AdminLocale }) {
  const [feedback, setFeedback] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setFeedback(adminText(locale, "saving"));
    try {
      await send(`/api/admin/messages/${id}`, "PATCH", Object.fromEntries(new FormData(event.currentTarget)));
      setFeedback(adminText(locale, "messageUpdated")); window.location.reload();
    } catch (error) { setFeedback(error instanceof Error ? error.message : adminText(locale, "updateFailed")); }
  }
  return <div className="min-w-0 space-y-4">
    {feedback && <p role="status">{feedback}</p>}
    <div className={`${scrollRegion} space-y-4`}>{messages.map((item) => <form key={item.id} onSubmit={(event) => submit(event, item.id)} className="min-w-0 border border-black/10 bg-white p-3 sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between"><strong className="min-w-0 break-words">{item.fullName} · <a href={`mailto:${item.email}`} className="break-all underline" dir="ltr">{item.email}</a></strong><select name="status" defaultValue={item.status} className="min-h-11 w-full border border-black/20 px-3 sm:w-auto">{["NEW", "READ", "IN_PROGRESS", "REPLIED", "DECLINED", "ARCHIVED"].map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></div>
      <p className="my-3 break-words text-sm text-black/65">{item.message}</p>
      <label className="admin-field">{adminText(locale, "internalReply")}<textarea name="replyBody" rows={3} defaultValue={item.replyBody ?? ""} /></label>
      <button className="mt-3 min-h-11 w-full bg-black px-4 py-3 text-xs text-white sm:w-auto">{adminText(locale, "saveMessage")}</button>
    </form>)}</div>
    {!messages.length && <p>{adminText(locale, "noMessages")}</p>}
  </div>;
}

type InventoryProduct = { id: string; name: string; inventory: number; variants: Array<{ id: string; size: string; color: string; inventory: number }> };
type InventoryHistory = { id: string; productName: string; variantLabel: string | null; delta: number; reason: string; actorId: string | null; createdAt: string };

export function AdminInventory({ products, history, locale }: { products: InventoryProduct[]; history: InventoryHistory[]; locale: AdminLocale }) {
  const [message, setMessage] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(adminText(locale, "saving"));
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await send("/api/admin/inventory", "POST", values);
      setMessage(adminText(locale, "inventoryAdjusted")); window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : adminText(locale, "updateFailed")); }
  }
  return <div className="min-w-0 space-y-6">
    <form onSubmit={submit} className="grid min-w-0 gap-4 border border-black/10 bg-white p-3 sm:grid-cols-2 sm:p-5 md:grid-cols-3">
      <label className="admin-field">{adminText(locale, "product")}<select name="productId" value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((product) => <option value={product.id} key={product.id}>{product.name} ({product.inventory})</option>)}</select></label>
      <label className="admin-field">{adminText(locale, "adjustment")}<input name="delta" type="number" required /></label>
      <label className="admin-field">{adminText(locale, "reason")}<input name="reason" minLength={3} required /></label>
      <button className="min-h-11 w-full bg-black px-4 py-3 text-xs text-white sm:w-fit">{adminText(locale, "applyAdjustment")}</button><p role="status" className="self-center text-xs">{message}</p>
    </form>
    <div className={`${scrollRegion} space-y-2 sm:hidden`}>{history.map((item) => <article key={item.id} className="border border-black/10 p-3 text-xs"><div className="flex items-start justify-between gap-3"><strong className="break-words">{item.productName}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</strong><span className={`shrink-0 text-sm font-semibold ${item.delta < 0 ? "text-red-700" : "text-green-800"}`}>{item.delta > 0 ? "+" : ""}{item.delta}</span></div><p className="mt-2 break-words text-black/65">{item.reason}</p><p className="mt-2 text-[10px] text-black/45">{new Date(item.createdAt).toLocaleString(dateLocale(locale))} · {item.actorId ?? adminText(locale, "system")}</p></article>)}</div>
    <div className="hidden max-h-[min(68dvh,42rem)] overflow-auto overscroll-contain [scrollbar-gutter:stable] sm:block"><table className="w-full min-w-[700px] text-start text-xs"><thead className="sticky top-0 z-10 bg-white"><tr className="border-b border-black"><th className="py-3">{adminText(locale, "date")}</th><th>{adminText(locale, "productVariant")}</th><th>{adminText(locale, "change")}</th><th>{adminText(locale, "reason")}</th><th>{adminText(locale, "actor")}</th></tr></thead><tbody>{history.map((item) => <tr key={item.id} className="border-b border-black/10"><td className="py-3">{new Date(item.createdAt).toLocaleString(dateLocale(locale))}</td><td>{item.productName}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</td><td className={item.delta < 0 ? "text-red-700" : "text-green-800"}>{item.delta > 0 ? "+" : ""}{item.delta}</td><td>{item.reason}</td><td>{item.actorId ?? adminText(locale, "system")}</td></tr>)}</tbody></table></div>
    {!history.length && <p>{adminText(locale, "noInventoryHistory")}</p>}
  </div>;
}

type PreOrder = { id: string; email: string; productName: string; status: string; createdAt: string; convertedOrderNumber: string | null };

export function AdminPreOrders({ items, locale }: { items: PreOrder[]; locale: AdminLocale }) {
  const [message, setMessage] = useState("");
  async function change(id: string, status: string) {
    setMessage(adminText(locale, "saving"));
    try { await send(`/api/admin/pre-orders/${id}`, "PATCH", { status }); setMessage(adminText(locale, "preOrderUpdated")); window.location.reload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : adminText(locale, "updateFailed")); }
  }
  return <div className="min-w-0">
    {message && <p role="status" className="py-3">{message}</p>}
    <div className={`${scrollRegion} divide-y divide-black/10`}>
    {items.map((item) => <div className="grid min-w-0 items-center gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[1fr_1fr_1fr]" key={item.id}>
      <div className="min-w-0"><strong className="break-words">{item.productName}</strong><p className="break-all text-xs" dir="ltr">{item.email}</p>{item.convertedOrderNumber && <p className="break-all text-xs" dir="ltr">{adminText(locale, "order")} {item.convertedOrderNumber}</p>}</div>
      <span className="w-fit rounded bg-black/5 px-2 py-1 text-[10px]">{adminStatus(locale, item.status)}</span>
      <select className="min-h-11 w-full border border-black/20 bg-white px-3 sm:col-span-2 md:col-span-1" aria-label={`${adminText(locale, "status")} ${item.email}`} value={item.status} disabled={["CONVERTED_TO_ORDER", "CANCELLED"].includes(item.status)} onChange={(event) => change(item.id, event.target.value)}>
        <option value={item.status}>{adminStatus(locale, item.status)}</option>
        {item.status === "WAITING" && <><option value="PRODUCT_AVAILABLE">{adminStatus(locale, "PRODUCT_AVAILABLE")}</option><option value="CANCELLED">{adminStatus(locale, "CANCELLED")}</option></>}
        {item.status === "PRODUCT_AVAILABLE" && <><option value="CUSTOMER_NOTIFIED">{adminStatus(locale, "CUSTOMER_NOTIFIED")}</option><option value="CANCELLED">{adminStatus(locale, "CANCELLED")}</option></>}
        {item.status === "CUSTOMER_NOTIFIED" && <><option value="CONVERTED_TO_ORDER">{adminStatus(locale, "CONVERTED_TO_ORDER")}</option><option value="CANCELLED">{adminStatus(locale, "CANCELLED")}</option></>}
      </select>
    </div>)}
    {!items.length && <p className="py-3">{adminText(locale, "noPreOrders")}</p>}</div>
  </div>;
}

type Settings = { contactEmail: string; contactPhone: string; shippingInfo: string; shippingEnabled: boolean; shippingPriceIls: number; shippingPriceUsd: number; shippingPriceEur: number; freeShippingEnabled: boolean; freeShippingThresholdIls: number | null; freeShippingThresholdUsd: number | null; freeShippingThresholdEur: number | null; defaultLowStockThreshold: number; announcement: string; announcementActive: boolean; globalPreOrderMode: boolean; notificationPreferences: { newOrder: boolean; lowStock: boolean; contactMessage: boolean; preOrder: boolean } };

export function AdminSettings({ settings, locale }: { settings: Settings; locale: AdminLocale }) {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setMessage(adminText(locale, "saving"));
    try {
      await send("/api/admin/settings", "PATCH", { ...Object.fromEntries(form), shippingEnabled: form.get("shippingEnabled") === "on", freeShippingEnabled: form.get("freeShippingEnabled") === "on", announcementActive: form.get("announcementActive") === "on", globalPreOrderMode: form.get("globalPreOrderMode") === "on", notificationPreferences: { newOrder: form.get("notifyNewOrder") === "on", lowStock: form.get("notifyLowStock") === "on", contactMessage: form.get("notifyContactMessage") === "on", preOrder: form.get("notifyPreOrder") === "on" } });
      setMessage(adminText(locale, "settingsSaved"));
    } catch (error) { setMessage(error instanceof Error ? error.message : adminText(locale, "updateFailed")); }
  }
  return <form onSubmit={submit} className="grid min-w-0 gap-5 md:grid-cols-2">
    <input type="hidden" name="globalPreOrderMode" value={settings.globalPreOrderMode ? "on" : "off"} />
    <label className="admin-field">{adminText(locale, "contactEmail")}<input name="contactEmail" type="email" maxLength={254} defaultValue={settings.contactEmail} /></label>
    <label className="admin-field">{adminText(locale, "contactPhone")}<input name="contactPhone" {...phoneInputAttributes} onInput={(event) => { event.currentTarget.value = sanitizePhoneInput(event.currentTarget.value); }} defaultValue={settings.contactPhone} /></label>
    <label className="admin-field md:col-span-2">{adminText(locale, "shippingInfo")}<textarea name="shippingInfo" rows={5} defaultValue={settings.shippingInfo} /></label>
    <fieldset className="grid gap-4 border border-black/10 p-3 sm:grid-cols-2 sm:p-4 md:col-span-2 lg:grid-cols-3"><legend className="px-2 text-xs font-medium">{adminText(locale, "shippingSettings")}</legend>
      <p className="text-xs leading-5 text-black/55 sm:col-span-2 lg:col-span-3">{locale === "he" ? "השאירו את ספי המשלוח החינם ריקים כדי להעניק משלוח חינם לכל הזמנה כאשר האפשרות פעילה." : "Leave the free-shipping thresholds blank to make every order eligible when free shipping is enabled."}</p>
      <label className="flex min-h-11 items-center gap-2 sm:col-span-2 lg:col-span-3"><input name="shippingEnabled" type="checkbox" defaultChecked={settings.shippingEnabled} /> {adminText(locale, "shippingEnabled")}</label>
      <label className="admin-field">{adminText(locale, "shippingPriceIls")}<input name="shippingPriceIls" type="number" min="0" step="0.01" defaultValue={settings.shippingPriceIls} required /></label>
      <label className="admin-field">{adminText(locale, "shippingPriceUsd")}<input name="shippingPriceUsd" type="number" min="0" step="0.01" defaultValue={settings.shippingPriceUsd} required /></label>
      <label className="admin-field">{adminText(locale, "shippingPriceEur")}<input name="shippingPriceEur" type="number" min="0" step="0.01" defaultValue={settings.shippingPriceEur} required /></label>
      <label className="flex min-h-11 items-center gap-2 sm:col-span-2 lg:col-span-3"><input name="freeShippingEnabled" type="checkbox" defaultChecked={settings.freeShippingEnabled} /> {adminText(locale, "freeShippingEnabled")}</label>
      <label className="admin-field">{adminText(locale, "freeShippingThresholdIls")}<input name="freeShippingThresholdIls" type="number" min="0" step="0.01" defaultValue={settings.freeShippingThresholdIls ?? ""} /></label>
      <label className="admin-field">{adminText(locale, "freeShippingThresholdUsd")}<input name="freeShippingThresholdUsd" type="number" min="0" step="0.01" defaultValue={settings.freeShippingThresholdUsd ?? ""} /></label>
      <label className="admin-field">{adminText(locale, "freeShippingThresholdEur")}<input name="freeShippingThresholdEur" type="number" min="0" step="0.01" defaultValue={settings.freeShippingThresholdEur ?? ""} /></label>
    </fieldset>
    <label className="admin-field">{adminText(locale, "lowStockThreshold")}<input name="defaultLowStockThreshold" type="number" min="0" defaultValue={settings.defaultLowStockThreshold} /></label>
    <label className="admin-field">{adminText(locale, "announcement")}<input name="announcement" defaultValue={settings.announcement} /></label>
    <label className="flex min-h-11 items-center gap-2"><input name="announcementActive" type="checkbox" defaultChecked={settings.announcementActive} /> {adminText(locale, "announcementActive")}</label>
    <fieldset className="grid gap-3 border border-black/10 p-3 sm:p-4 md:col-span-2"><legend className="max-w-full px-2 text-[10px] font-medium uppercase tracking-wider sm:text-xs">{adminText(locale, "notificationPreferences")}</legend>
      <label className="flex min-h-11 items-center gap-2"><input name="notifyNewOrder" type="checkbox" defaultChecked={settings.notificationPreferences.newOrder} /> {adminText(locale, "newOrders")}</label>
      <label className="flex min-h-11 items-center gap-2"><input name="notifyLowStock" type="checkbox" defaultChecked={settings.notificationPreferences.lowStock} /> {adminText(locale, "lowStock")}</label>
      <label className="flex min-h-11 items-center gap-2"><input name="notifyContactMessage" type="checkbox" defaultChecked={settings.notificationPreferences.contactMessage} /> {adminText(locale, "contactMessages")}</label>
      <label className="flex min-h-11 items-center gap-2"><input name="notifyPreOrder" type="checkbox" defaultChecked={settings.notificationPreferences.preOrder} /> {adminText(locale, "preOrders")}</label>
    </fieldset>
    <button className="min-h-11 w-full bg-black px-4 py-3 text-xs text-white sm:w-auto">{adminText(locale, "saveSettings")}</button><p role="status" className="break-words">{message}</p>
  </form>;
}

export function AdminPreOrderModeToggle({ enabled, locale }: { enabled: boolean; locale: AdminLocale }) {
  const [active, setActive] = useState(enabled);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function toggle() {
    if (pending) return;
    const next = !active;
    setPending(true);
    setMessage("");
    try {
      await send("/api/admin/settings/pre-order", "PATCH", { enabled: next });
      setActive(next);
      setMessage(locale === "he" ? "מצב החנות עודכן." : "Store mode updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : adminText(locale, "updateFailed"));
    } finally {
      setPending(false);
    }
  }

  return <section className="mt-5 rounded-lg border border-[#76513f]/30 bg-white p-4 shadow-sm sm:mt-8 sm:p-6" aria-labelledby="pre-order-mode-heading">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 id="pre-order-mode-heading" className="font-display text-2xl sm:text-3xl">{locale === "he" ? "מצב החנות" : "Store mode"}</h3>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-black/60">{locale === "he" ? "כאשר המתג פעיל, החנות מוצגת כחנות הזמנה מוקדמת: תופיע הודעה בכניסה, תוויות על המוצרים ושאלה בעמוד השאלות והתשובות." : "When enabled, the store runs in Pre-Order mode with an entry notice, product labels, and an FAQ entry."}</p>
      </div>
      <button type="button" role="switch" aria-checked={active} disabled={pending} onClick={toggle} className={`relative inline-flex min-h-12 w-full shrink-0 items-center justify-between rounded-full border px-4 py-2 text-xs font-semibold transition sm:w-52 ${active ? "border-[#76513f] bg-[#76513f] text-white" : "border-black/25 bg-[#f1eee8] text-black"} disabled:cursor-wait disabled:opacity-60`}>
        <span>{active ? (locale === "he" ? "הזמנה מוקדמת פעילה" : "PRE-ORDER ON") : (locale === "he" ? "חנות רגילה" : "PRE-ORDER OFF")}</span>
        <span aria-hidden="true" className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${active ? "translate-x-0" : "opacity-70"}`} />
      </button>
    </div>
    {message && <p role="status" className="mt-3 text-xs text-black/65">{message}</p>}
  </section>;
}

type Customer = { id: string; name: string | null; email: string | null; phone: string | null; emailVerified: string | null; createdAt: string; counts: { orders: number; preOrders: number; addresses: number; wishlist: number }; orders: Array<{ orderNumber: string; total: number; currency: string; status: string; createdAt: string }> };

export function AdminCustomers({ customers, locale }: { customers: Customer[]; locale: AdminLocale }) {
  const [query, setQuery] = useState(""); const normalized = query.trim().toLocaleLowerCase();
  const visible = customers.filter((customer) => !normalized || customer.name?.toLocaleLowerCase().includes(normalized) || customer.email?.toLocaleLowerCase().includes(normalized) || customer.phone?.includes(normalized));
  return <div className="min-w-0">
    <label className="admin-field max-w-xl">{adminText(locale, "searchCustomers")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={adminText(locale, "customerPlaceholder")} /></label>
    <p className="my-4 text-xs text-black/55" role="status">{visible.length} {adminText(locale, visible.length === 1 ? "customer" : "customersCount")}</p>
    <div className={`${scrollRegion} space-y-3`}>{visible.map((customer) => <details key={customer.id} className="min-w-0 border border-black/10 bg-white">
      <summary className="min-w-0 cursor-pointer px-3 py-3 sm:px-4">
        <span className="inline-flex min-w-0 items-center gap-3 align-middle">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-white"><UserRound size={17} aria-hidden="true" /></span>
          <span className="min-w-0"><strong className="block break-words">{customer.name || adminText(locale, "unnamedCustomer")}</strong><span className="block break-all text-xs text-black/55" dir="ltr">{customer.email ?? adminText(locale, "noEmail")}</span></span>
        </span>
      </summary>
      <div className="grid min-w-0 gap-4 border-t border-black/10 p-3 sm:p-4 md:grid-cols-2">
        <dl className="min-w-0 space-y-2 text-sm"><div><dt className="font-medium">{adminText(locale, "phone")}</dt><dd className="break-all" dir="ltr">{customer.phone ?? "—"}</dd></div><div><dt className="font-medium">{adminText(locale, "emailVerified")}</dt><dd className="break-words">{customer.emailVerified ? new Date(customer.emailVerified).toLocaleString(dateLocale(locale)) : adminText(locale, "none")}</dd></div><div><dt className="font-medium">{adminText(locale, "joined")}</dt><dd>{new Date(customer.createdAt).toLocaleString(dateLocale(locale))}</dd></div></dl>
        <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt>{adminText(locale, "orders")}</dt><dd className="text-xl">{customer.counts.orders}</dd></div><div><dt>{adminText(locale, "preOrders")}</dt><dd className="text-xl">{customer.counts.preOrders}</dd></div><div><dt>{adminText(locale, "addresses")}</dt><dd className="text-xl">{customer.counts.addresses}</dd></div><div><dt>{adminText(locale, "wishlist")}</dt><dd className="text-xl">{customer.counts.wishlist}</dd></div></dl>
        <div className="min-w-0 md:col-span-2"><h4 className="font-medium">{adminText(locale, "recentOrders")}</h4>{customer.orders.map((order) => <div key={order.orderNumber} className="mt-2 flex min-w-0 flex-col gap-1 border-t border-black/10 pt-2 text-xs sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2"><span className="break-all" dir="ltr">{order.orderNumber} · {adminStatus(locale, order.status)}</span><span className="shrink-0">{new Intl.NumberFormat(dateLocale(locale), { style: "currency", currency: order.currency }).format(order.total)}</span></div>)}{!customer.orders.length && <p className="mt-2 text-xs text-black/55">{adminText(locale, "noRecentOrders")}</p>}</div>
      </div>
    </details>)}</div>
  </div>;
}

type PreOrderCustomerItem = { id: string; customerName: string; email: string; phone: string | null; productName: string; status: string; createdAt: string };
type PreOrderWaitlistItem = { id: string; email: string; createdAt: string };

export function AdminPreOrderCustomers({ items, waitlistItems, locale }: { items: PreOrderCustomerItem[]; waitlistItems: PreOrderWaitlistItem[]; locale: AdminLocale }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const allItems: PreOrderCustomerItem[] = [
    ...items,
    ...waitlistItems.map((item) => ({ ...item, customerName: "", phone: null, productName: adminText(locale, "preOrderWaitlist"), status: "WAITING" })),
  ];
  const customers = Array.from(
    allItems.reduce((grouped, item) => {
      const key = item.email.trim().toLocaleLowerCase();
      const existing = grouped.get(key);
      if (existing) existing.preOrders.push(item);
      else grouped.set(key, { name: item.customerName, email: item.email, phone: item.phone, preOrders: [item] });
      return grouped;
    }, new Map<string, { name: string; email: string; phone: string | null; preOrders: PreOrderCustomerItem[] }>()).values(),
  );
  const visible = customers.filter((customer) => !normalized || customer.name.toLocaleLowerCase().includes(normalized) || customer.email.toLocaleLowerCase().includes(normalized) || customer.phone?.includes(normalized));

  return <div className="min-w-0">
    <label className="admin-field max-w-xl">{adminText(locale, "searchCustomers")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={adminText(locale, "customerPlaceholder")} /></label>
    <p className="my-4 text-xs text-black/55" role="status">{visible.length} {adminText(locale, visible.length === 1 ? "customer" : "customersCount")}</p>
    <div className={`${scrollRegion} space-y-3`}>{visible.map((customer) => <details key={customer.email.toLocaleLowerCase()} className="min-w-0 border border-black/10 bg-white">
      <summary className="min-w-0 cursor-pointer px-3 py-3 sm:px-4">
        <span className="inline-flex min-w-0 items-center gap-3 align-middle">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-white"><UserRound size={17} aria-hidden="true" /></span>
          <span className="min-w-0"><strong className="block break-words">{customer.name || adminText(locale, "unnamedCustomer")}</strong><span className="block break-all text-xs text-black/55" dir="ltr">{customer.email}</span></span>
        </span>
      </summary>
      <div className="min-w-0 border-t border-black/10 p-3 sm:p-4">
        <p className="mb-3 break-all text-sm" dir="ltr">{adminText(locale, "phone")}: {customer.phone ?? "—"}</p>
        <div className="divide-y divide-black/10">{customer.preOrders.map((item) => <div key={item.id} className="grid min-w-0 gap-1 py-3 text-xs sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
          <strong className="break-words">{item.productName}</strong>
          <span>{adminStatus(locale, item.status)}</span>
          <time className="text-black/55" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(dateLocale(locale))}</time>
        </div>)}</div>
      </div>
    </details>)}</div>
    {!visible.length && <p className="py-3">{adminText(locale, "noPreOrders")}</p>}
  </div>;
}
