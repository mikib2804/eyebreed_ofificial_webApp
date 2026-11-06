import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema } from "@/lib/validation";

const requestSchema = z.object({
  email: normalizedEmailSchema,
  locale: z.enum(["he", "en"]).default("he"),
  consent: z.literal(true),
  company: z.string().max(200).optional().default(""),
  startedAt: z.number().int().positive(),
}).strict();

function fingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  return createHash("sha256").update(`eyebreed-vision:${address}`).digest("hex");
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ message: "Unsupported request." }, { status: 415 });
  }
  const raw = await request.text();
  if (raw.length > 2_000) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = null; }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email and accept the update consent." }, { status: 400 });
  if (parsed.data.company) return NextResponse.json({ message: "You’re on the list." }, { status: 201 });
  const elapsed = Date.now() - parsed.data.startedAt;
  if (elapsed < 1_500 || elapsed > 2 * 60 * 60 * 1_000) return NextResponse.json({ message: "Refresh and try again." }, { status: 400 });

  const ipHash = fingerprint(request);
  const recent = await prisma.visionWaitlistEntry.count({ where: { ipHash, createdAt: { gt: new Date(Date.now() - 86_400_000) } } });
  if (recent >= 10) return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
  await prisma.visionWaitlistEntry.upsert({
    where: { email: parsed.data.email },
    update: { locale: parsed.data.locale, consentAt: new Date(), ipHash, active: true },
    create: { email: parsed.data.email, locale: parsed.data.locale, consentAt: new Date(), ipHash },
  });
  return NextResponse.json({ message: "You’re on the list." }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
