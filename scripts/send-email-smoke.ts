import { loadEnvConfig } from "@next/env";
import { prisma } from "../lib/prisma";
import { createSmtpTransport, resolveSmtpConfiguration } from "../lib/smtp-config";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

async function main() {
  const user = await prisma.user.findFirst({ where: { acceptMarketingEmails: true, email: { not: null } }, select: { id: true, email: true }, orderBy: { updatedAt: "desc" } });
  if (!user?.email) throw new Error("No opted-in user with an email address was found.");
  const configuration = resolveSmtpConfiguration();
  if (!configuration) throw new Error("SMTP is not configured.");
  const eventKey = "smtp-smoke:" + user.id + ":" + Date.now();
  const notification = await prisma.emailNotification.create({ data: { eventKey, recipient: user.email, template: "smtp-smoke", status: "PENDING" } });
  const transport = createSmtpTransport(configuration);
  try {
    const result = await transport.sendMail({ from: configuration.from, replyTo: configuration.replyTo, to: user.email, subject: "EYEBREED email delivery test", html: '<div style="background:#f4f0eb;padding:32px;font-family:Arial"><div style="max-width:600px;margin:auto;background:white;padding:32px"><h1 style="letter-spacing:5px">EYEBREED</h1><p>Email delivery is configured and working.</p></div></div>' });
    if (result.rejected.length) throw new Error("SMTP rejected the recipient.");
    await prisma.emailNotification.update({ where: { id: notification.id }, data: { status: "SENT", error: null, sentAt: new Date() } });
    console.log(JSON.stringify({ sent: true }));
  } catch (error) {
    await prisma.emailNotification.update({ where: { id: notification.id }, data: { status: "FAILED", error: error instanceof Error ? error.message.slice(0, 500) : "Unknown error" } });
    throw error;
  } finally {
    transport.close();
  }
}

main().finally(() => prisma.$disconnect());
