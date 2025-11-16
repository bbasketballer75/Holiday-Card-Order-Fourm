# 🚀 Production Deployment Checklist

## Pre-Deployment

- [ ] Create Supabase production project
- [ ] Create Stripe production account
- [ ] **Set up Railway.app account** (see Railway Setup Guide below)
- [ ] Run `npm run test-setup` and fix any issues
- [ ] Update domain in environment variables

## Railway Setup Guide

### 1. Create Railway Account

- Go to [railway.app](https://railway.app) and sign up
- Verify your email
- You get $5/month free credits automatically

### 2. Connect GitHub Repository

- Click **"New Project"** in Railway dashboard
- Select **"Deploy from GitHub repo"**
- Authorize Railway to access your GitHub account
- Search for and select: `bbasketballer75/Holiday-Card-Order-Fourm`

### 3. Configure Build Settings

- Railway auto-detects Next.js - no manual config needed
- Build command: `npm run build` (automatic)
- Start command: `npm run start` (automatic)

### 4. Set Environment Variables

In Railway dashboard → Your Project → **Variables** tab, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
PORT=3000
```

### 5. Deploy

- Railway deploys automatically on every push to `main` branch
- First deployment may take 2-3 minutes
- Check deployment logs in Railway dashboard if issues occur

### 6. Get Your Live URL

- After successful deployment, Railway provides a `*.railway.app` URL
- Copy this URL for your `NEXT_PUBLIC_BASE_URL` environment variable
- Test the live site functionality

## Database Setup

- [ ] Execute `supabase-schema.sql` in Supabase SQL Editor
- [ ] Run `npm run seed` to populate templates
- [ ] Verify RLS policies are correct

## Environment Variables

- [ ] Set all production env vars in Railway dashboard (Variables tab)
- [ ] Test Stripe webhook endpoint (if implemented)
- [ ] Verify Supabase connection

## Testing

- [ ] Test forum posting
- [ ] Test template browsing
- [ ] Test order checkout flow
- [ ] Test responsive design on mobile

## Security

- [ ] Ensure no sensitive data in client-side code
- [ ] Verify HTTPS redirect
- [ ] Check CORS settings

## Performance

- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Check bundle size

## Go-Live

- [ ] Connect GitHub repo to Railway (auto-deploys on push)
- [ ] Test live site functionality
- [ ] Update DNS (if custom domain) to point to Railway
- [ ] Monitor error logs in Railway dashboard
