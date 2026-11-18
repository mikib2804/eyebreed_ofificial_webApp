import "server-only";

import type { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateShippingCharge, fixedDiscount, fromMinorUnits, isDiscountActive, percentageDiscount, toMinorUnits } from "@/lib/pricing";
import { productReferenceKeys, splitProductReferences } from "@/lib/product-reference";

export type QuoteCurrency = "USD" | "ILS" | "EUR";
export type QuoteItemInput = { productId: string; slug?: string | null; quantity: number; size?: string | null; color?: string | null };
export type CartQuoteInput = { items: QuoteItemInput[]; currency: QuoteCurrency; code?: string | null };

export class QuoteError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) { super(message); }
}

type QuoteDatabase = { product: typeof prisma.product; discount: typeof prisma.discount; storeSettings: typeof prisma.storeSettings };

export type AppliedPromotion = { source: "AUTOMATIC" | "BUNDLE" | "CODE"; label: string; percentage: number };

function priceFor(product: { priceUsd: unknown; priceIls: unknown; priceEur: unknown }, currency: QuoteCurrency) {
  return Number(currency === "USD" ? product.priceUsd : currency === "EUR" ? product.priceEur : product.priceIls);
}

export async function quoteCart(input: CartQuoteInput, database: QuoteDatabase = prisma) {
  const ids = [...new Set(input.items.map((item) => item.productId))];
  const { directIds, legacySlugs } = splitProductReferences(ids);
  const requestedSlugs = [...new Set([...legacySlugs, ...input.items.map((item) => item.slug).filter((slug): slug is string => Boolean(slug))])];
  const products = await database.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        ...(directIds.length ? [{ id: { in: directIds } }] : []),
        ...(requestedSlugs.length ? [{ slug: { in: requestedSlugs } }] : []),
      ],
    },
    include: { variants: true },
  });
  const productMap = new Map(products.flatMap((product) => productReferenceKeys(product).map((key) => [key, product] as const)));
  const productSlugMap = new Map(products.map((product) => [product.slug, product]));
  const lines: Array<{ productId: string; slug: string; name: string; quantity: number; size: string | null; color: string | null; categoryId: string; unitAmount: number; lineAmount: number }> = [];
  const requestedByProduct = new Map<string, number>();

  for (const item of input.items) {
    const product = productMap.get(item.productId) ?? (item.slug ? productSlugMap.get(item.slug) : undefined);
    if (!product) throw new QuoteError("PRODUCT_UNAVAILABLE", "One or more products are no longer available.", 409);
    const size = item.size ?? null;
    const color = item.color ?? null;
    const variant = product.variants.find((candidate) => candidate.size === (size ?? "") && candidate.color === (color ?? ""));
    if (product.variants.length && !variant) throw new QuoteError("VARIANT_UNAVAILABLE", `${product.name} is not available in the selected option.`, 409);
    const stock = product.inventory;
    const requestedQuantity = (requestedByProduct.get(product.id) ?? 0) + item.quantity;
    if (requestedQuantity > stock) throw new QuoteError("INSUFFICIENT_STOCK", `Only ${stock} units of ${product.name} are available.`, 409);
    requestedByProduct.set(product.id, requestedQuantity);
    const unitAmount = toMinorUnits(priceFor(product, input.currency));
    lines.push({ productId: product.id, slug: product.slug, name: product.name, quantity: item.quantity, size, color, categoryId: product.categoryId, unitAmount, lineAmount: unitAmount * item.quantity });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineAmount, 0);
  const now = new Date();
  const automaticDiscounts = await database.discount.findMany({
    where: {
      code: null,
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    include: {
      products: { select: { id: true, priceIls: true, priceUsd: true, priceEur: true } },
      categories: { select: { id: true } },
    },
  });
  let discountAmount = 0;
  let discountCode: string | null = null;
  let appliedDiscountId: string | null = null;
  let promotion: AppliedPromotion | null = null;
  let codeMessage: string | null = null;

  for (const discount of automaticDiscounts) {
    if (!isDiscountActive(discount, now)) continue;
    if (discount.minimumPurchase !== null && subtotal < toMinorUnits(Number(discount.minimumPurchase))) continue;

    let candidateAmount = 0;
    let source: AppliedPromotion["source"] = "AUTOMATIC";
    if (discount.type === "FIXED" && discount.scope === "PRODUCT" && discount.products.length > 1) {
      const quantities = discount.products.map((product) => lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0));
      const bundleCount = Math.min(...quantities);
      if (bundleCount < 1) continue;
      const regularBundleTotal = discount.products.reduce((sum, product) => sum + toMinorUnits(priceFor(product, input.currency)), 0);
      const regularIlsTotal = discount.products.reduce((sum, product) => sum + Number(product.priceIls), 0);
      if (regularBundleTotal <= 0 || regularIlsTotal <= 0) continue;
      const targetInCurrency = toMinorUnits(Number(discount.value) * (fromMinorUnits(regularBundleTotal) / regularIlsTotal));
      candidateAmount = Math.max(0, regularBundleTotal - targetInCurrency) * bundleCount;
      source = "BUNDLE";
    } else {
      const eligibleProductIds = new Set(discount.products.map((product) => product.id));
      const eligibleCategoryIds = new Set(discount.categories.map((category) => category.id));
      const eligibleSubtotal = lines.filter((line) => discount.scope === "STORE" || (discount.scope === "PRODUCT" && eligibleProductIds.has(line.productId)) || (discount.scope === "CATEGORY" && eligibleCategoryIds.has(line.categoryId))).reduce((sum, line) => sum + line.lineAmount, 0);
      if (!eligibleSubtotal) continue;
      candidateAmount = calculateConfiguredDiscount(discount.type, Number(discount.value), eligibleSubtotal);
    }

    if (candidateAmount > discountAmount) {
      discountAmount = candidateAmount;
      appliedDiscountId = discount.id;
      promotion = { source, label: discount.name, percentage: discount.type === "PERCENTAGE" ? Number(discount.value) : 0 };
    }
  }

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
    if (codeDiscount > discountAmount) {
      discountAmount = codeDiscount;
      discountCode = discount.code;
      appliedDiscountId = discount.id;
      promotion = { source: "CODE", label: discount.name, percentage: discount.type === "PERCENTAGE" ? Number(discount.value) : 0 };
      codeMessage = "Discount code applied.";
    } else {
      codeMessage = "Code is valid, but the automatic promotion gives you an equal or better price.";
    }
  }

  const settings = await database.storeSettings.findUnique({ where: { id: "store" } });
  const shippingEnabled = settings?.shippingEnabled ?? false;
  const configuredShipping = Number(input.currency === "USD" ? settings?.shippingPriceUsd ?? 0 : input.currency === "EUR" ? settings?.shippingPriceEur ?? 0 : settings?.shippingPriceIls ?? 0);
  const configuredThreshold = input.currency === "USD" ? settings?.freeShippingThresholdUsd : input.currency === "EUR" ? settings?.freeShippingThresholdEur : settings?.freeShippingThresholdIls;
  const threshold = configuredThreshold === null || configuredThreshold === undefined ? null : toMinorUnits(Number(configuredThreshold));
  const { shippingAmount, freeShipping, freeShippingRemaining } = calculateShippingCharge(subtotal, discountAmount, {
    enabled: shippingEnabled,
    price: toMinorUnits(configuredShipping),
    freeShippingEnabled: Boolean(settings?.freeShippingEnabled),
    freeShippingThreshold: threshold,
  });
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    currency: input.currency,
    lines: lines.map((line) => ({ ...line, unitAmount: fromMinorUnits(line.unitAmount), lineAmount: fromMinorUnits(line.lineAmount) })),
    subtotal: fromMinorUnits(subtotal),
    discountAmount: fromMinorUnits(discountAmount),
    shippingAmount: fromMinorUnits(shippingAmount),
    total: fromMinorUnits(total),
    shippingEnabled,
    freeShipping,
    freeShippingThreshold: threshold === null ? null : fromMinorUnits(threshold),
    freeShippingRemaining: freeShippingRemaining === null ? null : fromMinorUnits(freeShippingRemaining),
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

