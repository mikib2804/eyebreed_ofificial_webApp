# Security status

Last reviewed: 2026-11-07.

## Dependency audit

`npm audit --omit=dev` reports no critical advisories. It reports one high and one moderate finding through Next.js' bundled PostCSS version. npm currently offers only a semver-major remediation: upgrading from Next.js 15 to Next.js 16.4.5.

Do not run `npm audit fix --force` on the release branch. The Next.js 16 migration needs its own compatibility branch because this application also depends on React 19, Auth.js v5 beta, Netlify build behavior, custom CSP headers, and Prisma generation.

Current risk reduction:

- Product/admin media fields reject traversal paths, credentials in URLs, non-HTTPS remote URLs, and hosts outside the configured allowlist.
- The application does not accept or compile customer-supplied CSS.
- CSP restricts scripts, objects, frames, images, and media.
- Runtime validation, request-size limits, same-origin checks, rate limits, and database authorization protect custom mutation routes.

## Required follow-up before release

1. Create a dedicated Next.js 16 upgrade branch.
2. Upgrade Next.js and its supported React/ESLint ecosystem without `--force`.
3. Re-run type-check, unit, integration, accessibility, production build, and browser tests.
4. Re-run `npm audit --omit=dev`; accept no unresolved critical findings and document any remaining advisory with a concrete mitigation and owner.

## Operational logging

Payment and admin rejection/failure events use structured request IDs. Logs intentionally exclude request bodies, emails, credentials, Stripe signatures, tokens, raw exception messages, and database connection details. Production alert routing still needs to be connected to the hosting provider's logging/alerting service.
