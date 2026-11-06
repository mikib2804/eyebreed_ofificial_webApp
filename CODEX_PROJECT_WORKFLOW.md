# EYEBREED finalization workflow

This is the ordered implementation backlog for bringing both EYEBREED websites to one primary database and finishing the storefront, customer account, admin, accessibility, security, discounts, and Stripe test-mode checkout.

## Definition of done

- Both deployed websites read and write only the primary PostgreSQL database.
- All legacy rows and email records from `Eyebreed_Db.parameter_ordinal_position` are preserved, migrated, reconciled, and backed up.
- The advertised promotion and the amount charged at checkout are the same: 15% off website orders, subject to the final agreed eligibility rules.
- Every public navigation/footer link resolves to a real route; technical/private routes are not advertised.
- Customer account pages show the signed-in customer's real data and all mutations persist safely.
- Admin-only features perform a fresh server-side role check and all management sections are operational.
- Cart discount codes are validated and calculated on the server and stored with the order.
- Stripe Checkout works end-to-end in test mode, with signed, idempotent webhooks as the source of payment truth.
- Google sign-in works in development and both deployed domains and correctly links to the primary user record.
- The site meets a practical WCAG 2.2 AA baseline and passes automated plus manual keyboard checks.
- Basic web security controls are present, tested, and documented.
- Build, migration, integration, and end-to-end checks pass before production cutover.

## Current repository facts

- Stack: Next.js 15, React 19, Auth.js v5 beta, Prisma 6, PostgreSQL, TypeScript, and Zod.
- One Prisma datasource is currently configured through `DATABASE_URL` and `DIRECT_URL`.
- Google and credentials authentication are already present in `auth.ts`; Google needs environment and callback verification rather than a new authentication system.
- Account routes already exist for overview, orders, pre-orders, profile, addresses, and wishlist. Several are partly wired, but counts, linking, editing, and end-to-end checkout data still need completion.
- The database already contains `User`, `Order`, `CartItem`, `Address`, `WishlistItem`, `PreOrder`, `Discount`, `StoreSettings`, and `AuditLog` models.
- The admin page currently has real products/messages/customers data, while Orders, Discounts, and Settings remain placeholders.
- The cart is primarily browser state, then synchronized for authenticated users. Prices and promotion logic must move to a server-authoritative quote before payments are enabled.
- The footer newsletter form currently does not save anything.
- Only one website/codebase is visible in this checkout. The second deployment/codebase and the legacy database must be identified in Phase 0.

## Phase 0 — inventory, backups, and a reproducible baseline

- [ ] Identify both websites: production URLs, hosting projects, branches/repositories, environment variables, and current database destinations.
- [ ] Confirm which PostgreSQL instance is the primary database and which instance/schema contains `Eyebreed_Db.parameter_ordinal_position`.
- [ ] Inspect the legacy table schema, constraints, row count, timestamps, duplicate-email rules, and relationships without changing it.
- [ ] Inventory every source of email/customer data: users, newsletter signups, contact messages, vision waitlist, pre-orders, orders, and the legacy table.
- [ ] Take dated backups of the legacy and primary databases and document a tested rollback command.
- [ ] Record current row counts and safe reconciliation hashes; never copy secrets or full personal data into logs.
- [x] Resolve the local Windows repository/Prisma file-lock issue so `prisma generate` and `next build` are reproducible.
- [x] Fix deployment/build-output configuration by separating the development cache from the standard production `.next` output used by Netlify.
- [ ] Add or repair baseline scripts: type-check and unit tests now pass; ESLint installation/configuration and later integration/end-to-end coverage remain.

**Gate:** Do not start data migration until both databases, both sites, backups, and rollback steps are verified.

## Phase 1 — consolidate both websites on the primary database

- [ ] Create a Prisma migration for a primary-database table matching the discovered `parameter_ordinal_position` schema. Preserve the original table name with Prisma mapping if compatibility requires it.
- [ ] Preserve the raw legacy rows first; normalize copies into the correct domain tables only after field mapping is reviewed.
- [ ] Add a real newsletter/subscriber model if the legacy email rows or footer subscriptions represent marketing consent. Store consent source and timestamps rather than treating every collected email as subscribed.
- [ ] Write an idempotent migration/import command with deterministic keys, email normalization, duplicate handling, dry-run mode, and a transaction/batch strategy.
- [ ] Reconcile source and destination row counts, rejected rows, duplicates, nulls, and sampled records. Produce a migration report that contains no sensitive values.
- [ ] Put the old sites into a short write freeze or dual-read verification window, run the final delta import, then switch both deployments to the primary `DATABASE_URL`/`DIRECT_URL`.
- [ ] Run smoke tests against both websites and monitor database errors before retiring old write credentials.
- [ ] Keep the legacy backup read-only for the agreed retention window; do not delete it as part of this task.

