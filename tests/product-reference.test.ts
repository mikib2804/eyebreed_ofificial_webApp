import assert from "node:assert/strict";
import test from "node:test";
import { productReferenceKeys, splitProductReferences } from "../lib/product-reference";

test("splits current database ids from legacy campaign cart references", () => {
  assert.deepEqual(
    splitProductReferences([
      "cm-product-1",
      "campaign-vision-washed-zip-hoodie",
      "campaign-vision-washed-zip-hoodie",
      "cm-product-1",
    ]),
    {
      directIds: ["cm-product-1"],
      legacySlugs: ["vision-washed-zip-hoodie"],
    },
  );
});

test("indexes a database product under both current and legacy cart references", () => {
  assert.deepEqual(
    productReferenceKeys({ id: "cm-product-1", slug: "vision-washed-zip-hoodie" }),
    ["cm-product-1", "campaign-vision-washed-zip-hoodie"],
  );
});
