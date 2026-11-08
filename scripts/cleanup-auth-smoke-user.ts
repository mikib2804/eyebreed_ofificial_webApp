import { prisma } from "../lib/prisma";

const email = process.argv[2]?.trim().toLowerCase();
const cleanAll = email === "--all";
if (!cleanAll && (!email?.startsWith("codex-auth-smoke-") || !email.endsWith("@eyebreed.test"))) throw new Error("Cleanup is restricted to disposable EYEBREED auth-smoke addresses.");

async function main() {
  const where = cleanAll
    ? { email: { startsWith: "codex-auth-smoke-", endsWith: "@eyebreed.test" } }
    : { email };
  const disposable = await prisma.user.findMany({ where, select: { email: true } });
  const recipients = disposable.map((user) => user.email).filter((item): item is string => Boolean(item));
  await prisma.emailNotification.deleteMany({ where: { recipient: { in: recipients } } });
  const result = await prisma.user.deleteMany({ where });
  console.log(JSON.stringify({ deletedDisposableUsers: result.count }));
}

main().finally(() => prisma.$disconnect());
