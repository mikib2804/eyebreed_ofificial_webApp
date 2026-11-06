import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/account";
import { PreOrdersView } from "@/components/pre-orders-view";

export default async function PreOrdersPage() {
  const sessionUser = await requireCustomer();
  const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { id: true, email: true, emailVerified: true } });
  if (dbUser?.email && dbUser.emailVerified) {
    await prisma.preOrder.updateMany({ where: { userId: null, email: dbUser.email.toLowerCase() }, data: { userId: dbUser.id } });
  }
  const items = await prisma.preOrder.findMany({
    where: { userId: sessionUser.id },
    include: { product: { select: { name: true, nameHe: true, slug: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <PreOrdersView items={items.map((item) => ({ id: item.id, productName: item.product.name, productNameHe: item.product.nameHe, productSlug: item.product.slug, image: item.product.images[0] ?? null, size: item.size, color: item.color, quantity: item.quantity, status: item.status, contactedAt: item.contactedAt?.toISOString() ?? null, notifiedAt: item.notifiedAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString() }))} />;
}
