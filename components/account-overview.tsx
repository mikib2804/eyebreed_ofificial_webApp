"use client";

import Link from "next/link";
import { EmptyState, PageTitle } from "@/components/account-shell";
import { useStore } from "@/components/store-provider";

type OverviewOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  currency: string;
};

export function AccountOverview({ firstName, orders, totalOrders, pending, shipped, preOrderCount }: { firstName: string; orders: OverviewOrder[]; totalOrders: number; pending: number; shipped: number; preOrderCount: number }) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const stats = [
    [totalOrders, hebrew ? "סה״כ הזמנות" : "TOTAL ORDERS"],
    [pending, hebrew ? "בתהליך" : "IN PROGRESS"],
    [shipped, hebrew ? "נשלחו" : "SHIPPED"],
  ] as const;

  const formatMoney = (value: number, currency: string) => new Intl.NumberFormat(hebrew ? "he-IL" : "en-US", { style: "currency", currency }).format(value);
  const formatStatus = (status: string) => {
    if (!hebrew) return status.replaceAll("_", " ");
    return ({ PROCESSING: "בטיפול", SHIPPED: "נשלחה", DELIVERED: "נמסרה", CANCELLED: "בוטלה", REFUNDED: "הוחזרה" } as Record<string, string>)[status] ?? status.replaceAll("_", " ");
  };

  return (
    <>
      <PageTitle title={hebrew ? `ברוך הבא, ${firstName}` : `Welcome, ${firstName}`}>
        <p className="mt-4 text-sm text-black/60">{hebrew ? "ההזמנות, הפריטים השמורים ופרטי החשבון שלך במקום אחד." : "Your orders, saved pieces and account details in one place."}</p>
      </PageTitle>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(([value, label]) => <div key={label} className="rounded-2xl border border-black/10 bg-white p-6"><strong className="font-display text-4xl">{value}</strong><p className="mt-2 text-[9px] tracking-luxury text-black/55">{label}</p></div>)}
      </div>

      <h2 className="mb-5 mt-12 font-display text-3xl">{hebrew ? "רכישות אחרונות" : "Recent purchases"}</h2>
      {orders.length ? (
        <div className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white">
          {orders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-5 transition hover:bg-black/[.025]"><span><b className="text-sm">#{order.orderNumber}</b><small className="mt-1 block text-black/55">{new Date(order.createdAt).toLocaleDateString(hebrew ? "he-IL" : "en-US")} · {formatStatus(order.status)}</small></span><b>{formatMoney(order.total, order.currency)}</b></Link>)}
        </div>
      ) : <EmptyState title="No orders yet" text="Your EYEBREED purchases will appear here." />}

      <h2 className="mb-5 mt-12 font-display text-3xl">{hebrew ? "פעילות בהזמנות מוקדמות" : "Pre-order activity"}</h2>
      <p className="text-sm text-black/60">{preOrderCount ? (hebrew ? `${preOrderCount} הרשמות אחרונות להזמנה מוקדמת.` : `${preOrderCount} recent pre-order registration${preOrderCount === 1 ? "" : "s"}.`) : (hebrew ? "אין הזמנות מוקדמות פעילות." : "No active pre-orders.")}</p>
    </>
  );
}
