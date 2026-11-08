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
port 3000.

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

## 3. Clone and configure the app

Replace `YOUR_REPOSITORY_URL` with the Git URL. For a private repository, use a
read-only deploy key instead of a personal password or token in the URL.

```bash
sudo -u eyebreed git clone YOUR_REPOSITORY_URL /var/www/eyebreed/app
cd /var/www/eyebreed/app
sudo -u eyebreed npm ci
sudo -u eyebreed cp .env.production.example .env
sudo chmod 600 .env
sudo chown eyebreed:eyebreed .env
sudoedit .env
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

## 4. Validate, migrate, and build

Run the repository's production checks, apply only committed Prisma migrations,
and create the optimized Next.js build:

```bash
cd /var/www/eyebreed/app
sudo -u eyebreed npm run check:deploy
sudo -u eyebreed npx prisma migrate deploy
sudo -u eyebreed npm run build
```

Do not use `prisma migrate dev` or `prisma db push` against production.

## 5. Install and start the systemd service

```bash
sudo cp deploy/systemd/eyebreed.service /etc/systemd/system/eyebreed.service
sudo systemctl daemon-reload
sudo systemctl enable --now eyebreed
sudo systemctl status eyebreed --no-pager
curl --fail --head http://127.0.0.1:3000
```

If startup fails, inspect the application log:

```bash
sudo journalctl -u eyebreed -n 100 --no-pager
```

## 6. Enable Nginx

```bash
sudo cp deploy/nginx/eyebreed.conf /etc/nginx/sites-available/eyebreed
sudo ln -s /etc/nginx/sites-available/eyebreed /etc/nginx/sites-enabled/eyebreed
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
curl --fail --head http://shop.eyebreedofficial.com
```

## 7. Add HTTPS with Certbot

Certbot recommends its snap package for most Linux installations:

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
sudo certbot --nginx -d shop.eyebreedofficial.com
sudo certbot renew --dry-run
```

After Certbot finishes, confirm that HTTP redirects to HTTPS and the app loads:

```bash
curl --head http://shop.eyebreedofficial.com
curl --fail --head https://shop.eyebreedofficial.com
```

## 8. Configure external callbacks

In Google Cloud Console, add:

- Authorized origin: `https://shop.eyebreedofficial.com`
- Redirect URI: `https://shop.eyebreedofficial.com/api/auth/callback/google`

In Stripe, create a webhook endpoint at:

`https://shop.eyebreedofficial.com/api/stripe/webhook`

Put its signing secret in `STRIPE_WEBHOOK_SECRET`. Keep
`STRIPE_CHECKOUT_ENABLED=false` until Google sign-in, the webhook, and a full
Stripe test payment have all been verified.

## 9. Deploy an update

Review upstream changes before running this sequence. It updates dependencies,
validates configuration, builds, applies committed migrations, and restarts the
service:

```bash
cd /var/www/eyebreed/app
sudo -u eyebreed git pull --ff-only
sudo -u eyebreed npm ci
sudo -u eyebreed npm run check:deploy
sudo -u eyebreed npm run build
sudo -u eyebreed npx prisma migrate deploy
sudo systemctl restart eyebreed
sudo systemctl status eyebreed --no-pager
```

Check the public endpoint and recent logs after every deployment:

```bash
curl --fail --head https://shop.eyebreedofficial.com
sudo journalctl -u eyebreed -n 100 --no-pager
```

## Rollback note

Application code can be rolled back to a known Git commit and rebuilt. Database
migrations are not automatically reversible, so take a provider snapshot before
high-risk schema changes and design production migrations to remain compatible
with the previous app release during rollout.
