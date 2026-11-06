import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().length(64).regex(/^[a-f0-9]+$/), password: z.string().min(8).max(72) }).strict();

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const rate = await consumeRateLimit("reset-password", requestFingerprint(request), 10, 60 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const passwordHash = await hash(parsed.data.password, 12);
  const changed = await prisma.$transaction(async (transaction) => {
    const record = await transaction.passwordResetToken.findFirst({ where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, userId: true } });
    if (!record) return false;
    const claimed = await transaction.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: new Date() } });
    if (!claimed.count) return false;
    await transaction.user.update({ where: { id: record.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } });
    await transaction.session.deleteMany({ where: { userId: record.userId } });
    return true;
  });
  if (!changed) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
