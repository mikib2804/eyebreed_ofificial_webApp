import nodemailer from "nodemailer";

async function main() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const host = process.env.SMTP_HOST?.trim() || (gmailUser ? "smtp.gmail.com" : "");
  const user = process.env.SMTP_USER?.trim() || gmailUser;
  const password = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD)?.replace(/\s+/g, "");
  const port = Number(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587));
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  if (!host || !user || !password) throw new Error("SMTP configuration is incomplete.");
  const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass: password }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 20_000 });
  await transport.verify();
  console.log(JSON.stringify({ smtpVerified: true, host, port, secure }));
  transport.close();
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ smtpVerified: false, errorType: error instanceof Error ? error.name : "unknown", message: error instanceof Error ? error.message.replace(/[^\s]{20,}/g, "[redacted]") : "SMTP verification failed." }));
  process.exitCode = 1;
});
