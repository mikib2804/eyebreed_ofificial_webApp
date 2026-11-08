import { PrismaClient } from "@prisma/client";

type TableRow = { schemaName: string; tableName: string; estimatedRows: bigint };
type ColumnRow = { schemaName: string; tableName: string; columnName: string; dataType: string; nullable: string; ordinalPosition: number };
type ConstraintRow = { schemaName: string; tableName: string; constraintName: string; constraintType: string; columnName: string | null };

async function main() {
  const url = process.env.LEGACY_DATABASE_URL;
  if (!url) throw new Error("LEGACY_DATABASE_URL is not configured.");
  const legacy = new PrismaClient({ datasources: { db: { url } } });
  try {
    const [identity] = await legacy.$queryRaw<Array<{ databaseName: string; schemaName: string }>>`SELECT current_database() AS "databaseName", current_schema() AS "schemaName"`;
    const tables = await legacy.$queryRaw<TableRow[]>`
      SELECT schemaname AS "schemaName", relname AS "tableName", n_live_tup::bigint AS "estimatedRows"
      FROM pg_stat_user_tables ORDER BY schemaname, relname
    `;
    const relevantColumns = await legacy.$queryRaw<ColumnRow[]>`
      SELECT table_schema AS "schemaName", table_name AS "tableName", column_name AS "columnName", data_type AS "dataType", is_nullable AS "nullable", ordinal_position AS "ordinalPosition"
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        AND (lower(table_name) = 'parameter_ordinal_position' OR lower(column_name) LIKE '%email%' OR lower(column_name) = 'parameter_ordinal_position')
      ORDER BY table_schema, table_name, ordinal_position
    `;
    const emailTables = [...new Map(relevantColumns.filter((column) => column.columnName.toLowerCase() === "email").map((column) => [`${column.schemaName}.${column.tableName}`, { schema: column.schemaName, table: column.tableName, emailColumn: column.columnName }])).values()];
    const fullColumns = await legacy.$queryRaw<ColumnRow[]>`
      SELECT table_schema AS "schemaName", table_name AS "tableName", column_name AS "columnName", data_type AS "dataType", is_nullable AS "nullable", ordinal_position AS "ordinalPosition"
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_name IN (SELECT table_name FROM information_schema.columns WHERE lower(column_name) = 'email')
      ORDER BY table_schema, table_name, ordinal_position
    `;
    const constraints = await legacy.$queryRaw<ConstraintRow[]>`
      SELECT tc.table_schema AS "schemaName", tc.table_name AS "tableName", tc.constraint_name AS "constraintName", tc.constraint_type AS "constraintType", kcu.column_name AS "columnName"
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_catalog = kcu.constraint_catalog AND tc.constraint_schema = kcu.constraint_schema AND tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND tc.table_name IN (SELECT table_name FROM information_schema.columns WHERE lower(column_name) = 'email')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name, kcu.ordinal_position
    `;
    const emailStats = [];
    for (const candidate of emailTables) {
      if (![candidate.schema, candidate.table, candidate.emailColumn].every((value) => /^[A-Za-z_][A-Za-z0-9_$]*$/.test(value))) continue;
      const qualified = `"${candidate.schema}"."${candidate.table}"`;
      const email = `"${candidate.emailColumn}"`;
      const [stats] = await legacy.$queryRawUnsafe<Array<{ total: bigint; nullEmails: bigint; blankEmails: bigint; distinctNormalizedEmails: bigint; duplicateNormalizedEmailGroups: bigint }>>(`SELECT COUNT(*)::bigint AS "total", COUNT(*) FILTER (WHERE ${email} IS NULL)::bigint AS "nullEmails", COUNT(*) FILTER (WHERE btrim(${email}) = '')::bigint AS "blankEmails", COUNT(DISTINCT lower(btrim(${email}))) FILTER (WHERE ${email} IS NOT NULL AND btrim(${email}) <> '')::bigint AS "distinctNormalizedEmails", (SELECT COUNT(*)::bigint FROM (SELECT lower(btrim(${email})) FROM ${qualified} WHERE ${email} IS NOT NULL AND btrim(${email}) <> '' GROUP BY lower(btrim(${email})) HAVING COUNT(*) > 1) duplicates) AS "duplicateNormalizedEmailGroups" FROM ${qualified}`);
      emailStats.push({ schema: candidate.schema, table: candidate.table, total: Number(stats?.total ?? 0), nullEmails: Number(stats?.nullEmails ?? 0), blankEmails: Number(stats?.blankEmails ?? 0), distinctNormalizedEmails: Number(stats?.distinctNormalizedEmails ?? 0), duplicateNormalizedEmailGroups: Number(stats?.duplicateNormalizedEmailGroups ?? 0) });
    }
    console.log(JSON.stringify({ databaseName: identity?.databaseName ?? "unknown", currentSchema: identity?.schemaName ?? "unknown", tables: tables.map((table) => ({ schema: table.schemaName, table: table.tableName, estimatedRows: Number(table.estimatedRows) })), fullColumns, constraints, emailStats }));
  } finally {
    await legacy.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ event: "legacy_inspection_failed", errorType: error instanceof Error ? error.name : "unknown", message: error instanceof Error && error.message === "LEGACY_DATABASE_URL is not configured." ? error.message : "Legacy inspection failed without logging credentials or row data." }));
  process.exitCode = 1;
});
