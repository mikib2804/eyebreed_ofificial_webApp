import { PrismaClient } from "@prisma/client";

type SourceEntry = {
  id: string;
  email: string;
  createdAt: Date;
  lastEmailedAt: Date | null;
};

async function main() {
  const sourceUrl = process.env.LEGACY_DATABASE_URL;
  const destinationUrl = process.env.DATABASE_URL;
  if (!sourceUrl || !destinationUrl) throw new Error("LEGACY_DATABASE_URL and DATABASE_URL are required.");
  if (sourceUrl === destinationUrl) throw new Error("Source and destination databases must be different.");

  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const destination = new PrismaClient({ datasources: { db: { url: destinationUrl } } });
  try {
    const entries = await source.$queryRaw<SourceEntry[]>`
      SELECT "id", "email", "createdAt", "lastEmailedAt"
      FROM "PreorderWaitlistEntry"
      WHERE btrim("email") <> ''
      ORDER BY "createdAt" ASC
    `;

    let inserted = 0;
    let updated = 0;
    for (const entry of entries) {
      const result = await destination.$queryRaw<Array<{ inserted: boolean }>>`
        INSERT INTO "PreorderWaitlistEntry" ("id", "email", "createdAt", "lastEmailedAt")
        VALUES (${entry.id}, ${entry.email.trim()}, ${entry.createdAt}, ${entry.lastEmailedAt})
        ON CONFLICT (lower(btrim("email"))) DO UPDATE SET
          "lastEmailedAt" = COALESCE(EXCLUDED."lastEmailedAt", "PreorderWaitlistEntry"."lastEmailedAt"),
          "createdAt" = LEAST(EXCLUDED."createdAt", "PreorderWaitlistEntry"."createdAt")
        RETURNING (xmax = 0) AS "inserted"
      `;
      if (result[0]?.inserted) inserted += 1;
      else updated += 1;
    }

    const [count] = await destination.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)::bigint AS "count" FROM "PreorderWaitlistEntry"
    `;
    console.log(JSON.stringify({ sourceRows: entries.length, inserted, updated, destinationRows: Number(count?.count ?? 0) }));
  } finally {
    await Promise.all([source.$disconnect(), destination.$disconnect()]);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Pre-order waitlist import failed.");
  process.exitCode = 1;
});
