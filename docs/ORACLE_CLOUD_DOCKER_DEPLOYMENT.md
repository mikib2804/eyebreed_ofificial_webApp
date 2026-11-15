# Oracle Cloud deployment with Docker

This guide deploys the storefront to an Oracle Cloud Ubuntu Compute instance.
Docker runs the application on `127.0.0.1:3000`; the existing host Nginx
configuration remains the only public entry point on ports 80 and 443.

The image supports both AMD64 and Oracle Ampere ARM64 instances when it is
built on the target instance.

## What the project provides

- `Dockerfile`: a multi-stage, non-root Next.js production image.
- `compose.yaml`: the app service and a separate one-off migration service.
- `.dockerignore`: prevents local secrets and development artifacts from
  entering the build context.
- `/api/health`: the Docker and operator health endpoint.
- `deploy/nginx/eyebreed.conf`: the host Nginx reverse proxy.

Database migrations do not run automatically when the app starts. Run them as
an explicit release step so a restart cannot unexpectedly change the schema.

## 1. Oracle networking

In the instance's Network Security Group (preferred) or subnet security list,
allow these stateful TCP ingress rules:

| Source | Destination port | Purpose |
|---|---:|---|
| Your administrator IP, if possible | 22 | SSH |
| `0.0.0.0/0` | 80 | HTTP and certificate validation |
| `0.0.0.0/0` | 443 | HTTPS |

Do not open port 3000 in OCI. Compose binds it only to the VM loopback address.
OCI networking and the Ubuntu firewall must both allow the request. The
project's existing firewall instructions are in `deploy/firewall/README.md`.

## 2. Install Docker Engine and Compose

Use Docker's official Ubuntu repository:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo \"${UBUNTU_CODENAME:-$VERSION_CODENAME}\")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc" | sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
```

Docker publishes mapped ports through its own iptables chains. Keep the Compose
mapping on `127.0.0.1`; do not change it to `0.0.0.0` unless you intentionally
want to bypass Nginx.

## 3. Configure the application

Clone or update the repository, then create the production environment file:

```bash
cd /var/www/eyebreed/app
cp .env.production.example .env.production
nano .env.production
chmod 600 .env.production
```

At minimum, replace the database, Auth.js, public URL, Google OAuth, and any
enabled Stripe values. Production URLs must use the real HTTPS origin:

```dotenv
AUTH_URL=https://shop.eyebreedofficial.com
NEXT_PUBLIC_APP_URL=https://shop.eyebreedofficial.com
AUTH_TRUST_HOST=true
```

Never add `.env.production` to Git or copy it into the image. Compose injects it
only when a container starts.

If the previous non-Docker systemd service is still running on port 3000, stop
it before starting the container:

```bash
sudo systemctl disable --now eyebreed
```

Nginx can remain running.

## 4. First deployment

Build both release targets, run migrations, then start the app:

```bash
cd /var/www/eyebreed/app
export IMAGE_TAG=$(git rev-parse --short HEAD)
sudo --preserve-env=IMAGE_TAG docker compose build app migrate
sudo --preserve-env=IMAGE_TAG docker compose run --rm migrate
sudo --preserve-env=IMAGE_TAG docker compose up -d app
```

The build does not receive `.env.production` or its secrets. Only
`MEDIA_ALLOWED_HOSTS` is accepted as a non-secret build argument. If you add
media hosts beyond the default, build with:

```bash
MEDIA_ALLOWED_HOSTS=cdn.example.com sudo --preserve-env=IMAGE_TAG,MEDIA_ALLOWED_HOSTS docker compose build app
```

## 5. Verify the container

```bash
sudo --preserve-env=IMAGE_TAG docker compose ps
sudo --preserve-env=IMAGE_TAG docker compose logs --tail=100 app
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
curl --fail --head -H 'Host: shop.eyebreedofficial.com' http://127.0.0.1
```

The health response should contain `"status":"ok"`, and the Nginx request
should return an HTTP success response.

Install or retain the host Nginx configuration and HTTPS certificate using
`docs/VPS_NGINX_DEPLOYMENT.md`. Its upstream is already
`http://127.0.0.1:3000`, so no proxy change is required.

## 6. Deploy a new version

```bash
cd /var/www/eyebreed/app
git pull --ff-only
export IMAGE_TAG=$(git rev-parse --short HEAD)
sudo --preserve-env=IMAGE_TAG docker compose build app migrate
sudo --preserve-env=IMAGE_TAG docker compose run --rm migrate
sudo --preserve-env=IMAGE_TAG docker compose up -d --no-deps app
sudo --preserve-env=IMAGE_TAG docker compose ps
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
```

Compose recreates only the app container. Nginx and the public TLS listener
continue running during the release.

## 7. Roll back the application image

List the locally retained release images:

```bash
sudo docker image ls eyebreed-web
```

Select the previous Git-based tag and recreate the app without rebuilding:

```bash
export IMAGE_TAG=PREVIOUS_TAG
sudo --preserve-env=IMAGE_TAG docker compose up -d --no-build --no-deps app
```

Application rollback does not reverse a database migration. Review migrations
before deploying schema changes and restore the database from a backup if a
schema rollback is required.

## Useful operations

```bash
# Follow application output
sudo --preserve-env=IMAGE_TAG docker compose logs -f app

# Restart the app container
sudo --preserve-env=IMAGE_TAG docker compose restart app

# Show the Docker health result
sudo docker inspect --format '{{json .State.Health}}' eyebreed-app-1

# Stop the app without deleting its image
sudo --preserve-env=IMAGE_TAG docker compose down
```

The database is managed externally through `DATABASE_URL` and `DIRECT_URL`, so
this Compose project intentionally does not create or store a PostgreSQL volume.

## References

- Docker Engine on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Docker Compose plugin: https://docs.docker.com/compose/install/linux/
- OCI security rules: https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securityrules.htm
