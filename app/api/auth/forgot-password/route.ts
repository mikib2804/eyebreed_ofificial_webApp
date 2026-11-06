import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppOrigin } from "@/lib/app-origin";
import { sendCustomerEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema } from "@/lib/validation";
import { consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";

const schema = z.object({ email: normalizedEmailSchema }).strict();

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const rate = await consumeRateLimit("forgot-password", requestFingerprint(request), 5, 60 * 60);
  if (!rate.allowed) return NextResponse.json({ ok: true, message: "If an account exists, a reset link has been sent." }, { headers: { "Retry-After": String(rate.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  const response = NextResponse.json({ ok: true, message: "If an account exists, a reset link has been sent." });
  if (!parsed.success) return response;
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return response;

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }),
  ]);
  const url = `${getAppOrigin()}/reset-password?token=${token}`;
  await sendCustomerEmail({ eventKey: `password-reset:${tokenHash}`, to: parsed.data.email, subject: "Reset your EYEBREED password", template: "password-reset", html: `<p>Use this secure link within one hour:</p><p><a href="${url}">Reset password</a></p>` }).catch(() => undefined);
  return response;
}
