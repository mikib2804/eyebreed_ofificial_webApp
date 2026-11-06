import assert from "node:assert/strict";
import test from "node:test";
import { fixedDiscount, fromMinorUnits, percentageDiscount, toMinorUnits, WEBSITE_PROMOTION_PERCENT } from "../lib/pricing";

test("website promotion applies exactly 15 percent using integer minor units", () => {
  const subtotal = toMinorUnits(239.99);
  const discount = percentageDiscount(subtotal, WEBSITE_PROMOTION_PERCENT);
  assert.equal(discount, 3600);
  assert.equal(fromMinorUnits(subtotal - discount), 203.99);
});

test("fixed and percentage discounts cannot make a total negative", () => {
  assert.equal(fixedDiscount(1_000, 2_000), 1_000);
  assert.equal(percentageDiscount(1_000, 100), 1_000);
  assert.throws(() => percentageDiscount(1_000, 101));
});
