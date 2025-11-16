#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --service-role KEY --anon KEY --url URL [--env ENVIRONMENT] [--repo REPO] [--set-github]"
  echo "Example: $0 --service-role 'sk-xxxxx' --anon 'pk-xxxxx' --url https://example.supabase.co --set-github"
}

SERVICE_KEY=""
ANON_KEY=""
SUPA_URL=""
ENV_NAME=""
REPO=""
SET_GITHUB=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --service-role) SERVICE_KEY="$2"; shift 2;;
    --anon) ANON_KEY="$2"; shift 2;;
    --url) SUPA_URL="$2"; shift 2;;
    --env) ENV_NAME="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --set-github) SET_GITHUB=true; shift;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option $1"; usage; exit 1;;
  esac
done

if [[ -z "$SERVICE_KEY" || -z "$ANON_KEY" || -z "$SUPA_URL" ]]; then
  echo "Missing arguments"; usage; exit 1
fi

echo "New Supabase URL: $SUPA_URL"
echo "New Anon Key: ${ANON_KEY:0:10}..."
echo "New Service Role Key: ${SERVICE_KEY:0:10}..."

if $SET_GITHUB; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh cli not found. Install it first: https://cli.github.com/";
    exit 1
  fi

  TARGET_REPO=${REPO:-$(gh repo view --json nameWithOwner --jq '.nameWithOwner')}
  if [[ -z "$TARGET_REPO" ]]; then
    echo "Unable to determine repo; pass --repo owner/repo to set secrets";
    exit 1
  fi

  echo "Setting GitHub secrets on repo: $TARGET_REPO"
  if [[ -n "$ENV_NAME" ]]; then
    echo "Setting secrets in environment: $ENV_NAME"
    gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$SUPA_URL" --repo "$TARGET_REPO" --env "$ENV_NAME"
    gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$ANON_KEY" --repo "$TARGET_REPO" --env "$ENV_NAME"
    gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SERVICE_KEY" --repo "$TARGET_REPO" --env "$ENV_NAME"
  else
    gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$SUPA_URL" --repo "$TARGET_REPO"
    gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$ANON_KEY" --repo "$TARGET_REPO"
    gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SERVICE_KEY" --repo "$TARGET_REPO"
  fi
  echo "Done setting secrets in GitHub. Please update other hosting keys (Vercel/Netlify) as needed.";
else
  echo "Set --set-github to update GitHub secrets. Otherwise this script prints instructions only.";
fi

echo "IMPORTANT: This script updates GitHub secrets only. To rotate the service-role key in Supabase, go to your project Dashboard -> Settings -> API -> Generate new secret"
echo "If you want me to attempt rotation via any Management API, provide the Management API token and I will attempt it."
