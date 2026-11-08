# Legacy waitlist migration report — 2026-11-07

## Source and result

- Discovered source: `public.PreorderWaitlistEntry` in the legacy PostgreSQL database. The originally supplied `parameter_ordinal_position` name was not a table in either database.
- Source rows: 46; distinct normalized emails: 46; null/blank emails: 0; duplicate normalized-email groups: 0.
- Raw preservation destination: `legacy_parameter_ordinal_position_raw`; rows after two apply runs: 46.
- Normalized destination: `VisionWaitlistEntry`; accepted: 46; rejected: 0; rows after two apply runs: 46.
- Consent was mapped to `PREORDER_UPDATES`, not newsletter marketing consent. Source provenance and source timestamps were preserved.
- Privacy-safe reconciliation SHA-256: `0c68dc3da199a75f9273f46202d72ed45eecc8449f17023afc8ffb6885937cc8`.

## Backups and rollback

Custom-format backups were created under the ignored local `.tmp/backups/2026-11-07-phase1/` directory before import. `pg_restore --list` successfully parsed both archives (60 legacy TOC entries and 199 primary TOC entries), proving archive readability. A destructive restore was not run against the production database.

Rollback must be performed into a separate empty recovery database first:

```powershell
pg_restore --clean --if-exists --no-owner --dbname "$env:RECOVERY_DATABASE_URL" ".tmp/backups/2026-11-07-phase1/primary-before-import.dump"
```

After validating the recovery database, switch deployment variables during a controlled rollback. Never restore this archive directly over production without a fresh backup and explicit approval.
