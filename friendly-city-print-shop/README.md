# Friendly City Print Shop

An interactive online forum and ordering system for holiday cards built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and Stripe. This is a minimal prototype scaffold designed to be free-tier friendly (Supabase free tier + Vercel for deployment).

## Dev setup

1. **Create separate accounts for this project:**
   - [Supabase](https://supabase.com) - Create a new project specifically for the Holiday Card Order Forum
   - [Stripe](https://stripe.com) - Create a new account for payment processing

2. Copy `.env.example` to `.env.local` and fill out your **unique** Supabase and Stripe credentials for this project only.

3. Install dependencies:

```bash
npm install
# or
pnpm install
```

1. Run the development server (uses port 3001 by default to avoid conflicts):

```bash
npm run dev
```

2. Seed sample templates (optional, requires SUPABASE_SERVICE_ROLE_KEY):

```bash
npm run seed
```

## Production Setup

### 1. Create Production Accounts

- **Supabase**: [Create a new project](https://supabase.com) for production
- **Stripe**: [Create a new account](https://stripe.com) for payment processing
- **Vercel**: [Sign up](https://vercel.com) for hosting (free tier available)

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-schema.sql` to create tables and policies
4. Run `npm run seed` to populate initial template data

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
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
PORT=3000
```

### 4. Stripe Webhook (Optional)

For order fulfillment automation, set up Stripe webhooks to listen for `checkout.session.completed` events.

### 5. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

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
