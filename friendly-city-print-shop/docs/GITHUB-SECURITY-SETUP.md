# GitHub Security & Repository Hardening — What to enable

This document lists recommended GitHub repository settings and repo files I added
to harden the project and prevent accidental secret commits. Some settings can be
enabled via repository files (Dependabot, CodeQL). Others require a repo admin
to toggle in the GitHub UI. Below are step-by-step instructions.

Files added by me in this repo (already committed):

- `.github/dependabot.yml` — enables Dependabot updates for `friendly-city-print-shop`.
- `.github/workflows/codeql-analysis.yml` — CodeQL analysis workflow for code scanning.
- `.github/workflows/secret-scan.yml` — a custom workflow that scans pushes/PRs for Supabase-like tokens.
- `.githooks/pre-commit` + `scripts/check-secrets.js` — repository-tracked pre-commit hook and Node script to scan staged files for secrets (run `npm run install-hooks` to enable locally).
- `.gitignore` (root) — updated to ignore `.env*`, `.next`, `node_modules`, and other artifacts.

Recommended GitHub UI settings to enable (Admin required)

Go to the repository → Settings → Security & analysis (or Settings → Advanced Security) and enable the following where available:

1. Dependency graph (Enable)
   - Keeps an up-to-date view of repository dependencies.

1. Dependabot alerts (Enable)
   - Notifies on vulnerable dependencies.

1. Dependabot security updates (Enable)
   - Automatically opens PRs to fix vulnerable dependencies. Useful for quick remediation.

1. Dependabot version updates (Optional but recommended)
   - Automatically create PRs for new dependency versions.

1. Code scanning (CodeQL) (Enable)
   - Click "Set up" for CodeQL analysis if prompts appear. We added a CodeQL workflow; enabling this here ensures results appear in Security tab.

1. Secret scanning / Secret protection (Enable)
   - If your GitHub plan supports it (GitHub Advanced Security), enable secret scanning and push protection to block secrets.

1. Push protection (Enable)
   - Blocks pushes that contain supported secrets.

1. Private vulnerability reporting (Optional)
   - Allow external security researchers to privately report vulnerabilities.

Notes

- Some features (e.g., secret scanning push protection, private vulnerability reporting) require GitHub Advanced Security or repository owner privileges.
- I added CI/workflow-based and pre-commit defenses to reduce accidental exposure even if UI features are not available.

How to enable (quick steps)

1. Open the repository on GitHub.
1. Click `Settings` → `Security & analysis` (or `Advanced Security`).
1. Toggle the following ON: Dependency graph, Dependabot alerts, Dependabot security updates, Code scanning (CodeQL), Secret scanning, Push protection.
1. If any options are grayed out, confirm your account/organization has Advanced Security enabled, or contact your organization admin.

After enabling

- Ensure repository secrets (in Settings → Secrets and variables → Actions) contain the rotated Supabase keys (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) so CI workflows (Playwright, CodeQL autobuild) work.
- Ask collaborators to run `git clone` fresh after the history rewrite.

If you want, I can attempt to enable some settings via the GitHub REST API for you if you provide a personal access token (PAT) with repo:admin scope — say the word and I will prepare an automated script. Otherwise, follow the UI steps above to finish enabling the remaining toggles.
