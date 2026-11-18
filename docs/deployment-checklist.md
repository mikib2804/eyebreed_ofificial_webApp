# EYEBREED deployment checklist

Run `npm run check:deploy` after setting the hosting environment. It reports only status and never prints secret values.

## Required before enabling checkout

1. Rotate the database and Gmail credentials that were shared in chat. Update the primary deployment with the rotated database URLs and a newly generated Gmail App Password.
2. Fill every required variable in `.env.production.example` in the hosting provider. Do not commit `.env` or usable keys.
3. Set `AUTH_TRUST_HOST=true` in the trusted HTTPS deployment environment. In Google Cloud, add the exact callback URL: `https://shop.eyebreedofficial.com/api/auth/callback/google`.
4. In Stripe test mode, create a webhook for `https://shop.eyebreedofficial.com/api/stripe/webhook` and subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.expired`.
5. Configure a fresh Gmail App Password through `SMTP_USER`/`SMTP_PASSWORD` (or the Gmail fallback variables), set `EMAIL_FROM`, `EMAIL_REPLY_TO`, and `ADMIN_NOTIFICATION_EMAIL`, then run `npm run smtp:verify` on the VPS. Never use the normal Gmail account password.
6. Leave `STRIPE_CHECKOUT_ENABLED=false` until a test deployment receives a signed webhook and a full test purchase is visible in the customer's account and admin area.
7. Run `npx prisma migrate deploy`, `npm run check`, `npm run test:auth`, `npm run check:deploy`, and `npm run build` using the deployment environment.

## External items that cannot be completed from this repository

- Point the second EYEBREED website/deployment at the same rotated primary database and verify a write/read smoke test there.
- Verify Google consent with the production OAuth client and an actual Google account.
- Configure Stripe Dashboard keys/webhook signing secret and perform test-card scenarios.
- Configure hosting alerts, logs, backups, DNS, HTTPS, and a rollback owner.
- Run Safari and iOS checks on Apple hardware and a short screen-reader check (VoiceOver or NVDA).

## Cutover order

Back up both databases, freeze legacy writes, run the idempotent raw import and normalization, compare the privacy-safe reconciliation hash/counts, deploy both sites with the primary URLs, run smoke tests, then revoke the legacy write credential only after the observation window.