**Acceptance:** both sites create and retrieve test records from the same primary database, reconciliation is complete, and rollback remains available.

## Phase 2 — authentication, identity linking, and authorization foundation

- [ ] Verify credentials login, registration, reset-password, logout, session expiry, and account protection against the primary database.
- [ ] Verify Google OAuth with `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and exact `/api/auth/callback/google` URLs for local development and both deployed domains.
- [x] Define safe account-linking rules for a matching verified email so Google sign-in does not create duplicate customers or enable account takeover (`docs/google-oauth.md`).
- [ ] Link existing legacy orders/pre-orders/wishlist/cart records to the signed-in user where a verified, normalized email matches.
- [x] Replace admin authorization based only on a potentially stale JWT role with a reusable server helper that checks the current database role for every current admin page and API mutation.
- [x] Define the controlled, confirmed, and audited admin-grant/revoke procedure; never allow public self-promotion to `ADMIN` (`docs/admin-role-procedure.md`).
- [ ] Add audit records for admin mutations and important role changes.

**Acceptance:** customers can use email/password or Google, duplicate identities are handled safely, and changing a database role takes effect without relying on hidden UI controls.

## Phase 3 — server-authoritative catalog, cart, promotion, and discount codes

- [x] Make database products, variants, inventory, and prices the canonical source for this repository's storefront and product routes; remove production dependence on the local catalog fallback. The second deployment/repository still needs to be identified before it can be switched.
- [x] Add a server-side cart quote service that reloads product prices/inventory, calculates subtotal/shipping/discount/total, and returns structured validation errors.
- [x] Replace every “50% off” reference with the approved “15% off website orders” copy in Hebrew and English.
- [x] Implement the 15% rule in the quote/checkout service, not only in the ticker. Current policy: all active database products receive 15%; free gifts are excluded; free-shipping/free-hat rules remain active; codes do not stack and replace the automatic promotion only when they save more.
- [x] Add a discount-code field and Apply/Remove states to the cart drawer, including localized success and error feedback.
- [x] Use the existing `Discount` model for code configuration and persist transactional order redemptions so total/per-customer limits are enforceable.
- [x] Add order fields such as `subtotal`, `discountAmount`, `shippingAmount`, `taxAmount`, `discountCode`, and `promotionSnapshot` (exact names finalized in the schema review).
- [x] Add a `DiscountRedemption` model linked to discount, order, and user/email, with indexes and uniqueness/idempotency rules.
- [x] Recheck discount validity and inventory inside the checkout transaction; never trust prices, totals, currency, coupon value, or stock sent by the browser.
- [x] Keep guest carts local for now; authenticated carts are database-backed and merge deterministically once on login.

**Acceptance:** changing browser payloads cannot change the charged price; invalid/expired/over-limit codes fail; the order stores an immutable pricing snapshot.

## Phase 4 — Stripe Checkout in test mode

- [x] Install the official Stripe server SDK and add documented test-only environment variables. Secret keys and webhook secrets remain server-only.
- [x] Extend the schema with unique Stripe Checkout Session and Payment Intent identifiers, payment timestamps, and an idempotent webhook-event record.
- [x] Create a checkout-session endpoint that authenticates the customer, calls the server quote inside a serializable transaction, validates stock, reserves code usage, creates a pending order, and sends only the trusted total to Stripe.
- [x] Redirect the cart checkout button only to an HTTPS `checkout.stripe.com` URL returned by the server in test mode.
- [x] Implement a webhook route that verifies the raw-body Stripe signature before processing anything.
- [x] Process `checkout.session.completed`, asynchronous success, and expiration events idempotently. Only verified webhook events may mark an order paid or change inventory.
- [x] Prevent double inventory decrement and double coupon redemption on webhook retries using stored event IDs and transactional state checks. Confirmation email delivery remains a later task.
- [x] Add success and cancel pages that retrieve order state from the server; a browser redirect never marks an order paid.
- [ ] Test successful payment, decline, 3-D Secure, abandoned checkout, delayed event, duplicate event, invalid signature, refund-state update, and out-of-stock race.
- [x] Document the later live-mode switch as an environment/Stripe Dashboard operation; do not embed dummy or live credentials in code (`docs/stripe-test-mode.md`).

**Acceptance:** a Stripe test payment produces exactly one paid order with correct items, totals, discount, inventory, history, and customer visibility.

## Phase 5 — finish every customer account destination

- [x] **Overview:** calculate totals from all customer orders rather than the current four-row recent-orders subset; show accurate pending/shipped/pre-order counts and recent activity.
- [x] **My Orders:** show all order/payment/shipping statuses, localized labels, pagination, actual persisted totals/discounts, and protected detail pages that enforce ownership.
- [x] **My Pre-orders:** link legacy/email-only records only after verified login; display real products, variants, localized status/history, and owner-only cancellation rules.
- [x] **My Profile:** persist name/phone safely; verify email changes with short-lived single-use tokens; require the current password for password accounts; handle Google-only accounts and invalidate old sessions after credential changes.
- [x] **My Addresses:** support add, edit, delete, and set-default; preserve ownership checks and guarantee only one default per customer.
- [x] **Wishlist:** connect every storefront heart button to the API/database for signed-in users, use a deliberate guest behavior, and keep UI state consistent across pages.
- [x] **Cart:** show the signed-in user's persisted cart and merge it once on login without duplicating quantities.
- [ ] Add loading, empty, error, and success states in Hebrew and English for each page.
- [ ] Add integration tests proving user A cannot read or modify user B's orders, addresses, wishlist, pre-orders, or cart.

**Acceptance:** every link in the supplied account navigation shows current database data and every supported mutation survives refresh and re-login.

Progress notes:

- Orders now have enum-validated filters, pagination, localized status labels, all three status dimensions, real totals, and ownership-protected detail queries. Discount breakdown remains dependent on the checkout pricing schema.
- Profile name/phone and password changes are persisted safely. Direct email replacement is blocked until the verified-email-change flow is implemented; Google-only accounts no longer receive unusable password controls.

## Phase 6 — make the admin management area operational

- [ ] Replace raw-query fallbacks with typed Prisma queries where practical and show a clear migration/configuration error rather than silently changing behavior.
- [x] **Overview:** real sales, order, pending, shipped, product, low-stock, active-discount, and unread-message metrics.
- [ ] **Products:** create/edit/archive products, localized content, variants, inventory, images, validation, and safe media-host rules.
- [ ] **Inventory:** adjustments with reason, actor, variant, before/after values, and audit history.
- [x] **Discounts:** create/edit/activate codes and the 15% store promotion; configure limits, dates, scope, audit changes, and view recent redemptions.
- [ ] **Orders:** list/filter/search, inspect pricing/payment history, update fulfilment/shipping/tracking, and prevent invalid state transitions.
- [ ] **Pre-orders:** manage status, contact/notification timestamps, and conversion to an order without duplicates.
- [ ] **Messages:** mark read/in progress/replied/archived and keep reply/audit data.
- [ ] **Customers:** safe search and customer/order overview without exposing password hashes, tokens, or unnecessary personal data.
- [ ] **Settings:** store contact details, announcements, shipping settings, notification preferences, and thresholds in `StoreSettings`.
- [ ] Protect every operation with the database-backed admin helper, runtime validation, CSRF/origin protection, rate limits where relevant, and `AuditLog` entries.

**Acceptance:** a customer receives 403/redirect responses for every admin operation, while an authorized admin can complete each workflow and see the result after refresh.

## Phase 7 — global routes, navigation, footer, and timed promotion popup

- [x] Create one typed route registry used by desktop navigation, mobile navigation, and footer so links cannot drift.
- [x] Include the real public routes: home/collection, Our Story, FAQ, Vision, Size Guide, and Terms (`/terms`, rendered by `terms-experience`).
- [x] Include Login/Register or Account based on session state, and show Admin only to admins.
- [x] Do not advertise technical/private routes such as reset-password, dynamic order details, or individual product slugs as global navigation items.
- [x] Remove footer titles that have no route and replace all `href="#"` placeholders with real destinations or remove them.
- [x] Make the footer subscription form persist to the primary database with consent, validation, duplicate handling, localized feedback, honeypot/timing checks, and IP-hash abuse limits.
- [x] Change `PromotionReminder` so the “free shipping + hat” reminder automatically disappears seven seconds after it appears, resets for a genuinely new cart state, remains manually dismissible, does not steal focus, and announces itself politely.
- [ ] Verify the 15% message and free-shipping/free-hat message do not contradict the server's final pricing rules.

**Acceptance:** automated link checking finds no dead internal links, and the promotion popup disappears after seven seconds with keyboard and screen-reader-friendly behavior.

## Phase 8 — accessibility across the application

Accessibility is implemented during every phase, followed by this full pass.

- [ ] Target WCAG 2.2 AA for storefront, auth, account, cart/checkout, and admin routes in both LTR and RTL modes.
- [ ] Add a skip link, correct landmark/heading structure, meaningful page titles, language/direction metadata, and descriptive link text.
- [ ] Ensure all controls have programmatic names, visible focus, correct states, and at least practical touch target sizing.
- [ ] Make the mobile menu, cart drawer, dialogs, carousels, filters, and palette selector fully keyboard operable; manage focus on open/close and support Escape.
- [ ] Connect form labels, instructions, errors, and status messages with appropriate IDs and live regions; move focus to useful error summaries when needed.
- [ ] Review image alternatives, decorative images, icon-only buttons, video controls/captions, and external-link behavior.
- [ ] Fix contrast in all palettes and states, zoom/reflow at 200%/400%, RTL clipping, and reduced-motion behavior for marquee/carousel/transition animations.
- [ ] Add automated accessibility checks with axe (or equivalent) to representative routes and run a manual keyboard plus screen-reader smoke test.

**Acceptance:** no serious/critical automated accessibility violations, all essential journeys work with keyboard only, and remaining exceptions are documented.

## Phase 9 — security hardening and abuse resistance

- [ ] Patch supported Next.js/React/Auth.js/Prisma versions and run dependency audit checks in CI.
- [x] Add global security headers: Content Security Policy, `X-Content-Type-Options`, clickjacking protection, `Referrer-Policy`, COOP, and a minimal `Permissions-Policy`.
- [x] Keep auth cookies `HttpOnly`, `SameSite`, and production-`Secure`; keep secrets out of client bundles, logs, source control, and error responses.
- [ ] Add strict runtime validation and request-size limits to every route handler. Validate IDs, quantities, currency, URLs, and enums.
- [x] Add same-origin/CSRF protection to current cookie-authenticated state-changing route handlers.
- [ ] Add rate limiting and abuse controls for login attempts, registration, password reset, contact, waitlist/newsletter signup, coupon validation, checkout creation, and admin mutations.
- [x] Keep password-reset responses non-enumerating, expire and single-use tokens, limit outstanding tokens, and invalidate sessions when credentials change.
- [x] Enforce ownership in current customer queries and fresh database-role authorization in every current admin query/mutation.
- [x] Verify Stripe signatures and event idempotency; never accept payment state, totals, inventory, or fulfilment commands from the browser.
- [ ] Add safe error logging with request IDs and redaction, plus alerts for payment/admin failures and suspicious repeated requests.
- [ ] Review the one inline `dangerouslySetInnerHTML` bootstrap, URL/media allowlists, outbound requests, email HTML generation, redirects, and third-party scripts against the final CSP.
- [ ] Back up the primary database, test restoration, and document data retention/deletion procedures for customer personal data.

**Acceptance:** security tests cover unauthenticated/unauthorized access, cross-user access, CSRF/origin rejection, rate limits, malicious inputs, invalid Stripe signatures, replayed webhooks, and price tampering.

## Phase 10 — final QA, migration rehearsal, and release

- [ ] Run schema migration on a staging copy of production data and record duration, locks, failures, and rollback results.
- [ ] Test core journeys on both sites: browse, locale/currency, account creation, Google login, cart merge, discount, Stripe test checkout, account order, admin fulfilment, and email notifications.
- [ ] Test Hebrew/English, mobile/tablet/desktop, Chrome/Safari/Firefox/Edge, keyboard, reduced motion, and slow/error states.
- [ ] Run type-check, lint, unit, integration, end-to-end, accessibility, security, and production-build checks.
- [ ] Verify analytics/cookies and marketing consent behavior, privacy/terms content, contact details, and payment-method claims shown in the footer.
- [ ] Execute the final database delta import and environment cutover in a scheduled window with monitoring and a rollback owner.
- [ ] After the agreed observation window, revoke legacy database write credentials and document the new single-database architecture.

## Suggested Codex delivery slices

Keep each slice independently reviewable and deployable:

1. Baseline/build repair plus route/database inventory.
2. Primary schema and idempotent legacy import with dry-run report.
3. Auth identity linking, database-backed admin authorization, and ownership tests.
4. Server cart quote, 15% promotion, coupon schema/UI, and pricing tests.
5. Stripe test checkout, webhook processing, and order lifecycle tests.
6. Customer account completion.
7. Admin management completion.
8. Navigation/footer/subscription/popup cleanup.
9. Accessibility remediation and automated checks.
10. Security hardening, full QA, cutover rehearsal, and release.

Each slice should end with: migration notes (if any), tests run, screenshots or route checks for UI changes, security/accessibility notes, and an explicit rollback description.

