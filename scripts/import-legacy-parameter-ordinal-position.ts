import { createHash } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

const apply = process.argv.includes("--apply");
const legacyUrl = process.env.LEGACY_DATABASE_URL;
const sourceName = process.env.LEGACY_SOURCE_NAME?.trim() || "Eyebreed_Db";
const sourceSchema = process.env.LEGACY_SOURCE_SCHEMA?.trim() || "public";
const sourceTable = process.env.LEGACY_SOURCE_TABLE?.trim() || "parameter_ordinal_position";
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_$]*$/;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedEmail(row: Record<string, unknown>) {
  const candidate = Object.entries(row).find(([key, value]) => ["email", "email_address", "emailaddress", "e_mail", "mail"].includes(key.toLowerCase()) && typeof value === "string")?.[1];
  if (typeof candidate !== "string") return null;
  const value = candidate.normalize("NFKC").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254 ? value : null;
}

function sourceKey(row: Record<string, unknown>, rowHash: string) {
  const candidate = Object.entries(row).find(([key, value]) => ["id", "uuid", "key", "record_id"].includes(key.toLowerCase()) && ["string", "number", "bigint"].includes(typeof value))?.[1];
  return candidate === undefined || candidate === null ? rowHash : digest(String(candidate));
}

async function main() {
  if (!legacyUrl) throw new Error("LEGACY_DATABASE_URL is not configured. No source was read.");
  if (![sourceSchema, sourceTable].every((value) => IDENTIFIER.test(value))) throw new Error("Legacy schema/table identifier is invalid.");
  if (apply && process.env.LEGACY_IMPORT_BACKUP_CONFIRMED !== "true") throw new Error("Set LEGACY_IMPORT_BACKUP_CONFIRMED=true only after both dated backups are verified.");

  const legacy = new PrismaClient({ datasources: { db: { url: legacyUrl } } });
  try {
    const qualified = `"${sourceSchema}"."${sourceTable}"`;
    const rows = await legacy.$queryRawUnsafe<Array<Record<string, unknown>>>(`SELECT to_jsonb(source_row) AS "raw" FROM ${qualified} AS source_row`);
    const prepared = rows.map(({ raw }) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Legacy source returned an unsupported row shape.");
      const data = raw as Record<string, unknown>;
      const serialized = canonical(data);
      const sourceHash = digest(serialized);
      return { rawData: data as Prisma.InputJsonObject, sourceHash, sourceKey: sourceKey(data, sourceHash), normalizedEmail: normalizedEmail(data) };
    });
    const uniqueHashes = new Set(prepared.map((row) => row.sourceHash));
    const emailCounts = new Map<string, number>();
    for (const row of prepared) if (row.normalizedEmail) emailCounts.set(row.normalizedEmail, (emailCounts.get(row.normalizedEmail) ?? 0) + 1);

    if (apply) {
      for (let offset = 0; offset < prepared.length; offset += 250) {
        const batch = prepared.slice(offset, offset + 250);
        await prisma.$transaction(batch.map((row) => prisma.legacyParameterOrdinalPosition.upsert({
          where: { sourceName_sourceSchema_sourceTable_sourceKey: { sourceName, sourceSchema, sourceTable, sourceKey: row.sourceKey } },
          update: { sourceHash: row.sourceHash, normalizedEmail: row.normalizedEmail, rawData: row.rawData },
          create: { sourceName, sourceSchema, sourceTable, ...row },
        })), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      }
    }

    const destinationRows = apply ? await prisma.legacyParameterOrdinalPosition.count({ where: { sourceName, sourceSchema, sourceTable } }) : null;
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", source: `${sourceName}.${sourceSchema}.${sourceTable}`, sourceRows: prepared.length, uniqueRows: uniqueHashes.size, exactDuplicateRows: prepared.length - uniqueHashes.size, rowsWithValidEmail: prepared.filter((row) => row.normalizedEmail).length, duplicateNormalizedEmails: [...emailCounts.values()].filter((count) => count > 1).length, reconciliationHash: digest([...uniqueHashes].sort().join("\n")), destinationRows }));
  } finally {
    await legacy.$disconnect();
  }
}

main().catch((error: unknown) => {
  const safeMessages = new Set(["LEGACY_DATABASE_URL is not configured. No source was read.", "Legacy schema/table identifier is invalid.", "Set LEGACY_IMPORT_BACKUP_CONFIRMED=true only after both dated backups are verified.", "Legacy source returned an unsupported row shape."]);
  const message = error instanceof Error && safeMessages.has(error.message) ? error.message : "Legacy import failed; inspect server-side database connectivity without logging credentials or row data.";
  console.error(JSON.stringify({ event: "legacy_import_failed", errorType: error instanceof Error ? error.name : "unknown", message }));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
