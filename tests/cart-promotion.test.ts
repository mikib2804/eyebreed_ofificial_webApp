import assert from "node:assert/strict";
import test from "node:test";
import { isPromotionGiftLine, PROMOTION_GIFT_ID } from "../lib/cart-promotion";

test("recognizes both current and legacy promotional gift lines", () => {
  assert.equal(isPromotionGiftLine({ id: PROMOTION_GIFT_ID, isGift: true }), true);
  assert.equal(isPromotionGiftLine({ id: PROMOTION_GIFT_ID }), true);
  assert.equal(isPromotionGiftLine({ id: "database-product-id", isGift: true }), true);
  assert.equal(isPromotionGiftLine({ id: "database-product-id" }), false);
});
