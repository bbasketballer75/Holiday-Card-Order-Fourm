# Forum likes — migration & test instructions

## Summary

This feature adds server-side persistence for message likes and a small Playwright E2E smoke test covering post, reply and like flows.

## Files added

- `app/api/forum/like/route.ts` — server API that records likes/unlikes in `forum_likes` table
- `scripts/migrations/create_forum_likes.sql` — SQL to create the `forum_likes` table in Supabase
- `tests/e2e/forum.spec.ts` — Playwright E2E smoke test
- `playwright.config.js` — Playwright config

## Database migration

This project uses Supabase. To persist likes you must run the migration in your Supabase project.

1. Open your Supabase project → SQL Editor.
1. Paste the contents of `scripts/migrations/create_forum_likes.sql` and run it, or use the `supabase` CLI:

```bash
supabase db query < friendly-city-print-shop/scripts/migrations/create_forum_likes.sql
```

1. Confirm the `forum_likes` table exists and has a unique constraint on `(message_id, user_name)`.

## Running the E2E tests

Install dependencies and Playwright browser binaries (one-time):

```bash
cd friendly-city-print-shop
npm install
npx playwright install
```

Start the dev server (in a separate terminal):

```bash
npm run dev
```

Run the tests:

```bash
npm run test:e2e
```

## Notes

- The API route uses the server role key (`SUPABASE_SERVICE_ROLE_KEY`) — ensure you set this in your environment for server-side routes to work.
- The Playwright tests assume the dev server is available at `http://localhost:3000`. Override with `PLAYWRIGHT_BASE_URL` if needed.
- Likes are stored in `forum_likes`. The UI falls back to a local like toggle if the API or table is not available.
