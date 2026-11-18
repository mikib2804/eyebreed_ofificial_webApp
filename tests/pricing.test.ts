import assert from "node:assert/strict";
import test from "node:test";
import { calculateShippingCharge, fixedDiscount, fromMinorUnits, isDiscountActive, percentageDiscount, toMinorUnits } from "../lib/pricing";

test("configured percentage promotions use integer minor units", () => {
  const subtotal = toMinorUnits(239.99);
  const discount = percentageDiscount(subtotal, 15);
  assert.equal(discount, 3600);
  assert.equal(fromMinorUnits(subtotal - discount), 203.99);
});

test("fixed and percentage discounts cannot make a total negative", () => {
  assert.equal(fixedDiscount(1_000, 2_000), 1_000);
  assert.equal(percentageDiscount(1_000, 100), 1_000);
  assert.throws(() => percentageDiscount(1_000, 101));
});

test("inactive and expired discounts are not eligible", () => {
  const now = new Date("2026-11-18T12:00:00.000Z");
  const base = { startsAt: null, endsAt: null, usageLimit: null, usageCount: 0 };
  assert.equal(isDiscountActive({ ...base, active: false }, now), false);
  assert.equal(isDiscountActive({ ...base, active: true, endsAt: new Date("2026-11-17T12:00:00.000Z") }, now), false);
  assert.equal(isDiscountActive({ ...base, active: true }, now), true);
});

test("different configured percentages produce their exact discounts", () => {
  const subtotal = toMinorUnits(200);
  assert.equal(fromMinorUnits(percentageDiscount(subtotal, 15)), 30);
  assert.equal(fromMinorUnits(percentageDiscount(subtotal, 22.5)), 45);
});

test("shipping is charged once when enabled and omitted when disabled", () => {
  const subtotal = toMinorUnits(200);
  const discount = toMinorUnits(20);
  assert.deepEqual(calculateShippingCharge(subtotal, discount, { enabled: true, price: toMinorUnits(25), freeShippingEnabled: false, freeShippingThreshold: null }), {
    shippingAmount: toMinorUnits(25), freeShipping: false, freeShippingRemaining: null,
  });
  assert.equal(calculateShippingCharge(subtotal, discount, { enabled: false, price: toMinorUnits(25), freeShippingEnabled: false, freeShippingThreshold: null }).shippingAmount, 0);
});

test("free-shipping threshold uses the discounted merchandise subtotal", () => {
  const below = calculateShippingCharge(toMinorUnits(200), toMinorUnits(20), { enabled: true, price: toMinorUnits(25), freeShippingEnabled: true, freeShippingThreshold: toMinorUnits(190) });
  assert.equal(below.shippingAmount, toMinorUnits(25));
  assert.equal(below.freeShippingRemaining, toMinorUnits(10));
  const reached = calculateShippingCharge(toMinorUnits(210), toMinorUnits(20), { enabled: true, price: toMinorUnits(25), freeShippingEnabled: true, freeShippingThreshold: toMinorUnits(190) });
  assert.equal(reached.shippingAmount, 0);
  assert.equal(reached.freeShipping, true);
});

test("Stripe minor-unit amount matches the server-calculated final total", () => {
  const subtotal = toMinorUnits(200);
  const discount = percentageDiscount(subtotal, 15);
  const { shippingAmount } = calculateShippingCharge(subtotal, discount, { enabled: true, price: toMinorUnits(25), freeShippingEnabled: false, freeShippingThreshold: null });
  const finalTotal = fromMinorUnits(subtotal - discount + shippingAmount);
  assert.equal(toMinorUnits(finalTotal), subtotal - discount + shippingAmount);
});
