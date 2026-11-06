import type { OrderStatus } from "@prisma/client";
import { AccountOrdersView } from "@/components/account-orders-view";
import { requireCustomer } from "@/lib/account";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const orderStatuses: readonly OrderStatus[] = [
  "PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_SHIPMENT",
  "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const user = await requireCustomer();
  const query = await searchParams;
  const status = orderStatuses.includes(query.status as OrderStatus) ? query.status as OrderStatus : undefined;
  const requestedPage = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const where = { userId: user.id, ...(status ? { status } : {}) };
  const totalItems = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: { select: { images: true } } } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return <AccountOrdersView
    activeStatus={status ?? null}
    page={page}
    totalPages={totalPages}
    totalItems={totalItems}
    orders={orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      total: Number(order.total),
      currency: order.currency,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: item.product?.images[0] ?? null,
      })),
    }))}
  />;
}
