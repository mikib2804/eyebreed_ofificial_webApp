import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/account";
import { AccountOverview } from "@/components/account-overview";

export default async function AccountPage() {
  const user = await requireCustomer();
  const [recentOrders, totalOrders, pendingOrders, shippedOrders, preOrderCount] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.count({
      where: {
        userId: user.id,
        status: { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] },
      },
    }),
    prisma.order.count({ where: { userId: user.id, status: "SHIPPED" } }),
    prisma.preOrder.count({ where: { userId: user.id, status: { not: "CANCELLED" } } }),
  ]);

  return (
    <AccountOverview
      firstName={user.name?.split(" ")[0] ?? "customer"}
      orders={recentOrders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, createdAt: order.createdAt.toISOString(), status: order.status, total: Number(order.total), currency: order.currency }))}
      totalOrders={totalOrders}
      pending={pendingOrders}
      shipped={shippedOrders}
      preOrderCount={preOrderCount}
    />
  );
}
