import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const apply = process.argv.includes("--apply");

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { not: null }, emailVerified: { not: null } },
    select: { id: true, email: true },
    orderBy: { id: "asc" },
  });

  let orders = 0;
  let preOrders = 0;
  for (const user of users) {
    if (!user.email) continue;
    const email = user.email.trim().toLowerCase();
    if (!email) continue;
    const [orderCount, preOrderCount] = await Promise.all([
      prisma.order.count({ where: { userId: null, customerEmail: { equals: email, mode: "insensitive" } } }),
      prisma.preOrder.count({ where: { userId: null, email: { equals: email, mode: "insensitive" } } }),
    ]);
    orders += orderCount;
    preOrders += preOrderCount;

    if (apply && (orderCount || preOrderCount)) {
      await prisma.$transaction([
        prisma.order.updateMany({ where: { userId: null, customerEmail: { equals: email, mode: "insensitive" } }, data: { userId: user.id } }),
        prisma.preOrder.updateMany({ where: { userId: null, email: { equals: email, mode: "insensitive" } }, data: { userId: user.id } }),
        prisma.auditLog.create({ data: { actorId: user.id, action: "VERIFIED_EMAIL_RECORDS_LINKED", entityType: "User", entityId: user.id, metadata: { orders: orderCount, preOrders: preOrderCount, source: "link-verified-customer-records" } } }),
      ], { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    }
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", verifiedUsersScanned: users.length, ordersEligible: orders, preOrdersEligible: preOrders }));
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ event: "verified_record_link_failed", errorType: error instanceof Error ? error.name : "unknown" }));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
