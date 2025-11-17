#!/usr/bin/env bash
set -euo pipefail

echo "Deploy placeholder: this script runs only when AGENT_MODE=agenic and allowProductionDeploy is true"
if [ -z "${RAILWAY_API_KEY:-}" ]; then
  echo "RAILWAY_API_KEY not set; skipping deploy"
  exit 0
fi

echo "Would perform deployment with RAILWAY_API_KEY (not printed)." 
echo "Implement your deployment logic here (e.g., railway up, or API call to your host)."

exit 0
