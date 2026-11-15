import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import nodemailer from "nodemailer";
import { getAppOrigin } from "@/lib/app-origin";
import { prisma } from "@/lib/prisma";
import { logServerEvent } from "@/lib/server-log";
import { normalizedEmailSchema } from "@/lib/validation";

export type EmailLocale = "he" | "en";
type DeliveryResult = { sent: boolean; duplicate?: boolean; skipped?: boolean };
let smtpTransport: ReturnType<typeof nodemailer.createTransport> | undefined;

const localeOf = (value?: string | null): EmailLocale => value === "en" ? "en" : "he";
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);

function smtpConfiguration() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const host = process.env.SMTP_HOST?.trim() || (gmailUser ? "smtp.gmail.com" : "");
  const user = process.env.SMTP_USER?.trim() || gmailUser;
  const password = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD)?.replace(/\s+/g, "");
  const port = Number(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587));
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  if (!host || !user || !password || !Number.isInteger(port)) return null;
  smtpTransport ??= nodemailer.createTransport({ host, port, secure, auth: { user, pass: password }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 20_000 });
  return { transport: smtpTransport, user };
}

function brandedEmail(locale: EmailLocale, title: string, body: string, action?: { label: string; url: string }, footer?: string) {
  const rtl = locale === "he";
  return `<!doctype html><html lang="${locale}" dir="${rtl ? "rtl" : "ltr"}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#f4f0eb;color:#171412;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0eb;padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #ded7cf"><tr><td style="background:#171412;color:#fff;padding:24px;text-align:center;font-size:24px;letter-spacing:6px">EYEBREED</td></tr><tr><td style="padding:32px 24px;line-height:1.7;text-align:${rtl ? "right" : "left"}"><h1 style="margin:0 0 20px;font-size:28px;line-height:1.2">${escapeHtml(title)}</h1>${body}${action ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#171412;color:#fff;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:1px">${escapeHtml(action.label)}</a></p>` : ""}</td></tr><tr><td style="border-top:1px solid #ded7cf;padding:20px 24px;color:#6c625a;font-size:11px;line-height:1.6;text-align:${rtl ? "right" : "left"}">${footer || (rtl ? "הודעה זו נשלחה על ידי EYEBREED." : "This message was sent by EYEBREED.")}</td></tr></table></td></tr></table></body></html>`;
}

export async function sendCustomerEmail(input: { eventKey: string; to: string; subject: string; html: string; template: string; replyTo?: string }): Promise<DeliveryResult> {
  const parsedEmail = normalizedEmailSchema.safeParse(input.to);
  if (!parsedEmail.success) {
    logServerEvent("warn", "email", input.eventKey, "invalid_recipient", { template: input.template });
    return { sent: false, skipped: true };
  }
  try {
    await prisma.emailNotification.create({ data: { eventKey: input.eventKey, recipient: parsedEmail.data, template: input.template, status: "PENDING" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { sent: false, duplicate: true };
    logServerEvent("error", "email", input.eventKey, "notification_claim_failed", { template: input.template, errorType: error instanceof Error ? error.name : "unknown" });
    return { sent: false };
  }
  const smtp = smtpConfiguration();
  if (!smtp) {
    await prisma.emailNotification.update({ where: { eventKey: input.eventKey }, data: { status: "SKIPPED", error: "SMTP is not configured." } }).catch(() => undefined);
    logServerEvent("warn", "email", input.eventKey, "smtp_not_configured", { template: input.template });
    return { sent: false, skipped: true };
  }
  try {
    const parsedReplyTo = input.replyTo ? normalizedEmailSchema.safeParse(input.replyTo) : null;
    const result = await smtp.transport.sendMail({ from: process.env.EMAIL_FROM?.trim() || `EYEBREED <${smtp.user}>`, replyTo: parsedReplyTo?.success ? parsedReplyTo.data : process.env.EMAIL_REPLY_TO?.trim() || undefined, to: parsedEmail.data, subject: input.subject, html: input.html });
    if (result.rejected.length) throw new Error("SMTP rejected the recipient.");
    await prisma.emailNotification.update({ where: { eventKey: input.eventKey }, data: { status: "SENT", error: null, sentAt: new Date() } });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown SMTP error";
    await prisma.emailNotification.update({ where: { eventKey: input.eventKey }, data: { status: "FAILED", error: message } }).catch(() => undefined);
    logServerEvent("error", "email", input.eventKey, "delivery_failed", { template: input.template, errorType: error instanceof Error ? error.name : "unknown" });
    return { sent: false };
  }
}

export async function sendContactRequestConfirmation(request: { id: string; email: string; locale: EmailLocale }) {
  const he = request.locale === "he";
  return sendCustomerEmail({
    eventKey: `contact-confirmation:${request.id}`,
    to: request.email,
    subject: he ? "קיבלנו את פנייתך ל-EYEBREED" : "We received your EYEBREED contact request",
    template: "contact-confirmation",
    html: brandedEmail(
      request.locale,
      he ? "הפנייה התקבלה" : "We received your request",
      `<p>${he ? "קיבלנו את פרטי הקשר שלך. הצוות שלנו יחזור אליך בהקדם האפשרי." : "We received your contact details. Our team will get back to you as soon as possible."}</p>`,
      { label: he ? "חזרה לאתר" : "RETURN TO EYEBREED", url: getAppOrigin() },
    ),
  });
}

export async function sendContactRequestNotification(request: { id: string; to: string; email: string; fullName: string; message: string; locale: EmailLocale }) {
  return sendCustomerEmail({
    eventKey: `contact-team-notification:${request.id}`,
    to: request.to,
    replyTo: request.email,
    subject: `פניית קשר חדשה מ-${request.email}`,
    template: "contact-team-notification",
    html: brandedEmail(
      "he",
      "פניית קשר חדשה",
      `<p><strong>שם:</strong> ${escapeHtml(request.fullName)}</p><p><strong>אימייל:</strong> <a href="mailto:${escapeHtml(request.email)}">${escapeHtml(request.email)}</a></p><p><strong>הודעה:</strong><br>${escapeHtml(request.message)}</p><p>יש לחזור ללקוח/ה בהקדם האפשרי.</p>`,
    ),
  });
}

export async function sendWelcomeEmail(user: { id: string; email: string; name: string | null; emailLocale?: string | null }) {
  const locale = localeOf(user.emailLocale); const he = locale === "he";
  return sendCustomerEmail({ eventKey: `welcome:${user.id}`, to: user.email, subject: he ? "ברוכים הבאים ל-EYEBREED" : "Welcome to EYEBREED", template: "welcome", html: brandedEmail(locale, he ? `ברוכים הבאים${user.name ? `, ${user.name}` : ""}` : `Welcome${user.name ? `, ${user.name}` : ""}`, `<p>${he ? "החשבון שלך נוצר בהצלחה. מעכשיו אפשר לשמור מועדפים, לנהל כתובות ולעקוב אחר הזמנות במקום אחד." : "Your account was created successfully. You can now save favorites, manage addresses, and follow orders in one place."}</p>`, { label: he ? "כניסה לאתר" : "VISIT EYEBREED", url: getAppOrigin() }) });
}

export async function sendProfileUpdatedEmail(user: { id: string; email: string; emailLocale?: string | null }, fields: string[], version: string) {
  const locale = localeOf(user.emailLocale); const he = locale === "he";
  const safeFields = fields.map(escapeHtml).join(he ? "، " : ", ");
  return sendCustomerEmail({ eventKey: `profile-updated:${user.id}:${version}`, to: user.email, subject: he ? "פרופיל EYEBREED עודכן" : "Your EYEBREED profile was updated", template: "profile-updated", html: brandedEmail(locale, he ? "הפרופיל שלך עודכן" : "Your profile has been updated", `<p>${he ? "השינויים נשמרו בהצלחה." : "Your changes were saved successfully."}</p>${safeFields ? `<p><strong>${he ? "פרטים שעודכנו" : "Updated information"}:</strong> ${safeFields}</p>` : ""}`, { label: he ? "לפרופיל שלי" : "OPEN MY PROFILE", url: `${getAppOrigin()}/account/profile` }) });
}

type OrderEmail = { id: string; orderNumber: string; customerEmail: string; customerName: string; currency: string; total: Prisma.Decimal; shippingAddress: Prisma.JsonValue; createdAt: Date; user?: { emailLocale: string } | null; items: Array<{ productName: string; quantity: number; unitPrice: Prisma.Decimal; size: string | null; color: string | null }> };
const money = (value: Prisma.Decimal, currency: string, locale: EmailLocale) => new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", { style: "currency", currency }).format(Number(value));

export async function sendOrderConfirmationEmail(order: OrderEmail) {
  const locale = localeOf(order.user?.emailLocale); const he = locale === "he";
  const rows = order.items.map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee">${escapeHtml(item.productName)}${item.size ? ` · ${escapeHtml(item.size)}` : ""}</td><td style="padding:10px;border-bottom:1px solid #eee">${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${escapeHtml(money(item.unitPrice, order.currency, locale))}</td></tr>`).join("");
  const address = order.shippingAddress && typeof order.shippingAddress === "object" && !Array.isArray(order.shippingAddress) ? order.shippingAddress as Record<string, unknown> : {};
  const addressText = [address.fullName, address.line1, address.line2, address.city, address.postalCode, address.country].filter(Boolean).map(escapeHtml).join("<br>");
  return sendCustomerEmail({ eventKey: `order-paid:${order.id}`, to: order.customerEmail, subject: he ? `אישור הזמנה ${order.orderNumber}` : `Order confirmation ${order.orderNumber}`, template: "order-confirmation", html: brandedEmail(locale, he ? "ההזמנה התקבלה בהצלחה" : "Your order is confirmed", `<p><strong>${he ? "מספר הזמנה" : "Order"}:</strong> ${escapeHtml(order.orderNumber)}</p><table role="presentation" width="100%" cellspacing="0"><tbody>${rows}</tbody></table><p><strong>${he ? "סה״כ ששולם" : "Total paid"}:</strong> ${escapeHtml(money(order.total, order.currency, locale))}</p><p><strong>${he ? "כתובת משלוח" : "Shipping address"}:</strong><br>${addressText}</p><p>${he ? "תאריך הזמנה" : "Order date"}: ${escapeHtml(order.createdAt.toLocaleDateString(locale === "he" ? "he-IL" : "en-US"))}</p>`, { label: he ? "צפייה בהזמנה" : "VIEW ORDER", url: `${getAppOrigin()}/account/orders/${order.id}` }) });
}

