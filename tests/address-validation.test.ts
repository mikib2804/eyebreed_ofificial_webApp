import assert from "node:assert/strict";
import test from "node:test";
import { addressCreateSchema } from "../lib/address-schema";

const validAddress = {
  fullName: "Test Customer",
  line1: "1 Test Street",
  city: "Tel Aviv",
  country: "Israel",
  isDefault: true,
};

test("uses the default address label when the optional field is blank", () => {
  assert.equal(addressCreateSchema.parse({ ...validAddress, label: "" }).label, "Home");
  assert.equal(addressCreateSchema.parse(validAddress).label, "Home");
});

test("preserves a customer-provided address label", () => {
  assert.equal(addressCreateSchema.parse({ ...validAddress, label: "Office" }).label, "Office");
});
