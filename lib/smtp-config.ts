import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

export type SmtpConfiguration = {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  user: string;
  password: string;
  from: string;
  replyTo?: string;
};

function booleanValue(value: string | undefined, fallback: boolean) {
  if (!value?.trim()) return fallback;
  return value.trim().toLowerCase() === "true";
}

export function resolveSmtpConfiguration(environment: Readonly<Record<string, string | undefined>> = process.env): SmtpConfiguration | null {
  const gmailUser = environment.GMAIL_USER?.trim();
  const host = environment.SMTP_HOST?.trim() || (gmailUser ? "smtp.gmail.com" : "");
  const user = environment.SMTP_USER?.trim() || gmailUser || "";
  const rawPassword = environment.SMTP_PASSWORD || environment.GMAIL_APP_PASSWORD || "";
  const password = host === "smtp.gmail.com" ? rawPassword.replace(/\s+/g, "") : rawPassword;
  const port = Number(environment.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587));
  const secure = booleanValue(environment.SMTP_SECURE, port === 465);
  const requireTLS = booleanValue(environment.SMTP_REQUIRE_TLS, !secure);
  if (!host || !user || !password || !Number.isInteger(port) || port < 1 || port > 65_535) return null;
  return {
    host,
    port,
    secure,
    requireTLS,
    user,
    password,
    from: environment.EMAIL_FROM?.trim() || "EYEBREED <" + user + ">",
    replyTo: environment.EMAIL_REPLY_TO?.trim() || undefined,
  };
}

export function createSmtpTransport(configuration: SmtpConfiguration): Transporter {
  return nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    requireTLS: configuration.requireTLS,
    auth: { user: configuration.user, pass: configuration.password },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    tls: { servername: configuration.host, minVersion: "TLSv1.2" },
  });
}
