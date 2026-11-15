import { z } from "zod";

export const normalizedEmailSchema = z.preprocess(
  (value) => typeof value === "string" ? value.normalize("NFKC").trim().toLowerCase() : value,
  z.email().max(254),
);

export const personNameSchema = z.string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}\p{Pd}'’.׳״ .]*$/u, "Enter a valid name.");

export const placeNameSchema = z.string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}\p{Pd}'’.׳״ ,&()]*$/u, "Enter a valid place name.");

export const phoneSchema = z.string()
  .trim()
  .min(7)
  .max(30)
  .regex(/^\+?[0-9(). -]+$/, "Enter a valid phone number.")
  .refine((value) => {
    const digitCount = value.replace(/\D/g, "").length;
    return digitCount >= 7 && digitCount <= 15;
  }, "Enter a phone number containing 7 to 15 digits.");

export const optionalPhoneSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  phoneSchema.optional(),
);

export const phoneOrEmptySchema = z.preprocess(
  (value) => typeof value === "string" ? value.trim() : value,
  z.union([phoneSchema, z.literal("")]),
);

export const postalCodeSchema = z.string()
  .trim()
  .min(2)
  .max(20)
  .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]*$/u, "Enter a valid postal code.");

export const optionalPostalCodeSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  postalCodeSchema.optional(),
);
