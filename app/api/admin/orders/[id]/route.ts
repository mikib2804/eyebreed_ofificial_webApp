import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

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
  const authorization = await authorizeAdminMutation(request, "orders"); if ("response" in authorization) return authorization.response;
  const id = z.string().cuid().safeParse((await params).id); if (!id.success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const raw = await readJsonBody(request, 8_192); if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status }); const body = schema.safeParse(raw.data); if (!body.success) return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  const current = await prisma.order.findUnique({ where: { id: id.data }, select: { status: true, shippingStatus: true } });
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (body.data.status !== current.status && !nextStatus[current.status].includes(body.data.status)) return NextResponse.json({ error: "Invalid order status transition" }, { status: 409 });
  if (body.data.shippingStatus !== current.shippingStatus && !nextShipping[current.shippingStatus].includes(body.data.shippingStatus)) return NextResponse.json({ error: "Invalid shipping status transition" }, { status: 409 });
  if (body.data.shippingStatus === "SHIPPED" && !body.data.trackingNumber) return NextResponse.json({ error: "Tracking number is required when shipping" }, { status: 400 });
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: id.data }, data: { ...body.data, trackingNumber: body.data.trackingNumber || null, shippingProvider: body.data.shippingProvider || null } });
    await tx.orderHistory.create({ data: { orderId: updated.id, actorId: authorization.access.user.id, action: "ADMIN_STATUS_UPDATE", note: `${current.status}/${current.shippingStatus} → ${updated.status}/${updated.shippingStatus}` } });
    await tx.auditLog.create({ data: { actorId: authorization.access.user.id, action: "ORDER_UPDATED", entityType: "Order", entityId: updated.id, metadata: { status: updated.status, shippingStatus: updated.shippingStatus } } });
    return updated;
  });
  return NextResponse.json({ ok: true, order });
}
