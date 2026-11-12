import { z } from "zod";

export const addressCreateSchema = z.object({
  label: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(30).default("Home"),
  ),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().min(2).max(80),
  isDefault: z.boolean().default(false),
}).strict();
