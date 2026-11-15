import { prisma } from "../lib/prisma";

const mask = (email: string) => {
  const [name, domain = ""] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
};

async function main() {
  const notifications = await prisma.emailNotification.findMany({
    select: { template: true, recipient: true, status: true, error: true, attemptedAt: true, sentAt: true },
    orderBy: { attemptedAt: "desc" },
    take: 12,
  });
  const preferences = await prisma.user.groupBy({ by: ["acceptMarketingEmails"], _count: { _all: true } });
  console.log(JSON.stringify({
    notifications: notifications.map((item) => ({ ...item, recipient: mask(item.recipient) })),
    preferences: preferences.map((item) => ({ enabled: item.acceptMarketingEmails, users: item._count._all })),
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
