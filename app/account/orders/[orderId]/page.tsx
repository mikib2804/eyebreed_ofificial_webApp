import { notFound } from "next/navigation";
import { PageTitle } from "@/components/account-shell";
import { money, requireCustomer } from "@/lib/account";
import { prisma } from "@/lib/prisma";

const steps = ["ORDER PLACED", "PAYMENT CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderDetail({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await requireCustomer();
  const { orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();
  const active = order.status === "DELIVERED" ? 4 : order.status === "SHIPPED" ? 3 : ["PROCESSING", "READY_FOR_SHIPMENT"].includes(order.status) ? 2 : order.paymentStatus === "PAID" ? 1 : 0;
  const address = order.shippingAddress as Record<string, string>;

  return <>
    <PageTitle eyebrow="ORDER DETAILS" title={`Order #${order.orderNumber}`}><p className="mt-3 text-xs text-black/55">Placed {order.createdAt.toLocaleDateString()}</p></PageTitle>
    <ol className="mb-12 grid grid-cols-5 gap-1">{steps.map((step, index) => <li key={step} className={`border-t-2 pt-3 text-[8px] tracking-wider ${index <= active ? "border-ink" : "border-black/15 text-black/35"}`}>{step}</li>)}</ol>
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div>{order.items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] border-b border-black/10 py-5"><div><b>{item.productName}</b><p className="text-xs text-black/55">{item.size} {item.color} · Qty {item.quantity}</p></div><b>{money(Number(item.unitPrice) * item.quantity, order.currency)}</b></div>)}</div>
      <aside className="space-y-6 border border-black/15 p-6 text-xs leading-6">
        <section><b className="text-[9px] tracking-luxury">SHIP TO</b><p className="mt-2">{address.fullName ?? order.customerName}<br />{address.line1}<br />{address.city} {address.postalCode}<br />{address.country}</p></section>
        <section><b className="text-[9px] tracking-luxury">TRACKING</b><p className="mt-2">{order.shippingProvider ?? "Not assigned"}<br />{order.trackingNumber ?? "Tracking will appear once shipped."}</p></section>
        <dl className="space-y-2 border-t border-black/10 pt-4">
          <div className="flex justify-between"><dt>SUBTOTAL</dt><dd>{money(order.subtotal, order.currency)}</dd></div>
          {Number(order.discountAmount) > 0 && <div className="flex justify-between text-green-800"><dt>{order.discountCode ? `DISCOUNT · ${order.discountCode}` : "WEBSITE PROMOTION"}</dt><dd>−{money(order.discountAmount, order.currency)}</dd></div>}
          <div className="flex justify-between"><dt>SHIPPING</dt><dd>{Number(order.shippingAmount) === 0 ? "FREE" : money(order.shippingAmount, order.currency)}</dd></div>
          {Number(order.taxAmount) > 0 && <div className="flex justify-between"><dt>TAX</dt><dd>{money(order.taxAmount, order.currency)}</dd></div>}
          <div className="flex justify-between border-t border-black/10 pt-3 text-sm"><dt className="font-bold">TOTAL</dt><dd className="font-bold">{money(order.total, order.currency)}</dd></div>
        </dl>
      </aside>
    </div>
  </>;
}
