# VPS deployment with Nginx

This guide deploys the storefront as a long-running Next.js process behind
Nginx. It assumes Ubuntu 24.04, the production hostname
`shop.eyebreedofficial.com`, and a PostgreSQL database hosted separately.

## 1. Point the hostname at the VPS

Create an `A` record for `shop.eyebreedofficial.com` pointing to the VPS IPv4
address. Add an `AAAA` record only if IPv6 is configured on the VPS. Wait until:

```bash
dig +short shop.eyebreedofficial.com
```

returns the server address.

In the VPS provider firewall, allow inbound TCP 22, 80, and 443. Do not expose
port 3000. On Oracle Cloud, add ports 80 and 443 to both the security list for
the instance's actual subnet and any Network Security Group attached to its
VNIC.

## 2. Install the server prerequisites

SSH into the server as a sudo-capable user. Install Git, Nginx, and snapd:

```bash
sudo apt update
sudo apt install -y git nginx snapd
```

Install Node.js 22 from the official signed-release download. The commands below
select the correct archive for either an x86-64 or ARM64 VPS. The application is
tested with this LTS line, which remains supported through April 2027:

```bash
cd /tmp
case "$(uname -m)" in
  x86_64) NODE_ARCH=x64 ;;
  aarch64|arm64) NODE_ARCH=arm64 ;;
  *) echo "Unsupported CPU architecture: $(uname -m)"; exit 1 ;;
esac
NODE_VERSION=v22.23.4
NODE_ARCHIVE="node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
curl -fsSLO "https://nodejs.org/dist/${NODE_VERSION}/${NODE_ARCHIVE}"
curl -fsSLO "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt"
grep " ${NODE_ARCHIVE}$" SHASUMS256.txt | sha256sum -c -
sudo tar -xJf "${NODE_ARCHIVE}" -C /usr/local --strip-components=1
```

Then clear Bash's command cache and verify the installation:

```bash
hash -r
node --version
npm --version
```

Create a dedicated unprivileged account for the application:

```bash
sudo adduser --system --group --home /var/www/eyebreed eyebreed
```

## 3. Configure the host firewall

The repository includes an idempotent firewall script for OCI Ubuntu images,
including images that place a blanket `REJECT` before UFW's INPUT chains:

```bash
sudo apt install -y iptables-persistent
```

Run the script after cloning in the next section. It preserves existing rules,
allows SSH and Nginx, inserts ports 80/443 before an early blanket rejection,
and saves the result. See [`deploy/firewall/README.md`](../deploy/firewall/README.md)
for the network model and verification commands.

## 4. Clone and configure the app

The current production work is on `newUpdates` until that branch is merged into
the default branch. For a private repository, configure a read-only deploy key
instead of putting a personal password or token in the URL.

```bash
sudo -u eyebreed git clone --branch newUpdates https://github.com/mikib2804/eyebreed_ofificial_webApp.git /var/www/eyebreed/app
sudo bash /var/www/eyebreed/app/deploy/firewall/configure-firewall.sh
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npm ci'
sudo -u eyebreed cp /var/www/eyebreed/app/.env.production.example /var/www/eyebreed/app/.env
sudo chmod 600 /var/www/eyebreed/app/.env
sudo chown eyebreed:eyebreed /var/www/eyebreed/app/.env
sudoedit /var/www/eyebreed/app/.env
```

Fill every required value in `.env`. In particular, keep these origins exact:

```dotenv
AUTH_TRUST_HOST=true
AUTH_URL=https://shop.eyebreedofficial.com
NEXT_PUBLIC_APP_URL=https://shop.eyebreedofficial.com
```

Generate `AUTH_SECRET` on the server with:

```bash
openssl rand -base64 48
```

Never commit `.env` or paste its contents into an issue or chat.

If Stripe is not configured yet, leave its three key values empty and keep
checkout disabled:

```dotenv
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CHECKOUT_ENABLED=false
```

The Stripe SDK remains an application dependency and is installed by `npm ci`,
but it does not contact Stripe while checkout is disabled.

## 5. Validate, migrate, and build

Run the repository's production checks, apply only committed Prisma migrations,
and create the optimized Next.js build:

```bash
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npm run check:deploy'
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npx prisma migrate deploy'
sudo -u eyebreed -H bash -c 'cd /var/www/eyebreed/app && npm run build'
```

Do not use `prisma migrate dev` or `prisma db push` against production.

## 6. Install and start the systemd service

```bash
sudo cp /var/www/eyebreed/app/deploy/systemd/eyebreed.service /etc/systemd/system/eyebreed.service
sudo systemctl daemon-reload
sudo systemctl enable --now eyebreed
sudo systemctl status eyebreed --no-pager
curl --fail --head http://127.0.0.1:3000
```

The service includes a `.next/BUILD_ID` condition, so systemd will not enter a
restart loop when an optimized production build is missing.

If startup fails, inspect the application log:

```bash
sudo journalctl -u eyebreed -n 100 --no-pager
```

## 7. Enable Nginx

```bash
sudo cp /var/www/eyebreed/app/deploy/nginx/eyebreed.conf /etc/nginx/sites-available/eyebreed
sudo ln -sf /etc/nginx/sites-available/eyebreed /etc/nginx/sites-enabled/eyebreed
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
curl --fail --head http://shop.eyebreedofficial.com
```

Before requesting a certificate, verify that ports 80 and 443 appear before any
blanket `REJECT` in the host firewall and that HTTP works from another network:

```bash
sudo iptables -L INPUT -n -v --line-numbers
```

## 8. Add HTTPS with Certbot

Certbot recommends its snap package for most Linux installations:

```bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/local/bin/certbot
sudo certbot --nginx -d shop.eyebreedofficial.com
sudo certbot renew --dry-run
```

After Certbot finishes, confirm that HTTP redirects to HTTPS and the app loads:

```bash
curl --head http://shop.eyebreedofficial.com
curl --fail --head https://shop.eyebreedofficial.com
```

## 9. Configure external callbacks

In Google Cloud Console, add:

- Authorized origin: `https://shop.eyebreedofficial.com`
- Redirect URI: `https://shop.eyebreedofficial.com/api/auth/callback/google`

In Stripe, create a webhook endpoint at:

`https://shop.eyebreedofficial.com/api/stripe/webhook`

Put its signing secret in `STRIPE_WEBHOOK_SECRET`. Keep
`STRIPE_CHECKOUT_ENABLED=false` until Google sign-in, the webhook, and a full
Stripe test payment have all been verified.

## 10. Deploy an update

Follow [`docs/DEPLOYING_UPDATES.md`](DEPLOYING_UPDATES.md) for the preflight,
fast-forward pull, dependency install, build, migration, restart, and production
verification sequence.

## Rollback note

Application code can be rolled back to a known Git commit and rebuilt. Database
migrations are not automatically reversible, so take a provider snapshot before
high-risk schema changes and design production migrations to remain compatible
with the previous app release during rollout.
