import assert from "node:assert/strict";
import test from "node:test";
import { resolveSmtpConfiguration } from "../lib/smtp-config";

test("Gmail fallback creates a secure SMTP configuration and normalizes App Password spacing", () => {
  const configuration = resolveSmtpConfiguration({
    GMAIL_USER: "store@example.com",
    GMAIL_APP_PASSWORD: "abcd efgh ijkl mnop",
    EMAIL_FROM: "EYEBREED <store@example.com>",
  });
  assert.ok(configuration);
  assert.equal(configuration.host, "smtp.gmail.com");
  assert.equal(configuration.port, 465);
  assert.equal(configuration.secure, true);
  assert.equal(configuration.requireTLS, false);
  assert.equal(configuration.user, "store@example.com");
  assert.equal(configuration.password, "abcdefghijklmnop");
});

test("generic SMTP preserves provider passwords and requires STARTTLS on port 587", () => {
  const configuration = resolveSmtpConfiguration({
    SMTP_HOST: "smtp.provider.test",
    SMTP_PORT: "587",
    SMTP_USER: "mailer",
    SMTP_PASSWORD: "password with spaces",
  });
  assert.ok(configuration);
  assert.equal(configuration.secure, false);
  assert.equal(configuration.requireTLS, true);
  assert.equal(configuration.password, "password with spaces");
});

test("incomplete and invalid SMTP configurations are rejected", () => {
  assert.equal(resolveSmtpConfiguration({}), null);
  assert.equal(resolveSmtpConfiguration({ SMTP_HOST: "smtp.provider.test", SMTP_PORT: "invalid", SMTP_USER: "mailer", SMTP_PASSWORD: "secret" }), null);
});
