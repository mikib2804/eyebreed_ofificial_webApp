import { z } from "zod";
import { optionalPhoneSchema, optionalPostalCodeSchema, personNameSchema, phoneSchema, placeNameSchema, postalCodeSchema } from "@/lib/validation";

export const addressCreateSchema = z.object({
  label: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(30).default("Home"),
  ),
  fullName: personNameSchema,
  phone: optionalPhoneSchema,
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: placeNameSchema,
  postalCode: optionalPostalCodeSchema,
  country: placeNameSchema,
  isDefault: z.boolean().default(false),
}).strict();

export const addressUpdateSchema = z.object({
  label: z.string().trim().min(1).max(30).optional(),
  fullName: personNameSchema.optional(),
  phone: z.union([phoneSchema, z.null()]).optional(),
  line1: z.string().trim().min(3).max(120).optional(),
  line2: z.string().trim().max(120).nullable().optional(),
  city: placeNameSchema.optional(),
  postalCode: z.union([postalCodeSchema, z.null()]).optional(),
  country: placeNameSchema.optional(),
  isDefault: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "No changes supplied");
