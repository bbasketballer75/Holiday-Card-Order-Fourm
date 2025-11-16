Quickstart
----------

1. `cd friendly-city-print-shop`
2. `npm ci`
3. For a quick dev smoke test, run `npm run test:e2e` (uses Playwright's CLI directly to avoid PowerShell `Playwright` not recognized issues).
4. For full CI parity (seed → prod build → start → test → cleanup), run `npm run e2e:run-prod` or `node scripts/e2e-run-prod.js --browser=all`.

Project Agent Additional Instructions
-------------------------------------

- Use the `project-agent` mode for proactive repo maintenance, automated testing, and CI/QA operations.
- Enable any helpful MCP servers or tools before starting work so the project-agent has full memory and automation support.
- Always reply with a one-line summary followed by three bullet action steps; reference artifacts rather than pasting verbose logs.
- Run `npm run lint`, `npm run build:prod`, `npm run test:ci -- --coverage`, and `npm run e2e:run-prod` before opening PRs whenever possible.
- Favor patch-style diffs, archive large outputs under `playwright-report`, and use artifact links when detailing failures.
- Keep PowerShell-friendly behavior by running CLI tools via `node` (e.g., `node scripts/e2e-run-prod.js --browser=all`) and prefer `Push-Location`/`Set-Location` over `cd /d`.
- The GitHub Pull Request extension is currently unreliable; rely on the `gh` CLI for PR operations until it is repaired.

Testing & Deployment Commands
----------------------------

- `node scripts/e2e-run-prod.js --browser=all`
- `npm run test:ci -- --coverage`
- `npm run build:prod`
- `npm run db:migrate:create -- ${migration_name}`
- `npm run db:seed:production`

WSL & Database Helpers
----------------------

- PostgreSQL (WSL): `sudo service postgresql start` then `psql -h localhost -U postgres -d holiday_cards`.
- MySQL alternative: `sudo service mysql start` before running migrations or seeds.
- From Windows PowerShell: `wsl sudo service postgresql start` and `wsl -- node scripts/e2e-run-prod.js` to keep tooling consistent.
- If Postgres is missing, bootstrap with `sudo apt update && sudo apt install postgresql postgresql-contrib` and `sudo -u postgres createdb holiday_cards`.

Workflow Automation Notes
------------------------

- Follow a Test → Fix → Deploy cycle, and when creating automated branches, use the `feature/YYYYMMDD-auto` naming convention.
- Run `scripts/e2e-run-prod.js` prior to PR creation and store HTML reports under `playwright-report` for linking in summaries.
- Open PRs automatically after passing tests but confirm deployment steps with stakeholders before hitting staging or production.
- Deploy to staging once checks pass; production deployments must have manual approval and include automatic rollback on any E2E failure.

PowerShell & CLI Setup
---------------------

- Use `npm run setup-dev` (unix fallback) or `npm run setup-dev-windows` to install required CLIs (`gh`, `supabase`, Playwright browsers) via platform-specific scripts.
- Run `npm run setup-powershell` to align the current user's execution policy and avoid `npm.ps1` load errors.

