import { z } from "zod";

export const cartQuoteInputSchema = z.object({
  currency: z.enum(["USD", "ILS", "EUR"]),
  code: z.string().trim().max(64).nullable().optional(),
  items: z.array(z.object({
    productId: z.string().min(1).max(64),
    quantity: z.number().int().min(1).max(20),
    size: z.string().max(30).nullable().optional(),
    color: z.string().max(40).nullable().optional(),
  }).strict()).min(1).max(100),
}).strict();
