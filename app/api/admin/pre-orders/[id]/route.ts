import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const schema = z.object({ status: z.enum(["WAITING", "PRODUCT_AVAILABLE", "CUSTOMER_NOTIFIED", "CANCELLED"]) }).strict();
const transitions: Record<string, readonly string[]> = { WAITING: ["PRODUCT_AVAILABLE", "CANCELLED"], PRODUCT_AVAILABLE: ["CUSTOMER_NOTIFIED", "CANCELLED"], CUSTOMER_NOTIFIED: ["CANCELLED"], CONVERTED_TO_ORDER: [], CANCELLED: [] };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 }); const access = await getAdminAccess(); if (access.status !== "authorized") return NextResponse.json({ error: "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403 });
  const id = z.string().cuid().safeParse((await params).id); const body = schema.safeParse(await request.json().catch(() => null)); if (!id.success || !body.success) return NextResponse.json({ error: "Invalid pre-order update" }, { status: 400 });
  const current = await prisma.preOrder.findUnique({ where: { id: id.data }, select: { status: true } }); if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 }); if (body.data.status !== current.status && !transitions[current.status].includes(body.data.status)) return NextResponse.json({ error: "Invalid status transition" }, { status: 409 });
  await prisma.$transaction(async (tx) => { await tx.preOrder.update({ where: { id: id.data }, data: { status: body.data.status, contactedAt: body.data.status === "PRODUCT_AVAILABLE" ? new Date() : undefined, notifiedAt: body.data.status === "CUSTOMER_NOTIFIED" ? new Date() : undefined } }); await tx.auditLog.create({ data: { actorId: access.user.id, action: "PREORDER_UPDATED", entityType: "PreOrder", entityId: id.data, metadata: { from: current.status, to: body.data.status } } }); }); return NextResponse.json({ ok: true });
}
