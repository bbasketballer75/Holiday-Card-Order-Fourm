#!/usr/bin/env bash
set -euo pipefail

# Presents an installation URL for the Pieces GitHub App and optionally opens it in the default browser.
# Usage: bash ./scripts/install-pieces-app.sh [--open]

OWNER=${OWNER:-bbasketballer75}
REPO=${REPO:-Holiday-Card-Order-Fourm}
OWNER_ID=${OWNER_ID:-$(gh api repos/$OWNER/$REPO --jq '.owner.id')}
APP_SLUG=pieces

INSTALL_URL="https://github.com/apps/${APP_SLUG}/installations/new/permissions?target_id=${OWNER_ID}"

echo "Pieces GitHub App installation URL:"
echo "$INSTALL_URL"

if [ "${1:-}" = "--open" ]; then
  if command -v gh >/dev/null 2>&1; then
    gh browse "$INSTALL_URL" || true
  else
    if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* || "$(uname -s)" == CYGWIN* ]]; then
      start "" "$INSTALL_URL"
    else
      xdg-open "$INSTALL_URL" || true
    fi
  fi
fi

echo "If install fails, you may need to follow the GitHub App UI to configure permissions for this repository." 
