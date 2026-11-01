import { prisma } from "@/lib/prisma";

export async function sendCustomerEmail(input: { eventKey: string; to: string; subject: string; html: string; template: string }) {
  const existing = await prisma.emailNotification.findUnique({ where: { eventKey: input.eventKey } });
  if (existing) return;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "EYEBREED <account@eyebreed.com>", to: input.to, subject: input.subject, html: input.html }) });
    if (!response.ok) throw new Error("Email delivery failed");
  }
  await prisma.emailNotification.create({ data: { eventKey: input.eventKey, recipient: input.to, template: input.template } });
}
