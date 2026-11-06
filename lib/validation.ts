import { z } from "zod";

export const normalizedEmailSchema = z.preprocess(
  (value) => typeof value === "string" ? value.normalize("NFKC").trim().toLowerCase() : value,
  z.email().max(254),
);
