import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const schema = z.object({ token: z.string().length(64).regex(/^[a-f0-9]+$/) }).strict();
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth(); if (!session?.user.id) return NextResponse.json({ error: "Sign in to confirm this change." }, { status: 401 });
  const body = schema.safeParse(await request.json().catch(() => null)); if (!body.success) return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
  const tokenHash = createHash("sha256").update(body.data.token).digest("hex");
  const changed = await prisma.$transaction(async (tx) => {
    const token = await tx.emailChangeToken.findFirst({ where: { tokenHash, userId: session.user.id, usedAt: null, expiresAt: { gt: new Date() } } }); if (!token) return false;
    if (await tx.user.findFirst({ where: { email: token.newEmail, id: { not: token.userId } }, select: { id: true } })) return false;
    const claim = await tx.emailChangeToken.updateMany({ where: { id: token.id, usedAt: null }, data: { usedAt: new Date() } }); if (!claim.count) return false;
    await tx.user.update({ where: { id: token.userId }, data: { email: token.newEmail, emailVerified: new Date(), sessionVersion: { increment: 1 } } }); await tx.session.deleteMany({ where: { userId: token.userId } }); return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "This verification link is invalid, expired, or already used." }, { status: 400 });
}
