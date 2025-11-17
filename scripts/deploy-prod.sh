#!/usr/bin/env bash
set -euo pipefail

echo "Starting production deploy helper script"

if [ -z "${RAILWAY_API_KEY:-}" ]; then
  echo "RAILWAY_API_KEY not set; skipping deploy"
  exit 0
fi

# Optionally pass RAILWAY_PROJECT and RAILWAY_ENV
PROJECT=${RAILWAY_PROJECT:-}
ENV=${RAILWAY_ENV:-production}

echo "Using project: ${PROJECT:-(default)} and environment: $ENV"

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI not found; attempting to install via npm (global)"
  npm install -g @railway/cli || true
fi

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI still not available; try 'npm i -g @railway/cli' or install manually"
  exit 1
fi

echo "Logging into Railway using provided API key (this does not print the key)"
railway login --apiKey "$RAILWAY_API_KEY" || true

if [ -n "$PROJECT" ]; then
  echo "Setting Railway project: $PROJECT"
  railway project set "$PROJECT" || true
fi

echo "Running 'railway up' to trigger a production deployment (non-interactive)"
railway up --detach --environment "$ENV" || {
  echo "railway up failed; trying 'railway deploy'"
  railway deploy --environment "$ENV" || {
    echo "Railway deploy failed; please inspect Railway project/CI"
    exit 1
  }
}

echo "Deploy trigger completed; check Railway dashboard for build logs."
exit 0
