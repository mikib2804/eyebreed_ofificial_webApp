import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type Level = "PASS" | "WARN" | "FAIL";
type Check = { level: Level; name: string; detail: string };

function loadLocalEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let envValue = match[2].trim();
    if ((envValue.startsWith('"') && envValue.endsWith('"')) || (envValue.startsWith("'") && envValue.endsWith("'"))) envValue = envValue.slice(1, -1);
    process.env[match[1]] = envValue;
  }
}

loadLocalEnv();
const checks: Check[] = [];
const value = (name: string) => process.env[name]?.trim() ?? "";
const isPlaceholder = (input: string) => !input || /REPLACE_ME|example\.com|changeme/i.test(input);
const check = (level: Level, name: string, detail: string) => checks.push({ level, name, detail });

for (const name of ["DATABASE_URL", "DIRECT_URL"] as const) {
  let valid = false;
  try {
    const parsed = new URL(value(name));
    valid = ["postgres:", "postgresql:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {}
  check(valid ? "PASS" : "FAIL", name, valid ? "PostgreSQL URL configured." : "Missing or invalid PostgreSQL URL.");
}

const authSecret = value("AUTH_SECRET");
check(authSecret.length >= 32 && !isPlaceholder(authSecret) ? "PASS" : "FAIL", "AUTH_SECRET", "Must be a unique random value of at least 32 characters.");

let appUrlValid = false;
try {
  const parsed = new URL(value("NEXT_PUBLIC_APP_URL"));
  appUrlValid = parsed.protocol === "https:" || parsed.hostname === "localhost";
} catch {}
check(appUrlValid ? "PASS" : "FAIL", "NEXT_PUBLIC_APP_URL", "Must be the exact deployment origin; HTTPS is required outside localhost.");

for (const name of ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] as const) check(!isPlaceholder(value(name)) ? "PASS" : "FAIL", name, "Required for Google sign-in.");
check(value("AUTH_TRUST_HOST") === "true" ? "PASS" : "FAIL", "AUTH_TRUST_HOST", "Set true only in the trusted HTTPS deployment environment so Auth.js accepts the proxy host.");

const stripeSecret = value("STRIPE_SECRET_KEY");
const stripePublic = value("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
const stripeWebhook = value("STRIPE_WEBHOOK_SECRET");
const stripeEnabled = value("STRIPE_CHECKOUT_ENABLED") === "true";
const stripeMode = value("STRIPE_MODE");
const stripeLevel = (valid: boolean): Level => valid ? "PASS" : stripeEnabled ? "FAIL" : "WARN";
check(stripeLevel(stripeMode === "test" || stripeMode === "live"), "STRIPE_MODE", "Set to test or live; live accepts real charges.");
const stripeSecretPrefix = stripeMode === "live" ? "sk_live_" : "sk_test_";
const stripePublicPrefix = stripeMode === "live" ? "pk_live_" : "pk_test_";
check(stripeLevel(stripeSecret.startsWith(stripeSecretPrefix) && !isPlaceholder(stripeSecret)), "STRIPE_SECRET_KEY", stripeEnabled ? `Use the matching Stripe ${stripeMode || "selected"} secret key on the server only.` : "Optional while Stripe checkout is disabled.");
check(stripeLevel(stripePublic.startsWith(stripePublicPrefix) && !isPlaceholder(stripePublic)), "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", stripeEnabled ? `Use the matching Stripe ${stripeMode || "selected"} publishable key.` : "Optional while Stripe checkout is disabled.");
check(stripeLevel(/^whsec_.+/.test(stripeWebhook) && !isPlaceholder(stripeWebhook)), "STRIPE_WEBHOOK_SECRET", stripeEnabled ? "Use this deployment's webhook signing secret." : "Optional while Stripe checkout is disabled.");
check(stripeEnabled ? "PASS" : "WARN", "STRIPE_CHECKOUT_ENABLED", "Keep false until webhook delivery and one complete test payment are verified.");

const gmailUser = value("GMAIL_USER");
const gmailAppPassword = value("GMAIL_APP_PASSWORD").replace(/\s+/g, "");
const genericSmtp = Boolean(value("SMTP_HOST") && value("SMTP_USER") && value("SMTP_PASSWORD"));
const gmailSmtp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailUser) && gmailAppPassword.length === 16 && !isPlaceholder(gmailUser) && !isPlaceholder(gmailAppPassword);
check(genericSmtp || gmailSmtp ? "PASS" : "WARN", "SMTP delivery", "Configure SMTP_HOST/SMTP_USER/SMTP_PASSWORD or the Gmail fallback variables.");
check(value("EMAIL_FROM").includes("@") && !isPlaceholder(value("EMAIL_FROM")) ? "PASS" : "WARN", "EMAIL_FROM", "Use an address on a domain verified by your email provider.");
check(value("CRON_SECRET").length >= 32 && !isPlaceholder(value("CRON_SECRET")) ? "PASS" : stripeEnabled ? "FAIL" : "WARN", "CRON_SECRET", "Required to protect interrupted-checkout processing.");
check(!value("NEXT_PUBLIC_STRIPE_SECRET_KEY") ? "PASS" : "FAIL", "Secret exposure guard", "Never define NEXT_PUBLIC_STRIPE_SECRET_KEY.");
check(!value("NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET") ? "PASS" : "FAIL", "Webhook exposure guard", "Never define NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET.");

for (const item of checks) console.log(`${item.level.padEnd(4)} ${item.name}: ${item.detail}`);
const failures = checks.filter((item) => item.level === "FAIL").length;
const warnings = checks.filter((item) => item.level === "WARN").length;
console.log(`\nDeployment readiness: ${checks.length - failures - warnings} passed, ${warnings} warnings, ${failures} failures.`);
if (failures) process.exitCode = 1;
