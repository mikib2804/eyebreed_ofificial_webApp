import assert from "node:assert/strict";
import test from "node:test";
import { addressCreateSchema, addressUpdateSchema } from "../lib/address-schema";
import { normalizedEmailSchema, personNameSchema, phoneSchema, placeNameSchema, postalCodeSchema } from "../lib/validation";
import { sanitizePhoneInput } from "../lib/input-constraints";

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

test("accepts international phone formatting but rejects letters and invalid lengths", () => {
  assert.equal(phoneSchema.parse("+972 54-123-4567"), "+972 54-123-4567");
  assert.equal(phoneSchema.safeParse("call-me-please").success, false);
  assert.equal(phoneSchema.safeParse("12345").success, false);
  assert.equal(phoneSchema.safeParse("1234567890123456").success, false);
  assert.equal(sanitizePhoneInput("call +972-54-123-4567"), "+972-54-123-4567");
});

test("validates optional phone numbers on address creation and updates", () => {
  assert.equal(addressCreateSchema.safeParse({ ...validAddress, phone: "not a phone" }).success, false);
  assert.equal(addressUpdateSchema.safeParse({ phone: "+1 (212) 555-0198" }).success, true);
  assert.equal(addressUpdateSchema.safeParse({ phone: "letters" }).success, false);
  assert.equal(addressUpdateSchema.safeParse({ phone: null }).success, true);
});

test("validates names, email addresses, and postal codes by field type", () => {
  assert.equal(personNameSchema.safeParse("נועה לוי").success, true);
  assert.equal(personNameSchema.safeParse("John Smith 123").success, false);
  assert.equal(placeNameSchema.safeParse("Washington, D.C.").success, true);
  assert.equal(normalizedEmailSchema.parse("  USER@Example.com "), "user@example.com");
  assert.equal(normalizedEmailSchema.safeParse("not-an-email").success, false);
  assert.equal(postalCodeSchema.safeParse("6100001").success, true);
  assert.equal(postalCodeSchema.safeParse("SW1A 1AA").success, true);
  assert.equal(postalCodeSchema.safeParse("zip@code").success, false);
});
