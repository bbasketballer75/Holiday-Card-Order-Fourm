#!/bin/bash

# Script to validate Railway deployment environment variables
# Run this locally to ensure all required env vars are set before deployment

echo "🔍 Validating Railway environment variables..."
echo ""

# Required environment variables for Railway deployment
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_SECRET_KEY"
)

MISSING_VARS=()

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "   Please create .env.local with your environment variables."
    exit 1
fi

echo "📋 Checking required environment variables:"
echo ""

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env.local; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
        if [ -z "$value" ] || [ "$value" = "your_${var,,}" ]; then
            echo "❌ $var - MISSING or PLACEHOLDER value"
            MISSING_VARS+=("$var")
        else
            echo "✅ $var - SET"
        fi
    else
        echo "❌ $var - NOT FOUND"
        MISSING_VARS+=("$var")
    fi
done

echo ""
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "🎉 All required environment variables are configured!"
    echo ""
    echo "🚀 Ready for Railway deployment. Make sure to:"
    echo "   1. Set these variables in Railway dashboard (Variables tab)"
    echo "   2. Push to main branch to trigger deployment"
    echo "   3. Check Railway logs for any build issues"
else
    echo "❌ Missing or invalid environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📝 Please update .env.local with the correct values before deploying."
    exit 1
fi