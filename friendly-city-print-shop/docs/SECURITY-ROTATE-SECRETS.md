## Immediate security remediation: rotate Supabase keys and remove tracked env files

This project had Supabase service keys committed to an env file. Those keys are
highly sensitive (the service role key can perform privileged operations) and
must be rotated immediately. The following steps outline recommended remediation
actions. I have removed the directly tracked `.env.local` file from the repository
working tree and added this guidance plus an `.env.example` placeholder file.

1) Rotate Supabase keys (IMMEDIATE)
   - Sign in to your Supabase project dashboard.
   - Navigate to Settings → API and rotate the Service Role key and any other
     keys that may have been exposed.
   - Treat the rotated keys as compromised; do not reuse them.

2) Replace secrets in hosting/CI
   - Add the new keys to your hosting provider's secret store (Vercel, Netlify,
     GitHub Actions Secrets, etc.). Do NOT store them in repository files.
   - For Vercel: Project Settings → Environment Variables. For GitHub Actions:
     Repository → Settings → Secrets and variables → Actions.

3) Remove tracked env files from the repository (done / recommended)
   - Removing a tracked file from the working tree does NOT purge it from git
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

   - Using git-filter-repo (recommended over BFG):
     ```sh
     python -m pip install git-filter-repo
     git clone --mirror <repo-url> repo-mirror.git
     cd repo-mirror.git
     git filter-repo --path friendly-city-print-shop/.env.local --invert-paths
     git push --force
     ```

   - Using BFG (alternative):
     ```sh
     # read BFG docs first; this is an irreversible history rewrite
     java -jar bfg.jar --delete-files .env.local
     git reflog expire --expire=now --all
     git gc --prune=now --aggressive
     git push --force
     ```

4) Verify and test
   - After rotating keys and updating secrets in your hosting/CI, re-deploy the
     app and run the test suite (including the Playwright E2E smoke tests) to
     ensure server routes and integrations work correctly.

5) Prevent recurrence
   - Keep `.env.local` and other env files in `.gitignore` (this repository already
     includes `.env.local` and `.env.*.local` in `.gitignore`). But note that
     `.gitignore` does not affect files already tracked by git — you must remove
     them as shown above.
   - Consider adding a pre-commit hook to block accidental commits of files that
     contain secret-looking values (e.g., detect `SUPABASE_SERVICE_ROLE_KEY`).

If you'd like, I can:
 - purge the secret from the repository history using `git filter-repo` or BFG
   (I will NOT do this without your confirmation because it's a destructive
   operation and requires coordination),
 - update any CI configuration to ensure secrets are loaded from secure
   environment variables,
 - or proceed to rotate keys and update hosting secrets if you provide access
   method/confirmation.

Please rotate the exposed Supabase keys now. I removed the tracked `.env.local`
from the working tree in this change to help stop further accidental exposure.
