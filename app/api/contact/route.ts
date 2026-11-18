import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { normalizedEmailSchema, personNameSchema } from "@/lib/validation";
import { sendContactRequestConfirmation, sendContactRequestNotification } from "@/lib/email";

const MAX_BODY_CHARS = 12_000;
const MIN_COMPLETION_MS = 2_000;
const MAX_COMPLETION_MS = 2 * 60 * 60 * 1_000;
const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

const contactSchema = z.object({
  fullName: personNameSchema,
  email: normalizedEmailSchema,
  message: z.string().trim().min(10).max(2_000),
  locale: z.enum(["he", "en"]).default("he"),
  company: z.string().max(200).optional().default(""),
  startedAt: z.number().int().positive(),
}).strict();

function reportedClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip")?.trim() || forwarded;
}

function clientFingerprint(request: Request, email: string) {
  const reportedAddress = reportedClientAddress(request);
  const address = !reportedAddress || LOOPBACK_ADDRESSES.has(reportedAddress)
    ? `local:${email.toLowerCase()}`
    : reportedAddress;
  return createHash("sha256").update(`eyebreed-contact:${address}`).digest("hex");
}

function countLinks(value: string) {
  return value.match(/(?:https?:\/\/|www\.)/gi)?.length ?? 0;
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ message: "Unsupported request." }, { status: 415 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_CHARS) {
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

  const { email, fullName, message, locale } = parsed.data;
  const ipHash = clientFingerprint(request, email);
  const reportedAddress = reportedClientAddress(request);
  const localDevelopment = process.env.NODE_ENV !== "production" && (!reportedAddress || LOOPBACK_ADDRESSES.has(reportedAddress));

  try {
    const [limits] = await prisma.$queryRaw<Array<{ recentByIp: bigint; dailyByIp: bigint; recentByEmail: bigint; duplicate: bigint }>>`
      SELECT
        COUNT(*) FILTER (WHERE "ipHash" = ${ipHash} AND "createdAt" > NOW() - INTERVAL '30 minutes')::bigint AS "recentByIp",
        COUNT(*) FILTER (WHERE "ipHash" = ${ipHash})::bigint AS "dailyByIp",
        COUNT(*) FILTER (WHERE "email" = ${email} AND "createdAt" > NOW() - INTERVAL '60 minutes')::bigint AS "recentByEmail",
        COUNT(*) FILTER (WHERE "email" = ${email} AND "message" = ${message})::bigint AS "duplicate"
      FROM "ContactMessage"
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
        AND ("ipHash" = ${ipHash} OR "email" = ${email})
    `;

    if (Number(limits?.duplicate ?? 0) >= 1) {
      return NextResponse.json(
        { message: locale === "he" ? "הפנייה כבר התקבלה ותטופל בהקדם." : "This request was already received and will be handled shortly." },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!localDevelopment && (
      Number(limits?.recentByIp ?? 0) >= 3 ||
      Number(limits?.dailyByIp ?? 0) >= 10 ||
      Number(limits?.recentByEmail ?? 0) >= 3
    )) {
      return NextResponse.json(
        { message: locale === "he" ? "נשלחו יותר מדי הודעות. נסו שוב מאוחר יותר." : "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": "1800" } },
      );
    }

    const messageId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "ContactMessage" ("id", "fullName", "email", "message", "locale", "ipHash", "createdAt")
      VALUES (${messageId}, ${fullName}, ${email}, ${message}, ${locale}, ${ipHash}, CURRENT_TIMESTAMP)
    `;

    const settings = await prisma.storeSettings.findUnique({ where: { id: "store" }, select: { contactEmail: true, notificationPreferences: true } });
    const preferences = settings?.notificationPreferences && typeof settings.notificationPreferences === "object" && !Array.isArray(settings.notificationPreferences)
      ? settings.notificationPreferences as Record<string, unknown>
      : {};
    const teamEmail = settings?.contactEmail?.trim()
      || process.env.ADMIN_NOTIFICATION_EMAIL?.trim()
      || process.env.CONTACT_NOTIFICATION_EMAIL?.trim()
      || process.env.EMAIL_REPLY_TO?.trim()
      || process.env.SMTP_USER?.trim()
      || process.env.GMAIL_USER?.trim()
      || "eyebreedofficial@gmail.com";
    const deliveries: Array<Promise<unknown>> = [sendContactRequestConfirmation({ id: messageId, email, locale })];
    if (teamEmail && preferences.contactMessage !== false) deliveries.push(sendContactRequestNotification({ id: messageId, to: teamEmail, email, fullName, message, locale }));
    await Promise.allSettled(deliveries);

    return NextResponse.json(
      { message: locale === "he" ? "הפנייה התקבלה. הצוות שלנו יחזור אליך בהקדם האפשרי." : "Request received. Our team will contact you as soon as possible." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: locale === "he" ? "לא הצלחנו לשמור את ההודעה. נסו שוב." : "We could not save your message. Please try again." },
      { status: 500 },
    );
  }
}