export async function sendPaymentUnsuccessfulEmail(order: Pick<OrderEmail, "id" | "orderNumber" | "customerEmail" | "user">, reason: "failed" | "interrupted") {
  const locale = localeOf(order.user?.emailLocale); const he = locale === "he";
  return sendCustomerEmail({ eventKey: `payment-${reason}:${order.id}`, to: order.customerEmail, subject: he ? "התשלום עבור ההזמנה לא הושלם" : "Your payment was not completed", template: `payment-${reason}`, html: brandedEmail(locale, reason === "failed" ? (he ? "התשלום נכשל" : "Payment unsuccessful") : (he ? "ההזמנה לא הושלמה" : "Checkout was interrupted"), `<p>${he ? "לא התקבל תשלום עבור ההזמנה" : "No payment was received for order"} <strong>${escapeHtml(order.orderNumber)}</strong>.</p><p>${he ? "אפשר לחזור לעגלה ולנסות שוב. לא חויבת עבור הזמנה זו." : "You can return to your cart and try again. You were not charged for this order."}</p>`, { label: he ? "חזרה לקנייה" : "RETURN TO CHECKOUT", url: `${getAppOrigin()}/checkout` }) });
}

function signingSecret() {
  const value = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.AUTH_SECRET;
  if (!value) throw new Error("EMAIL_UNSUBSCRIBE_SECRET or AUTH_SECRET is required.");
  return value;
}

