export const WEBSITE_PROMOTION_PERCENT = 15;

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
