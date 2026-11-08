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
check(/^sk_test_.+/.test(stripeSecret) && !isPlaceholder(stripeSecret) ? "PASS" : "FAIL", "STRIPE_SECRET_KEY", "Use a Stripe test secret key on the server only.");
check(/^pk_test_.+/.test(stripePublic) && !isPlaceholder(stripePublic) ? "PASS" : "FAIL", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "Use the matching Stripe test publishable key.");
check(/^whsec_.+/.test(stripeWebhook) && !isPlaceholder(stripeWebhook) ? "PASS" : "FAIL", "STRIPE_WEBHOOK_SECRET", "Use this deployment's webhook signing secret.");
check(value("STRIPE_CHECKOUT_ENABLED") === "true" ? "PASS" : "WARN", "STRIPE_CHECKOUT_ENABLED", "Keep false until webhook delivery and one complete test payment are verified.");

check(/^re_.+/.test(value("RESEND_API_KEY")) && !isPlaceholder(value("RESEND_API_KEY")) ? "PASS" : "WARN", "RESEND_API_KEY", "Required for real transactional email delivery.");
check(value("EMAIL_FROM").includes("@") && !isPlaceholder(value("EMAIL_FROM")) ? "PASS" : "WARN", "EMAIL_FROM", "Use an address on a domain verified by your email provider.");
check(!value("NEXT_PUBLIC_STRIPE_SECRET_KEY") ? "PASS" : "FAIL", "Secret exposure guard", "Never define NEXT_PUBLIC_STRIPE_SECRET_KEY.");
check(!value("NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET") ? "PASS" : "FAIL", "Webhook exposure guard", "Never define NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET.");

for (const item of checks) console.log(`${item.level.padEnd(4)} ${item.name}: ${item.detail}`);
const failures = checks.filter((item) => item.level === "FAIL").length;
const warnings = checks.filter((item) => item.level === "WARN").length;
console.log(`\nDeployment readiness: ${checks.length - failures - warnings} passed, ${warnings} warnings, ${failures} failures.`);
if (failures) process.exitCode = 1;
