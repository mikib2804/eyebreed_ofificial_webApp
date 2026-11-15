import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema, optionalPhoneSchema, personNameSchema } from "@/lib/validation";
import { getAppOrigin } from "@/lib/app-origin";
import { sendCustomerEmail, sendProfileUpdatedEmail } from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";
import { logServerEvent } from "@/lib/server-log";

const profileSchema = z.object({
  name: personNameSchema,
  email: normalizedEmailSchema,
  phone: optionalPhoneSchema,
  currentPassword: z.string().max(72).optional(),
  newPassword: z.union([z.string().min(8).max(72), z.literal("")]).optional(),
  acceptMarketingEmails: z.boolean(),
  locale: z.enum(["he", "en"]),
}).strict();

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rate = await consumeRateLimit("account-profile", session.user.id, 20, 15 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many profile updates. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });

  const raw = await readJsonBody(request, 8_192);
  if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const parsed = profileSchema.safeParse(raw.data);
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

  const updatedUser = await prisma.user.update({
    where: { id: current.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null, acceptMarketingEmails: parsed.data.acceptMarketingEmails, emailLocale: parsed.data.locale, ...(passwordHash ? { passwordHash, sessionVersion: { increment: 1 } } : {}) },
  });
  if (emailChanged) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.$transaction([prisma.emailChangeToken.deleteMany({ where: { userId: current.id, usedAt: null } }), prisma.emailChangeToken.create({ data: { userId: current.id, newEmail: parsed.data.email, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } })]);
    const url = `${getAppOrigin()}/account/profile/verify-email?token=${token}`;
    await sendCustomerEmail({ eventKey: `email-change:${tokenHash}`, to: parsed.data.email, subject: "Verify your new EYEBREED email", template: "email-change", html: `<p>Confirm this email address within 30 minutes:</p><p><a href="${url}">Verify email change</a></p>` });
  }
  if (current.email) {
    const updatedFields = [parsed.data.name !== current.name ? (parsed.data.locale === "he" ? "שם" : "name") : "", (parsed.data.phone || null) !== current.phone ? (parsed.data.locale === "he" ? "טלפון" : "phone") : "", parsed.data.acceptMarketingEmails !== current.acceptMarketingEmails ? (parsed.data.locale === "he" ? "העדפות דיוור" : "marketing preference") : "", passwordHash ? (parsed.data.locale === "he" ? "סיסמה" : "password") : ""].filter(Boolean);
    await sendProfileUpdatedEmail({ id: current.id, email: current.email, emailLocale: parsed.data.locale }, updatedFields, updatedUser.updatedAt.toISOString()).catch((error) => logServerEvent("error", "email", current.id, "profile_notification_failed", { errorType: error instanceof Error ? error.name : "unknown" }));
  }
  return NextResponse.json({ ok: true, emailVerificationSent: emailChanged });
}
