export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid money amount");
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number): number {
  return amount / 100;
}

export function percentageDiscount(amount: number, percentage: number): number {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) throw new Error("Invalid percentage");
  return Math.min(amount, Math.round(amount * percentage / 100));
}

export function fixedDiscount(amount: number, discount: number): number {
  return Math.min(amount, Math.max(0, discount));
}

export function isDiscountActive(discount: { active: boolean; startsAt: Date | null; endsAt: Date | null; usageLimit: number | null; usageCount: number }, now = new Date()): boolean {
  return discount.active
    && (!discount.startsAt || discount.startsAt <= now)
    && (!discount.endsAt || discount.endsAt >= now)
    && (discount.usageLimit === null || discount.usageCount < discount.usageLimit);
}

export function calculateShippingCharge(subtotal: number, discountAmount: number, settings: { enabled: boolean; price: number; freeShippingEnabled: boolean; freeShippingThreshold: number | null }) {
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const freeShipping = settings.enabled
    && settings.freeShippingEnabled
    && (settings.freeShippingThreshold === null || discountedSubtotal >= settings.freeShippingThreshold);
  const shippingAmount = settings.enabled && !freeShipping ? settings.price : 0;
  const freeShippingRemaining = settings.enabled
    && settings.freeShippingEnabled
    && settings.freeShippingThreshold !== null
    && !freeShipping
      ? Math.max(0, settings.freeShippingThreshold - discountedSubtotal)
      : null;
  return { shippingAmount, freeShipping, freeShippingRemaining };
}
