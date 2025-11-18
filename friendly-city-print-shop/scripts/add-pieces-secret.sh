#!/usr/bin/env bash
set -euo pipefail

# Usage: PIECES_API_TOKEN=<token> bash ./scripts/add-pieces-secret.sh
# This script adds `PIECES_API_TOKEN` and optional `PIECES_API_URL` secrets to the repository

if [ -z "${PIECES_API_TOKEN:-}" ]; then
  echo "PIECES_API_TOKEN is not set as environment variable. Use: PIECES_API_TOKEN=<token> $0"
  exit 1
fi

REPO=${REPO:-bbasketballer75/Holiday-Card-Order-Fourm}

echo "Adding PIECES_API_TOKEN secret to repo: $REPO"
echo -n "$PIECES_API_TOKEN" | gh secret set PIECES_API_TOKEN --repo "$REPO"

if [ -n "${PIECES_API_URL:-}" ]; then
  echo "Adding PIECES_API_URL secret to repo: $REPO"
  echo -n "$PIECES_API_URL" | gh secret set PIECES_API_URL --repo "$REPO"
fi

echo "Secrets added (or updated). Verify via 'gh secret list --repo $REPO'."
