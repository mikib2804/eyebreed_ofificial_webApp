import { z } from "zod";

export const maintenanceNoticeInputSchema = z.object({
  title: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(2_000),
  duration: z.string().trim().min(1).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  active: z.boolean(),
  subtitle: z.string().trim().max(240).optional().default(""),
}).strict().superRefine((value, context) => {
  if (new Date(value.endsAt) <= new Date(value.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End time must be after the start time." });
  }
});

export const maintenanceNoticeUpdateSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  message: z.string().trim().min(10).max(2_000).optional(),
  duration: z.string().trim().min(1).max(120).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  active: z.boolean().optional(),
  subtitle: z.string().trim().max(240).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "No changes supplied.");
