CI E2E Setup and Supabase Secrets
=================================

This document describes how to run Playwright E2E in CI and locally.

Run the CI-like e2e locally (production build, start server, run tests):

~~~bash
cd friendly-city-print-shop
npm ci
npm run build
npm run e2e:seed && npm run build && node ./scripts/e2e-run-prod.js
~~~

In CI, we provide options to either use a hosted Supabase (set secrets) or run a local Supabase using the Supabase CLI. If you prefer hosted Supabase, add the following secrets to GitHub Secrets (recommended to use a dedicated test project):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

  See the repository's playwright workflow for conditional handling of hosted vs local Supabase.
