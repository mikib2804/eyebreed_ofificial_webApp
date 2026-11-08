import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductDetail } from "@/components/product-detail";
import { prisma } from "@/lib/prisma";
import { applyPercentageDiscount, productWithVariants, toStoreProduct } from "@/lib/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const now = new Date();
  const dbProduct = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productWithVariants,
  });
  if (!dbProduct) notFound();
  const discount = await prisma.discount.findFirst({
    where: {
      active: true,
      code: null,
      type: "PERCENTAGE",
      scope: "PRODUCT",
      products: { some: { id: dbProduct.id } },
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { value: "desc" },
    select: { name: true, value: true },
  });
  const product = applyPercentageDiscount(toStoreProduct(dbProduct), Number(discount?.value ?? 0), discount?.name);

  return (
    <>
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
      <CartDrawer />
    </>
  );
}
