import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const apply = process.argv.includes("--apply");
const rowSchema = z.object({ id: z.string().min(1), email: z.string().email().max(254), createdAt: z.coerce.date(), lastEmailedAt: z.coerce.date().nullable().optional() }).passthrough();

async function main() {
  if (apply && process.env.LEGACY_IMPORT_BACKUP_CONFIRMED !== "true") throw new Error("Backup confirmation is required.");
  const rawRows = await prisma.legacyParameterOrdinalPosition.findMany({ where: { sourceName: "waitlist-web-app", sourceSchema: "public", sourceTable: "PreorderWaitlistEntry" }, select: { sourceHash: true, rawData: true }, orderBy: { sourceHash: "asc" } });
  const accepted = [];
  let rejected = 0;
  for (const row of rawRows) {
    const parsed = rowSchema.safeParse(row.rawData);
    if (!parsed.success) { rejected += 1; continue; }
    accepted.push({ sourceHash: row.sourceHash, email: parsed.data.email.normalize("NFKC").trim().toLowerCase(), createdAt: parsed.data.createdAt, lastEmailedAt: parsed.data.lastEmailedAt ?? null });
  }
  if (apply) {
    for (const row of accepted) {
      const existing = await prisma.visionWaitlistEntry.findUnique({ where: { email: row.email }, select: { id: true, lastEmailedAt: true } });
      if (existing) {
        if (row.lastEmailedAt && (!existing.lastEmailedAt || row.lastEmailedAt > existing.lastEmailedAt)) await prisma.visionWaitlistEntry.update({ where: { id: existing.id }, data: { lastEmailedAt: row.lastEmailedAt } });
      } else {
        await prisma.visionWaitlistEntry.create({ data: { email: row.email, locale: "he", consentAt: row.createdAt, consentScope: "PREORDER_UPDATES", source: "legacy-waitlist-web-app", lastEmailedAt: row.lastEmailedAt, ipHash: `legacy:${row.sourceHash}`, createdAt: row.createdAt } });
      }
    }
  }
  const destinationRows = apply ? await prisma.visionWaitlistEntry.count({ where: { source: "legacy-waitlist-web-app" } }) : null;
  const reconciliationHash = createHash("sha256").update(accepted.map((row) => row.sourceHash).sort().join("\n")).digest("hex");
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", rawRows: rawRows.length, accepted: accepted.length, rejected, reconciliationHash, destinationRows }));
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ event: "legacy_waitlist_normalization_failed", errorType: error instanceof Error ? error.name : "unknown", message: error instanceof Error && error.message === "Backup confirmation is required." ? error.message : "Normalization failed without logging personal data." }));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
