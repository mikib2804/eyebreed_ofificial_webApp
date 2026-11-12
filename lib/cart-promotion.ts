export const PROMOTION_GIFT_ID = "promotion-free-vision-hat";

type CartPromotionLine = {
  id: string;
  isGift?: boolean;
};

/**
 * Older browser carts may have saved the promotional line without `isGift`.
 * Its stable synthetic ID remains authoritative so the line can still be
 * excluded from paid items and removed correctly.
 */
export function isPromotionGiftLine(line: CartPromotionLine): boolean {
  return line.isGift === true || line.id === PROMOTION_GIFT_ID;
}
