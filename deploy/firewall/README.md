# Production firewall rules

The public network path is:

`Internet -> OCI security list/NSG -> Ubuntu firewall -> Nginx -> Next.js`

Only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) should be public. Next.js binds
to `127.0.0.1:3000` and must not be exposed by OCI, UFW, or iptables.

## OCI rules

On the security list for the instance's actual subnet, and on any Network
Security Group attached to the VNIC, add stateful TCP ingress rules:

| Source | Destination port | Purpose |
|---|---:|---|
| `0.0.0.0/0` | 80 | HTTP and ACME validation |
| `0.0.0.0/0` | 443 | HTTPS |

Keep the existing SSH rule for TCP port 22. Add equivalent `::/0` rules only
when the instance and DNS are intentionally configured for IPv6.

## Ubuntu rules

Install persistence support, then run the repository's idempotent rule script:

```bash
sudo apt update
sudo apt install -y iptables-persistent
sudo bash /var/www/eyebreed/app/deploy/firewall/configure-firewall.sh
```

The script allows SSH through UFW, enables the `Nginx Full` profile, and adds
ports 80/443 before an early OCI-image `REJECT` rule when one exists. It does
not flush or replace the firewall, and running it again does not duplicate its
iptables rules.

Verify the result:

```bash
sudo ufw status verbose
sudo ss -ltnp '( sport = :80 or sport = :443 )'
sudo iptables -L INPUT -n -v --line-numbers
```

The port 80 and 443 `ACCEPT` rules must appear before any blanket `REJECT`.
Test HTTP from a different network, such as a phone on mobile data, before
requesting a certificate.
