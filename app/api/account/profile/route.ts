import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema } from "@/lib/validation";
import { getAppOrigin } from "@/lib/app-origin";
import { sendCustomerEmail } from "@/lib/email";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: normalizedEmailSchema,
  phone: z.string().trim().max(30).optional(),
  currentPassword: z.string().max(72).optional(),
  newPassword: z.union([z.string().min(8).max(72), z.literal("")]).optional(),
}).strict();

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check your details." }, { status: 400 });

  const current = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!current) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const emailChanged = parsed.data.email !== current.email?.toLowerCase();
  if (emailChanged && current.passwordHash && (!parsed.data.currentPassword || !await compare(parsed.data.currentPassword, current.passwordHash))) return NextResponse.json({ error: "Enter your current password to change email." }, { status: 400 });
  if (emailChanged && await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })) return NextResponse.json({ error: "That email is already in use." }, { status: 409 });

  let passwordHash: string | undefined;
  if (parsed.data.newPassword) {
    if (!current.passwordHash) return NextResponse.json({ error: "This account uses Google sign-in and has no password to change." }, { status: 400 });
    if (!parsed.data.currentPassword || !await compare(parsed.data.currentPassword, current.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    passwordHash = await hash(parsed.data.newPassword, 12);
  }

  await prisma.user.update({
    where: { id: current.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null, ...(passwordHash ? { passwordHash, sessionVersion: { increment: 1 } } : {}) },
  });
  if (emailChanged) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.$transaction([prisma.emailChangeToken.deleteMany({ where: { userId: current.id, usedAt: null } }), prisma.emailChangeToken.create({ data: { userId: current.id, newEmail: parsed.data.email, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } })]);
    const url = `${getAppOrigin()}/account/profile/verify-email?token=${token}`;
    await sendCustomerEmail({ eventKey: `email-change:${tokenHash}`, to: parsed.data.email, subject: "Verify your new EYEBREED email", template: "email-change", html: `<p>Confirm this email address within 30 minutes:</p><p><a href="${url}">Verify email change</a></p>` });
  }
  return NextResponse.json({ ok: true, emailVerificationSent: emailChanged });
}
