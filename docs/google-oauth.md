# Google OAuth setup and linking policy

Configure one Google OAuth web client with an authorized callback for every application origin:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production site 1: `https://<domain-1>/api/auth/callback/google`
- Production site 2: `https://<domain-2>/api/auth/callback/google`

Set the client values as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in each deployment. Never expose the secret through a `NEXT_PUBLIC_` variable.

## Identity-linking rule

When Google returns a verified email that exactly matches an existing normalized customer email, Auth.js may attach the Google account to that user. Unverified Google emails are rejected. This allows a credentials customer to add Google sign-in without creating a duplicate record while preventing arbitrary unverified-email linking.

Email addresses are normalized to lowercase during credentials registration and Google profile processing. Direct email replacement in the profile form remains disabled until a separate verified email-change flow is implemented.

Before production launch, test:

1. New Google customer creation.
2. Existing password customer with the same verified Google email.
3. Repeat Google sign-in after linking.
4. A different Google email creating a separate customer.
5. Logout, callback URL handling, session expiry, and revoked Google consent.
