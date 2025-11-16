#!/bin/bash

# Script to set a GitHub repository secret using the gh CLI
# Usage: ./scripts/set-gh-secret.sh SECRET_NAME secret_value [org/repo]
# If no repo specified, uses the current repository

set -e

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed. Please install it first."
    echo "See: https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "Error: Not logged in to GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 SECRET_NAME secret_value [org/repo]"
    echo "Example: $0 NEXT_PUBLIC_SUPABASE_URL https://xxxxx.supabase.co"
    exit 1
fi

SECRET_NAME="$1"
SECRET_VALUE="$2"
REPO="${3:-$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')}"

if [ -z "$REPO" ]; then
    echo "Error: Could not determine repository. Please specify as third argument: $0 $SECRET_NAME 'value' org/repo"
    exit 1
fi

echo "Setting GitHub secret '$SECRET_NAME' for repository: $REPO"

# Set the secret
gh secret set "$SECRET_NAME" --body "$SECRET_VALUE" --repo "$REPO"

echo "✅ Successfully set secret '$SECRET_NAME' for $REPO"