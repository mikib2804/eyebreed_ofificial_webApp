# Phase 0 baseline — 2026-11-05

This record contains no database credentials or customer data.

## Verified

- Repository: one checkout on branch `newUpdates`, with one GitHub remote.
- Application: one Next.js 15 / React 19 codebase with one Prisma PostgreSQL datasource.
- Production output: development uses `.next-eyebreed`; production and Netlify use the standard `.next` output.
- Auth middleware: Edge-safe Auth.js configuration is separated from the Node-only Prisma, bcrypt, and credentials configuration.
- TypeScript: `npm run typecheck` passes.
- Unit tests: `npm test` runs 7 tests and all pass.
- Production build: `npm run build` completes successfully.
- Database network: both configured Prisma PostgreSQL hosts accept TCP connections from the workstation.
- Primary database inventory: Prisma connected successfully after an intermittent initial failure. The `public` schema contains the expected application tables and 4 migration records.
- Exact non-sensitive counts at inventory time: 1 user; 0 accounts, categories, products, orders, pre-orders, discounts, contact messages, and vision waitlist entries.
- The primary database does not contain a table named `parameter_ordinal_position`.

## Not yet verified / blockers

- Prisma connectivity is intermittent: inventory succeeded on retry after a connection failure. This must be monitored before cutover.
- No legacy database schema, row counts, or `parameter_ordinal_position` metadata could be read because the legacy source is not configured.
- No database backup has been created or verified.
- The second EYEBREED website/deployment is not represented in this checkout and no second repository, URL, hosting project, or environment was found.
- It is not yet clear whether `Eyebreed_Db` is a database name, schema name, or service label, or whether `parameter_ordinal_position` is the intended table name.
- The repository has no installed ESLint dependency/configuration. The legacy `next lint` command is interactive and deprecated. An attempted official ESLint dependency install stalled at the package registry and was stopped without modifying dependencies.

## Changes made in Phase 0

- Added `npm run typecheck`, `npm test`, `npm run check`, and the read-only `npm run db:inventory` command.
- Added a safe `.env.example` inventory containing placeholders only.
- Added `.next-eyebreed` to `.gitignore` and separated development/production build directories.
- Restored the two palette definitions expected by the existing tests and made unknown palette IDs fall back to `original` deterministically.
- Split Auth.js configuration so middleware no longer bundles Prisma or bcrypt into the Edge runtime.

## Required before Phase 1 data migration

1. Provide the second website's URL and repository/hosting project, or confirm that “both websites” are two deployments of this repository.
2. Provide read-only connection details for the legacy `Eyebreed_Db` source through local environment configuration (never in chat or source control).
3. Confirm the exact legacy source object and its meaning.
4. Create and verify dated backups of both primary and legacy databases.
5. Investigate or monitor the intermittent Prisma connection before production cutover.

No migration or destructive database operation has been run.
