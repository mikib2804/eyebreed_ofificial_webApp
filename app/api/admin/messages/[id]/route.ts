import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

const schema = z.object({ status: z.enum(["NEW", "READ", "IN_PROGRESS", "REPLIED", "DECLINED", "ARCHIVED"]), replyBody: z.string().trim().max(10_000).optional() }).strict();
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation(request, "messages"); if ("response" in authorization) return authorization.response;
  const raw = await readJsonBody(request, 16_384); if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const id = z.string().uuid().safeParse((await params).id); const body = schema.safeParse(raw.data);
  if (!id.success || !body.success) return NextResponse.json({ error: "Invalid message update" }, { status: 400 });
  const message = await prisma.$transaction(async (tx) => {
    const updated = await tx.contactMessage.update({ where: { id: id.data }, data: { status: body.data.status, replyBody: body.data.replyBody || null, repliedAt: body.data.status === "REPLIED" ? new Date() : undefined } });
    await tx.auditLog.create({ data: { actorId: authorization.access.user.id, action: "MESSAGE_UPDATED", entityType: "ContactMessage", entityId: updated.id, metadata: { status: updated.status } } }); return updated;
  }).catch(() => null);
  return message ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Message not found" }, { status: 404 });
}
