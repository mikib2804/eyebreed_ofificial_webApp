import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatus, PaymentStatus, ShippingStatus, type Prisma } from "@prisma/client";
import { PrintReportButton } from "@/components/print-report-button";
import { getAdminAccess } from "@/lib/admin-auth";
import { adminStatus, type AdminLocale } from "@/lib/admin-i18n";
import { prisma } from "@/lib/prisma";

const amount = (value: number, currency: string, locale: AdminLocale) => new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", { style: "currency", currency }).format(value);

export default async function PrintableOrders({ searchParams }: { searchParams: Promise<{ lang?: string; status?: string; payment?: string; shipping?: string }> }) {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/login?callbackUrl=/admin/print/orders");
  if (access.status === "forbidden") redirect("/");
  const params = await searchParams;
  const locale: AdminLocale = params.lang === "en" ? "en" : "he";
  const he = locale === "he";
  const orderStatuses = Object.values(OrderStatus);
  const paymentStatuses = Object.values(PaymentStatus);
  const shippingStatuses = Object.values(ShippingStatus);
  const status = orderStatuses.find((value) => value === params.status);
  const payment = paymentStatuses.find((value) => value === params.payment);
  const shipping = shippingStatuses.find((value) => value === params.shipping);
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(payment ? { paymentStatus: payment } : {}),
    ...(shipping ? { shippingStatus: shipping } : {}),
  };
  const orders = await prisma.order.findMany({ where, include: { items: { orderBy: { productName: "asc" } } }, orderBy: { createdAt: "desc" } });
  const totals = new Map<string, number>();
  for (const order of orders) totals.set(order.currency, (totals.get(order.currency) ?? 0) + Number(order.total));

  return <main dir={he ? "rtl" : "ltr"} className="min-h-screen bg-white p-4 text-black sm:p-8 print:p-0">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-5 print:mb-4">
        <div><p className="text-xs tracking-[.3em]">EYEBREED</p><h1 className="mt-2 font-display text-4xl">{he ? "דוח כל ההזמנות" : "All orders report"}</h1><p className="mt-2 text-xs text-black/60">{he ? "הופק" : "Generated"}: {new Date().toLocaleString(he ? "he-IL" : "en-US")}</p></div>
        <div className="flex gap-2 print:hidden"><Link href={`/admin?section=Orders&lang=${locale}`} className="inline-flex min-h-11 items-center border border-black px-5 text-xs">{he ? "חזרה לניהול" : "BACK TO ADMIN"}</Link><PrintReportButton label={he ? "הדפסה" : "PRINT"}/></div>
      </div>
      <form method="get" action="/admin/print/orders" className="mb-6 grid gap-3 border border-black/20 bg-black/[.03] p-4 print:hidden sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
        <input type="hidden" name="lang" value={locale} />
        <label className="text-xs font-medium">{he ? "סטטוס הזמנה" : "Order status"}<select name="status" defaultValue={status ?? ""} className="mt-2 min-h-11 w-full border border-black/25 bg-white px-3"><option value="">{he ? "כל הסטטוסים" : "All statuses"}</option>{orderStatuses.map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></label>
        <label className="text-xs font-medium">{he ? "סטטוס תשלום" : "Payment status"}<select name="payment" defaultValue={payment ?? ""} className="mt-2 min-h-11 w-full border border-black/25 bg-white px-3"><option value="">{he ? "כל התשלומים" : "All payments"}</option>{paymentStatuses.map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></label>
        <label className="text-xs font-medium">{he ? "סטטוס משלוח" : "Shipping status"}<select name="shipping" defaultValue={shipping ?? ""} className="mt-2 min-h-11 w-full border border-black/25 bg-white px-3"><option value="">{he ? "כל המשלוחים" : "All shipments"}</option>{shippingStatuses.map((value) => <option key={value} value={value}>{adminStatus(locale, value)}</option>)}</select></label>
        <button className="min-h-11 bg-black px-5 text-xs font-semibold text-white">{he ? "סינון" : "FILTER"}</button>
        <Link href={`/admin/print/orders?lang=${locale}`} className="inline-flex min-h-11 items-center justify-center border border-black px-5 text-xs font-semibold">{he ? "איפוס" : "RESET"}</Link>
      </form>
      {(status || payment || shipping) && <p className="mb-5 border-s-4 border-black ps-3 text-xs"><strong>{he ? "הדוח מסונן לפי" : "Report filtered by"}:</strong> {[status ? `${he ? "הזמנה" : "Order"}: ${adminStatus(locale, status)}` : null, payment ? `${he ? "תשלום" : "Payment"}: ${adminStatus(locale, payment)}` : null, shipping ? `${he ? "משלוח" : "Shipping"}: ${adminStatus(locale, shipping)}` : null].filter(Boolean).join(" · ")}</p>}
      <section className="mb-8 grid gap-3 border border-black p-4 sm:grid-cols-2 print:grid-cols-2">
        <div><span className="text-xs text-black/55">{he ? "מספר הזמנות" : "Order count"}</span><strong className="block text-3xl">{orders.length}</strong></div>
        <div><span className="text-xs text-black/55">{he ? "סכומים כוללים" : "Totals by currency"}</span>{[...totals].map(([currency, total]) => <strong key={currency} className="block text-xl">{amount(total, currency, locale)}</strong>)}</div>
      </section>
      <div className="space-y-6">{orders.map((order) => {
        const address = order.shippingAddress && typeof order.shippingAddress === "object" && !Array.isArray(order.shippingAddress) ? order.shippingAddress as Record<string, unknown> : {};
        return <article key={order.id} className="break-inside-avoid border border-black p-4">
          <header className="flex flex-wrap justify-between gap-3 border-b border-black pb-3"><div><h2 className="text-xl font-bold" dir="ltr">#{order.orderNumber}</h2><p className="text-xs">{order.createdAt.toLocaleString(he ? "he-IL" : "en-US")}</p></div><div className="text-end text-xs"><strong className="block text-base">{adminStatus(locale, order.status)}</strong><span>{adminStatus(locale, order.paymentStatus)} · {adminStatus(locale, order.shippingStatus)}</span></div></header>
          <div className="grid gap-4 py-4 text-sm sm:grid-cols-2 print:grid-cols-2"><div><h3 className="font-bold">{he ? "לקוח" : "Customer"}</h3><p>{order.customerName}</p><p dir="ltr" className="break-all">{order.customerEmail}</p></div><div><h3 className="font-bold">{he ? "כתובת משלוח" : "Shipping address"}</h3><p>{[address.fullName, address.line1, address.line2, address.city, address.postalCode, address.country].filter(Boolean).map(String).join(" · ") || "—"}</p></div></div>
          <table className="w-full border-collapse text-xs"><thead><tr className="border-y border-black"><th className="py-2 text-start">{he ? "מוצר" : "Product"}</th><th>{he ? "מידה" : "Size"}</th><th>{he ? "צבע" : "Color"}</th><th>{he ? "כמות" : "Qty"}</th><th className="text-end">{he ? "מחיר יחידה" : "Unit price"}</th><th className="text-end">{he ? "סה״כ" : "Line total"}</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-b border-black/20"><td className="py-2">{item.productName}</td><td className="text-center">{item.size ?? "—"}</td><td className="text-center">{item.color || "—"}</td><td className="text-center">{item.quantity}</td><td className="text-end">{amount(Number(item.unitPrice), order.currency, locale)}</td><td className="text-end">{amount(Number(item.unitPrice) * item.quantity, order.currency, locale)}</td></tr>)}</tbody></table>
          <dl className="ms-auto mt-4 grid max-w-sm grid-cols-2 gap-x-5 text-sm"><dt>{he ? "סכום ביניים" : "Subtotal"}</dt><dd className="text-end">{amount(Number(order.subtotal), order.currency, locale)}</dd><dt>{he ? "הנחה" : "Discount"}</dt><dd className="text-end">−{amount(Number(order.discountAmount), order.currency, locale)}</dd><dt>{he ? "משלוח" : "Shipping"}</dt><dd className="text-end">{amount(Number(order.shippingAmount), order.currency, locale)}</dd><dt>{he ? "מס" : "Tax"}</dt><dd className="text-end">{amount(Number(order.taxAmount), order.currency, locale)}</dd><dt className="border-t border-black pt-2 font-bold">{he ? "סה״כ" : "Total"}</dt><dd className="border-t border-black pt-2 text-end font-bold">{amount(Number(order.total), order.currency, locale)}</dd></dl>
          {(order.trackingNumber || order.shippingProvider) && <p className="mt-3 border-t border-black/20 pt-3 text-xs">{he ? "משלוח" : "Shipment"}: {order.shippingProvider ?? "—"} · {order.trackingNumber ?? "—"}</p>}
        </article>;
      })}</div>
      {!orders.length && <p className="py-16 text-center">{he ? "אין הזמנות להדפסה." : "No orders to print."}</p>}
    </div>
  </main>;
}
