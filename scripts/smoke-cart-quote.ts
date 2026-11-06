import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3100";

async function main() {
  const product = await prisma.product.findFirst({
    where: { status: "ACTIVE" },
    include: { variants: { where: { inventory: { gt: 0 } }, take: 1 } },
    orderBy: { createdAt: "asc" },
  });
  if (!product) throw new Error("No active database product is available for the quote smoke test.");
  const variant = product.variants[0];
  const response = await fetch(`${baseUrl}/api/cart/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: baseUrl },
    body: JSON.stringify({
      currency: "ILS",
      items: [{ productId: product.id, quantity: 1, size: variant?.size ?? null, color: variant?.color ?? null }],
    }),
  });
  const quote = await response.json() as { subtotal?: number; discountAmount?: number; total?: number; promotion?: { percentage?: number }; error?: string };
  if (!response.ok) throw new Error(quote.error ?? `Quote failed with ${response.status}`);
  if (quote.promotion?.percentage !== 15) throw new Error("The automatic promotion was not 15%.");
  if (typeof quote.subtotal !== "number" || typeof quote.discountAmount !== "number" || typeof quote.total !== "number") throw new Error("Quote totals are missing.");
  if (Math.round((quote.subtotal - quote.discountAmount) * 100) !== Math.round(quote.total * 100)) throw new Error("Quote total does not reconcile.");
  console.log(`Quote smoke test passed for one active product: subtotal ${quote.subtotal} ILS, discount ${quote.discountAmount} ILS, total ${quote.total} ILS.`);
}

main().finally(() => prisma.$disconnect());
