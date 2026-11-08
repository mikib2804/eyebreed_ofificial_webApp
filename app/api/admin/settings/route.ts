import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";
import { normalizedEmailSchema } from "@/lib/validation";

const schema = z.object({
  contactEmail: z.union([normalizedEmailSchema, z.literal("")]),
  contactPhone: z.string().trim().max(40),
  shippingInfo: z.string().trim().max(5_000),
  defaultLowStockThreshold: z.coerce.number().int().min(0).max(10_000),
  announcement: z.string().trim().max(500),
  announcementActive: z.boolean(),
  notificationPreferences: z.object({ newOrder: z.boolean(), lowStock: z.boolean(), contactMessage: z.boolean(), preOrder: z.boolean() }).strict(),
}).strict();
export async function PATCH(request: Request) {
  const authorization = await authorizeAdminMutation(request, "settings"); if ("response" in authorization) return authorization.response;
  const raw = await readJsonBody(request, 16_384); if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status }); const body = schema.safeParse(raw.data); if (!body.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  const data = { ...body.data, contactEmail: body.data.contactEmail || null, contactPhone: body.data.contactPhone || null, shippingInfo: body.data.shippingInfo || null, announcement: body.data.announcement || null };
  await prisma.$transaction(async (tx) => { await tx.storeSettings.upsert({ where: { id: "store" }, update: data, create: { id: "store", ...data } }); await tx.auditLog.create({ data: { actorId: authorization.access.user.id, action: "SETTINGS_UPDATED", entityType: "StoreSettings", entityId: "store" } }); });
  return NextResponse.json({ ok: true });
}
