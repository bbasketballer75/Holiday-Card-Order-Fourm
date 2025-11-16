#!/usr/bin/env bash
set -euo pipefail

echo "Checking developer tools on Unix-like OS..."
command -v gh >/dev/null 2>&1 || {
  echo "gh CLI not found; please install via your package manager or follow https://cli.github.com/"
}

command -v supabase >/dev/null 2>&1 || {
  echo "supabase CLI not found; installing via npm (if available)..."
  if command -v npm >/dev/null 2>&1; then
    npm install -g supabase || echo "Failed to install supabase CLI via npm; please install manually"
  else
    echo "npm not available; please install Node.js and npm first"
  fi
}

if [[ "${1:-}" == "--with-playwright" ]]; then
  echo "Installing Playwright browsers..."
  if command -v npx >/dev/null 2>&1; then
    npx playwright install --with-deps || echo "Playwright install failed"
  else
    echo "npx not available; please install Node and run npm ci in project root"
  fi
fi

echo "Dev tooling check complete"
