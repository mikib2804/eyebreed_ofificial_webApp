import assert from "node:assert/strict";
import test from "node:test";
import { adminProductSchema } from "../lib/admin-product-validation";

const validProduct = {
  name: "Archive Hoodie",
  nameHe: "",
  slug: "archive-hoodie",
  categoryId: "cm00000000000000000000000",
  description: "A sufficiently detailed product description.",
  descriptionHe: "",
  story: "",
  storyHe: "",
  material: "Cotton",
  priceUsd: 100,
  priceIls: 360,
  priceEur: 95,
  status: "ACTIVE",
  featured: false,
  bestSeller: false,
  isNew: true,
  lowStockThreshold: 5,
  inventory: 4,
  images: ["/products/archive-hoodie.jpg"],
  videoUrl: "",
  variants: [{ size: "M", color: "Black", inventory: 4 }],
} as const;

test("accepts bounded local product media and unique variants", () => {
  assert.equal(adminProductSchema.safeParse(validProduct).success, true);
  assert.equal(adminProductSchema.safeParse({ ...validProduct, inventory: 12, variants: [] }).success, true);
});

test("rejects unsafe media URLs and duplicate variants", () => {
  assert.equal(adminProductSchema.safeParse({ ...validProduct, images: ["http://attacker.example/image.jpg"] }).success, false);
  assert.equal(adminProductSchema.safeParse({ ...validProduct, images: ["/../secrets.txt"] }).success, false);
  assert.equal(adminProductSchema.safeParse({ ...validProduct, variants: [{ size: "M", color: "Black", inventory: 4 }, { size: "m", color: "black", inventory: 2 }] }).success, false);
});
