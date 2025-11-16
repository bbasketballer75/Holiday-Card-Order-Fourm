# Friendly City Print Shop

An interactive online forum and ordering system for holiday cards built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and Stripe. This is a minimal prototype scaffold designed to be free-tier friendly (Supabase free tier + Railway.app for deployment).

## Dev setup

1. **Create separate accounts for this project:**
   - [Supabase](https://supabase.com) - Create a new project specifically for the Holiday Card Order Forum
   - [Stripe](https://stripe.com) - Create a new account for payment processing

1. Copy `.env.example` to `.env.local` and fill out your **unique** Supabase and Stripe credentials for this project only.

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

1. Run the development server (uses port 3001 by default to avoid conflicts):

```bash
npm run dev
```

1. Seed sample templates (optional, requires SUPABASE_SERVICE_ROLE_KEY):

```bash
npm run seed
```

## Tooling & CLI installs

- Run `npm run setup-dev` (or `npm run setup-dev-windows`) early to install `gh`, the Supabase CLI (see manual instructions below), and Playwright browsers.
- The Supabase CLI no longer supports `npm install -g supabase`. Instead, download the latest Windows release from [https://github.com/supabase/cli/releases](https://github.com/supabase/cli/releases), unzip it, and add the executable to your `%PATH%` (or use a package manager that supports Supabase CLI). This ensures the CLI is available for seeding and migrations.
- During Windows setup we tried several installers:
  - `npm install -g supabase` now fails because the CLI no longer supports npm global installs.
  - `winget search supabase` and `winget search supabase-cli` return no matches, so winget cannot install it at this time.
  - Chocolatey’s `supabase-cli` package is currently missing from the default community source (install fails with “package not found”).

## Production Setup

### Create Production Accounts

- **Supabase**: [Create a new project](https://supabase.com) for production
- **Stripe**: [Create a new account](https://stripe.com) for payment processing
- **Railway**: [Sign up](https://railway.app) for hosting (free tier with $5/month credits)

### Database Setup

1. Go to your Supabase project dashboard
1. Navigate to SQL Editor
1. Run the contents of `supabase-schema.sql` to create tables and policies
1. Run `npm run seed` to populate initial template data

### 3. Environment Variables

Create `.env.local` with your production credentials:

```bash
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Production
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key

# App Config
NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
PORT=3000
```

> 💡 Without `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, the seed scripts (`npm run seed`, `npm run e2e:run-prod`) will skip automatically. Provide both keys before running the seeds or CI workflow.

### Stripe Webhook (Optional)

For order fulfillment automation, set up Stripe webhooks to listen for `checkout.session.completed` events.

### Deploy to Railway

1. Sign in to [Railway.app](https://railway.app)
1. Click **New Project** → **Deploy from GitHub repo**
1. Select your GitHub repository (`bbasketballer75/Holiday-Card-Order-Fourm`)
1. Railway will auto-detect Next.js and configure the build using `railway.toml`
1. Add environment variables in Railway dashboard (Variables tab):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `PORT=3000`
1. Railway will auto-deploy on every GitHub push to `main`

**Railway URL**: After deployment, Railway provides a `*.railway.app` URL. Update your `NEXT_PUBLIC_BASE_URL` with this URL for proper redirects.

**Free Tier**: Railway provides $5/month free credits - perfect for development and small production workloads.

## Testing Production Setup

### Local Testing

```bash
# Test with production env vars
npm run dev
```

### Database Testing

```bash
# Seed data
npm run seed
```

### Payment Testing

- Use Stripe test keys for development
- Switch to live keys only when ready for production
- Test the full checkout flow

## Notes

- This scaffold is intentionally minimal. Replace placeholder images and content with your brand resources.

## E2E & CI (Playwright)

This project includes Playwright E2E tests under `tests/e2e`. To run a CI-like E2E test locally (production build, server start, tests, cleanup):

```bash
npm ci
npm run e2e:run-prod
```

On CI, add the following repository secrets to run E2E against a Supabase test project:

- `NEXT_PUBLIC_SUPABASE_URL` (e.g., <https://xxxx.supabase.co>)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anon key)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side service role key — store securely)

## Helper scripts

This repository includes helper scripts in `/scripts` to make CI and secret management easier:

- `scripts/set-gh-secret.sh` — set a repository secret using the `gh` CLI
- `scripts/set-gh-secret-env.sh` — set a secret scoped to a GitHub Environment
- `scripts/rotate-supabase-keys.sh` — update GitHub Secrets with new Supabase keys (does not rotate inside Supabase)

Example to set secrets using `gh` (local machine):

```bash
./scripts/set-gh-secret.sh NEXT_PUBLIC_SUPABASE_URL https://xxxx.supabase.co
./scripts/set-gh-secret.sh NEXT_PUBLIC_SUPABASE_ANON_KEY pk_xxxxx
./scripts/set-gh-secret.sh SUPABASE_SERVICE_ROLE_KEY sk_xxxxx
```

See `docs/CI-E2E.md` for details and recommended practices.
