import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema } from "@/lib/validation";
import { consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: normalizedEmailSchema,
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(30).optional(),
  acceptedTerms: z.literal(true)
});

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const rate = await consumeRateLimit("register", requestFingerprint(request), 5, 60 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your details." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null, passwordHash } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
