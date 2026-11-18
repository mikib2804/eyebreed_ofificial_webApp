export type DiscountConditionInput = {
  endsAt: Date | null;
  minimumPurchase: unknown | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
};

export function buildDiscountConditions(discount: DiscountConditionInput) {
  const en: string[] = [];
  const he: string[] = [];
  if (discount.endsAt) {
    en.push(`Valid until ${discount.endsAt.toLocaleDateString("en-US")}.`);
    he.push(`בתוקף עד ${discount.endsAt.toLocaleDateString("he-IL")}.`);
  }
  if (discount.minimumPurchase !== null) {
    const minimum = Number(discount.minimumPurchase);
    en.push(`Minimum purchase: ₪${minimum.toFixed(2)}.`);
    he.push(`סכום רכישה מינימלי: ₪${minimum.toFixed(2)}.`);
  }
  if (discount.usageLimit !== null) {
    en.push(`Limited to ${discount.usageLimit} total redemptions.`);
    he.push(`מוגבל ל-${discount.usageLimit} מימושים בסך הכול.`);
  }
  if (discount.perCustomerLimit !== null) {
    en.push(`Limited to ${discount.perCustomerLimit} redemption${discount.perCustomerLimit === 1 ? "" : "s"} per customer.`);
    he.push(`מוגבל ל-${discount.perCustomerLimit} מימושים לכל לקוח.`);
  }
  return en.length ? { en, he } : undefined;
}
