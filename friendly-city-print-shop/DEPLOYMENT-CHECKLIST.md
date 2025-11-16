# 🚀 Production Deployment Checklist

## Pre-Deployment

- [ ] Create Supabase production project
- [ ] Create Stripe production account
- [ ] Set up Vercel account
- [ ] Run `npm run test-setup` and fix any issues
- [ ] Update domain in environment variables

## Database Setup

- [ ] Execute `supabase-schema.sql` in Supabase SQL Editor
- [ ] Run `npm run seed` to populate templates
- [ ] Verify RLS policies are correct

## Environment Variables

- [ ] Set all production env vars in Vercel
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

- [ ] Deploy to Vercel
- [ ] Test live site functionality
- [ ] Update DNS (if custom domain)
- [ ] Monitor error logs
