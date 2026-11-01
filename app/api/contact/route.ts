import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MAX_BODY_CHARS = 12_000;
const MIN_COMPLETION_MS = 2_000;
const MAX_COMPLETION_MS = 2 * 60 * 60 * 1_000;

const contactSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  message: z.string().trim().min(10).max(2_000),
  locale: z.enum(["he", "en"]).default("he"),
  company: z.string().max(200).optional().default(""),
  startedAt: z.number().int().positive(),
});

function clientFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  return createHash("sha256").update(`eyebreed-contact:${address}`).digest("hex");
}

function countLinks(value: string) {
  return value.match(/(?:https?:\/\/|www\.)/gi)?.length ?? 0;
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ message: "Unsupported request." }, { status: 415 });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_CHARS) {
    return NextResponse.json({ message: "Message is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the form fields." }, { status: 400 });
  }

  // Honeypot submissions receive a neutral response so bots cannot tune around it.
  if (parsed.data.company) {
    return NextResponse.json({ message: "Message received." }, { status: 201 });
  }

  const completionTime = Date.now() - parsed.data.startedAt;
  if (completionTime < MIN_COMPLETION_MS || completionTime > MAX_COMPLETION_MS) {
    return NextResponse.json({ message: "Please refresh the form and try again." }, { status: 400 });
  }

  if (countLinks(parsed.data.message) > 2) {
    return NextResponse.json({ message: "Please remove extra links from the message." }, { status: 400 });
  }

  const ipHash = clientFingerprint(request);
  const { email, fullName, message, locale } = parsed.data;

  try {
    const [recentByIp, dailyByIp, recentByEmail, duplicate] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS "count" FROM "ContactMessage"
        WHERE "ipHash" = ${ipHash} AND "createdAt" > NOW() - INTERVAL '30 minutes'
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS "count" FROM "ContactMessage"
        WHERE "ipHash" = ${ipHash} AND "createdAt" > NOW() - INTERVAL '24 hours'
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS "count" FROM "ContactMessage"
        WHERE "email" = ${email} AND "createdAt" > NOW() - INTERVAL '60 minutes'
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS "count" FROM "ContactMessage"
        WHERE "email" = ${email} AND "message" = ${message}
          AND "createdAt" > NOW() - INTERVAL '24 hours'
      `,
    ]);

    if (
      Number(recentByIp[0]?.count ?? 0) >= 3 ||
      Number(dailyByIp[0]?.count ?? 0) >= 10 ||
      Number(recentByEmail[0]?.count ?? 0) >= 3 ||
      Number(duplicate[0]?.count ?? 0) >= 1
    ) {
      return NextResponse.json(
        { message: locale === "he" ? "נשלחו יותר מדי הודעות. נסו שוב מאוחר יותר." : "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": "1800" } },
      );
    }

    await prisma.$executeRaw`
      INSERT INTO "ContactMessage" ("id", "fullName", "email", "message", "locale", "ipHash", "createdAt")
      VALUES (${randomUUID()}, ${fullName}, ${email}, ${message}, ${locale}, ${ipHash}, CURRENT_TIMESTAMP)
    `;

    return NextResponse.json(
      { message: locale === "he" ? "ההודעה נשלחה בהצלחה." : "Your message was sent successfully." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: locale === "he" ? "לא הצלחנו לשמור את ההודעה. נסו שוב." : "We could not save your message. Please try again." },
      { status: 500 },
    );
  }
}
