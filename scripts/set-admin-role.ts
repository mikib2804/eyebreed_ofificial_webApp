import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = argument("email")?.trim().toLowerCase();
  const role = argument("role")?.toUpperCase();
  const confirmed = process.argv.includes("--confirm");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Provide a valid --email value.");
  if (role !== Role.ADMIN && role !== Role.CUSTOMER) throw new Error("--role must be ADMIN or CUSTOMER.");
  if (!confirmed) throw new Error("Role changes require the explicit --confirm flag.");

  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) throw new Error("No user exists with that normalized email.");
    if (user.role === role) return { id: user.id, previousRole: user.role, changed: false };
    await transaction.user.update({ where: { id: user.id }, data: { role } });
    await transaction.auditLog.create({
      data: {
        actorId: "controlled-cli",
        action: role === Role.ADMIN ? "ADMIN_ROLE_GRANTED" : "ADMIN_ROLE_REVOKED",
        entityType: "User",
        entityId: user.id,
        metadata: { previousRole: user.role, newRole: role },
      },
    });
    return { id: user.id, previousRole: user.role, changed: true };
  });
  console.log(result.changed ? `Role updated for user ${result.id}: ${result.previousRole} -> ${role}.` : `User ${result.id} already has role ${role}; no change made.`);
}

main().finally(() => prisma.$disconnect());
