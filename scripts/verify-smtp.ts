import { loadEnvConfig } from "@next/env";
import { createSmtpTransport, resolveSmtpConfiguration } from "../lib/smtp-config";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

async function main() {
  const configuration = resolveSmtpConfiguration();
  if (!configuration) throw new Error("SMTP configuration is incomplete.");
  const transport = createSmtpTransport(configuration);
  try {
    await transport.verify();
    console.log(JSON.stringify({ smtpVerified: true, host: configuration.host, port: configuration.port, secure: configuration.secure, requireTLS: configuration.requireTLS }));
  } finally {
    transport.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "SMTP verification failed.";
  console.error(JSON.stringify({ smtpVerified: false, errorType: error instanceof Error ? error.name : "unknown", message: message.replace(/[^\s]{20,}/g, "[redacted]") }));
  process.exitCode = 1;
});
