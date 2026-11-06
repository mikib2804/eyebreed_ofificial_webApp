import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const session = await auth();
  if (!session?.user.id) redirect("/login?callbackUrl=/account/orders");
  const { session_id: stripeSessionId } = await searchParams;
  if (!stripeSessionId) notFound();
  const order = await prisma.order.findFirst({ where: { stripeCheckoutSessionId: stripeSessionId, userId: session.user.id }, select: { id: true, orderNumber: true, paymentStatus: true } });
  if (!order) notFound();
  return <main className="grid min-h-[70vh] place-items-center bg-cream px-6 text-center text-ink"><div className="max-w-xl"><p className="text-[10px] tracking-luxury">ORDER #{order.orderNumber}</p><h1 className="mt-4 font-display text-6xl">Thank you</h1><p className="mt-6 text-sm leading-7 text-black/65">Payment status: {order.paymentStatus.replaceAll("_", " ")}. This page reads the server order state; the redirect itself does not mark an order paid.</p><Link href={`/account/orders/${order.id}`} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-[10px] tracking-luxury !text-white">VIEW ORDER</Link></div></main>;
}
