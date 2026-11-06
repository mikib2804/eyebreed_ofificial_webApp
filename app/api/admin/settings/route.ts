import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema } from "@/lib/validation";

const schema = z.object({ contactEmail: z.union([normalizedEmailSchema, z.literal("")]), contactPhone: z.string().trim().max(40), shippingInfo: z.string().trim().max(5_000), defaultLowStockThreshold: z.coerce.number().int().min(0).max(10_000), announcement: z.string().trim().max(500), announcementActive: z.boolean() }).strict();
export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const access = await getAdminAccess(); if (access.status !== "authorized") return NextResponse.json({ error: "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403 });
  const body = schema.safeParse(await request.json().catch(() => null)); if (!body.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  const data = { ...body.data, contactEmail: body.data.contactEmail || null, contactPhone: body.data.contactPhone || null, shippingInfo: body.data.shippingInfo || null, announcement: body.data.announcement || null };
  await prisma.$transaction(async (tx) => { await tx.storeSettings.upsert({ where: { id: "store" }, update: data, create: { id: "store", ...data } }); await tx.auditLog.create({ data: { actorId: access.user.id, action: "SETTINGS_UPDATED", entityType: "StoreSettings", entityId: "store" } }); });
  return NextResponse.json({ ok: true });
}
