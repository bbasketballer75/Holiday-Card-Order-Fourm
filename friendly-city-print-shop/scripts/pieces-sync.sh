#!/usr/bin/env bash
set -euo pipefail

# Simple script to create a snippet on Pieces for a PR
# This is a template – update the PIECES_API_URL or data schema for the actual API

if [ -z "${PIECES_API_TOKEN:-}" ]; then
  echo "PIECES_API_TOKEN not set; skipping Pieces sync"
  exit 0
fi

if [ -z "${GITHUB_EVENT_PATH:-}" ]; then
  echo "GITHUB_EVENT_PATH not set; can't read PR event payload"
  exit 0
fi

PR_NUMBER=$(jq -r '.pull_request.number // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true)
PR_TITLE=$(jq -r '.pull_request.title // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true)
PR_BODY=$(jq -r '.pull_request.body // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true)
PR_URL=$(jq -r '.pull_request.html_url // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true)
PR_AUTHOR=$(jq -r '.pull_request.user.login // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true)
REPO=${GITHUB_REPOSITORY:-}

if [ -z "$PR_NUMBER" ]; then
  echo "No PR number found in event; skipping"
  exit 0
fi

if command -v jq >/dev/null 2>&1; then
  payload=$(jq -n \
    --arg repo "$REPO" \
    --arg pr_number "$PR_NUMBER" \
    --arg title "$PR_TITLE" \
    --arg url "$PR_URL" \
    --arg author "$PR_AUTHOR" \
    --arg body "$PR_BODY" \
    '{type: "pull_request", repo: $repo, pr_number: $pr_number|tonumber, title: $title, url: $url, author: $author, body: $body}')
else
  if command -v python3 >/dev/null 2>&1; then
    payload=$(python3 - <<PY
import json
ev=json.load(open("$GITHUB_EVENT_PATH"))
pr=ev.get('pull_request', {})
obj={
  'type':'pull_request',
  'repo': "$REPO",
  'pr_number': pr.get('number'),
  'title': pr.get('title'),
  'url': pr.get('html_url'),
  'author': pr.get('user', {}).get('login'),
  'body': pr.get('body')
}
print(json.dumps(obj))
PY
    )
  else
    echo "Neither jq nor python3 is installed - can't construct payload"
    exit 1
  fi
fi

echo "Sending PR #$PR_NUMBER to Pieces (repo: $REPO)"

PIECES_API_URL=${PIECES_API_URL:-"https://api.pieces.app/v1/snippets"}

resp=$(curl -s -w "%{http_code}" -X POST "$PIECES_API_URL" \
  -H "Authorization: Bearer $PIECES_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$payload")

status=${resp: -3}
body=${resp:: -3}

if [ "$status" -ge "200" ] && [ "$status" -lt "300" ]; then
  echo "Pieces sync successful: $body"
else
  echo "Pieces sync failed (status $status). Response: $body"
  exit 1
fi
