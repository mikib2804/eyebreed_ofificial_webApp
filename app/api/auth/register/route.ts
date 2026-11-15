import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema, optionalPhoneSchema, personNameSchema } from "@/lib/validation";
import { consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";
import { sendWelcomeEmail } from "@/lib/email";
import { logServerEvent } from "@/lib/server-log";

const registerSchema = z.object({
  name: personNameSchema,
  email: normalizedEmailSchema,
  password: z.string().min(8).max(72),
  phone: optionalPhoneSchema,
  acceptedTerms: z.literal(true),
  acceptMarketingEmails: z.boolean().default(false),
  locale: z.enum(["he", "en"]).default("he")
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const rate = await consumeRateLimit("register", requestFingerprint(request), 5, 60 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const raw = await readJsonBody(request, 8_192);
  if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const parsed = registerSchema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: "Please check your details." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null, passwordHash, acceptMarketingEmails: parsed.data.acceptMarketingEmails, emailLocale: parsed.data.locale } });
  await sendWelcomeEmail({ id: user.id, name: user.name, email: parsed.data.email, emailLocale: user.emailLocale }).catch((error) => logServerEvent("error", "email", user.id, "welcome_notification_failed", { errorType: error instanceof Error ? error.name : "unknown" }));
  return NextResponse.json({ ok: true }, { status: 201 });
}
