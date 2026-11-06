import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const schema = z.object({ status: z.enum(["NEW", "READ", "IN_PROGRESS", "REPLIED", "DECLINED", "ARCHIVED"]), replyBody: z.string().trim().max(10_000).optional() }).strict();
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const access = await getAdminAccess(); if (access.status !== "authorized") return NextResponse.json({ error: "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403 });
  const id = z.string().uuid().safeParse((await params).id); const body = schema.safeParse(await request.json().catch(() => null));
  if (!id.success || !body.success) return NextResponse.json({ error: "Invalid message update" }, { status: 400 });
  const message = await prisma.$transaction(async (tx) => {
    const updated = await tx.contactMessage.update({ where: { id: id.data }, data: { status: body.data.status, replyBody: body.data.replyBody || null, repliedAt: body.data.status === "REPLIED" ? new Date() : undefined } });
    await tx.auditLog.create({ data: { actorId: access.user.id, action: "MESSAGE_UPDATED", entityType: "ContactMessage", entityId: updated.id, metadata: { status: updated.status } } }); return updated;
  }).catch(() => null);
  return message ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Message not found" }, { status: 404 });
}
