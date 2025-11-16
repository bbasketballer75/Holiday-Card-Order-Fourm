# Immediate security remediation: rotate Supabase keys and remove tracked env files

This project had Supabase service keys committed to an env file. Those keys are
highly sensitive (the service role key can perform privileged operations) and
must be rotated immediately. The following steps outline recommended remediation
actions. I have removed the directly tracked `.env.local` file from the repository
working tree and added this guidance plus an `.env.example` placeholder file.

1. Rotate Supabase keys (IMMEDIATE)
   - Sign in to your Supabase project dashboard.
   - Navigate to Settings → API and rotate the Service Role key and any other
     keys that may have been exposed.
   - Treat the rotated keys as compromised; do not reuse them.

1. Replace secrets in hosting/CI
   - Add the new keys to your hosting provider's secret store (Railway, Netlify,
     GitHub Actions Secrets, etc.). Do NOT store them in repository files.
   - For Railway: Project Dashboard → Variables tab → Add variables. For GitHub Actions:
     Repository → Settings → Secrets and variables → Actions.

1. Remove tracked env files from the repository (done / recommended)

   Removing a tracked file from the working tree does NOT purge it from git
   history. If you need to expunge the secret from history, consider using
   `git filter-repo` or the BFG Repo-Cleaner (this is a destructive operation
   and requires a force-push and coordination with collaborators).

   Example (safe, one-off removal from current branch):

   ```sh
   git rm --cached friendly-city-print-shop/.env.local
   git commit -m "chore(secrets): remove committed env file"
   git push origin HEAD
   ```

   Example (purge from history — use with caution):
   1. Using git-filter-repo (recommended over BFG):

   ```sh
   python -m pip install git-filter-repo
   git clone --mirror <repo-url> repo-mirror.git
   cd repo-mirror.git
   git filter-repo --path friendly-city-print-shop/.env.local --invert-paths
   git push --force
   ```

   1. Using BFG (alternative):

   ```sh
   # read BFG docs first; this is an irreversible history rewrite
   java -jar bfg.jar --delete-files .env.local
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

1. Verify and test
   - After rotating keys and updating secrets in your hosting/CI, re-deploy the
     app and run the test suite (including the Playwright E2E smoke tests) to
     ensure server routes and integrations work correctly.

1. Prevent recurrence
   - Keep `.env.local` and other env files in `.gitignore` (this repository already
     includes `.env.local` and `.env.*.local` in `.gitignore`). But note that
     `.gitignore` does not affect files already tracked by git — you must remove
     them as shown above.

   - Consider adding a pre-commit hook to block accidental commits of files that
     contain secret-looking values (e.g., detect `SUPABASE_SERVICE_ROLE_KEY`).

If you'd like, I can:

1. purge the secret from the repository history using `git filter-repo` or BFG
   (I will NOT do this without your confirmation because it's a destructive
   operation and requires coordination),

1. update any CI configuration to ensure secrets are loaded from secure
   environment variables,

1. proceed to rotate keys and update hosting secrets if you provide access
   method/confirmation.

## ✅ COMPLETED: Added helper scripts for secret management

- `scripts/set-gh-secret.sh` - Set individual GitHub repository secrets
- `scripts/set-gh-secret-env.sh` - Set environment-specific secrets
- `scripts/rotate-supabase-keys.sh` - Update all Supabase secrets from .env.local

## FINAL STEPS TO COMPLETE SECURITY REMEDIATION

1. **Rotate Supabase keys immediately:**
   - Go to <https://supabase.com/dashboard>
   - Select your project
   - Navigate to Settings → API
   - Click "Regenerate" next to Service Role key
   - Copy the new keys (URL, anon key, service role key)

2. **Update .env.local with new keys:**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   ```

3. **Update GitHub Actions secrets:**

   ```bash
   cd friendly-city-print-shop
   ./scripts/rotate-supabase-keys.sh
   ```

4. **Update Railway environment variables:**
   - Go to Railway dashboard
   - Select your project
   - Go to Variables tab
   - Update the three Supabase variables with new values

5. **Test the deployment:**
   - Push to trigger Railway auto-deploy
   - Run E2E tests: `npm run e2e:run-prod`

Please rotate the exposed Supabase keys now. I removed the tracked `.env.local`
from the working tree in this change to help stop further accidental exposure.

---

Actions performed (branch: feature/forum-likes-e2e)

- Commit: c90856c — removed tracked `friendly-city-print-shop/.env.vercel` and
  added `.env.example` and `.github/workflows/secret-scan.yml`.
- I replaced the local working copies of `.env.local` and `.env.vercel` with
  non-sensitive placeholder values (they remain untracked).

Next recommended actions: rotate the Supabase Service Role key immediately and
update your hosting/CI secret stores (Railway/GitHub Actions) with the newly
generated keys. If you want me to purge the secret from git history, say so
and I will prepare a safe plan (this requires a force push and coordination).

---

History purge performed (by request)

I ran a history-rewrite to remove committed env files from the repository history
and force-pushed the cleaned history to the remote. Summary of actions performed
on behalf of the repository owner:

- Created a local backup of the working repository (copied to
  `d:/business-website/Holiday-Card-Order-Fourm-backup`).
- Created a mirror clone of the repository and ran `git-filter-repo` to remove
  the following paths across all commits:
  - `friendly-city-print-shop/.env.local`
  - `friendly-city-print-shop/.env.vercel`
  - any committed `friendly-city-print-shop/.env.*` files
  - committed `friendly-city-print-shop/.next/` artifacts (if present)

  Command used (performed in a mirror clone):

  ```sh
  python -m git_filter_repo --invert-paths \
    --path friendly-city-print-shop/.env.local \
    --path friendly-city-print-shop/.env.vercel \
    --path-glob 'friendly-city-print-shop/.env.*' \
    --path-glob 'friendly-city-print-shop/.next/**'
  ```

- Pushed the cleaned repository back to GitHub with a mirror push (force)
  (`git push --mirror origin`). The following branches were force-updated on
  the remote: `master` and `feature/forum-likes-e2e`.

Notes and follow-up:

- GitHub pull refs (e.g., `refs/pull/*`) cannot be updated and were skipped by
  the push; this is normal. The main branch heads were updated.
- This is a destructive operation: all collaborators must re-clone the
  repository to get the rewritten history. Do NOT `git pull` or merge — instead
  re-clone the repository fresh.

  Recommended re-clone command for collaborators:

  ```sh
  git clone https://github.com/bbasketballer75/Holiday-Card-Order-Fourm.git
  ```

If you want, I can also:

1. Create announcement text for your team explaining the re-clone step.

1. Coordinate a maintenance window for the force-push and help collaborators
   rebase or re-clone safely.
