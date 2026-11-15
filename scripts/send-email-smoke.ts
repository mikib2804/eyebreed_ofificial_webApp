import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({ where: { acceptMarketingEmails: true, email: { not: null } }, select: { id: true, email: true }, orderBy: { updatedAt: "desc" } });
  if (!user?.email) throw new Error("No opted-in user with an email address was found.");
  const gmailUser = process.env.GMAIL_USER?.trim();
  const host = process.env.SMTP_HOST?.trim() || (gmailUser ? "smtp.gmail.com" : "");
  const smtpUser = process.env.SMTP_USER?.trim() || gmailUser;
  const password = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD)?.replace(/\s+/g, "");
  const port = Number(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587));
  if (!host || !smtpUser || !password) throw new Error("SMTP is not configured.");
  const eventKey = `smtp-smoke:${user.id}:${Date.now()}`;
  const notification = await prisma.emailNotification.create({ data: { eventKey, recipient: user.email, template: "smtp-smoke", status: "PENDING" } });
  try {
    const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user: smtpUser, pass: password }, connectionTimeout: 15_000, socketTimeout: 20_000 });
    await transport.sendMail({ from: process.env.EMAIL_FROM || `EYEBREED <${smtpUser}>`, to: user.email, subject: "EYEBREED email delivery test", html: '<div style="background:#f4f0eb;padding:32px;font-family:Arial"><div style="max-width:600px;margin:auto;background:white;padding:32px"><h1 style="letter-spacing:5px">EYEBREED</h1><p>Email delivery is configured and working.</p></div></div>' });
    await prisma.emailNotification.update({ where: { id: notification.id }, data: { status: "SENT", sentAt: new Date() } });
    console.log(JSON.stringify({ sent: true }));
    transport.close();
  } catch (error) {
    await prisma.emailNotification.update({ where: { id: notification.id }, data: { status: "FAILED", error: error instanceof Error ? error.message.slice(0, 500) : "Unknown error" } });
    throw error;
  }
}

main().finally(() => prisma.$disconnect());
