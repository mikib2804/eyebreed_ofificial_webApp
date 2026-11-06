import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const schema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  shippingStatus: z.enum(["NOT_SHIPPED", "READY", "SHIPPED", "DELIVERED", "RETURNED"]),
  trackingNumber: z.string().trim().max(120).optional(),
  shippingProvider: z.string().trim().max(120).optional(),
}).strict();

const nextStatus: Record<string, readonly string[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"], PAID: ["PROCESSING", "REFUNDED"], PROCESSING: ["READY_FOR_SHIPMENT", "CANCELLED", "REFUNDED"], READY_FOR_SHIPMENT: ["SHIPPED", "CANCELLED", "REFUNDED"], SHIPPED: ["DELIVERED", "REFUNDED"], DELIVERED: ["REFUNDED"], CANCELLED: [], REFUNDED: [],
};
const nextShipping: Record<string, readonly string[]> = { NOT_SHIPPED: ["READY"], READY: ["SHIPPED"], SHIPPED: ["DELIVERED", "RETURNED"], DELIVERED: ["RETURNED"], RETURNED: [] };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const access = await getAdminAccess(); if (access.status !== "authorized") return NextResponse.json({ error: access.status === "unauthenticated" ? "Unauthorized" : "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403 });
  const id = z.string().cuid().safeParse((await params).id); if (!id.success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const body = schema.safeParse(await request.json().catch(() => null)); if (!body.success) return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  const current = await prisma.order.findUnique({ where: { id: id.data }, select: { status: true, shippingStatus: true } });
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (body.data.status !== current.status && !nextStatus[current.status].includes(body.data.status)) return NextResponse.json({ error: "Invalid order status transition" }, { status: 409 });
  if (body.data.shippingStatus !== current.shippingStatus && !nextShipping[current.shippingStatus].includes(body.data.shippingStatus)) return NextResponse.json({ error: "Invalid shipping status transition" }, { status: 409 });
  if (body.data.shippingStatus === "SHIPPED" && !body.data.trackingNumber) return NextResponse.json({ error: "Tracking number is required when shipping" }, { status: 400 });
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: id.data }, data: { ...body.data, trackingNumber: body.data.trackingNumber || null, shippingProvider: body.data.shippingProvider || null } });
    await tx.orderHistory.create({ data: { orderId: updated.id, actorId: access.user.id, action: "ADMIN_STATUS_UPDATE", note: `${current.status}/${current.shippingStatus} → ${updated.status}/${updated.shippingStatus}` } });
    await tx.auditLog.create({ data: { actorId: access.user.id, action: "ORDER_UPDATED", entityType: "Order", entityId: updated.id, metadata: { status: updated.status, shippingStatus: updated.shippingStatus } } });
    return updated;
  });
  return NextResponse.json({ ok: true, order });
}