export function createUnsubscribeToken(userId: string) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
  const payload = `${userId}.${expires}`;
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string) {
  try {
    const [userId, expiresText, supplied] = Buffer.from(token, "base64url").toString("utf8").split(".");
    if (!userId || !expiresText || !supplied || Number(expiresText) < Math.floor(Date.now() / 1000)) return null;
    const expected = createHmac("sha256", signingSecret()).update(`${userId}.${expiresText}`).digest("base64url");
    const a = Buffer.from(supplied); const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b) ? userId : null;
  } catch { return null; }
}

export async function sendDiscountCampaign(discountId: string) {
  const discount = await prisma.discount.findUnique({ where: { id: discountId }, include: { products: { select: { name: true, slug: true, images: true } }, categories: { select: { name: true } } } });
  if (!discount?.active) return { recipients: 0 };
  const recipients = await prisma.user.findMany({ where: { acceptMarketingEmails: true, email: { not: null } }, select: { id: true, email: true, emailLocale: true } });
  const fingerprint = createHmac("sha256", signingSecret()).update(JSON.stringify({ name: discount.name, type: discount.type, value: String(discount.value), scope: discount.scope, products: discount.products.map((item) => item.slug).sort(), categories: discount.categories.map((item) => item.name).sort(), endsAt: discount.endsAt?.toISOString() })).digest("hex").slice(0, 20);
  await Promise.allSettled(recipients.map((user) => {
    if (!user.email) return Promise.resolve();
    const locale = localeOf(user.emailLocale); const he = locale === "he";
    const applies = discount.products.length ? discount.products.map((item) => item.name).join(", ") : discount.categories.length ? discount.categories.map((item) => item.name).join(", ") : (he ? "כל החנות" : "Storewide");
    const value = discount.type === "PERCENTAGE" ? `${Number(discount.value)}%` : money(discount.value, "ILS", locale);
    const rawImage = discount.products[0]?.images[0];
    const image = rawImage ? (rawImage.startsWith("/") ? `${getAppOrigin()}${rawImage}` : rawImage) : null;
    const unsubscribe = `${getAppOrigin()}/api/email/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(user.id))}`;
    const footer = he ? `קיבלת הודעה זו כי אישרת דיוור שיווקי. <a href="${unsubscribe}">הסרה מרשימת התפוצה</a>` : `You received this because you opted in to marketing email. <a href="${unsubscribe}">Unsubscribe</a>`;
    return sendCustomerEmail({ eventKey: `discount:${discount.id}:${fingerprint}:${user.id}`, to: user.email, subject: he ? `הטבה חדשה ב-EYEBREED: ${discount.name}` : `New EYEBREED offer: ${discount.name}`, template: "discount-campaign", html: brandedEmail(locale, discount.name, `${image ? `<p><img src="${escapeHtml(image)}" alt="" width="572" style="display:block;width:100%;height:auto;max-height:420px;object-fit:cover"></p>` : ""}<p><strong>${escapeHtml(value)}</strong></p><p>${he ? "חל על" : "Applies to"}: ${escapeHtml(applies)}</p>${discount.endsAt ? `<p>${he ? "בתוקף עד" : "Valid until"}: ${escapeHtml(discount.endsAt.toLocaleDateString(locale === "he" ? "he-IL" : "en-US"))}</p>` : ""}`, { label: he ? "לצפייה בהטבה" : "VIEW OFFER", url: discount.products[0] ? `${getAppOrigin()}/products/${discount.products[0].slug}` : `${getAppOrigin()}/#products` }, footer) });
  }));
  return { recipients: recipients.length };
}
