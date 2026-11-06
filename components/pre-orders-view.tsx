"use client";

import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/account-forms";
import { EmptyState, PageTitle } from "@/components/account-shell";
import { useStore } from "@/components/store-provider";

type Item = { id: string; productName: string; productNameHe: string | null; productSlug: string; image: string | null; size: string | null; color: string | null; quantity: number; status: "WAITING" | "PRODUCT_AVAILABLE" | "CUSTOMER_NOTIFIED" | "CONVERTED_TO_ORDER" | "CANCELLED"; contactedAt: string | null; notifiedAt: string | null; createdAt: string };
const statusText: Record<Item["status"], { en: string; he: string }> = {
  WAITING: { en: "Waiting for availability", he: "בהמתנה לזמינות" }, PRODUCT_AVAILABLE: { en: "Product available", he: "המוצר זמין" }, CUSTOMER_NOTIFIED: { en: "Availability notice sent", he: "נשלחה הודעת זמינות" }, CONVERTED_TO_ORDER: { en: "Converted to order", he: "הומר להזמנה" }, CANCELLED: { en: "Cancelled", he: "בוטלה" },
};

export function PreOrdersView({ items }: { items: Item[] }) {
  const { locale } = useStore(); const he = locale === "he";
  if (!items.length) return <><PageTitle title="My Pre-orders" /><EmptyState title="No pre-orders" text="Your pre-order registrations and availability updates will appear here." /></>;
  return <><PageTitle title="My Pre-orders" /><div className="space-y-4">{items.map((item) => <article key={item.id} className="grid gap-5 rounded-2xl border border-black/15 bg-white p-4 sm:grid-cols-[96px_1fr_auto]">
    <Link href={`/products/${item.productSlug}`} className="relative block h-28 overflow-hidden rounded-xl bg-black/5">{item.image ? <Image src={item.image} alt={he ? item.productNameHe ?? item.productName : item.productName} fill sizes="96px" className="object-cover" /> : null}</Link>
    <div><h2 className="font-display text-2xl"><Link href={`/products/${item.productSlug}`}>{he ? item.productNameHe ?? item.productName : item.productName}</Link></h2><p className="mt-1 text-xs text-black/55">{[item.size, item.color].filter(Boolean).join(" · ")} · {he ? "כמות" : "Qty"} {item.quantity}</p><p className="mt-3 text-xs font-medium">{statusText[item.status][locale]}</p><dl className="mt-3 grid gap-1 text-[11px] text-black/55"><div><dt className="inline">{he ? "נוצרה:" : "Created:"}</dt> <dd className="inline">{new Date(item.createdAt).toLocaleDateString(he ? "he-IL" : "en-GB")}</dd></div>{item.notifiedAt ? <div><dt className="inline">{he ? "הודעה נשלחה:" : "Notified:"}</dt> <dd className="inline">{new Date(item.notifiedAt).toLocaleDateString(he ? "he-IL" : "en-GB")}</dd></div> : null}</dl></div>
    {item.status === "WAITING" ? <DeleteButton endpoint={`/api/account/pre-orders/${item.id}`} label={he ? "ביטול" : "CANCEL"} /> : null}
  </article>)}</div></>;
}
