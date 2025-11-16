# Friendly City Print Shop - Project Memory

This file stores project-specific memory and preferences for the Friendly City Print Shop project. Use this as a source of truth for local development and CI.

Project: Friendly City Print Shop
Stack: Next.js 14 (App Router), TypeScript, Tailwind, Supabase (Auth, DB, Storage), Stripe (Payments - test mode)
Repo path: D:\business-website\Holiday-Card-Order-Fourm\friendly-city-print-shop
Node Version: 18+

Dev Preferences:

- Keep everything on the D: dev drive for development.
- Use `.env.local` for secrets (do not commit keys). Never commit dummy or fake keys in code.
- Use `npm ci` for CI and `npm install` for local development where lock files differ.
- Use `scripts/dev.js` to start the dev server (default PORT 3000) while allowing override via `PORT`.
- Respect `process.env.PORT` in Playwright and related tests; never hardcode ports in tests.

Cost Control:

- Keep the project free-friendly: Supabase free tier, Railway.app for hosting, and Stripe test keys for payments during development.

Testing & CI:

- Use Playwright and avoid hard-coded ports; use env vars to set baseURL.
- Use `npm ci` in CI and cache `node_modules` or use `pnpm` for speed and efficient disk usage.

Other

- If you need to share the repo with the team without exposing secrets, provide steps to create personal `.env.local` files.
- Use a personal GitHub PAT with minimal scopes for authenticated requests if necessary (see `docs/avoid-github-rate-limits.md` for details).
