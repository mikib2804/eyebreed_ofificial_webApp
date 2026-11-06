import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired"].includes(event.type)) return NextResponse.json({ received: true });
  const checkout = event.data.object as Stripe.Checkout.Session;
  const orderId = checkout.metadata?.orderId;
  if (!orderId) return NextResponse.json({ error: "Missing order metadata." }, { status: 400 });

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.stripeWebhookEvent.create({ data: { id: event.id, type: event.type } });
      const order = await transaction.order.findUnique({ where: { id: orderId }, include: { items: true, discountRedemption: true } });
      if (!order) throw new Error("Order not found");

      if (event.type === "checkout.session.expired") {
        if (order.paymentStatus !== "PENDING") return;
        if (order.discountRedemption) {
          await transaction.discountRedemption.delete({ where: { orderId: order.id } });
          await transaction.discount.update({ where: { id: order.discountRedemption.discountId }, data: { usageCount: { decrement: 1 } } });
        }
        await transaction.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: "FAILED", history: { create: { action: "CHECKOUT_EXPIRED", note: "Stripe Checkout session expired before payment." } } } });
        return;
      }

      if (order.paymentStatus === "PAID") return;
      for (const item of order.items) {
        if (!item.productId) continue;
        const variant = await transaction.productVariant.findFirst({ where: { productId: item.productId, size: item.size ?? "", color: item.color ?? "" }, select: { id: true } });
        if (variant) {
          const adjusted = await transaction.productVariant.updateMany({ where: { id: variant.id, inventory: { gte: item.quantity } }, data: { inventory: { decrement: item.quantity } } });
          if (!adjusted.count) throw new Error("Insufficient variant inventory");
        } else {
          const adjusted = await transaction.product.updateMany({ where: { id: item.productId, inventory: { gte: item.quantity } }, data: { inventory: { decrement: item.quantity } } });
          if (!adjusted.count) throw new Error("Insufficient product inventory");
        }
        await transaction.inventoryAdjustment.create({ data: { productId: item.productId, variantId: variant?.id, delta: -item.quantity, reason: `Stripe payment for ${order.orderNumber}` } });
      }
      const paymentIntent = typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
      await transaction.order.update({ where: { id: order.id }, data: { status: "PAID", paymentStatus: "PAID", stripePaymentIntentId: paymentIntent ?? null, paidAt: new Date(), history: { create: { action: "PAYMENT_CONFIRMED", note: `Verified Stripe event ${event.id}.` } } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
