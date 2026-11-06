"use client";

import Image from "next/image";
import Link from "next/link";
import { EmptyState, PageTitle } from "@/components/account-shell";
import { useStore } from "@/components/store-provider";

type OrderItem = { id: string; productName: string; size: string | null; color: string | null; quantity: number; image: string | null };
type AccountOrder = { id: string; orderNumber: string; createdAt: string; status: string; paymentStatus: string; shippingStatus: string; total: number; currency: string; items: OrderItem[] };

const filters = [
  [null, "All", "הכול"],
  ["PENDING_PAYMENT", "Pending payment", "ממתינה לתשלום"],
  ["PROCESSING", "Processing", "בטיפול"],
  ["READY_FOR_SHIPMENT", "Ready to ship", "מוכנה למשלוח"],
  ["SHIPPED", "Shipped", "נשלחה"],
  ["DELIVERED", "Delivered", "נמסרה"],
  ["CANCELLED", "Cancelled", "בוטלה"],
  ["REFUNDED", "Refunded", "הוחזרה"],
] as const;

const statusHe: Record<string, string> = {
  PENDING_PAYMENT: "ממתינה לתשלום", PAID: "שולמה", PROCESSING: "בטיפול",
  READY_FOR_SHIPMENT: "מוכנה למשלוח", SHIPPED: "נשלחה", DELIVERED: "נמסרה",
  CANCELLED: "בוטלה", REFUNDED: "הוחזרה", FAILED: "התשלום נכשל",
  PARTIALLY_REFUNDED: "החזר חלקי", NOT_SHIPPED: "טרם נשלחה", READY: "מוכנה",
  RETURNED: "הוחזרה לשולח",
};

function readableStatus(value: string, hebrew: boolean) {
  return hebrew ? (statusHe[value] ?? value.replaceAll("_", " ")) : value.replaceAll("_", " ");
}

function pageHref(page: number, status: string | null) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/account/orders${query ? `?${query}` : ""}`;
}

export function AccountOrdersView({ orders, activeStatus, page, totalPages, totalItems }: { orders: AccountOrder[]; activeStatus: string | null; page: number; totalPages: number; totalItems: number }) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const money = (amount: number, currency: string) => new Intl.NumberFormat(hebrew ? "he-IL" : "en-US", { style: "currency", currency }).format(amount);

  return <>
    <PageTitle title="My Orders"><p className="mt-4 text-sm text-black/60">{hebrew ? `${totalItems} הזמנות נמצאו בחשבון שלך.` : `${totalItems} order${totalItems === 1 ? "" : "s"} found in your account.`}</p></PageTitle>
    <nav aria-label={hebrew ? "סינון הזמנות" : "Order filters"} className="mb-8 flex flex-wrap gap-2">
      {filters.map(([value, labelEn, labelHe]) => { const active = activeStatus === value; return <Link key={value ?? "all"} href={pageHref(1, value)} aria-current={active ? "page" : undefined} className={`rounded-full border px-4 py-2 text-[9px] tracking-wider transition ${active ? "border-[#171412] bg-[#171412] !text-white" : "border-black/20 text-black/65 hover:border-black"}`}>{hebrew ? labelHe : labelEn}</Link>; })}
    </nav>
    {orders.length ? <div className="space-y-5">{orders.map((order) => <Link href={`/account/orders/${order.id}`} key={order.id} className="block rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
      <div className="flex flex-wrap justify-between gap-4"><div><b>#{order.orderNumber}</b><p className="mt-1 text-xs text-black/55">{new Date(order.createdAt).toLocaleDateString(hebrew ? "he-IL" : "en-US")}</p></div><b>{money(order.total, order.currency)}</b></div>
      <dl className="mt-4 grid gap-2 rounded-xl bg-black/[.035] p-3 text-[9px] tracking-wider sm:grid-cols-3">
        <div><dt className="text-black/50">{hebrew ? "הזמנה" : "ORDER"}</dt><dd className="mt-1">{readableStatus(order.status, hebrew)}</dd></div>
        <div><dt className="text-black/50">{hebrew ? "תשלום" : "PAYMENT"}</dt><dd className="mt-1">{readableStatus(order.paymentStatus, hebrew)}</dd></div>
        <div><dt className="text-black/50">{hebrew ? "משלוח" : "SHIPPING"}</dt><dd className="mt-1">{readableStatus(order.shippingStatus, hebrew)}</dd></div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-4">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3"><div className="relative h-16 w-12 overflow-hidden rounded bg-black/5">{item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />}</div><p className="max-w-40 text-xs">{item.productName}<small className="block text-black/50">{[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}</small></p></div>)}</div>
    </Link>)}</div> : <EmptyState title="No matching orders" text="Orders matching this filter will appear here." />}
    {totalPages > 1 && <nav aria-label={hebrew ? "עמודי הזמנות" : "Order pages"} className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-6 text-xs">
      <Link aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined} href={pageHref(Math.max(1, page - 1), activeStatus)} className={page === 1 ? "pointer-events-none opacity-35" : "underline underline-offset-4"}>{hebrew ? "הקודם" : "Previous"}</Link>
      <span>{hebrew ? `עמוד ${page} מתוך ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
      <Link aria-disabled={page === totalPages} tabIndex={page === totalPages ? -1 : undefined} href={pageHref(Math.min(totalPages, page + 1), activeStatus)} className={page === totalPages ? "pointer-events-none opacity-35" : "underline underline-offset-4"}>{hebrew ? "הבא" : "Next"}</Link>
    </nav>}
  </>;
}
