import { z } from "zod";

const optionalMoney = z.preprocess((value) => value === "" || value === undefined ? null : value, z.coerce.number().nonnegative().max(1_000_000).nullable());
const optionalLimit = z.preprocess((value) => value === "" || value === undefined ? null : value, z.coerce.number().int().positive().max(1_000_000).nullable());
const optionalDate = z.preprocess((value) => value === "" || value === undefined ? null : value, z.coerce.date().nullable());

export const discountInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? null : value, z.string().trim().min(2).max(64).regex(/^[A-Za-z0-9_-]+$/).transform((value) => value.toUpperCase()).nullable()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  scope: z.enum(["STORE", "PRODUCT", "CATEGORY"]),
  value: z.coerce.number().positive().max(1_000_000),
  active: z.boolean(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  minimumPurchase: optionalMoney,
  usageLimit: optionalLimit,
  perCustomerLimit: optionalLimit,
  productIds: z.array(z.string().min(1).max(64)).max(100),
  categoryIds: z.array(z.string().min(1).max(64)).max(100),
}).strict().superRefine((value, context) => {
  if (value.type === "PERCENTAGE" && value.value > 100) context.addIssue({ code: "custom", path: ["value"], message: "Percentage cannot exceed 100." });
  if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) context.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after the start date." });
  if (value.scope === "PRODUCT" && value.productIds.length === 0) context.addIssue({ code: "custom", path: ["productIds"], message: "Select at least one product." });
  if (value.scope === "CATEGORY" && value.categoryIds.length === 0) context.addIssue({ code: "custom", path: ["categoryIds"], message: "Select at least one category." });
});
