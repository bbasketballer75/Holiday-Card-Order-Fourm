#!/bin/bash

# Script to set a GitHub repository environment secret using the gh CLI
# Usage: ./scripts/set-gh-secret-env.sh ENVIRONMENT SECRET_NAME secret_value [org/repo]
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
if [ $# -lt 3 ]; then
    echo "Usage: $0 ENVIRONMENT SECRET_NAME secret_value [org/repo]"
    echo "Example: $0 production NEXT_PUBLIC_SUPABASE_URL https://xxxxx.supabase.co"
    exit 1
fi

ENVIRONMENT="$1"
SECRET_NAME="$2"
SECRET_VALUE="$3"
REPO="${4:-$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')}"

if [ -z "$REPO" ]; then
    echo "Error: Could not determine repository. Please specify as fourth argument: $0 $ENVIRONMENT $SECRET_NAME 'value' org/repo"
    exit 1
fi

echo "Setting GitHub environment secret '$SECRET_NAME' in environment '$ENVIRONMENT' for repository: $REPO"

# Set the environment secret
gh secret set "$SECRET_NAME" --body "$SECRET_VALUE" --repo "$REPO" --env "$ENVIRONMENT"

echo "✅ Successfully set environment secret '$SECRET_NAME' in '$ENVIRONMENT' for $REPO"