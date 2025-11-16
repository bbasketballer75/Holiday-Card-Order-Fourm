#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <secret-name> <secret-value> [environment]"
  exit 1
fi

SECRET_NAME="$1"
SECRET_VALUE="$2"
ENVIRONMENT="${3:-}"  # optional environment name

if [ -n "$ENVIRONMENT" ]; then
  echo "Setting secret '$SECRET_NAME' for environment '$ENVIRONMENT'"
  gh secret set "$SECRET_NAME" --body "$SECRET_VALUE" --env "$ENVIRONMENT"
else
  echo "Setting repository secret '$SECRET_NAME'"
  gh secret set "$SECRET_NAME" --body "$SECRET_VALUE"
fi

echo "Done."
