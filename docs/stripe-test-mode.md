# Stripe test-mode setup

The application refuses live Stripe secret keys. `lib/stripe.ts` accepts only keys beginning with `sk_test_`, and checkout remains disabled unless `STRIPE_CHECKOUT_ENABLED=true`.

## Local/test configuration

1. Copy the Stripe entries from `.env.example` into the uncommitted `.env` file.
2. Set `STRIPE_SECRET_KEY` to a test secret key and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to its matching test publishable key.
3. Forward Stripe test webhooks to `/api/stripe/webhook` and place the resulting test signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Set `NEXT_PUBLIC_APP_URL` to the exact application origin.
5. Set `STRIPE_CHECKOUT_ENABLED=true` only after the primary database migration and product import are complete.

The webhook must receive at least:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

## Production switch later

Do not change source code for live mode. During a separate production review:

1. Verify products, currencies, shipping, tax, refund, privacy, and fulfilment behavior.
2. Register the production webhook endpoint in Stripe Dashboard and configure only the required events.
3. Replace test environment variables in the hosting provider with live values and rotate any obsolete test secrets.
4. Update the server-side key policy in `lib/stripe.ts` as an explicit reviewed change.
5. Run a low-value live transaction and confirm one order, one inventory decrement, one redemption, and one payment record.

Never commit Stripe secret or webhook keys, and never expose them with a `NEXT_PUBLIC_` prefix.
