# Controlled admin role procedure

There is no public or customer-facing route that can grant `ADMIN`. Role changes are performed by an authorized operator from the repository environment and are written to `AuditLog`.

Grant admin:

```powershell
npm run admin:role -- --email person@example.com --role ADMIN --confirm
```

Revoke admin:

```powershell
npm run admin:role -- --email person@example.com --role CUSTOMER --confirm
```

Operational rules:

- Verify the person's identity and business approval outside the application before running the command.
- Use the normalized account email; the script refuses unknown accounts.
- Keep terminal output and database credentials private.
- Review the generated `ADMIN_ROLE_GRANTED` or `ADMIN_ROLE_REVOKED` audit entry.
- Revocation takes effect on the next admin request because admin authorization checks the current database role rather than only the session token.
