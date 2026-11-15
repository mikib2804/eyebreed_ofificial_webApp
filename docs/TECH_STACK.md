# Technology stack

## Application

| Layer | Technology | Role |
|---|---|---|
| Web framework | Next.js 15 App Router | Server rendering, routing, API route handlers, middleware, image optimization |
| UI runtime | React 19 | Server and client components |
| Language | TypeScript | Application and tooling type safety |
| Styling | Tailwind CSS 3 | Responsive UI styling and RTL-aware layouts |
| Motion/icons | Framer Motion, Lucide React, React Icons | Animation and iconography |
| Validation | Zod | Request and form validation |
| Authentication | Auth.js / NextAuth 5 beta | Google OAuth, database sessions, protected account/admin routes |
| Passwords | bcryptjs | Password hashing for credential-based account flows |

## Data and integrations

| Area | Technology | Role |
|---|---|---|
| Database | PostgreSQL / Prisma Postgres | Production relational data store |
| ORM and migrations | Prisma 6 | Typed queries and committed production migrations |
| Payments | Stripe SDK | Optional test-mode checkout and signed webhooks; disabled with `STRIPE_CHECKOUT_ENABLED=false` |
| Email | Gmail SMTP via Nodemailer | Optional transactional email delivery using a Google App Password |
| Social media | Instagram Graph API | Optional reel/media integration |

## Production infrastructure

| Component | Technology | Role |
|---|---|---|
| Compute | Oracle Cloud Ubuntu VPS | Application host |
| Container runtime | Docker Engine and Compose | Reproducible ARM64/AMD64 image, health monitoring, restarts, and release operations |
| Application runtime | Node.js 20, Debian Bookworm slim | Runs the standalone Next.js production server as a non-root user |
| Alternative runtime | Node.js 22 LTS with systemd | Supported direct-host deployment path documented separately |
| Reverse proxy | Nginx | Public HTTP/HTTPS endpoint and proxy to `127.0.0.1:3000` |
| TLS | Let's Encrypt with Certbot | Certificate issuance and automatic renewal |
| Network security | OCI security list/NSG, UFW, iptables | Allows public 80/443 and SSH 22 while keeping port 3000 private |
| Source/dependencies | Git, GitHub, npm lockfile | Versioned releases and reproducible dependency installation |

Production request flow:

```text
Browser
  -> OCI public IP and security rules
  -> Ubuntu UFW/iptables
  -> Nginx :80/:443
  -> Docker loopback mapping 127.0.0.1:3000
  -> standalone Next.js container :3000
  -> Prisma
  -> PostgreSQL
```

## Quality checks

- `npm run typecheck`: TypeScript validation.
- `npm test`: request security, pricing, catalog, and admin validation tests.
- `npm run check`: typecheck plus automated tests.
- `npm run check:deploy`: production environment and secret-shape checks.
- `npm run build`: Prisma client generation and optimized Next.js build.
