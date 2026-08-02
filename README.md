# VERO — luxury commerce starter

A modern Next.js App Router storefront with TypeScript, Tailwind CSS, Auth.js (NextAuth), Prisma/PostgreSQL, an EN/HE RTL switcher, three currencies, a working local cart drawer, and a protected admin product form.

## 1. Create the database

Create a free PostgreSQL project on [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy `.env.example` to `.env.local`, then set:

```env
DATABASE_URL="your pooled PostgreSQL connection"
DIRECT_URL="your direct PostgreSQL connection"
AUTH_SECRET="a long random secret"
AUTH_GOOGLE_ID="Google OAuth client ID"
AUTH_GOOGLE_SECRET="Google OAuth client secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate an Auth.js secret with `npx auth secret`.

## 2. Configure Google login

In Google Cloud Console:

1. Create/select a project and configure the OAuth consent screen.
2. Create an OAuth 2.0 Web Application credential.
3. Add `http://localhost:3000` as an authorized JavaScript origin.
4. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
5. Put the client ID and secret in `.env.local`.

For production, add the deployed domain and its `/api/auth/callback/google` URI.

## 3. Install and migrate

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## 4. Grant an administrator role

After signing in once with Google, open Prisma Studio:

```bash
npx prisma studio
```

Find your `User` row and change `role` from `CUSTOMER` to `ADMIN`. Sign out/in, then visit `/admin`.

## Architecture notes

- `prisma/schema.prisma`: Auth.js models plus User, Category, Product, and CartItem.
- `auth.ts`: Google provider, Prisma adapter, database session, and role propagation.
- `middleware.ts`: requires authentication under `/admin`; the admin page and API enforce `ADMIN`.
- `components/store-provider.tsx`: client-side locale, currency, and cart state.
- `app/api/admin/products/route.ts`: authenticated and validated product creation.

The homepage catalog uses a typed local fallback so the visual storefront works before database setup. After migration, replace `lib/catalog.ts` with a server query or a products API. Persisting guest carts can be added with a signed cookie; authenticated carts map directly to `CartItem`.

## Production checklist

- Restrict Google OAuth to approved domains.
- Put secrets only in the deployment environment, never in git.
- Configure an object store (Supabase Storage or Cloudinary) for uploads instead of accepting arbitrary media URLs.
- Add Stripe Checkout and create orders from verified webhook events before taking payments.
- Add rate limiting, audit logging, product update/delete API routes, and input sanitization before opening admin access broadly.
