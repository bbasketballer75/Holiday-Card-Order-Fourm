#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <environment> <secret-name> <secret-value>"
  echo "Example: $0 preview NEXT_PUBLIC_SUPABASE_URL 'https://xyz.supabase.co'"
  exit 1
fi

ENVIRONMENT="$1"
SECRET_NAME="$2"
SECRET_VALUE="$3"

echo "Setting secret '$SECRET_NAME' in GitHub environment '$ENVIRONMENT'"
gh secret set "$SECRET_NAME" --body "$SECRET_VALUE" --env "$ENVIRONMENT"
echo "Done."
