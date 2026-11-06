import "server-only";

import type { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fixedDiscount, fromMinorUnits, percentageDiscount, toMinorUnits, WEBSITE_PROMOTION_PERCENT } from "@/lib/pricing";

export type QuoteCurrency = "USD" | "ILS" | "EUR";
export type QuoteItemInput = { productId: string; quantity: number; size?: string | null; color?: string | null };
export type CartQuoteInput = { items: QuoteItemInput[]; currency: QuoteCurrency; code?: string | null };

export class QuoteError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) { super(message); }
}

type QuoteDatabase = { product: typeof prisma.product; discount: typeof prisma.discount };

function priceFor(product: { priceUsd: unknown; priceIls: unknown; priceEur: unknown }, currency: QuoteCurrency) {
  return Number(currency === "USD" ? product.priceUsd : currency === "EUR" ? product.priceEur : product.priceIls);
}

export async function quoteCart(input: CartQuoteInput, database: QuoteDatabase = prisma) {
  const ids = [...new Set(input.items.map((item) => item.productId))];
  const products = await database.product.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    include: { variants: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const lines: Array<{ productId: string; slug: string; name: string; quantity: number; size: string | null; color: string | null; categoryId: string; unitAmount: number; lineAmount: number }> = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new QuoteError("PRODUCT_UNAVAILABLE", "One or more products are no longer available.", 409);
    const size = item.size ?? null;
    const color = item.color ?? null;
    const variant = product.variants.find((candidate) => candidate.size === (size ?? "") && candidate.color === (color ?? ""));
    if (product.variants.length && !variant) throw new QuoteError("VARIANT_UNAVAILABLE", `${product.name} is not available in the selected option.`, 409);
    const stock = variant?.inventory ?? product.inventory;
    if (item.quantity > stock) throw new QuoteError("INSUFFICIENT_STOCK", `Only ${stock} units of ${product.name} are available.`, 409);
    const unitAmount = toMinorUnits(priceFor(product, input.currency));
    lines.push({ productId: product.id, slug: product.slug, name: product.name, quantity: item.quantity, size, color, categoryId: product.categoryId, unitAmount, lineAmount: unitAmount * item.quantity });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineAmount, 0);
  const now = new Date();
  const configuredPromotion = await database.discount.findFirst({
    where: {
      name: "15% website promotion",
      code: null,
      active: true,
      scope: "STORE",
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
  });
  const automaticPercentage = !configuredPromotion ? WEBSITE_PROMOTION_PERCENT : configuredPromotion.type === "PERCENTAGE" ? Number(configuredPromotion.value) : 0;
  const automaticDiscount = configuredPromotion?.type === "FIXED"
    ? fixedDiscount(subtotal, toMinorUnits(Number(configuredPromotion.value)))
    : percentageDiscount(subtotal, Math.min(100, Math.max(0, automaticPercentage)));
  let discountAmount = automaticDiscount;
  let discountCode: string | null = null;
  let appliedDiscountId: string | null = null;
  let promotion = { source: "WEBSITE_15" as "WEBSITE_15" | "CODE", label: configuredPromotion?.name ?? "15% website promotion", percentage: automaticPercentage };
  let codeMessage: string | null = null;

  const requestedCode = input.code?.trim().toUpperCase();
  if (requestedCode) {
    const discount = await database.discount.findFirst({
      where: { code: { equals: requestedCode, mode: "insensitive" } },
      include: { products: { select: { id: true } }, categories: { select: { id: true } } },
    });
    if (!discount || !discount.active) throw new QuoteError("INVALID_CODE", "This discount code is not valid.");
    if (discount.startsAt && discount.startsAt > now) throw new QuoteError("CODE_NOT_STARTED", "This discount code is not active yet.");
    if (discount.endsAt && discount.endsAt < now) throw new QuoteError("CODE_EXPIRED", "This discount code has expired.");
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) throw new QuoteError("CODE_LIMIT_REACHED", "This discount code has reached its usage limit.");
    if (discount.minimumPurchase !== null && subtotal < toMinorUnits(Number(discount.minimumPurchase))) throw new QuoteError("MINIMUM_NOT_MET", `This code requires a minimum purchase of ${Number(discount.minimumPurchase).toFixed(2)} ${input.currency}.`);

    const eligibleProductIds = new Set(discount.products.map((product) => product.id));
    const eligibleCategoryIds = new Set(discount.categories.map((category) => category.id));
    const eligibleSubtotal = lines.filter((line) => discount.scope === "STORE" || (discount.scope === "PRODUCT" && eligibleProductIds.has(line.productId)) || (discount.scope === "CATEGORY" && eligibleCategoryIds.has(line.categoryId))).reduce((sum, line) => sum + line.lineAmount, 0);
    if (!eligibleSubtotal) throw new QuoteError("CODE_NOT_APPLICABLE", "This code does not apply to the items in your cart.");
    const codeDiscount = calculateConfiguredDiscount(discount.type, Number(discount.value), eligibleSubtotal);
    if (codeDiscount > automaticDiscount) {
      discountAmount = codeDiscount;
      discountCode = discount.code;
      appliedDiscountId = discount.id;
      promotion = { source: "CODE", label: discount.name, percentage: discount.type === "PERCENTAGE" ? Number(discount.value) : 0 };
      codeMessage = "Discount code applied.";
    } else {
      codeMessage = "Code is valid, but the 15% website promotion gives you an equal or better price.";
    }
  }

  const paidItemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const freeShipping = paidItemCount >= 3 || (lines.some((line) => line.slug === "vision-washed-zip-hoodie") && lines.some((line) => line.slug === "vision-25-layered-jersey"));
  const shippingAmount = 0;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    currency: input.currency,
    lines: lines.map((line) => ({ ...line, unitAmount: fromMinorUnits(line.unitAmount), lineAmount: fromMinorUnits(line.lineAmount) })),
    subtotal: fromMinorUnits(subtotal),
    discountAmount: fromMinorUnits(discountAmount),
    shippingAmount: fromMinorUnits(shippingAmount),
    total: fromMinorUnits(total),
    freeShipping,
    discountCode,
    appliedDiscountId,
    promotion,
    codeMessage,
  };
}

function calculateConfiguredDiscount(type: DiscountType, value: number, eligibleSubtotal: number) {
  return type === "PERCENTAGE"
    ? percentageDiscount(eligibleSubtotal, Math.min(100, Math.max(0, value)))
    : fixedDiscount(eligibleSubtotal, toMinorUnits(value));
}

