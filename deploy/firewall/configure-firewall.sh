#!/usr/bin/env bash
set -Eeuo pipefail

if (( EUID != 0 )); then
  echo "Run this script with sudo: sudo bash deploy/firewall/configure-firewall.sh" >&2
  exit 1
fi

if ! command -v iptables >/dev/null 2>&1; then
  echo "iptables is required but was not found." >&2
  exit 1
fi

# Keep SSH open before touching web rules. This does not enable UFW when it is
# currently disabled; enabling a host firewall remains an explicit admin step.
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp
  ufw allow "Nginx Full"
fi

ensure_web_rule() {
  local port="$1"

  if iptables -C INPUT -p tcp --dport "$port" -m conntrack --ctstate NEW -j ACCEPT 2>/dev/null; then
    echo "IPv4 TCP port ${port} is already allowed."
    return
  fi

  # Some OCI Ubuntu images contain a blanket REJECT before UFW's INPUT jumps.
  # Insert immediately before the first REJECT so public traffic can reach
  # Nginx without weakening SSH or replacing the rest of the firewall policy.
  local reject_line
  reject_line="$(iptables -L INPUT -n --line-numbers | awk '$2 == "REJECT" { print $1; exit }')"

  if [[ -n "$reject_line" ]]; then
    iptables -I INPUT "$reject_line" -p tcp --dport "$port" -m conntrack --ctstate NEW -j ACCEPT
  else
    iptables -A INPUT -p tcp --dport "$port" -m conntrack --ctstate NEW -j ACCEPT
  fi

  echo "Allowed IPv4 TCP port ${port}."
}

ensure_web_rule 80
ensure_web_rule 443

if command -v netfilter-persistent >/dev/null 2>&1; then
  netfilter-persistent save
  echo "Saved firewall rules with netfilter-persistent."
else
  cat >&2 <<'EOF'
The live rules are installed, but netfilter-persistent is not available.
Install and save them with:
  sudo apt install -y iptables-persistent
  sudo netfilter-persistent save
EOF
fi

iptables -L INPUT -n -v --line-numbers
