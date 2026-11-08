import { createHash, randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

const origin = process.env.AUTH_SMOKE_ORIGIN ?? "http://localhost:3000";

async function post(path: string, body: unknown) {
  return fetch(`${origin}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, "X-Forwarded-For": "127.0.0.77" }, body: JSON.stringify(body) });
}

async function main() {
  const marker = randomUUID();
  const email = `codex-auth-${marker}@example.test`;
  const oldPassword = `Old-${marker}!`;
  const newPassword = `New-${marker}!`;
  const knownToken = createHash("sha256").update(`token:${marker}`).digest("hex");
  const knownTokenHash = createHash("sha256").update(knownToken).digest("hex");
  const user = await prisma.user.create({ data: { email, name: "Auth Smoke", passwordHash: await hash(oldPassword, 12), sessions: { create: { sessionToken: `smoke-${marker}`, expires: new Date(Date.now() + 3_600_000) } } } });
  try {
    const forgot = await post("/api/auth/forgot-password", { email });
    if (!forgot.ok) throw new Error(`Forgot-password returned ${forgot.status}.`);
    const generic = await forgot.json() as { message?: string };
    if (!generic.message?.startsWith("If an account exists")) throw new Error("Forgot-password response is not non-enumerating.");
    const issued = await prisma.passwordResetToken.count({ where: { userId: user.id, usedAt: null } });
    if (issued !== 1) throw new Error("Forgot-password did not leave exactly one outstanding token.");

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: knownTokenHash, expiresAt: new Date(Date.now() + 3_600_000) } });
    const reset = await post("/api/auth/reset-password", { token: knownToken, password: newPassword });
    if (!reset.ok) throw new Error(`Reset-password returned ${reset.status}.`);
    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true, sessionVersion: true, sessions: { select: { id: true } }, passwordResetTokens: { where: { tokenHash: knownTokenHash }, select: { usedAt: true } } } });
    if (!updated.passwordHash || !await compare(newPassword, updated.passwordHash)) throw new Error("New password was not persisted.");
    if (updated.sessionVersion !== 1 || updated.sessions.length !== 0) throw new Error("Credential change did not invalidate sessions.");
    if (!updated.passwordResetTokens[0]?.usedAt) throw new Error("Reset token was not consumed.");
    const replay = await post("/api/auth/reset-password", { token: knownToken, password: oldPassword });
    if (replay.status !== 400) throw new Error("Consumed reset token was accepted again.");
    console.log(JSON.stringify({ forgotPassword: "passed", nonEnumeration: "passed", resetPassword: "passed", singleUseToken: "passed", sessionInvalidation: "passed" }));
  } finally {
    await prisma.emailNotification.deleteMany({ where: { recipient: email } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ event: "auth_smoke_failed", errorType: error instanceof Error ? error.name : "unknown", message: error instanceof Error ? error.message : "Unknown failure" }));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
