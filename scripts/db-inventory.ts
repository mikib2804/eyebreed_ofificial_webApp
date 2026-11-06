import { prisma } from "../lib/prisma";

type DatabaseRow = {
  databaseName: string;
  schemaName: string;
};

type TableRow = {
  schemaName: string;
  tableName: string;
  estimatedRows: bigint;
};

type ColumnRow = {
  schemaName: string;
  tableName: string;
  columnName: string;
  dataType: string;
  nullable: string;
  ordinalPosition: number;
};

async function main() {
  const [database] = await prisma.$queryRaw<DatabaseRow[]>`
    SELECT
      current_database() AS "databaseName",
      current_schema() AS "schemaName"
  `;

  const tables = await prisma.$queryRaw<TableRow[]>`
    SELECT
      schemaname AS "schemaName",
      relname AS "tableName",
      n_live_tup::bigint AS "estimatedRows"
    FROM pg_stat_user_tables
    ORDER BY schemaname, relname
  `;

  const legacyColumns = await prisma.$queryRaw<ColumnRow[]>`
    SELECT
      table_schema AS "schemaName",
      table_name AS "tableName",
      column_name AS "columnName",
      data_type AS "dataType",
      is_nullable AS "nullable",
      ordinal_position AS "ordinalPosition"
    FROM information_schema.columns
    WHERE lower(table_name) = lower('parameter_ordinal_position')
    ORDER BY table_schema, table_name, ordinal_position
  `;

  const [
    users,
    accounts,
    categories,
    products,
    orders,
    preOrders,
    discounts,
    contactMessages,
    waitlistEntries,
    migrations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.preOrder.count(),
    prisma.discount.count(),
    prisma.contactMessage.count(),
    prisma.visionWaitlistEntry.count(),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)::bigint AS count FROM "_prisma_migrations"
    `.then((rows) => Number(rows[0]?.count ?? 0)),
  ]);

  console.log(`Database: ${database?.databaseName ?? "unknown"}`);
  console.log(`Current schema: ${database?.schemaName ?? "unknown"}`);
  console.table(
    tables.map((table) => ({
      schema: table.schemaName,
      table: table.tableName,
      estimatedRows: table.estimatedRows.toString(),
    })),
  );

  console.log("Exact domain counts (no row contents):");
  console.table([
    { table: "User", rows: users },
    { table: "Account", rows: accounts },
    { table: "Category", rows: categories },
    { table: "Product", rows: products },
    { table: "Order", rows: orders },
    { table: "PreOrder", rows: preOrders },
    { table: "Discount", rows: discounts },
    { table: "ContactMessage", rows: contactMessages },
    { table: "VisionWaitlistEntry", rows: waitlistEntries },
    { table: "_prisma_migrations", rows: migrations },
  ]);

  if (legacyColumns.length === 0) {
    console.log("Table parameter_ordinal_position was not found in this database.");
    return;
  }

  console.log("parameter_ordinal_position columns:");
  console.table(
    legacyColumns.map((column) => ({
      schema: column.schemaName,
      table: column.tableName,
      position: column.ordinalPosition,
      column: column.columnName,
      type: column.dataType,
      nullable: column.nullable,
    })),
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`Database inventory failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
