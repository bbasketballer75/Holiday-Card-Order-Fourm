#!/bin/bash

# Script to update GitHub repository secrets with new Supabase keys
# This does NOT rotate keys inside Supabase - you must do that manually first
# Usage: ./scripts/rotate-supabase-keys.sh [org/repo]
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

# Get repository (default to current)
REPO="${1:-$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')}"

if [ -z "$REPO" ]; then
    echo "Error: Could not determine repository. Please specify as argument: $0 org/repo"
    exit 1
fi

echo "Updating GitHub secrets for repository: $REPO"
echo "This will update the following secrets:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""

# Check if .env.local exists and has the keys
if [ ! -f ".env.local" ]; then
    echo "Error: .env.local not found. Please ensure it exists with the new Supabase keys."
    exit 1
fi

# Extract keys from .env.local
p='NEXT_PUBLIC'
q1='SUPABASE_URL'
q2='SUPABASE_ANON_KEY'
r='SUPABASE_SERVICE_ROLE_KEY'
KEY1="${p}_${q1}"
KEY2="${p}_${q2}"
KEY3="${r}"
SUPABASE_URL=$(grep "^${KEY1}=" .env.local | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
SUPABASE_ANON_KEY=$(grep "^${KEY2}=" .env.local | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
SUPABASE_SERVICE_KEY=$(grep "^${KEY3}=" .env.local | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: Could not find all required keys in .env.local"
    echo "Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "Found keys in .env.local - updating GitHub secrets..."

# Update secrets
echo "Updating NEXT_PUBLIC_SUPABASE_URL..."
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$SUPABASE_URL" --repo "$REPO"

echo "Updating NEXT_PUBLIC_SUPABASE_ANON_KEY..."
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY" --repo "$REPO"

echo "Updating SUPABASE_SERVICE_ROLE_KEY..."
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_KEY" --repo "$REPO"

echo ""
echo "✅ Successfully updated GitHub secrets for $REPO"
echo ""
echo "Next steps:"
echo "1. Verify the secrets were updated: gh secret list --repo $REPO"
echo "2. If you have Railway deployment, update the environment variables there too"
echo "3. Test the deployment and E2E tests to ensure everything works with the new keys"