import assert from "node:assert/strict";
import test from "node:test";
import { maintenanceNoticeInputSchema, maintenanceNoticeUpdateSchema } from "../lib/maintenance-validation";

const validNotice = {
  title: "We are evolving",
  message: "We are making a few careful improvements to the store.",
  duration: "About 2 hours",
  startsAt: "2026-11-18T18:00:00.000Z",
  endsAt: "2026-11-18T20:00:00.000Z",
  active: true,
  subtitle: "Thank you for your patience.",
};

test("maintenance notices accept a complete valid schedule", () => {
  assert.equal(maintenanceNoticeInputSchema.safeParse(validNotice).success, true);
});

test("maintenance notices reject an end time that is not after the start", () => {
  const parsed = maintenanceNoticeInputSchema.safeParse({
    ...validNotice,
    endsAt: validNotice.startsAt,
  });
  assert.equal(parsed.success, false);
  if (!parsed.success) assert.equal(parsed.error.issues[0]?.path[0], "endsAt");
});

test("maintenance updates allow a single field but reject empty payloads", () => {
  assert.equal(maintenanceNoticeUpdateSchema.safeParse({ active: false }).success, true);
  assert.equal(maintenanceNoticeUpdateSchema.safeParse({}).success, false);
});
