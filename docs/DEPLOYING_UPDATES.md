# Deploying a new version

This runbook updates the single-server production installation at
`/var/www/eyebreed/app`. Run the commands as the sudo-capable `ubuntu` user;
repository commands explicitly run as the unprivileged `eyebreed` account.

## Before deployment

Confirm the service is healthy and the checkout is on the intended branch:

```bash
sudo systemctl status eyebreed --no-pager
sudo -u eyebreed git -C /var/www/eyebreed/app status --short
sudo -u eyebreed git -C /var/www/eyebreed/app branch --show-current
```

The working tree should be empty. Do not overwrite unexpected server-side
changes; move them into Git or investigate them first. The current production
branch is `newUpdates` until it is merged into the repository's default branch.

Review incoming commits:

```bash
sudo -u eyebreed git -C /var/www/eyebreed/app fetch origin
sudo -u eyebreed git -C /var/www/eyebreed/app log --oneline HEAD..origin/newUpdates
```

If a release includes database migrations, take a database-provider snapshot
before deployment. Prisma production migrations are forward operations and are
not automatically rolled back with application code.

## Deploy

Pull only a fast-forward update, install the exact locked dependencies, run the
configuration checks, and build before restarting the live service:

```bash
sudo -u eyebreed git -C /var/www/eyebreed/app pull --ff-only origin newUpdates
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npm ci'
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npm run check:deploy'
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npm run build'
```

Warnings for disabled optional integrations such as Stripe or Instagram are
acceptable. A failed build is not: leave the current service running and fix
the error before continuing.

Apply committed migrations and restart:

```bash
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npx prisma migrate deploy'
sudo systemctl restart eyebreed
sleep 5
```

## Verify

```bash
sudo systemctl status eyebreed --no-pager
curl --fail --head http://127.0.0.1:3000
curl --fail --head https://shop.eyebreedofficial.com
sudo journalctl -u eyebreed -n 100 --no-pager
```

Also verify sign-in, a product page, and the admin area in a browser. When
Stripe is enabled, perform one test-mode checkout and confirm webhook delivery.

## Configuration-only changes

Edit secrets with `sudoedit`; never commit or paste `.env`:

```bash
sudoedit /var/www/eyebreed/app/.env
sudo chown eyebreed:eyebreed /var/www/eyebreed/app/.env
sudo chmod 600 /var/www/eyebreed/app/.env
```

Values prefixed with `NEXT_PUBLIC_` are embedded during the build, so rebuild
and restart after changing them. Server-only values normally require only a
restart, but rebuilding is the safest consistent procedure.

## Failure and rollback guidance

- If `npm ci`, readiness checks, or the build fails, do not restart the service.
- If the restarted service fails, inspect `journalctl` immediately.
- Application code can be rebuilt from a previously known-good Git commit.
- Do not reverse or reset production migrations without a reviewed recovery
  plan and a verified database snapshot.
- Keep port 3000 private; Nginx remains the only public application entrypoint.
