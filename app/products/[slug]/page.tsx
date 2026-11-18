import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductDetail } from "@/components/product-detail";
import { prisma } from "@/lib/prisma";
import { applyPercentageDiscount, productWithVariants, toStoreProduct } from "@/lib/products";
import { buildDiscountConditions } from "@/lib/discount-conditions";

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
  const discounts = await prisma.discount.findMany({
    where: {
      active: true,
      code: null,
      type: { in: ["PERCENTAGE", "FIXED"] },
      OR: [
        { scope: "STORE" },
        { scope: "PRODUCT", products: { some: { id: dbProduct.id } } },
        { scope: "CATEGORY", categories: { some: { id: dbProduct.categoryId } } },
      ],
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    select: { name: true, type: true, scope: true, value: true, endsAt: true, minimumPurchase: true, usageLimit: true, usageCount: true, perCustomerLimit: true, products: { select: { id: true } } },
  });
  const displayableDiscounts = discounts.filter((discount) => discount.minimumPurchase === null && (discount.usageLimit === null || discount.usageCount < discount.usageLimit));
  const percentageDiscount = displayableDiscounts
    .filter((discount) => discount.type === "PERCENTAGE")
    .sort((left, right) => Number(right.value) - Number(left.value))[0];
  const bundleDiscount = displayableDiscounts.find((discount) => discount.type === "FIXED" && discount.scope === "PRODUCT" && discount.products.length > 1);
  const displayedDiscount = percentageDiscount ?? bundleDiscount;
  const discountedProduct = applyPercentageDiscount(toStoreProduct(dbProduct), Number(percentageDiscount?.value ?? 0), percentageDiscount?.name);
  const baseConditions = displayedDiscount ? buildDiscountConditions(displayedDiscount) : undefined;
  const bundleConditions = bundleDiscount && !percentageDiscount ? {
    en: ["Bundle price applies when all linked items are purchased together.", ...(baseConditions?.en ?? [])],
    he: ["מחיר החבילה חל ברכישה משותפת של כל הפריטים המקושרים.", ...(baseConditions?.he ?? [])],
  } : baseConditions;
  const product = {
    ...discountedProduct,
    saleLabel: discountedProduct.saleLabel ?? bundleDiscount?.name,
    discountConditions: bundleConditions,
  };

  return (
    <>
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
      <CartDrawer />
    </>
  );
}
