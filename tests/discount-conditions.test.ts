import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDiscountConditions } from "../lib/discount-conditions";

test("discount conditions only describe configured restrictions", () => {
  assert.equal(buildDiscountConditions({ endsAt: null, minimumPurchase: null, usageLimit: null, perCustomerLimit: null }), undefined);
  const conditions = buildDiscountConditions({
    endsAt: new Date("2026-12-31T12:00:00.000Z"),
    minimumPurchase: 200,
    usageLimit: 50,
    perCustomerLimit: 1,
  });
  assert.equal(conditions?.en.length, 4);
  assert.match(conditions?.en[1] ?? "", /₪200\.00/);
  assert.match(conditions?.he[2] ?? "", /50/);
});
